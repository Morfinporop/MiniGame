import { useState, useEffect, useCallback } from 'react';
import { socket } from './socket';
import { Player, Room, ChatMessage, RevealItem } from './types';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import RevealScreen from './components/RevealScreen';
import FinishedScreen from './components/FinishedScreen';
import HomeScreen from './components/HomeScreen';
import { Toaster, toast } from './components/Toast';
import { IconWifi, IconWifiOff } from './components/Icons';

export type AppPhase = 'home' | 'lobby' | 'game' | 'reveal' | 'finished';

export default function App() {
  const [phase, setPhase]               = useState<AppPhase>('home');
  const [room, setRoom]                 = useState<Room | null>(null);
  const [myPlayer, setMyPlayer]         = useState<Player | null>(null);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [gamePhase, setGamePhase]       = useState<'write' | 'draw' | null>(null);
  const [roundInfo, setRoundInfo]       = useState<any>(null);
  const [revealItem, setRevealItem]     = useState<RevealItem | null>(null);
  const [finishedData, setFinishedData] = useState<any>(null);
  const [connected, setConnected]       = useState(false);
  const [countdown, setCountdown]       = useState<number | null>(null);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room:update', (data: Room) => {
      setRoom(data);
      setMyPlayer(prev => {
        if (!prev) return prev;
        const found = data.players.find(p => p.id === prev.id);
        return found ? { ...prev, ...found } : prev;
      });
    });

    socket.on('room:joined', ({ room, player }: { room: Room; player: Player }) => {
      setRoom(room);
      setMyPlayer(player);
      setPhase('lobby');
    });

    socket.on('error', ({ message }: { message: string }) => {
      toast.error(message);
    });

    socket.on('player:joined', ({ player }: { player: Player }) => {
      toast.info(`${player.name} присоединился к игре`);
    });

    socket.on('player:left', ({ playerName }: { playerName: string }) => {
      toast.info(`${playerName} вышел из игры`);
    });

    socket.on('host:changed', ({ newHostId }: { newHostId: string }) => {
      setMyPlayer(prev => {
        if (prev && prev.id === newHostId) {
          toast.success('Вы теперь хост комнаты!');
        }
        return prev;
      });
      setRoom(prev => prev ? { ...prev, hostId: newHostId } : prev);
    });

    socket.on('game:starting', ({ countdown: c }: { countdown: number }) => {
      setCountdown(c);
      let n = c;
      const interval = setInterval(() => {
        n--;
        if (n <= 0) {
          clearInterval(interval);
          setCountdown(null);
          setPhase('game');
        } else {
          setCountdown(n);
        }
      }, 1000);
    });

    socket.on('round:start', (data: any) => {
      setGamePhase(data.phase);
      setRoundInfo(data);
      setPhase('game');
    });

    socket.on('game:finished', (data: any) => {
      setFinishedData(data);
      setPhase('finished');
    });

    socket.on('reveal:item', (data: RevealItem) => {
      setRevealItem(data);
      setPhase('reveal');
    });

    socket.on('game:restart', () => {
      setPhase('lobby');
      setGamePhase(null);
      setRoundInfo(null);
      setRevealItem(null);
      setFinishedData(null);
      setMessages([]);
      setCountdown(null);
    });

    socket.on('game:cancelled', ({ reason }: { reason: string }) => {
      toast.error(reason);
      setPhase('lobby');
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages(prev => [...prev.slice(-99), msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room:update');
      socket.off('room:joined');
      socket.off('error');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('host:changed');
      socket.off('game:starting');
      socket.off('round:start');
      socket.off('game:finished');
      socket.off('reveal:item');
      socket.off('game:restart');
      socket.off('game:cancelled');
      socket.off('chat:message');
    };
  }, []);

  const handleCreateRoom = useCallback((name: string, avatar: string, roundTime: number, totalRounds: number) => {
    socket.emit('room:create', { name, avatar, roundTime, totalRounds });
  }, []);

  const handleJoinRoom = useCallback((code: string, name: string, avatar: string) => {
    socket.emit('room:join', { code: code.toUpperCase(), name, avatar });
  }, []);

  const handleStartGame   = useCallback(() => { socket.emit('game:start'); }, []);
  const handleSubmitWrite = useCallback((content: string) => { socket.emit('submit:write', { content }); }, []);
  const handleSubmitDraw  = useCallback((imageData: string) => { socket.emit('submit:draw', { imageData }); }, []);
  const handleRevealNext  = useCallback(() => { socket.emit('reveal:next'); }, []);
  const handleRestart     = useCallback(() => { socket.emit('room:restart'); }, []);
  const handleSendMessage = useCallback((text: string) => { socket.emit('chat:message', { text }); }, []);
  const handleSettings    = useCallback((roundTime: number, totalRounds: number) => { socket.emit('room:settings', { roundTime, totalRounds }); }, []);

  const handleLeave = useCallback(() => {
    socket.disconnect();
    socket.connect();
    setRoom(null);
    setMyPlayer(null);
    setPhase('home');
    setMessages([]);
    setGamePhase(null);
    setRoundInfo(null);
    setRevealItem(null);
    setFinishedData(null);
    setCountdown(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#060d1f] text-white overflow-x-hidden">
      <Toaster />

      {/* ── Connection badge ── */}
      <div className={`fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-md ${
        connected
          ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/25'
          : 'bg-red-950/70 text-red-400 border-red-500/25 animate-pulse'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
        {connected ? <IconWifi size={11} /> : <IconWifiOff size={11} />}
        {connected ? 'Online' : 'Offline'}
      </div>

      {/* ── Countdown overlay ── */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="text-center">
            {/* Glowing ring */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl scale-150" />
              <div
                key={countdown}
                className="relative text-[10rem] font-black grad-text leading-none animate-countdown"
                style={{ textShadow: '0 0 80px rgba(34,211,238,0.4)' }}
              >
                {countdown}
              </div>
            </div>
            <p className="text-3xl text-white/80 font-black tracking-wide">Игра начинается!</p>
            <p className="text-white/30 mt-2 text-sm">Приготовьтесь...</p>
          </div>
        </div>
      )}

      {/* ── Screens ── */}
      {phase === 'home' && (
        <HomeScreen
          onCreate={handleCreateRoom}
          onJoin={handleJoinRoom}
          connected={connected}
        />
      )}
      {phase === 'lobby' && room && myPlayer && (
        <LobbyScreen
          room={room}
          myPlayer={myPlayer}
          messages={messages}
          onStart={handleStartGame}
          onSettings={handleSettings}
          onSendMessage={handleSendMessage}
          onLeave={handleLeave}
        />
      )}
      {phase === 'game' && room && myPlayer && roundInfo && (
        <GameScreen
          room={room}
          myPlayer={myPlayer}
          roundInfo={roundInfo}
          gamePhase={gamePhase!}
          messages={messages}
          onSubmitWrite={handleSubmitWrite}
          onSubmitDraw={handleSubmitDraw}
          onSendMessage={handleSendMessage}
        />
      )}
      {phase === 'reveal' && room && myPlayer && revealItem && (
        <RevealScreen
          room={room}
          myPlayer={myPlayer}
          revealItem={revealItem}
          messages={messages}
          onNext={handleRevealNext}
          onSendMessage={handleSendMessage}
        />
      )}
      {phase === 'finished' && room && myPlayer && finishedData && (
        <FinishedScreen
          room={room}
          myPlayer={myPlayer}
          finishedData={finishedData}
          onRestart={handleRestart}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}
