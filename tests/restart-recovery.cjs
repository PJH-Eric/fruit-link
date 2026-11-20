'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { setTimeout: sleep } = require('node:timers/promises');
const { io } = require('socket.io-client');
const Rules = require('../public/js/rules.js');

async function exercise(base, restart) {
  const sockets = [];
  async function connect(url, clientId) {
    const socket = io(url, { transports: ['websocket'], forceNew: true, reconnection: false, timeout: 5000 });
    sockets.push(socket);
    const player = { socket, send: (event, payload) => socket.timeout(5000).emitWithAck(event, payload) };
    socket.on('room:sync', view => { player.view = view; });
    const hello = await player.send('hello', { clientId, name: 'Recovery test' });
    assert.ok(hello.ok);
    player.id = hello.clientId;
    return player;
  }

  async function waitFor(read) {
    for (let i = 0; i < 220; i++) {
      const result = read();
      if (result) return result;
      await sleep(50);
    }
    assert.fail('等不到房間狀態');
  }

  try {
    const hostKey = randomUUID();
    const guestKey = randomUUID();
    let host = await connect(base, hostKey);
    let guest = await connect(base, guestKey);
    const hostId = host.id;
    const guestId = guest.id;
    const { ok, code } = await host.send('room:create', { roomName: 'Restart test', level: 'easy', private: true });
    assert.ok(ok);
    const invite = await host.send('room:invite', { role: 'player' });
    assert.ok(invite.ok, JSON.stringify(invite));
    assert.ok((await guest.send('room:join', { code, token: invite.token })).ok);
    const impostor = await connect(base, hostId);
    assert.notEqual(impostor.id, hostId);
    assert.equal((await impostor.send('room:join', { code })).ok, false);
    impostor.socket.disconnect();
    for (const player of [host, guest]) player.socket.emit('room:ready', { ready: true });
    await waitFor(() => host.view?.members.filter(member => member.ready).length === 2);
    host.socket.emit('room:start', {});
    const match = await waitFor(() => host.view?.phase === 'playing' && host.view.match);
    const pair = Rules.findPair(match.grid, match.W, match.H);
    assert.ok(pair);
    host.socket.emit('room:link', pair);
    const before = await waitFor(() => host.view?.match.left < match.left && host.view.match);
    const restarted = await restart({ code, hostId, guestId });
    host = await connect(restarted, hostKey);
    guest = await connect(restarted, guestKey);
    assert.equal(host.id, hostId);
    assert.equal(guest.id, guestId);
    assert.ok((await host.send('room:join', { code })).reconnected);
    const paused = await waitFor(() => host.view);
    assert.equal(paused.recovering, true);
    assert.equal(paused.you.can.play, false);
    assert.ok((await guest.send('room:join', { code })).reconnected);
    const after = await waitFor(() => host.view?.you.can.play && host.view);
    assert.equal(after.code, code);
    assert.equal(after.hostId, hostId);
    assert.equal(after.you.role, 'player');
    assert.equal(guest.view.you.role, 'player');
    assert.deepEqual(after.match.grid, before.grid);
    assert.deepEqual(after.match.players, before.players);
    assert.equal(after.match.left, before.left);
    host.socket.emit('room:leave', {});
    guest.socket.emit('room:leave', {});
    return { code, left: after.match.left, score: after.match.players.find(player => player.id === hostId).score };
  } finally {
    for (const socket of sockets) socket.disconnect();
  }
}

function start(file) {
  const child = spawn(process.execPath, ['-e', `
    const { server } = require('./server.js');
    server.listen(0, '127.0.0.1', () => console.log(server.address().port));
  `], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, FRUIT_ROOM_DB_PATH: file, COUNTDOWN_MS: '0' },
    stdio: ['ignore', 'pipe', 'inherit']
  });
  const base = Promise.race([
    once(child.stdout, 'data').then(([data]) => 'http://127.0.0.1:' + String(data).trim()),
    once(child, 'exit').then(([code]) => { throw new Error('等待伺服器啟動失敗 (' + code + ')'); })
  ]);
  return { child, base };
}

async function stop(child) {
  if (child.exitCode != null || child.signalCode != null) return;
  const done = once(child, 'exit');
  child.kill('SIGKILL');
  await done;
}

if (require.main === module) test('重啟後回復原房、座位、棋盤和已確認的得分', { timeout: 35000 }, async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fruit-link-restart-'));
  const file = path.join(directory, 'rooms.sqlite');
  let server = start(file);
  try {
    const result = await exercise(await server.base, async () => {
      await stop(server.child);
      server = start(file);
      return server.base;
    });
    assert.equal(result.score, Rules.BASE_SCORE);
  } finally {
    await stop(server.child);
    rmSync(directory, { recursive: true, force: true });
  }
});

module.exports = { exercise };
