'use strict';

const { randomBytes } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { deserialize, serialize } = require('node:v8');

function openCheckpoints(filename) {
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, checkpoint BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS identity (slot INTEGER PRIMARY KEY, salt BLOB NOT NULL);
  `);
  db.prepare('INSERT OR IGNORE INTO identity VALUES (1, ?)').run(randomBytes(32));
  const identity = db.prepare('SELECT salt FROM identity WHERE slot = 1').get();
  const rows = db.prepare('SELECT checkpoint FROM rooms');
  const save = db.prepare('INSERT INTO rooms VALUES (?, ?) ON CONFLICT(code) DO UPDATE SET checkpoint = excluded.checkpoint');
  const remove = db.prepare('DELETE FROM rooms WHERE code = ?');

  return {
    salt: identity.salt,
    close() { db.close(); },
    load() { return rows.all().map(row => deserialize(row.checkpoint)); },
    write(rooms, savedAt) {
      db.exec('BEGIN IMMEDIATE');
      try {
        for (const room of rooms) {
          if (room.phase === 'closed') remove.run(room.code);
          else {
            const { store, rng, ...state } = room;
            save.run(room.code, serialize({ format: 1, savedAt, state, rngState: rng?.checkpoint() }));
          }
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }
  };
}

module.exports = { openCheckpoints };
