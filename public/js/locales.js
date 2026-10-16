/* ===== locales.js — 字典（繁體中文 zh-Hant / English en） =====
 *
 * 本遊戲英文名：Fruit Link（中文：水果連連看）
 *
 * 規則：
 *   - 每一筆都是 [key, zh-Hant, en]，兩種語言由同一份清單產生，key 一定一致。
 *   - zh-Hant 的內容與原本畫面上的中文完全一致，不可改寫。
 *   - 值裡的 {name} 會被 I18N.t(key, {name: ...}) 取代；少數值含受信任的 HTML 標籤（<b> 等）。
 *   - srv.* 是伺服器（server.js、lib/rooms.js）與 rules.js 回傳的中文訊息：
 *     前端用 I18N.srv(text) 依這些範本對照翻譯，線上協定與伺服器程式碼完全不變。
 */
(function (root) {
  'use strict';

  var D = [];
  function add(key, zh, en) { D.push([key, zh, en]); }

  /* ---------- 頁面 ---------- */
  add('meta.title', "水果連連看｜免費線上多人連連看・免下載", 'Fruit Link');
  add('meta.desc',
    "免費免下載的水果連連看，在兩次轉彎內連線消除相同圖案。單機從幼幼班一路闖關，也能邀最多六人同盤搶消、觀戰聊天，多款圖案主題，手機平板電腦都能玩。",
    'Cute fruit-matching game: three kids’ levels plus three challenge levels solo, or race up to 6 players on one shared board online.');
  add('lang.switchTo', '切換成英文（English）', 'Switch to Traditional Chinese (中文)');

  /* ---------- 共用 ---------- */
  add('common.back', '◀ 返回', '◀ Back');
  add('common.close', '關閉', 'Close');
  add('common.cancel', '取消', 'Cancel');
  add('common.ok', '確定', 'OK');
  add('common.on', '開啟', 'On');
  add('common.off', '關閉', 'Off');
  add('common.you', '你', 'You');
  add('common.youTag', '（你）', ' (you)');
  add('common.player', '玩家', 'Player');
  add('common.system', '系統', 'System');
  add('common.someone', '有人', 'Someone');
  add('common.roomOf', '{name} 的果園', '{name}’s Orchard');

  /* ---------- 首頁 ---------- */
  add('home.aria', '主選單', 'Main menu');
  add('home.lobby', '← 回遊戲大廳', '← Game Lobby');
  add('home.solo', '單機闖關（六關）', 'Solo Levels (6)');
  add('home.online', '線上競速（最多 6 人）', 'Online Race (up to 6)');
  add('home.help', '玩法說明', 'How to Play');
  add('home.stats', '我的紀錄', 'My Records');
  add('home.note', '兩個一樣的水果，中間的路徑「轉彎不超過 2 次」就能連掉。',
    'Match two identical tiles when a path joins them with no more than 2 turns.');
  add('logo.title', '水果連連看', 'Fruit Link');
  add('logo.sub', '三折以內就能連', 'Up to 2 turns!');

  /* ---------- 設定入口 ---------- */
  add('settings.fabTitle', '遊戲設定', 'Settings');
  add('settings.fabAria', '開啟遊戲設定', 'Open settings');

  /* ---------- 單機設定 ---------- */
  add('solo.aria', '單機闖關設定', 'Solo setup');
  add('solo.title', '單機闖關', 'Solo Levels');
  add('solo.note', '從幼幼班一路打到第三關，分數會累加；也可以直接挑你想玩的那一關。',
    'Play from the kids’ levels up to Level 3 and your score adds up, or jump straight to any level.');
  add('solo.theme', '圖案主題', 'Tile Theme');
  add('solo.themeAria', '選擇圖案主題', 'Choose a tile theme');
  add('solo.themeHint', '{note}；每一局會從裡面隨機抽圖案，所以每次玩到的都不一樣。',
    '{note}. Each round draws a random set of tiles, so no two games look alike.');
  add('solo.level', '從哪一關開始', 'Start from');
  add('solo.levelAria', '選擇起始關卡', 'Choose a starting level');
  add('solo.start', '開始闖關', 'Start');
  add('theme.designs', '{n} 種', '{n} designs');
  add('theme.cardAria', '{label}，{n} 種圖案', '{label}, {n} designs');
  add('level.groupKids', '👶 幼幼班', '👶 Kids’ Class');
  add('level.groupKidsSub',
    '給 3～5 歲的小朋友：格子很大、時間很長，提示和洗牌不限次數，每一顆水果都會自動寫上名字。',
    'For ages 3–5: big tiles, lots of time, unlimited hints and shuffles, and every fruit shows its name.');
  add('level.groupPlay', '🍓 闖關模式', '🍓 Challenge Mode');
  add('level.groupPlaySub',
    '每種水果最多 2 對。越後面的關卡格子越多、種類越雜，提示和洗牌也越少。',
    'Up to 2 pairs of each fruit. Later levels have more tiles, more kinds, and fewer hints and shuffles.');
  add('level.kinds', '{n} 種水果', '{n} kinds');
  add('level.secs', '{n} 秒', '{n}s');
  add('level.hintN', '💡 提示 {n}', '💡 Hint {n}');
  add('level.shuffleN', '🔀 洗牌 {n}', '🔀 Shuffle {n}');
  add('level.placeholder', '第一關', 'Level 1');

  add('level.kids.label', '幼幼班 · 一起認水果', 'Kids 1 · Meet the Fruits');
  add('level.kids.short', '幼幼', 'Kids 1');
  add('level.kids.blurb', '4 × 3，只有 3 種水果。格子很大、時間很長、提示和洗牌不限次數，適合 3～5 歲的小朋友。',
    '4 × 3, only 3 kinds of fruit. Big tiles, lots of time, unlimited hints and shuffles. Great for ages 3–5.');
  add('level.kids2.label', '幼幼進階 · 每種只有一對', 'Kids 2 · One Pair Each');
  add('level.kids2.short', '幼幼進階', 'Kids 2');
  add('level.kids2.blurb', '5 × 4，10 種水果，每一種剛好只有一對、完全不重複。格子一樣很大、時間一樣很長，適合玩熟幼幼班的小朋友。',
    '5 × 4, 10 kinds of fruit, exactly one pair of each. Same big tiles and long timer, for kids who have mastered Kids 1.');
  add('level.kids3.label', '幼幼困難 · 找久一點', 'Kids 3 · Look Longer');
  add('level.kids3.short', '幼幼困難', 'Kids 3');
  add('level.kids3.blurb', '6 × 5，15 種水果，每一種一樣只有一對、完全不重複。格子和時間都還是幼幼班的規格，只是要多找一下。',
    '6 × 5, 15 kinds of fruit, still one pair of each. Same kid-sized tiles and timer, just a bit more to search.');
  add('level.easy.label', '第一關 · 果園入門', 'Level 1 · Orchard Intro');
  add('level.easy.short', '簡單', 'Easy');
  add('level.easy.blurb', '8 × 6，12 種水果，每種最多出現 2 對。時間很寬鬆，先熟悉三折以內怎麼連。',
    '8 × 6, 12 kinds of fruit, up to 2 pairs each. Plenty of time to learn the 2-turn rule.');
  add('level.normal.label', '第二關 · 果園日常', 'Level 2 · Orchard Days');
  add('level.normal.short', '普通', 'Normal');
  add('level.normal.blurb', '10 × 8，20 種水果，每種最多出現 2 對。提示和洗牌都變少了，要開始看路徑。',
    '10 × 8, 20 kinds of fruit, up to 2 pairs each. Fewer hints and shuffles, so start reading the paths.');
  add('level.hard.label', '第三關 · 果園大亂', 'Level 3 · Orchard Chaos');
  add('level.hard.short', '困難', 'Hard');
  add('level.hard.blurb', '12 × 10，30 種水果，每種最多出現 2 對（開始混進蔬菜）。眼睛要放亮一點。',
    '12 × 10, 30 kinds of fruit, up to 2 pairs each (veggies join in). Keep your eyes sharp!');

  add('theme.fruits.label', '蔬果', 'Fruits');
  add('theme.fruits.note', '水果與蔬菜', 'Fruits and vegetables');
  add('theme.animals.label', '動物', 'Animals');
  add('theme.animals.note', '陸海空的動物們', 'Animals of land, sea and sky');
  add('theme.food.label', '食物', 'Food');
  add('theme.food.note', '正餐、點心與飲料', 'Meals, snacks and drinks');
  add('theme.flags.label', '國旗', 'Flags');
  add('theme.flags.note', '各國國旗', 'Flags from around the world');
  add('theme.mahjong.label', '麻將', 'Mahjong');
  add('theme.mahjong.note', '一副 42 種麻將牌（含花牌與季節牌）；這個主題會疊起來玩',
    'A set of 42 mahjong tiles (with flowers and seasons); this theme is played stacked');
  add('theme.mixed.label', '大混搭', 'Mix-up');
  add('theme.mixed.note', '蔬果、動物、食物和國旗混在一起', 'Fruits, animals, food and flags all mixed together');

  /* ---------- 玩法說明 ---------- */
  add('help.aria', '玩法說明', 'How to play');
  add('help.title', '📖 玩法說明', '📖 How to Play');
  add('help.how', '怎麼連', 'How to Match');
  add('help.howBody',
    '點兩個<b>一樣的水果</b>。只要它們之間存在一條路徑，這條路徑<b>只走上下左右、只經過空格，而且轉彎不超過 2 次</b>，兩個就會一起消失。路徑可以繞到盤面外面那一圈，所以最外圈的水果不會被困住。',
    'Tap two <b>identical tiles</b>. If a path joins them that <b>only moves up, down, left or right, only crosses empty cells, and turns no more than 2 times</b>, both tiles vanish. Paths may loop around the outside edge of the board, so tiles on the border are never trapped.');
  add('help.howHint', '上面示範的是 0 折、1 折、2 折三種合法路徑；轉三次以上就不算。',
    'The examples above show legal paths with 0, 1 and 2 turns. Three or more turns do not count.');
  add('help.demo0', '0 折 · 直線', '0 turns · straight');
  add('help.demo1', '1 折 · 轉一次', '1 turn');
  add('help.demo2', '2 折 · 繞出去', '2 turns · around the edge');
  add('help.mj', '🀄 麻將怎麼連', '🀄 Matching Mahjong');
  add('help.mjBody',
    '麻將的每一層都視為<b>獨立的平面</b>，規則和其他模式一樣：路徑<b>只走上下左右、只經過該層的空格，而且轉彎不超過 2 次</b>，也可以繞到該層平面外圈。其他層的牌不會阻擋路徑，但上層實際覆蓋到的牌仍然不能操作。兩張牌必須<b>圖案相同、位於同一層、且沒有被上層麻將壓住</b>；不要求左右一定有空位，相鄰同圖案的牌也能以 0 折直線消除。',
    'Each mahjong layer is treated as its <b>own flat plane</b> with the same rules: the path <b>moves only up, down, left or right, crosses only empty cells on that layer, and turns no more than 2 times</b>, and may loop around that layer’s outer edge. Tiles on other layers never block a path, but tiles covered by an upper tile still can’t be played. Both tiles must <b>show the same picture, be on the same layer, and not be covered</b>. Neighbours with the same picture can match with a straight 0-turn line.');
  add('help.score', '計分', 'Scoring');
  add('help.scoreItem', '項目', 'Item');
  add('help.scorePts', '分數', 'Points');
  add('help.scoreBase', '連成一對', 'Each pair');
  add('help.scoreBaseV', '基礎 100 分', '100 base points');
  add('help.scoreCombo', '連擊加成', 'Combo bonus');
  add('help.scoreComboV', '5 秒內接著連下一對，每次 +10%，最多 ×2.0', 'Match the next pair within 5 s: +10% each time, up to ×2.0');
  add('help.scoreMiss', '連錯', 'Wrong match');
  add('help.scoreMissV', '<b>不扣分</b>，只會把連擊歸零', '<b>No penalty</b>, but it resets your combo');
  add('help.scoreTime', '過關剩餘時間', 'Time left');
  add('help.scoreTimeV', '每剩 1 秒 +2 分（清空盤面才有）', '+2 points per second left (only if you clear the board)');
  add('help.levels', '六個關卡', 'The Six Levels');
  add('help.thLevel', '關卡', 'Level');
  add('help.thBoard', '盤面', 'Board');
  add('help.thKinds', '水果種類', 'Kinds');
  add('help.thTime', '時間', 'Time');
  add('help.thHints', '提示', 'Hints');
  add('help.thShuffles', '洗牌', 'Shuffles');
  add('help.times', '{n} 次', '{n}');
  add('help.themes', '圖案主題', 'Tile Themes');
  add('help.themesBody',
    '除了蔬果，還可以換成動物、食物、國旗、麻將，或是把蔬果、動物、食物和國旗混在一起的「大混搭」（不含麻將）。每一局會從主題裡<b>隨機抽</b>要用的圖案，所以同一關每次玩到的組合都不一樣。線上對戰由房主決定主題，全場看到的都一樣。',
    'Besides fruits and veggies you can play with animals, food, flags, mahjong, or the “Mix-up” theme that blends fruits, animals, food and flags (no mahjong). Each round <b>randomly picks</b> its tiles from the theme, so the same level never looks the same twice. In online games the host picks the theme and everyone sees the same tiles.');
  add('help.mjStack',
    '<b>🀄 麻將的畫面會疊起來。</b>牌會像真的麻將一樣一層一層疊上去，上面那一層往右下偏半張，所以<b>視覺上上層會蓋住下層 4 張</b>。被蓋住的牌會<b>變暗、點不動</b>，要先把疊在它上面的牌消掉才會解鎖；但每層的路徑判定彼此獨立。<br>配對時要選<b>同圖案、同層、上方露出</b>的兩張牌，而且必須存在一條<b>只經過該層空格、不超過 2 折</b>的合法路徑。空格規則與其他模式相同。單機的提示、洗牌與自動解死局都照樣有用。',
    '<b>🀄 Mahjong tiles are stacked.</b> They pile up in layers like real mahjong, each upper layer shifted half a tile down-right, so <b>an upper tile visually covers 4 tiles below</b>. Covered tiles are <b>dimmed and can’t be tapped</b> until you clear what sits on top, but paths are still checked per layer.<br>Pick two tiles with the <b>same picture, on the same layer, and uncovered</b>, joined by a legal path that <b>only crosses empty cells on that layer with at most 2 turns</b>. Empty-cell rules are the same as other themes. Solo hints, shuffles and automatic dead-end fixes all still work.');
  add('help.assist', '提示與洗牌', 'Hints and Shuffles');
  add('help.assistBody',
    '💡 <b>提示</b>會幫你點亮一組還能連的水果。🔀 <b>洗牌</b>會把盤面上剩下的水果重新排一次，而且保證重排後一定還有解。<br>盤面消掉之後<b>位置固定不動</b>，所以偶爾會走到「誰都連不到」的死局 —— 這時候系統會<b>自動免費洗牌</b>，不會浪費你的次數。線上競速為了公平，沒有手動提示與洗牌。',
    '💡 <b>Hint</b> lights up a pair you can still match. 🔀 <b>Shuffle</b> rearranges the remaining tiles and always leaves at least one solution.<br>Tiles <b>stay in place</b> once others are cleared, so you can sometimes hit a dead end where nothing connects. The game then <b>shuffles for free automatically</b> without using up your count. Online races have no manual hints or shuffles, to keep things fair.');
  add('help.online', '線上競速', 'Online Race');
  add('help.onlineBody',
    '房間裡最多 6 個人<b>共用同一張盤面</b>，同一對水果<b>誰先連到就是誰的分</b>，慢一步就會撲空（但不扣分）。時間到或盤面清空就結算，分數最高的人贏。<br>席位滿了或對局進行中進來的人會變成<b>觀戰</b>，看得到盤面和聊天室，但不能出手；下一局才能下場。線上競速不提供手動提示與洗牌，遇到死局時由系統自動重排。房主可以產生<b>邀請連結</b>，連結有使用次數與有效期限，也可以隨時撤銷。',
    'Up to 6 players <b>share one board</b> in a room. Whoever matches a pair first <b>gets the points</b>; arrive a moment late and you miss it (with no penalty). When time runs out or the board is cleared, the highest score wins.<br>If seats are full or a round is already underway, you join as a <b>spectator</b>: you can watch the board and chat but not play until the next round. Online races have no manual hints or shuffles; dead ends are reshuffled automatically. The host can create <b>invite links</b> with a use limit and an expiry, and can revoke them at any time.');
  add('help.controls', '操作', 'Controls');
  add('help.controlsBody',
    '<b>觸控／滑鼠</b>：點一下選起來，再點第二個就送出；點同一個可以取消。<br><b>鍵盤</b>：方向鍵移動、Enter 或空白鍵選取、Esc 取消選取。<br><b>螢幕閱讀器</b>：每一格都會唸出是第幾列第幾行、哪一種水果、有沒有被選起來。',
    '<b>Touch / mouse</b>: tap to select, tap a second tile to match; tap the same tile again to deselect.<br><b>Keyboard</b>: arrow keys to move, Enter or Space to select, Esc to deselect.<br><b>Screen readers</b>: every cell announces its row, column, which tile it is, and whether it is selected.');
  add('help.settings', '遊戲設定', 'Game Settings');
  add('help.settingsBody',
    '每個畫面<b>右上角的 ⚙</b> 都能開設定：背景音樂與音效可以分開開關與調音量，還有觸控震動、減少動態，以及「顯示水果名稱」（預設開啟；手機上格子太小會自動隱藏，不蓋住水果；麻將牌不顯示）。',
    'The <b>⚙ in the top-right corner</b> of every screen opens settings: music and sound effects have separate switches and volumes, plus touch vibration, reduced motion, and “Show fruit names” (on by default; hidden automatically when tiles are too small on phones; not shown on mahjong tiles).');

  /* ---------- 我的紀錄 ---------- */
  add('stats.aria', '我的紀錄', 'My records');
  add('stats.title', '🏅 我的紀錄', '🏅 My Records');
  add('stats.best', '每一關的最佳成績', 'Best Result per Level');
  add('stats.bestRow', '最高分 <b>{score}</b>　最快 <b>{sec}</b> 秒　最高 <b>{combo}</b> 連擊',
    'Best score <b>{score}</b>　Fastest <b>{sec}</b>s　Top combo <b>{combo}</b>');
  add('stats.none', '還沒有紀錄', 'No record yet');
  add('stats.totals', '累計戰績', 'Totals');
  add('stats.soloClear', '單機過關', 'Solo cleared');
  add('stats.soloFail', '單機失敗', 'Solo failed');
  add('stats.onlineWin', '線上第一名', 'Online wins');
  add('stats.onlineLose', '線上未奪冠', 'Online losses');
  add('stats.note', '紀錄只存在這台裝置的瀏覽器裡，不會上傳到任何地方。',
    'Records are stored only in this device’s browser and are never uploaded.');
  add('stats.reset', '清除本機紀錄', 'Clear Records');
  add('stats.confirm', '要清除這台裝置上的所有紀錄嗎？清掉就找不回來了。', 'Clear all records on this device? This cannot be undone.');
  add('stats.confirmYes', '清除', 'Clear');
  add('stats.cleared', '已清除本機紀錄', 'Records cleared');

  /* ---------- 線上大廳 ---------- */
  add('lobby.aria', '線上大廳', 'Online lobby');
  add('lobby.title', '線上競速', 'Online Race');
  add('conn.idle', '尚未連線', 'Not connected');
  add('conn.loading', '正在載入連線程式…', 'Loading the connection library…');
  add('conn.connecting', '連線中…（免費方案冷啟動可能要十幾秒）', 'Connecting… (a free server can take 10+ seconds to wake up)');
  add('conn.connected', '已連線：{host}', 'Connected: {host}');
  add('conn.error', '連線失敗', 'Connection failed');
  add('conn.offline', '沒有可用的伺服器，只能玩單機', 'No server available. Solo play only.');
  add('conn.reconnect', '重新連線', 'Reconnect');
  add('lobby.nick', '玩家暱稱', 'Your Nickname');
  add('lobby.nickPh', '水果高手', 'Fruit Pro');
  add('lobby.inviteTitle', '收到房間邀請', 'Room Invitation');
  add('lobby.inviteNote', '請先設定你的暱稱，再加入這間水果連線房間。', 'Set your nickname first, then join this Fruit Link room.');
  add('lobby.inviteNoteToken', '請先設定你的暱稱，再加入這間受邀的水果連線房間。', 'Set your nickname first, then join this room you were invited to.');
  add('lobby.inviteNoteSpec', '這是觀戰邀請，請設定暱稱後加入。', 'This is a spectator invite. Set a nickname, then join.');
  add('lobby.inviteNotePlayer', '這是玩家邀請，請設定暱稱後加入。', 'This is a player invite. Set a nickname, then join.');
  add('lobby.inviteJoin', '以此暱稱加入', 'Join');
  add('lobby.newRoom', '開一間新房', 'Create a Room');
  add('lobby.roomNamePh', '房間名稱（可留空）', 'Room name (optional)');
  add('lobby.private', '私人房間（只能用邀請連結進來）', 'Private room (invite link only)');
  add('lobby.create', '建立房間', 'Create');
  add('lobby.byCode', '用房號加入', 'Join by Code');
  add('lobby.codeAria', '房號', 'Room code');
  add('lobby.join', '加入房間', 'Join');
  add('lobby.public', '公開房間', 'Public Rooms');
  add('lobby.refresh', '🔄 重新整理', '🔄 Refresh');
  add('lobby.noteEnabled',
    '在電腦上執行「啟動遊戲.bat」之後，同一個 Wi-Fi 的平板或手機打開視窗裡印出的「同網段」網址，就會進到同一個大廳。',
    'Run “npm start” on a computer, then open the “same network” address it prints on a tablet or phone on the same Wi-Fi to reach the same lobby.');
  add('lobby.noteDisabled', '目前沒有設定遊戲伺服器，只能玩單機闖關。', 'No game server is set up, so only solo play is available.');
  add('lobby.empty', '現在沒有公開房間，按「建立房間」開一間吧。', 'No public rooms right now. Press “Create” to start one.');
  add('lobby.roomMeta', '房號 {code}　{level}（{board}）　{theme}', 'Code {code}　{level} ({board})　{theme}');
  add('lobby.phasePlaying', '對戰中', 'Playing');
  add('lobby.phaseCountdown', '倒數中', 'Starting');
  add('lobby.phaseOver', '剛結束', 'Finished');
  add('lobby.phaseWaiting', '等待中', 'Waiting');
  add('lobby.players', '玩家 {n}/{max}', 'Players {n}/{max}');
  add('lobby.specs', '觀戰 {n}', 'Watching {n}');
  add('lobby.sit', '加入', 'Join');
  add('lobby.watch', '觀戰', 'Watch');
  add('lobby.needCode', '請先輸入房號', 'Enter a room code first');
  add('lobby.notConnected', '還沒連上伺服器', 'Not connected to the server yet');
  add('lobby.needNick', '請先輸入暱稱，再加入邀請房間', 'Enter a nickname before joining the invited room');
  add('lobby.defaultNick', '玩家', 'Player');
  add('lobby.downgraded', '玩家席位滿了，你先以觀戰身分進來', 'Player seats are full, so you joined as a spectator');
  add('lobby.waiting', '這一局已經開始了，先觀戰，下一局再下場', 'This round has already started. Watch for now and play next round');
  add('lobby.inviteBad', '這個邀請連結沒有用了', 'This invite link no longer works');
  add('lobby.reconnected', '重新連上線了', 'Reconnected');
  add('lobby.closed', '房間已經關閉', 'The room has closed');
  add('lobby.opFailed', '操作失敗', 'Something went wrong');
  add('cfg.invalid', '設定有誤（線上已停用）', 'Invalid setup (online disabled)');
  add('cfg.unset', '未設定（只能玩單機）', 'Not set (solo only)');
  add('cfg.query', '（網址參數）', ' (URL parameter)');
  add('cfg.injected', '（建置注入）', ' (build-time)');
  add('cfg.same', '（同源）', ' (same origin)');
  add('cfg.badUrl', '不是合法的絕對網址：{raw}', 'Not a valid absolute URL: {raw}');
  add('cfg.badProto', '只接受 http 或 https：{raw}', 'Only http or https is accepted: {raw}');
  add('cfg.mixed', 'https 頁面不能連 http 伺服器（混合內容會被瀏覽器擋掉）：{raw}', 'An https page can’t connect to an http server (blocked as mixed content): {raw}');
  add('net.noUrl', '沒有設定遊戲伺服器位址。', 'No game server address is set.');
  add('net.unreachable', '連不到遊戲伺服器（{host}），請確認伺服器有開著。', 'Can’t reach the game server ({host}). Make sure it is running.');
  add('net.noServer', '目前沒有可用的遊戲伺服器，只能玩單機。', 'No game server is available. Solo play only.');
  add('net.dropped', '連線中斷（{reason}），正在重試…', 'Connection lost ({reason}). Retrying…');
  add('net.failed', '連不上伺服器：{msg}', 'Can’t reach the server: {msg}');
  add('net.unknown', '未知錯誤', 'unknown error');
  add('net.timeout', '伺服器沒有回應（免費方案冷啟動可能要十幾秒，請再試一次）。', 'The server did not respond (a free server can take 10+ seconds to wake up). Please try again.');
  add('net.refused', '伺服器拒絕連線。', 'The server refused the connection.');
  add('net.offlineSend', '目前沒有連線，動作沒有送出去。請等重新連線後再試。', 'You are offline, so that action was not sent. Please try again after reconnecting.');
  add('lat.waitAria', '連線延遲，等待回應', 'Connection latency, waiting for a reply');
  add('lat.valueAria', '連線延遲 {ms} 毫秒', 'Connection latency {ms} milliseconds');
  add('lat.waitTitle', '連線延遲：等待回應', 'Latency: waiting for a reply');
  add('lat.valueTitle', '連線延遲：{ms} ms', 'Latency: {ms} ms');

  /* ---------- 對局 HUD ---------- */
  add('game.aria', '遊戲畫面', 'Game');
  add('game.boardAria', '水果盤面', 'Tile board');
  add('hud.quit', '離開這一局', 'Leave this round');
  add('hud.restart', '重新開始新的一局', 'Restart this level');
  add('hud.time', '剩餘', 'Time');
  add('hud.score', '分數', 'Score');
  add('hud.left', '剩餘水果', 'Left');
  add('hud.combo', '連擊', 'Combo');
  add('hud.hint', '💡 提示', '💡 Hint');
  add('hud.shuffle', '🔀 洗牌', '🔀 Shuffle');
  add('side.aria', '戰況與聊天', 'Status and chat');
  add('side.tabsAria', '側欄分頁', 'Side panel tabs');
  add('side.sum', '戰況', 'Status');
  add('side.chat', '聊天', 'Chat');
  add('side.close', '收起側欄', 'Close side panel');
  add('side.openSum', '打開戰況', 'Open status');
  add('side.openChat', '打開聊天室', 'Open chat');
  add('side.rank', '即時排行', 'Live Ranking');
  add('side.chatLog', '聊天訊息', 'Chat messages');
  add('side.chatPh', '說點什麼…', 'Say something…');
  add('side.chatInput', '輸入聊天訊息', 'Type a chat message');
  add('side.send', '送出', 'Send');
  add('side.noChat', '單機闖關沒有聊天室。', 'There is no chat in solo play.');
  add('side.noChatToast', '單機闖關沒有聊天室', 'There is no chat in solo play');
  add('side.specTag', ' · 觀戰', ' · Watching');
  add('side.comboSmall', '{n} 連擊', '{n} combo');
  add('side.pairsSmall', '{n} 對', '{n} pairs');
  add('side.roomOnline', '房號 <b>{code}</b><br>{name}<br>{level}　{cols} × {rows}　{theme}<br>觀戰 {specs} 人',
    'Room <b>{code}</b><br>{name}<br>{level}　{cols} × {rows}　{theme}<br>Watching: {specs}');
  add('side.roomSolo', '單機闖關<br><b>{level}</b>　{cols} × {rows}<br>{theme}<br>累計 <b>{total}</b> 分',
    'Solo Levels<br><b>{level}</b>　{cols} × {rows}<br>{theme}<br>Total <b>{total}</b> pts');
  add('side.myStat', '已連 {pairs} 對 · 連錯 {misses} 次 · 最高 {combo} 連擊<br>剩餘水果 {left} 個',
    '{pairs} pairs · {misses} misses · best combo {combo}<br>{left} tiles left');
  add('side.autoShuffle', '<br>系統自動洗牌 {n} 次', '<br>Auto shuffles: {n}');
  add('side.spectating', '你正在觀戰：看得到盤面與聊天室，但不能出手。', 'You are spectating: you can see the board and chat but can’t play.');

  add('tile.empty', '空格', 'Empty');
  add('tile.fallback', '圖案', 'Tile');
  add('tile.stackAria', '第 {z} 層，第 {r} 列第 {c} 行，{name}', 'Layer {z}, row {r}, column {c}, {name}');
  add('tile.flatAria', '第 {r} 列第 {c} 行，{name}', 'Row {r}, column {c}, {name}');

  add('play.countdown', '還在倒數，先別急', 'Still counting down. Hold on!');
  add('play.spectator', '你正在觀戰，不能出手', 'You are spectating and can’t play');
  add('play.locked', '這張被壓住了，要先把疊在上面的牌消掉', 'This tile is covered. Clear the tiles on top first');
  add('play.missStack', '這兩張配不起來（要同圖案、同層、上方露出，路徑只經過該層空格且在 2 折以內）',
    'Those two don’t match (same picture, same layer, uncovered, and a path through empty cells on that layer with at most 2 turns)');
  add('play.missFlat', '這兩顆連不起來（路徑要轉彎 2 次以內、而且只能經過空格）',
    'Those two can’t connect (the path needs at most 2 turns and may only cross empty cells)');
  add('play.shuffleAuto', '沒有水果連得到了，系統自動幫大家洗牌（不算次數）', 'No matches left, so the game shuffled for everyone (it doesn’t use up a shuffle)');
  add('play.shuffled', '已經洗牌', 'Shuffled');
  add('play.go', '開始！', 'Go!');
  add('play.combo5', '5 連擊！', '5 combo!');
  add('play.combo10', '10 連擊！！', '10 combo!!');

  /* ---------- 等待與結算 ---------- */
  add('wait.title', '準備開始', 'Get Ready');
  add('wait.titleRoom', '{name}（房號 {code}）', '{name} (code {code})');
  add('wait.level', '關卡（房主設定）', 'Level (host sets)');
  add('wait.levelAria', '關卡', 'Level');
  add('wait.theme', '圖案主題（房主設定）', 'Tile theme (host sets)');
  add('wait.themeAria', '圖案主題', 'Tile theme');
  add('wait.levelCard', '{cols}×{rows}　{sec} 秒', '{cols}×{rows}　{sec}s');
  add('wait.note',
    '圖案：<b>{theme}</b>（{n} 種，每局隨機抽）<br>關卡：<b>{level}</b>　{cols} × {rows}　{sec} 秒<br>最多 {seats} 人共用同一張盤面，同一對水果誰先連到就是誰的分。',
    'Tiles: <b>{theme}</b> ({n} designs, random each round)<br>Level: <b>{level}</b>　{cols} × {rows}　{sec}s<br>Up to {seats} players share one board; whoever matches a pair first scores it.');
  add('wait.blocked', '<br>還不能開始：{why}', '<br>Can’t start yet: {why}');
  add('wait.cancelReady', '取消準備', 'Not Ready');
  add('wait.ready', '我準備好了 ✔', 'I’m Ready ✔');
  add('wait.sit', '我要下場 🎮', 'Play 🎮');
  add('wait.stand', '改成觀戰 👀', 'Watch 👀');
  add('wait.start', '開始遊戲 ▶', 'Start ▶');
  add('wait.invite', '邀請朋友 🔗', 'Invite 🔗');
  add('wait.leave', '離開房間', 'Leave Room');
  add('seat.host', '房主', 'Host');
  add('seat.spec', '觀戰', 'Watching');
  add('seat.ready', '準備好了', 'Ready');
  add('seat.waiting', '等待中', 'Waiting');
  add('seat.off', '斷線', 'Offline');
  add('seat.empty', '還沒有人在房間裡', 'Nobody is in the room yet');

  add('result.title', '結算', 'Results');
  add('result.levelClear', '{level} 過關！', '{level} cleared!');
  add('result.allClear', '🎉 {n} 關全部通過！', '🎉 All {n} levels cleared!');
  add('result.timeUp', '⏰ 時間到', '⏰ Time’s up');
  add('result.boardClear', '🎉 盤面清空！', '🎉 Board cleared!');
  add('result.thisLevel', '這一關', 'This level');
  add('result.line', '{pairs} 對 · 最高 {combo} 連擊 · 連錯 {misses} 次', '{pairs} pairs · best combo {combo} · {misses} misses');
  add('result.bonus', ' · 時間 +{n}', ' · time +{n}');
  add('result.total', '本次闖關累計', 'Run total');
  add('result.best', '這一關的個人最佳：{score} 分 · {sec} 秒 · {combo} 連擊', 'Your best on this level: {score} pts · {sec}s · combo {combo}');
  add('result.left', '盤面上還剩 {n} 個水果。<br>提示和洗牌用完就沒有了，記得留一點在後面。',
    '{n} tiles were left on the board.<br>Hints and shuffles run out, so save some for later.');
  add('result.next', '下一關 ▶', 'Next ▶');
  add('result.again', '再玩這一關 🔁', 'Replay 🔁');
  add('result.retry', '再挑戰一次 🔁', 'Try Again 🔁');
  add('result.home', '回主選單 🏠', 'Home 🏠');
  add('result.draw', '同分平手！', 'It’s a tie!');
  add('result.champion', '冠軍是 <b>{name}</b>，{score} 分。', 'The champion is <b>{name}</b> with {score} points.');
  add('result.myRank', '<br>你是第 {rank} 名。', '<br>You placed #{rank}.');
  add('result.watched', '<br>你這一局是觀戰。', '<br>You were watching this round.');
  add('result.rematch', '再來一局 🔁（{votes}/{need}）', 'Rematch 🔁 ({votes}/{need})');
  add('result.toRoom', '回房間準備', 'Back to Room');
  add('result.dash', '—', '—');

  /* ---------- 設定彈窗 ---------- */
  add('set.title', '⚙ 遊戲設定', '⚙ Settings');
  add('set.close', '關閉設定', 'Close settings');
  add('set.music', '背景音樂', 'Music');
  add('set.musicVol', '音樂音量', 'Music volume');
  add('set.sfx', '遊戲音效', 'Sound effects');
  add('set.sfxVol', '音效音量', 'Effects volume');
  add('set.haptic', '觸控震動', 'Vibration');
  add('set.hapticSub', '連到、連錯時輕輕震一下', 'A light buzz on matches and misses');
  add('set.motion', '減少動態', 'Reduce motion');
  add('set.motionSub', '關掉飄浮裝飾與消除動畫', 'Turns off floating decorations and clear animations');
  add('set.label', '顯示水果名稱', 'Show fruit names');
  add('set.labelSub', '每一格加上文字，不只靠顏色分辨（手機格子太小時會自動隱藏）',
    'Adds text to every tile so you don’t rely on colour alone (auto-hidden when tiles are small on phones)');
  add('set.server', '線上伺服器：{host}', 'Online server: {host}');
  add('set.reset', '恢復預設', 'Reset');
  add('set.done', '完成', 'Done');
  add('set.resetDone', '已恢復預設設定', 'Settings reset to default');

  /* ---------- 邀請彈窗 ---------- */
  add('inv.title', '🔗 邀請朋友', '🔗 Invite Friends');
  add('inv.close', '關閉', 'Close');
  add('inv.role', '要邀請成什麼身分', 'Invite as');
  add('inv.roleAria', '邀請身分', 'Invite role');
  add('inv.player', '下場玩', 'Player');
  add('inv.playerSub', '席位滿了會自動變觀戰', 'Becomes a spectator if seats are full');
  add('inv.spec', '只觀戰', 'Spectator');
  add('inv.specSub', '看得到盤面，不能出手', 'Can watch the board but not play');
  add('inv.make', '產生邀請連結', 'Create Link');
  add('inv.urlAria', '邀請連結', 'Invite link');
  add('inv.copy', '複製', 'Copy');
  add('inv.note', '邀請連結預設 30 分鐘內有效、最多 5 個人用，隨時可以撤銷。', 'The invite link is valid for 30 minutes and up to 5 people by default, and can be revoked at any time.');
  add('inv.made', '這張邀請是「{role}」身分，最多 {max} 個人用，{time} 之前有效。', 'This invite is for “{role}”, up to {max} people, valid until {time}.');
  add('inv.list', '已產生的邀請', 'Invites Created');
  add('inv.empty', '還沒有產生過邀請連結', 'No invite links yet');
  add('inv.revoked', '已撤銷', 'Revoked');
  add('inv.expired', '已過期', 'Expired');
  add('inv.used', '已用完', 'Used up');
  add('inv.valid', '有效', 'Valid');
  add('inv.row', '{role}　{why}　用了 {uses}/{max}', '{role}　{why}　used {uses}/{max}');
  add('inv.revoke', '撤銷', 'Revoke');
  add('inv.revokedToast', '已撤銷這張邀請', 'Invite revoked');
  add('inv.copied', '邀請連結已複製', 'Invite link copied');
  add('inv.copyManual', '請手動選取複製', 'Please select and copy it manually');

  /* ---------- 確認彈窗 ---------- */
  add('confirm.title', '確認', 'Confirm');
  add('confirm.leaveRoom', '要離開這個房間嗎？離開之後座位會讓給別人。', 'Leave this room? Your seat will go to someone else.');
  add('confirm.leaveSolo', '要離開這一關嗎？目前的進度不會保留。', 'Leave this level? Your progress will not be saved.');
  add('confirm.leave', '離開', 'Leave');
  add('confirm.restart', '要重新開始新的一局嗎？這一關目前的進度不會保留。', 'Start a new round? Progress on this level will not be saved.');
  add('confirm.restartYes', '重新開始', 'Restart');

  /* ---------- 伺服器與規則訊息（用 I18N.srv 對照；zh 必須與伺服器原文一致） ---------- */
  var SRV = [];
  function srv(id, zh, en) { var k = 'srv.' + id; add(k, zh, en); SRV.push([k, zh]); }
  /* rules.js */
  srv('notInMatch', '你不在這一局裡。', 'You are not in this round.');
  srv('matchOver', '這一局已經結束了。', 'This round is already over.');
  srv('countdown', '還在倒數，先別急。', 'Still counting down. Hold on!');
  srv('badCell', '格子編號不合法。', 'Invalid cell.');
  srv('noHint', '提示已經用完了。', 'No hints left.');
  srv('noPair', '現在沒有可以連的水果，用洗牌吧。', 'Nothing to match right now. Try a shuffle.');
  srv('noShuffle', '洗牌次數已經用完了。', 'No shuffles left.');
  srv('fewTiles', '剩下的水果太少了，不用洗。', 'Too few tiles left to shuffle.');
  /* lib/rooms.js */
  srv('roomFull', '這個房間人太多了（含觀戰上限 {n} 人）。', 'This room is too crowded (limit {n} including spectators).');
  srv('private', '這是私人房間，需要邀請連結才能進來。', 'This is a private room. You need an invite link.');
  srv('notInRoom', '你不在這個房間裡。', 'You are not in this room.');
  srv('startedNoSit', '這一局已經開始了，等結束之後才能下場。', 'This round has already started. You can play after it ends.');
  srv('seatsFull', '玩家席位已經滿了（最多 {n} 人），可以先觀戰。', 'Player seats are full (max {n}). You can watch for now.');
  srv('noLeaveSeat', '對局進行中不能中途離席。', 'You can’t leave your seat during a round.');
  srv('specNoReady', '觀戰中不需要準備。', 'Spectators don’t need to get ready.');
  srv('noReadyChange', '對局進行中不能改準備狀態。', 'You can’t change ready status during a round.');
  srv('whyRunning', '這一局已經在進行中', 'This round is already in progress');
  srv('whyNoPlayers', '至少要有一位玩家下場', 'At least one player must take a seat');
  srv('whyNotReady', '{names} 還沒按準備', '{names} not ready yet');
  srv('cannotStart', '{why}，還不能開始。', '{why}. Can’t start yet.');
  srv('hostLevel', '只有房主可以改關卡。', 'Only the host can change the level.');
  srv('noLevelChange', '對局進行中不能改關卡。', 'You can’t change the level during a round.');
  srv('badLevel', '沒有這個關卡。', 'No such level.');
  srv('hostTheme', '只有房主可以改造型。', 'Only the host can change the theme.');
  srv('noThemeChange', '對局進行中不能改造型。', 'You can’t change the theme during a round.');
  srv('badTheme', '沒有這個造型主題。', 'No such theme.');
  srv('hostStart', '只有房主可以開始。', 'Only the host can start.');
  srv('specNoPlay', '觀戰中不能出手。', 'Spectators can’t play.');
  srv('notYet', '現在還不能出手。', 'You can’t play yet.');
  srv('specNoHint', '觀戰中不能用提示。', 'Spectators can’t use hints.');
  srv('onlineNoHint', '線上對戰不提供提示。', 'Hints are not available in online games.');
  srv('specNoShuffle', '觀戰中不能洗牌。', 'Spectators can’t shuffle.');
  srv('onlineNoShuffle', '線上對戰不提供手動洗牌。', 'Manual shuffles are not available in online games.');
  srv('notOver', '這一局還沒結束。', 'This round isn’t over yet.');
  srv('specNoRematch', '觀戰中不能投票再來一局。', 'Spectators can’t vote for a rematch.');
  srv('hostReset', '只有房主可以重開房間。', 'Only the host can reset the room.');
  srv('stillRunning', '對局還在進行中。', 'A round is still in progress.');
  srv('muted', '你被暫時禁言，還要等 {n} 秒。', 'You are muted for {n} more seconds.');
  srv('slowDown', '打字慢一點，別洗版。', 'Slow down, please don’t spam.');
  srv('emptyMsg', '訊息是空的。', 'The message is empty.');
  srv('hostMute', '只有房主可以禁言。', 'Only the host can mute.');
  srv('noSuchPerson', '找不到這個人。', 'Can’t find that person.');
  srv('muteSelf', '不能禁言自己。', 'You can’t mute yourself.');
  srv('hostInvite', '只有房主可以產生邀請連結。', 'Only the host can create invite links.');
  srv('hostRevoke', '只有房主可以撤銷邀請連結。', 'Only the host can revoke invite links.');
  srv('noInvite', '找不到這張邀請。', 'Can’t find that invite.');
  srv('inviteBad', '這個邀請連結無效（可能已被撤銷，或房主重開了房間）。', 'This invite link is invalid (it may have been revoked, or the host reset the room).');
  srv('inviteRevoked', '這個邀請連結已經被房主撤銷了。', 'The host has revoked this invite link.');
  srv('inviteExpired', '這個邀請連結已經過期了。', 'This invite link has expired.');
  srv('inviteUsed', '這個邀請連結的使用次數已經用完了。', 'This invite link has no uses left.');
  srv('noteSpecInvite', '這是觀戰用的邀請連結，進去之後是觀戰身分。', 'This is a spectator invite link. You will join as a spectator.');
  srv('noteSeatsFull', '玩家席位已滿，進去之後會先變成觀戰。', 'Player seats are full. You will join as a spectator for now.');
  srv('noteRunning', '這間房正在對戰中，進去之後會先觀戰，下一局才能下場。', 'This room is mid-round. You will watch first and can play next round.');
  srv('tooManyRooms', '伺服器上的房間太多了，請稍後再試。', 'The server has too many rooms. Please try again later.');
  srv('codeFail', '產生房號失敗，請再試一次。', 'Couldn’t create a room code. Please try again.');
  srv('goneNamed', '{n} 太久沒回來，座位已經釋出。', '{n} was away too long, so the seat was released.');
  /* server.js */
  srv('noSession', '連線還沒準備好，請重新整理頁面。', 'The connection isn’t ready. Please refresh the page.');
  srv('roomGone', '找不到這個房間，可能已經關閉或房號打錯了。', 'Can’t find that room. It may have closed, or the code is wrong.');
  srv('inviteRoomGone', '這個邀請連結指向的房間已經不存在了。', 'The room this invite points to no longer exists.');
  srv('notAnywhere', '你已經不在任何房間裡了。', 'You are no longer in any room.');
  srv('sysOpened', '{n} 開了這間房。大家按「準備好了」就能開始搶消。', '{n} opened this room. Everyone press “Ready” to start the race.');
  srv('sysBack', '{n} 重新連上線了。', '{n} is back online.');
  srv('sysJoinedPlayer', '{n} 加入了（玩家）。', '{n} joined (player).');
  srv('sysJoinedSpec', '{n} 加入了（觀戰）。', '{n} joined (spectator).');
  srv('sysSat', '{n} 從觀戰改成下場。', '{n} switched from watching to playing.');
  srv('sysStood', '{n} 改成觀戰。', '{n} switched to watching.');
  srv('sysLevel', '關卡改成「{label}」。', 'Level changed to “{label}”.');
  srv('sysTheme', '造型換成「{label}」（{count} 種）。', 'Theme changed to “{label}” ({count} designs).');
  srv('sysDealt', '盤面發好了！這一局的種子是 {seed}。', 'The board is dealt! This round’s seed is {seed}.');
  srv('sysCleared', '盤面清空了！冠軍是 {n}，{s} 分。', 'Board cleared! The champion is {n} with {s} points.');
  srv('sysEnded', '這一局結束了。', 'The round is over.');
  srv('sysShuffle', '{n} 洗了一次牌。', '{n} used a shuffle.');
  srv('sysRematchGo', '大家都同意，新的一局開始了！', 'Everyone agreed. A new round begins!');
  srv('sysRematchVote', '{n} 想再來一局（{v}/{need}）。', '{n} wants a rematch ({v}/{need}).');
  srv('sysReset', '房主把房間拉回準備階段，可以換座位或改關卡了。', 'The host moved the room back to setup. You can change seats or levels now.');
  srv('sysMuted', '{n} 被房主暫時禁言 {s} 秒。', '{n} was muted by the host for {s} seconds.');
  srv('sysEmpty', '房間沒有人了，已經自動關閉。', 'The room is empty and was closed automatically.');
  srv('sysLeft', '{n} 離開了房間。', '{n} left the room.');
  srv('sysDisc', '{n} 斷線了，座位會先保留一分鐘。', '{n} disconnected. Their seat is held for one minute.');
  srv('sysTimeTie', '時間到！{names} 同分平手。', 'Time’s up! {names} tied.');
  srv('sysTimeWin', '時間到！冠軍是 {n}，{s} 分。', 'Time’s up! The champion is {n} with {s} points.');

  /* ---------- 造型名稱 ---------- */
  function art(theme, list) {
    list.forEach(function (x) { add('art.' + theme + '.' + x[0], x[1], x[2]); });
  }
  art('fruits', [
    ['apple', '蘋果', 'Apple'], ['pear', '梨子', 'Pear'], ['banana', '香蕉', 'Banana'], ['orange', '橘子', 'Orange'],
    ['grape', '葡萄', 'Grapes'], ['strawberry', '草莓', 'Strawberry'], ['watermelon', '西瓜', 'Watermelon'], ['peach', '水蜜桃', 'Peach'],
    ['cherry', '櫻桃', 'Cherry'], ['pineapple', '鳳梨', 'Pineapple'], ['lemon', '檸檬', 'Lemon'], ['kiwi', '奇異果', 'Kiwi'],
    ['mango', '芒果', 'Mango'], ['blueberry', '藍莓', 'Blueberry'], ['avocado', '酪梨', 'Avocado'], ['coconut', '椰子', 'Coconut'],
    ['papaya', '木瓜', 'Papaya'], ['persimmon', '柿子', 'Persimmon'], ['carrot', '紅蘿蔔', 'Carrot'], ['tomato', '番茄', 'Tomato'],
    ['broccoli', '花椰菜', 'Broccoli'], ['corn', '玉米', 'Corn'], ['pumpkin', '南瓜', 'Pumpkin'], ['eggplant', '茄子', 'Eggplant'],
    ['potato', '馬鈴薯', 'Potato'], ['onion', '洋蔥', 'Onion'], ['mushroom', '香菇', 'Mushroom'], ['pepper', '甜椒', 'Pepper'],
    ['cucumber', '小黃瓜', 'Cucumber'], ['cabbage', '高麗菜', 'Cabbage'], ['peas', '豌豆', 'Peas'], ['radish', '白蘿蔔', 'Radish'],
    ['guava', '芭樂', 'Guava'], ['dragonfruit', '火龍果', 'Dragon Fruit'], ['melon', '哈密瓜', 'Melon'], ['durian', '榴槤', 'Durian'],
    ['pomegranate', '石榴', 'Pomegranate'], ['sweet-potato', '地瓜', 'Sweet Potato'], ['garlic', '大蒜', 'Garlic'], ['chili', '辣椒', 'Chili'],
    ['scallion', '蔥', 'Scallion'], ['bitter-melon', '苦瓜', 'Bitter Melon'], ['plum', '李子', 'Plum'], ['fig', '無花果', 'Fig'],
    ['lychee', '荔枝', 'Lychee'], ['starfruit', '楊桃', 'Starfruit'], ['passionfruit', '百香果', 'Passion Fruit'], ['raspberry', '覆盆子', 'Raspberry'],
    ['mangosteen', '山竹', 'Mangosteen'], ['loquat', '枇杷', 'Loquat'], ['celery', '芹菜', 'Celery'], ['asparagus', '蘆筍', 'Asparagus'],
    ['spinach', '菠菜', 'Spinach'], ['okra', '秋葵', 'Okra'], ['beetroot', '甜菜根', 'Beetroot'], ['ginger', '薑', 'Ginger'],
    ['lotus-root', '蓮藕', 'Lotus Root'], ['bamboo-shoot', '竹筍', 'Bamboo Shoot'], ['taro', '芋頭', 'Taro'], ['chestnut', '栗子', 'Chestnut']
  ]);
  art('animals', [
    ['cat', '貓咪', 'Cat'], ['dog', '小狗', 'Dog'], ['rabbit', '兔子', 'Rabbit'], ['bear', '熊', 'Bear'],
    ['panda', '貓熊', 'Panda'], ['fox', '狐狸', 'Fox'], ['pig', '小豬', 'Pig'], ['cow', '乳牛', 'Cow'],
    ['sheep', '綿羊', 'Sheep'], ['monkey', '猴子', 'Monkey'], ['lion', '獅子', 'Lion'], ['tiger', '老虎', 'Tiger'],
    ['elephant', '大象', 'Elephant'], ['giraffe', '長頸鹿', 'Giraffe'], ['zebra', '斑馬', 'Zebra'], ['hippo', '河馬', 'Hippo'],
    ['koala', '無尾熊', 'Koala'], ['deer', '小鹿', 'Deer'], ['squirrel', '松鼠', 'Squirrel'], ['hedgehog', '刺蝟', 'Hedgehog'],
    ['frog', '青蛙', 'Frog'], ['penguin', '企鵝', 'Penguin'], ['owl', '貓頭鷹', 'Owl'], ['chick', '小雞', 'Chick'],
    ['duck', '鴨子', 'Duck'], ['whale', '鯨魚', 'Whale'], ['dolphin', '海豚', 'Dolphin'], ['octopus', '章魚', 'Octopus'],
    ['crab', '螃蟹', 'Crab'], ['turtle', '烏龜', 'Turtle'], ['snail', '蝸牛', 'Snail'], ['bee', '蜜蜂', 'Bee'],
    ['mouse', '老鼠', 'Mouse'], ['butterfly', '蝴蝶', 'Butterfly'], ['ladybug', '瓢蟲', 'Ladybug'], ['goldfish', '金魚', 'Goldfish'],
    ['shark', '鯊魚', 'Shark'], ['starfish', '海星', 'Starfish'], ['jellyfish', '水母', 'Jellyfish'], ['kangaroo', '袋鼠', 'Kangaroo'],
    ['raccoon', '浣熊', 'Raccoon'], ['parrot', '鸚鵡', 'Parrot'], ['horse', '馬', 'Horse'], ['camel', '駱駝', 'Camel'],
    ['sloth', '樹懶', 'Sloth'], ['bat', '蝙蝠', 'Bat'], ['swan', '天鵝', 'Swan'], ['flamingo', '紅鶴', 'Flamingo'],
    ['peacock', '孔雀', 'Peacock'], ['rooster', '公雞', 'Rooster'], ['crocodile', '鱷魚', 'Crocodile'], ['snake', '蛇', 'Snake'],
    ['seahorse', '海馬', 'Seahorse'], ['shrimp', '蝦子', 'Shrimp'], ['seal', '海豹', 'Seal'], ['scallop', '扇貝', 'Scallop'],
    ['ant', '螞蟻', 'Ant'], ['dragonfly', '蜻蜓', 'Dragonfly'], ['spider', '蜘蛛', 'Spider'], ['beetle', '獨角仙', 'Beetle']
  ]);
  art('food', [
    ['food1', '漢堡', 'Burger'], ['food2', '披薩', 'Pizza'], ['food3', '壽司', 'Sushi'], ['food4', '飯糰', 'Rice Ball'],
    ['food5', '拉麵', 'Ramen'], ['food6', '墨西哥捲', 'Burrito'], ['food7', '三明治', 'Sandwich'], ['food8', '熱狗', 'Hot Dog'],
    ['food9', '薯條', 'Fries'], ['food10', '牛排', 'Steak'], ['food11', '烤雞', 'Roast Chicken'], ['food12', '荷包蛋', 'Fried Egg'],
    ['food13', '起司', 'Cheese'], ['food14', '吐司', 'Toast'], ['food15', '可頌', 'Croissant'], ['food16', '水餃', 'Dumpling'],
    ['food17', '熱湯', 'Soup'], ['food18', '沙拉', 'Salad'], ['food19', '咖哩飯', 'Curry Rice'], ['food20', '便當', 'Bento'],
    ['food21', '爆米花', 'Popcorn'], ['food22', '蛋糕', 'Cake'], ['food23', '杯子蛋糕', 'Cupcake'], ['food24', '甜甜圈', 'Donut'],
    ['food25', '餅乾', 'Cookie'], ['food26', '巧克力', 'Chocolate'], ['food27', '糖果', 'Candy'], ['food28', '冰淇淋', 'Ice Cream'],
    ['food29', '刨冰', 'Shaved Ice'], ['food30', '咖啡', 'Coffee'], ['food31', '牛奶', 'Milk'], ['food32', '果汁', 'Juice'],
    ['pancake', '鬆餅', 'Pancake'], ['bubble-tea', '珍珠奶茶', 'Boba Tea'], ['taiyaki', '鯛魚燒', 'Taiyaki'], ['takoyaki', '章魚燒', 'Takoyaki'],
    ['pudding', '布丁', 'Pudding'], ['lollipop', '棒棒糖', 'Lollipop'], ['chips', '洋芋片', 'Chips'], ['bagel', '貝果', 'Bagel'],
    ['hotpot', '火鍋', 'Hot Pot'], ['skewer', '串燒', 'Skewer'], ['spaghetti', '義大利麵', 'Spaghetti'], ['taco', '塔可餅', 'Taco'],
    ['pretzel', '蝴蝶脆餅', 'Pretzel'], ['macaron', '馬卡龍', 'Macaron'], ['mooncake', '月餅', 'Mooncake'], ['pineapple-cake', '鳳梨酥', 'Pineapple Cake'],
    ['bao', '包子', 'Bao'], ['tofu', '豆腐', 'Tofu'], ['fried-rice', '炒飯', 'Fried Rice'], ['sausage', '香腸', 'Sausage'],
    ['sundae', '聖代', 'Sundae'], ['tea', '熱茶', 'Hot Tea'], ['soda', '汽水', 'Soda'], ['honey', '蜂蜜', 'Honey'],
    ['swiss-roll', '蛋糕捲', 'Swiss Roll'], ['cotton-candy', '棉花糖', 'Cotton Candy'], ['egg-tart', '蛋塔', 'Egg Tart'], ['sashimi', '生魚片', 'Sashimi']
  ]);
  art('flags', [
    ['taiwan', '台灣', 'Taiwan'], ['japan', '日本', 'Japan'], ['south-korea', '韓國', 'S. Korea'], ['china', '中國', 'China'],
    ['mongolia', '蒙古', 'Mongolia'], ['india', '印度', 'India'], ['singapore', '新加坡', 'Singapore'], ['thailand', '泰國', 'Thailand'],
    ['vietnam', '越南', 'Vietnam'], ['philippines', '菲律賓', 'Philippines'], ['indonesia', '印尼', 'Indonesia'], ['malaysia', '馬來西亞', 'Malaysia'],
    ['australia', '澳洲', 'Australia'], ['new-zealand', '紐西蘭', 'New Zealand'], ['united-states', '美國', 'USA'], ['canada', '加拿大', 'Canada'],
    ['mexico', '墨西哥', 'Mexico'], ['brazil', '巴西', 'Brazil'], ['argentina', '阿根廷', 'Argentina'], ['united-kingdom', '英國', 'UK'],
    ['france', '法國', 'France'], ['germany', '德國', 'Germany'], ['italy', '義大利', 'Italy'], ['spain', '西班牙', 'Spain'],
    ['portugal', '葡萄牙', 'Portugal'], ['netherlands', '荷蘭', 'Netherlands'], ['switzerland', '瑞士', 'Switzerland'], ['sweden', '瑞典', 'Sweden'],
    ['norway', '挪威', 'Norway'], ['finland', '芬蘭', 'Finland'], ['south-africa', '南非', 'S. Africa'], ['egypt', '埃及', 'Egypt'],
    ['russia', '俄羅斯', 'Russia'], ['austria', '奧地利', 'Austria'], ['hungary', '匈牙利', 'Hungary'], ['bulgaria', '保加利亞', 'Bulgaria'],
    ['lithuania', '立陶宛', 'Lithuania'], ['estonia', '愛沙尼亞', 'Estonia'], ['poland', '波蘭', 'Poland'], ['ukraine', '烏克蘭', 'Ukraine'],
    ['belgium', '比利時', 'Belgium'], ['ireland', '愛爾蘭', 'Ireland'], ['romania', '羅馬尼亞', 'Romania'], ['nigeria', '奈及利亞', 'Nigeria'],
    ['peru', '秘魯', 'Peru'], ['ivory-coast', '象牙海岸', 'Ivory Coast'], ['denmark', '丹麥', 'Denmark'], ['iceland', '冰島', 'Iceland'],
    ['czechia', '捷克', 'Czechia'], ['turkey', '土耳其', 'Turkey'], ['chile', '智利', 'Chile'], ['morocco', '摩洛哥', 'Morocco'],
    ['greece', '希臘', 'Greece'], ['colombia', '哥倫比亞', 'Colombia'], ['ghana', '迦納', 'Ghana'], ['ethiopia', '衣索比亞', 'Ethiopia'],
    ['senegal', '塞內加爾', 'Senegal'], ['cameroon', '喀麥隆', 'Cameroon'], ['armenia', '亞美尼亞', 'Armenia'], ['kenya', '肯亞', 'Kenya'],
    ['pakistan', '巴基斯坦', 'Pakistan'], ['algeria', '阿爾及利亞', 'Algeria'], ['tunisia', '突尼西亞', 'Tunisia'], ['israel', '以色列', 'Israel'],
    ['uae', '阿聯', 'UAE'], ['bangladesh', '孟加拉', 'Bangladesh'], ['laos', '寮國', 'Laos'], ['cambodia', '柬埔寨', 'Cambodia'],
    ['myanmar', '緬甸', 'Myanmar'], ['cuba', '古巴', 'Cuba'], ['jamaica', '牙買加', 'Jamaica'], ['georgia', '喬治亞', 'Georgia']
  ]);
  (function () {
    var nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var list = [];
    nums.forEach(function (n, i) { list.push(['dot-' + (i + 1), n + '筒', (i + 1) + ' Dots']); });
    nums.forEach(function (n, i) { list.push(['bam-' + (i + 1), n + '條', (i + 1) + ' Bamboo']); });
    nums.forEach(function (n, i) { list.push(['man-' + (i + 1), n + '萬', (i + 1) + ' Characters']); });
    list.push(['honor-east', '東', 'East'], ['honor-south', '南', 'South'], ['honor-west', '西', 'West'], ['honor-north', '北', 'North'],
      ['honor-red', '中', 'Red'], ['honor-green', '發', 'Green'], ['honor-white', '白', 'White'],
      ['flower-plum', '梅', 'Plum'], ['flower-orchid', '蘭', 'Orchid'], ['flower-chrysanthemum', '菊', 'Chrysanthemum'], ['flower-bamboo', '竹', 'Bamboo'],
      ['season-spring', '春', 'Spring'], ['season-summer', '夏', 'Summer'], ['season-autumn', '秋', 'Autumn'], ['season-winter', '冬', 'Winter']);
    art('mahjong', list);
  }());

  /* ---------- 註冊 ---------- */
  var zh = {}, en = {};
  D.forEach(function (r) { zh[r[0]] = r[1]; en[r[0]] = r[2]; });
  root.I18N.register('zh-Hant', zh).register('en', en);

  /* ---------- 伺服器訊息對照 ---------- */
  var srvRules = null;
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function buildRules() {
    srvRules = SRV.map(function (r) {
      var names = [];
      var src = esc(r[1]).replace(/\\\{(\w+)\\\}/g, function (m, k) { names.push(k); return '(.+?)'; });
      /* esc() 會把 { } 跳脫成 \{ \}，上面的 replace 還原成參數群組 */
      return { key: r[0], re: new RegExp('^' + src + '$'), names: names };
    });
  }

  /** 系統產生的預設名稱（玩家3、你、系統）依語言顯示；玩家自己取的暱稱原樣不動。 */
  function dispName(name) {
    var s = String(name === undefined || name === null ? '' : name);
    if (root.I18N.lang !== 'en') return s;
    var m = /^玩家(\d*)$/.exec(s);
    if (m) return root.I18N.t('common.player') + (m[1] ? ' ' + m[1] : '');
    if (s === '你') return root.I18N.t('common.you');
    if (s === '系統') return root.I18N.t('common.system');
    return s;
  }

  var labelMapCache = null;
  function labelMap() {
    if (labelMapCache) return labelMapCache;
    labelMapCache = {};
    if (root.Rules) root.Rules.LEVELS.forEach(function (l) { labelMapCache[l.label] = 'level.' + l.key + '.label'; });
    if (root.Themes) root.Themes.menu().forEach(function (t) { labelMapCache[t.label] = 'theme.' + t.key + '.label'; });
    return labelMapCache;
  }

  /** 把伺服器／規則回傳的中文訊息翻成目前語言；對不到的原樣回傳（中文介面一律原樣）。 */
  function translateSrv(text) {
    var s = String(text === undefined || text === null ? '' : text);
    if (root.I18N.lang !== 'en') return s;
    if (!srvRules) buildRules();
    for (var i = 0; i < srvRules.length; i++) {
      var r = srvRules[i];
      var m = r.re.exec(s);
      if (!m) continue;
      var p = {};
      r.names.forEach(function (k, j) {
        var v = m[j + 1];
        if (k === 'why') v = translateSrv(v);
        else if (k === 'label') { var lk = labelMap()[v]; v = lk ? root.I18N.t(lk) : v; }
        else if (k === 'names') v = v.split('、').map(dispName).join(', ');
        else if (k === 'n') v = dispName(v);
        p[k] = v;
      });
      return root.I18N.t(r.key, p);
    }
    /* 預設房名「某某 的果園」 */
    var rm = /^(.+) 的果園$/.exec(s);
    if (rm) return root.I18N.t('common.roomOf', { name: dispName(rm[1]) });
    return dispName(s);
  }

  /** 關卡／主題的中文名稱 → 目前語言（伺服器的房間清單只送中文名稱）。 */
  function labelOf(zh) {
    var s = String(zh === undefined || zh === null ? '' : zh);
    if (root.I18N.lang !== 'en') return s;
    var k = labelMap()[s];
    return k ? root.I18N.t(k) : s;
  }

  root.I18N.label = labelOf;
  root.I18N.srv = translateSrv;
  root.I18N.name = dispName;
  root.I18N_SRV_KEYS = SRV.map(function (r) { return r[0]; });
})(typeof window !== 'undefined' ? window : this);
