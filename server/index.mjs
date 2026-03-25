import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 5e6,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// ─── Game State ─────────────────────────────────────────────────────────────

const rooms = new Map();
// rooms: Map<roomCode, Room>
// Room: {
//   code, hostId, players: Map<socketId, Player>,
//   phase: 'lobby'|'write'|'draw'|'reveal'|'finished',
//   round, totalRounds, roundTime,
//   chains: Map<playerId, ChainItem[]>,
//   submissions: Map<playerId, {type,content}>,
//   revealIndex, revealChainIndex, revealTimer
// }

// Player: { id, name, avatar, score, ready }

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getRoom(code) {
  return rooms.get(code.toUpperCase());
}

function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return null;
}

function broadcastRoom(room) {
  const data = serializeRoom(room);
  io.to(room.code).emit('room:update', data);
}

function serializeRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    totalRounds: room.totalRounds,
    roundTime: room.roundTime,
    players: Array.from(room.players.values()),
    revealIndex: room.revealIndex,
    revealChainIndex: room.revealChainIndex,
    submittedIds: Array.from(room.submissions.keys()),
  };
}

function startRound(room) {
  room.submissions = new Map();
  const players = Array.from(room.players.values());

  if (room.round === 1) {
    // First round: everyone writes a phrase
    room.phase = 'write';
    io.to(room.code).emit('round:start', {
      phase: 'write',
      round: room.round,
      totalRounds: room.totalRounds,
      timeLimit: room.roundTime,
      prompt: null,
    });
  } else {
    // Alternate write/draw
    room.phase = room.round % 2 === 0 ? 'draw' : 'write';
    // Send each player their specific prompt from the chain
    players.forEach(player => {
      const chainOwner = getChainOwnerForPlayer(room, player.id);
      const chain = room.chains.get(chainOwner);
      if (!chain) return;
      const lastItem = chain[chain.length - 1];
      io.to(player.socketId).emit('round:start', {
        phase: room.phase,
        round: room.round,
        totalRounds: room.totalRounds,
        timeLimit: room.roundTime,
        prompt: lastItem || null,
        chainOwner,
      });
    });
    broadcastRoom(room);
    startRoundTimer(room);
    return;
  }

  broadcastRoom(room);
  startRoundTimer(room);
}

function getChainOwnerForPlayer(room, playerId) {
  const players = Array.from(room.players.values());
  const idx = players.findIndex(p => p.id === playerId);
  // Rotate: each round, player works on the next person's chain
  const offset = room.round - 1;
  const ownerIdx = (idx + offset) % players.length;
  return players[ownerIdx].id;
}

function startRoundTimer(room) {
  if (room.roundTimer) clearTimeout(room.roundTimer);
  room.roundTimer = setTimeout(() => {
    autoSubmitMissing(room);
  }, (room.roundTime + 2) * 1000);
}

function autoSubmitMissing(room) {
  const players = Array.from(room.players.values());
  players.forEach(player => {
    if (!room.submissions.has(player.id)) {
      const defaultContent = room.phase === 'write' ? '...' : '';
      room.submissions.set(player.id, { type: room.phase, content: defaultContent });
    }
  });
  processRoundEnd(room);
}

function processRoundEnd(room) {
  if (room.roundTimer) clearTimeout(room.roundTimer);
  const players = Array.from(room.players.values());

  // Save submissions to chains
  players.forEach(player => {
    const submission = room.submissions.get(player.id);
    if (!submission) return;

    if (room.round === 1) {
      room.chains.set(player.id, [{ type: 'write', content: submission.content, authorId: player.id, authorName: player.name }]);
    } else {
      const chainOwner = getChainOwnerForPlayer(room, player.id);
      const chain = room.chains.get(chainOwner) || [];
      chain.push({ type: submission.type, content: submission.content, authorId: player.id, authorName: player.name });
      room.chains.set(chainOwner, chain);
    }
  });

  room.round++;

  if (room.round > room.totalRounds) {
    room.phase = 'reveal';
    room.revealIndex = 0;
    room.revealChainIndex = 0;
    startReveal(room);
  } else {
    startRound(room);
  }
}

function startReveal(room) {
  room.phase = 'reveal';
  const players = Array.from(room.players.values());
  if (room.revealIndex >= players.length) {
    room.phase = 'finished';
    io.to(room.code).emit('game:finished', {
      players: players,
      chains: Object.fromEntries(room.chains),
    });
    broadcastRoom(room);
    return;
  }

  const chainOwner = players[room.revealIndex];
  const chain = room.chains.get(chainOwner.id) || [];
  const item = chain[room.revealChainIndex];

  io.to(room.code).emit('reveal:item', {
    chainOwner: chainOwner,
    chainIndex: room.revealChainIndex,
    chainLength: chain.length,
    totalChains: players.length,
    currentChain: room.revealIndex,
    item: item || null,
  });

  broadcastRoom(room);
}

// ─── Socket Events ───────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('room:create', ({ name, avatar, roundTime, totalRounds }) => {
    let code = generateCode();
    while (rooms.has(code)) code = generateCode();

    const playerId = uuidv4();
    const player = {
      id: playerId,
      socketId: socket.id,
      name: name || 'Player',
      avatar: avatar || '🎨',
      score: 0,
      ready: false,
    };

    const room = {
      code,
      hostId: playerId,
      players: new Map([[socket.id, player]]),
      phase: 'lobby',
      round: 1,
      totalRounds: Math.min(Math.max(totalRounds || 4, 2), 10),
      roundTime: Math.min(Math.max(roundTime || 60, 20), 180),
      chains: new Map(),
      submissions: new Map(),
      revealIndex: 0,
      revealChainIndex: 0,
      roundTimer: null,
    };

    rooms.set(code, room);
    socket.join(code);
    socket.emit('room:joined', { room: serializeRoom(room), player });
    broadcastRoom(room);
    console.log(`Room created: ${code} by ${name}`);
  });

  socket.on('room:join', ({ code, name, avatar }) => {
    const room = getRoom(code);
    if (!room) {
      socket.emit('error', { message: 'Комната не найдена!' });
      return;
    }
    if (room.phase !== 'lobby') {
      socket.emit('error', { message: 'Игра уже началась!' });
      return;
    }
    if (room.players.size >= 10) {
      socket.emit('error', { message: 'Комната заполнена!' });
      return;
    }

    const playerId = uuidv4();
    const player = {
      id: playerId,
      socketId: socket.id,
      name: name || 'Player',
      avatar: avatar || '🎮',
      score: 0,
      ready: false,
    };

    room.players.set(socket.id, player);
    socket.join(room.code);
    socket.emit('room:joined', { room: serializeRoom(room), player });
    io.to(room.code).emit('player:joined', { player });
    broadcastRoom(room);
    console.log(`${name} joined room ${code}`);
  });

  socket.on('game:start', () => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.id !== room.hostId) return;
    if (room.players.size < 2) {
      socket.emit('error', { message: 'Нужно минимум 2 игрока!' });
      return;
    }

    room.round = 1;
    room.chains = new Map();
    room.submissions = new Map();
    room.totalRounds = Math.max(room.players.size * 2, room.totalRounds);

    io.to(room.code).emit('game:starting', { countdown: 3 });
    setTimeout(() => startRound(room), 3000);
  });

  socket.on('submit:write', ({ content, chainOwner }) => {
    const room = getRoomBySocket(socket.id);
    if (!room || room.phase !== 'write') return;
    const player = room.players.get(socket.id);
    if (!player) return;

    room.submissions.set(player.id, { type: 'write', content: content || '...' });
    io.to(room.code).emit('player:submitted', { playerId: player.id });
    broadcastRoom(room);

    if (room.submissions.size >= room.players.size) {
      processRoundEnd(room);
    }
  });

  socket.on('submit:draw', ({ imageData, chainOwner }) => {
    const room = getRoomBySocket(socket.id);
    if (!room || room.phase !== 'draw') return;
    const player = room.players.get(socket.id);
    if (!player) return;

    room.submissions.set(player.id, { type: 'draw', content: imageData || '' });
    io.to(room.code).emit('player:submitted', { playerId: player.id });
    broadcastRoom(room);

    if (room.submissions.size >= room.players.size) {
      processRoundEnd(room);
    }
  });

  socket.on('reveal:next', () => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.id !== room.hostId) return;
    if (room.phase !== 'reveal') return;

    const players = Array.from(room.players.values());
    const chainOwner = players[room.revealIndex];
    const chain = room.chains.get(chainOwner?.id) || [];

    room.revealChainIndex++;
    if (room.revealChainIndex >= chain.length) {
      room.revealChainIndex = 0;
      room.revealIndex++;
    }

    startReveal(room);
  });

  socket.on('room:settings', ({ roundTime, totalRounds }) => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.id !== room.hostId) return;
    if (room.phase !== 'lobby') return;

    if (roundTime) room.roundTime = Math.min(Math.max(roundTime, 20), 180);
    if (totalRounds) room.totalRounds = Math.min(Math.max(totalRounds, 2), 10);
    broadcastRoom(room);
  });

  socket.on('room:restart', () => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.id !== room.hostId) return;

    room.phase = 'lobby';
    room.round = 1;
    room.chains = new Map();
    room.submissions = new Map();
    room.revealIndex = 0;
    room.revealChainIndex = 0;
    if (room.roundTimer) clearTimeout(room.roundTimer);
    room.players.forEach(p => { p.score = 0; p.ready = false; });
    io.to(room.code).emit('game:restart');
    broadcastRoom(room);
  });

  socket.on('chat:message', ({ text }) => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player) return;
    io.to(room.code).emit('chat:message', {
      id: uuidv4(),
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      text: text.slice(0, 200),
      timestamp: Date.now(),
    });
  });

  socket.on('disconnect', () => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player) return;

    room.players.delete(socket.id);
    io.to(room.code).emit('player:left', { playerId: player.id, playerName: player.name });

    if (room.players.size === 0) {
      if (room.roundTimer) clearTimeout(room.roundTimer);
      rooms.delete(room.code);
      console.log(`Room ${room.code} deleted (empty)`);
      return;
    }

    // Transfer host
    if (room.hostId === player.id) {
      const newHost = room.players.values().next().value;
      room.hostId = newHost.id;
      io.to(room.code).emit('host:changed', { newHostId: newHost.id });
    }

    // If in game and not enough players
    if (room.phase !== 'lobby' && room.phase !== 'reveal' && room.phase !== 'finished') {
      if (room.players.size < 2) {
        if (room.roundTimer) clearTimeout(room.roundTimer);
        room.phase = 'lobby';
        io.to(room.code).emit('game:cancelled', { reason: 'Недостаточно игроков' });
      } else if (room.submissions.size >= room.players.size) {
        processRoundEnd(room);
      }
    }

    broadcastRoom(room);
    console.log(`${player.name} left room ${room.code}`);
  });
});

// ─── Fallback SPA ────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🎨 GarticPhone server running on port ${PORT}`);
});
