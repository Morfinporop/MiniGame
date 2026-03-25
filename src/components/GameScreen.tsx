import { useState, useEffect, useRef } from 'react';
import { Room, Player, ChatMessage } from '../types';
import DrawingCanvas from './DrawingCanvas';
import {
  IconTimer, IconChat, IconSend, IconCheck, IconPen, IconBrush, IconX
} from './Icons';

interface Props {
  room: Room;
  myPlayer: Player;
  roundInfo: any;
  gamePhase: 'write' | 'draw';
  messages: ChatMessage[];
  onSubmitWrite: (content: string) => void;
  onSubmitDraw: (imageData: string) => void;
  onSendMessage: (text: string) => void;
}

export default function GameScreen({ room, myPlayer, roundInfo, gamePhase, messages, onSubmitWrite, onSubmitDraw, onSendMessage }: Props) {
  const [writeText, setWriteText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(room.roundTime);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSubmitted(false);
    setWriteText('');
    setTimeLeft(room.roundTime);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [roundInfo?.round, room.roundTime]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSubmitWrite = () => {
    if (!writeText.trim() || submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmitWrite(writeText.trim());
  };

  const handleSubmitDraw = (img: string) => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmitDraw(img);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const timerPercent = (timeLeft / room.roundTime) * 100;
  const timerColor   = timeLeft > 30 ? '#22d3ee' : timeLeft > 10 ? '#f97316' : '#ef4444';
  const timerClass   = timeLeft <= 10
    ? 'border-red-500/60 text-red-400 bg-red-500/10'
    : timeLeft <= 30
    ? 'border-orange-400/60 text-orange-400 bg-orange-500/10'
    : 'border-cyan-500/40 text-cyan-300 bg-cyan-500/8';

  const submittedCount = room.submittedIds?.length || 0;
  const prompt = roundInfo?.prompt;
  const isFirstRound = roundInfo?.round === 1;

  return (
    <div className="min-h-screen dot-grid flex flex-col items-center px-3 py-4 relative overflow-hidden">
      {/* Progress bar at very top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-[3px] bg-white/5">
          <div
            className="h-full transition-all duration-1000 ease-linear rounded-r-full"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor, boxShadow: `0 0 8px ${timerColor}60` }}
          />
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-4 flex-wrap gap-2 pt-2">
        {/* Left: timer + phase */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-black text-2xl transition-all ${timerClass} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
            <IconTimer size={20} />
            <span>{timeLeft}</span>
            <span className="text-base font-semibold opacity-70">с</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base">
              {gamePhase === 'write'
                ? <><IconPen size={16} className="text-cyan-400" /> {isFirstRound ? 'Придумай фразу' : 'Угадай рисунок'}</>
                : <><IconBrush size={16} className="text-blue-400" /> Нарисуй задание</>
              }
            </div>
            <div className="text-white/35 text-xs mt-0.5">
              Раунд <span className="text-white/60 font-bold">{roundInfo?.round}</span> из <span className="text-white/60 font-bold">{room.totalRounds}</span>
            </div>
          </div>
        </div>

        {/* Right: player submission status + chat */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {room.players.map((p: Player) => {
              const done = room.submittedIds?.includes(p.id);
              return (
                <div key={p.id} title={p.name} className="relative">
                  <div className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                    done ? 'border-emerald-400 opacity-100 scale-90' : 'border-white/15 opacity-60'
                  }`}>
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  {done && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <IconCheck size={9} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
            <span className="text-white/35 text-xs ml-1 font-medium">{submittedCount}/{room.players.length}</span>
          </div>

          <button
            onClick={() => setShowChat(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
              showChat
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'glass border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            <IconChat size={15} />
            <span className="hidden sm:inline">Чат</span>
          </button>
        </div>
      </div>

      {/* ── PROMPT BANNER ── */}
      {prompt && (
        <div className="w-full max-w-6xl mb-3">
          <div className="glass-strong rounded-2xl p-4 flex items-center gap-3 border border-white/7 shadow-lg">
            <span className="text-xs font-bold text-white/35 uppercase tracking-widest flex-shrink-0">
              {gamePhase === 'draw' ? 'Твоё задание' : 'Из прошлого раунда'}
            </span>
            <div className="w-px h-5 bg-white/10 flex-shrink-0" />
            {prompt.type === 'write' ? (
              <span className="text-xl font-black text-white">{prompt.content}</span>
            ) : (
              <img src={prompt.content} alt="Задание" className="max-h-20 rounded-xl border border-white/10 shadow-md" />
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT + CHAT ── */}
      <div className="w-full max-w-6xl flex gap-4 flex-1">
        {/* Main area */}
        <div className={`flex-1 min-w-0 ${showChat ? 'hidden md:flex' : 'flex'} flex-col`}>
          {submitted ? (
            // Submitted state
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-slide-up">
                <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center neon-cyan">
                  <IconCheck size={44} className="text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white mb-2">Отлично!</div>
                <div className="text-white/40 mb-6">Ждём остальных игроков...</div>

                <div className="flex gap-3 justify-center flex-wrap">
                  {room.players.map((p: Player) => {
                    const done = room.submittedIds?.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-all ${
                          done
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'glass border-white/8 opacity-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs text-white/60 font-medium">{p.name}</div>
                        <div className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-white/25'}`}>
                          {done ? 'Сдал' : '...'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : gamePhase === 'write' ? (
            // Write phase
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-2xl">
                <div className="glass-strong rounded-3xl p-6 border border-white/7 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/35 uppercase tracking-widest mb-4">
                    <IconPen size={13} />
                    {isFirstRound ? 'Придумай фразу для рисунка' : 'Что изображено на рисунке?'}
                  </div>
                  <textarea
                    className="w-full glass border border-white/12 rounded-2xl px-5 py-4 text-white text-2xl font-bold placeholder-white/20 focus:outline-none focus:border-cyan-400/70 transition-all resize-none text-center leading-relaxed"
                    placeholder={isFirstRound ? 'Например: кот-астронавт на луне' : 'Что ты видишь на рисунке?'}
                    value={writeText}
                    onChange={e => setWriteText(e.target.value)}
                    maxLength={100}
                    rows={3}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmitWrite())}
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-32 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                          style={{ width: `${(writeText.length / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-white/25 text-xs">{writeText.length}/100</span>
                    </div>
                    <button
                      onClick={handleSubmitWrite}
                      disabled={!writeText.trim()}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-35 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
                    >
                      <IconCheck size={18} /> Отправить
                    </button>
                  </div>
                </div>
              </div>

              {/* Tip */}
              <div className="glass rounded-2xl px-4 py-3 border border-white/6 text-sm text-white/30 text-center max-w-lg">
                {isFirstRound
                  ? 'Чем смешнее и неожиданнее фраза — тем веселее будет результат!'
                  : 'Не угадал — не страшно! Это и делает игру смешной.'
                }
              </div>
            </div>
          ) : (
            // Draw phase
            <div className="flex-1">
              <DrawingCanvas onExport={handleSubmitDraw} />
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-72 flex-shrink-0 glass-strong border border-white/7 rounded-3xl flex flex-col overflow-hidden shadow-xl" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <div className="h-[1px] bg-gradient-to-r from-cyan-500/40 to-transparent" />
            <div className="p-3 border-b border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconChat size={14} className="text-cyan-400" />
                <span className="text-xs font-bold text-white/45 uppercase tracking-wider">Чат</span>
              </div>
              <button onClick={() => setShowChat(false)} className="p-1.5 rounded-lg glass border border-white/8 text-white/30 hover:text-white/70 transition-all">
                <IconX size={12} />
              </button>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.playerId === myPlayer.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={msg.avatar} alt={msg.playerName} className="w-full h-full object-cover" />
                  </div>
                  <div className={`max-w-[75%] flex flex-col ${msg.playerId === myPlayer.id ? 'items-end' : ''}`}>
                    <span className="text-[10px] text-white/25 mb-0.5 px-1">{msg.playerName}</span>
                    <div className={`px-2.5 py-1.5 rounded-xl text-sm ${
                      msg.playerId === myPlayer.id
                        ? 'bg-cyan-600/35 text-white rounded-tr-sm'
                        : 'bg-white/8 text-white/80 rounded-tl-sm'
                    }`}>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/6 flex gap-2">
              <input
                className="flex-1 glass border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 transition-all"
                placeholder="Написать..."
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
        )}
      </div>
    </div>
  );
}
