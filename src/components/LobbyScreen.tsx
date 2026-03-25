import { useState, useRef, useEffect } from 'react';
import { Room, Player, ChatMessage } from '../types';
import {
  IconCopy, IconCheck, IconUsers, IconCrown, IconSettings,
  IconChat, IconTimer, IconRefresh, IconPlay, IconSave,
  IconLogout, IconSend, IconUser, IconZap
} from './Icons';

interface Props {
  room: Room;
  myPlayer: Player;
  messages: ChatMessage[];
  onStart: () => void;
  onSettings: (roundTime: number, totalRounds: number) => void;
  onSendMessage: (text: string) => void;
  onLeave: () => void;
}

export default function LobbyScreen({ room, myPlayer, messages, onStart, onSettings, onSendMessage, onLeave }: Props) {
  const [chatInput, setChatInput] = useState('');
  const [roundTime, setRoundTime] = useState(room.roundTime);
  const [totalRounds, setTotalRounds] = useState(room.totalRounds);
  const [copied, setCopied] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const isHost = myPlayer.id === room.hostId;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    setRoundTime(room.roundTime);
    setTotalRounds(room.totalRounds);
  }, [room.roundTime, room.totalRounds]);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="min-h-screen dot-grid flex flex-col items-center justify-start px-4 py-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500" />
        <div className="absolute -top-60 -left-40 w-[500px] h-[500px] rounded-full bg-blue-700/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-red-700/10 blur-[100px]" />
      </div>

      {/* ── HEADER ── */}
      <div className="relative w-full max-w-6xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <IconZap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black grad-text">Лобби</h1>
            <p className="text-white/35 text-xs font-medium">Ждём игроков · {room.players.length}/10</p>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/8 text-white/45 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-semibold"
        >
          <IconLogout size={15} /> Выйти
        </button>
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Room code card */}
          <div className="glass-strong rounded-3xl overflow-hidden shadow-xl">
            <div className="h-[1px] bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-transparent" />
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-white/35 uppercase tracking-widest mb-4">
                <IconLink size={12} /> Код комнаты
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center py-3 px-4 glass rounded-2xl border border-white/8">
                  <div className="text-5xl font-black tracking-[0.4em] grad-text">{room.code}</div>
                </div>
                <button
                  onClick={copyCode}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border flex-shrink-0 ${
                    copied
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'glass border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-400/40'
                  }`}
                >
                  {copied ? <><IconCheck size={15} /> Скопировано</> : <><IconCopy size={15} /> Копировать</>}
                </button>
              </div>
              <p className="text-white/20 text-xs text-center mt-3">
                Поделитесь кодом с друзьями — они введут его на главном экране
              </p>
            </div>
          </div>

          {/* Players grid */}
          <div className="glass-strong rounded-3xl overflow-hidden shadow-xl">
            <div className="h-[1px] bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-transparent" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white/35 uppercase tracking-widest">
                  <IconUsers size={12} /> Игроки
                </div>
                {/* Slots indicator */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all ${
                        i < room.players.length
                          ? 'w-2.5 h-2.5 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                          : 'w-2 h-2 bg-white/8'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-white/30 font-mono">{room.players.length}/10</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {room.players.map(player => (
                  <div
                    key={player.id}
                    className={`relative flex flex-col items-center gap-2.5 p-3.5 rounded-2xl transition-all border ${
                      player.id === myPlayer.id
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : 'glass border-white/7 hover:border-white/15'
                    }`}
                  >
                    {player.id === room.hostId && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <IconCrown size={12} className="text-white" />
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                      <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-sm font-bold text-white truncate w-full text-center">
                      {player.name}
                    </div>
                    {player.id === myPlayer.id && (
                      <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">Это ты</div>
                    )}
                  </div>
                ))}

                {/* Empty slots */}
                {room.players.length < 10 && Array.from({ length: Math.min(3, 10 - room.players.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border border-dashed border-white/8 opacity-30">
                    <div className="w-12 h-12 rounded-xl bg-white/4 flex items-center justify-center">
                      <IconUser size={20} className="text-white/30" />
                    </div>
                    <div className="text-xs text-white/30">Ждём...</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings (host) */}
          {isHost && (
            <div className="glass-strong rounded-3xl overflow-hidden shadow-xl">
              <div className="h-[1px] bg-gradient-to-r from-red-500/40 via-blue-500/40 to-transparent" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-white/35 uppercase tracking-widest mb-4">
                  <IconSettings size={12} /> Настройки игры
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <label className="flex items-center gap-2 text-sm text-white/60 font-medium">
                        <IconTimer size={15} className="text-cyan-400" /> Время на раунд
                      </label>
                      <span className="text-cyan-400 font-black">{roundTime}<span className="text-white/40 text-sm font-normal">с</span></span>
                    </div>
                    <input type="range" min={20} max={180} step={10} value={roundTime}
                      onChange={e => setRoundTime(+e.target.value)} className="w-full cursor-pointer" />
                    <div className="flex justify-between text-xs text-white/20 mt-1">
                      <span>20с</span><span>180с</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <label className="flex items-center gap-2 text-sm text-white/60 font-medium">
                        <IconRefresh size={15} className="text-blue-400" /> Количество раундов
                      </label>
                      <span className="text-blue-400 font-black">{totalRounds}</span>
                    </div>
                    <input type="range" min={2} max={10} step={1} value={totalRounds}
                      onChange={e => setTotalRounds(+e.target.value)} className="w-full cursor-pointer" />
                    <div className="flex justify-between text-xs text-white/20 mt-1">
                      <span>2</span><span>10</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSettings(roundTime, totalRounds)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/12 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm font-semibold"
                  >
                    <IconSave size={15} /> Применить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info for non-host */}
          {!isHost && (
            <div className="glass-strong rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-white/35 uppercase tracking-widest mb-4">
                Параметры игры
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-4 text-center border border-white/7">
                  <div className="text-3xl font-black text-cyan-400">{room.roundTime}<span className="text-lg">с</span></div>
                  <div className="text-xs text-white/35 mt-1 flex items-center justify-center gap-1.5">
                    <IconTimer size={11} /> Время раунда
                  </div>
                </div>
                <div className="glass rounded-2xl p-4 text-center border border-white/7">
                  <div className="text-3xl font-black text-blue-400">{room.totalRounds}</div>
                  <div className="text-xs text-white/35 mt-1 flex items-center justify-center gap-1.5">
                    <IconRefresh size={11} /> Раундов
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/25 text-sm justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Ждём пока хост начнёт игру...
              </div>
            </div>
          )}

          {/* Start button */}
          {isHost && (
            <button
              onClick={onStart}
              disabled={room.players.length < 2}
              className="w-full py-5 rounded-3xl font-black text-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-red-500 hover:from-cyan-400 hover:via-blue-500 hover:to-red-400 disabled:opacity-35 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3"
            >
              {room.players.length < 2 ? (
                <><IconUsers size={22} /> Нужно минимум 2 игрока</>
              ) : (
                <><IconPlay size={22} /> НАЧАТЬ ИГРУ</>
              )}
            </button>
          )}
        </div>

        {/* ── CHAT ── */}
        <div className="glass-strong rounded-3xl overflow-hidden shadow-xl flex flex-col" style={{ minHeight: 420, maxHeight: 640 }}>
          <div className="h-[1px] bg-gradient-to-r from-cyan-500/40 to-transparent" />
          <div className="p-4 border-b border-white/6 flex items-center gap-2">
            <IconChat size={15} className="text-cyan-400" />
            <span className="text-sm font-bold text-white/50 uppercase tracking-wider">Чат лобби</span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                <div className="w-12 h-12 rounded-xl glass border border-white/8 flex items-center justify-center">
                  <IconChat size={20} className="text-white/20" />
                </div>
                <p className="text-white/20 text-sm text-center">Будь первым<br />кто напишет!</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.playerId === myPlayer.id ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                  <img src={msg.avatar} alt={msg.playerName} className="w-full h-full object-cover" />
                </div>
                <div className={`max-w-[75%] flex flex-col ${msg.playerId === myPlayer.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-white/25 mb-1 px-1">{msg.playerName}</span>
                  <div className={`px-3 py-2 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.playerId === myPlayer.id
                      ? 'bg-gradient-to-br from-cyan-600/40 to-blue-700/40 text-white rounded-tr-sm'
                      : 'bg-white/7 text-white/85 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-white/6 flex gap-2">
            <input
              className="flex-1 glass border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 transition-all"
              placeholder="Сообщение..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              maxLength={200}
            />
            <button
              onClick={sendMessage}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0"
            >
              <IconSend size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local icon
function IconLink({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
