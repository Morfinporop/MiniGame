import { useState, useRef, useEffect } from 'react';
import { Room, Player, ChatMessage, RevealItem } from '../types';
import {
  IconChat, IconSend, IconArrowRight, IconTrophy, IconEye, IconPen, IconBrush
} from './Icons';

interface Props {
  room: Room;
  myPlayer: Player;
  revealItem: RevealItem;
  messages: ChatMessage[];
  onNext: () => void;
  onSendMessage: (text: string) => void;
}

export default function RevealScreen({ room, myPlayer, revealItem, messages, onNext, onSendMessage }: Props) {
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const isHost = myPlayer.id === room.hostId;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const { chainOwner, item, chainIndex, chainLength, currentChain, totalChains } = revealItem;
  const progressChain   = ((chainIndex + 1) / chainLength) * 100;
  const progressOverall = ((currentChain * chainLength + chainIndex + 1) / (totalChains * chainLength)) * 100;
  const isLast = chainIndex + 1 >= chainLength && currentChain + 1 >= totalChains;
  const authorPlayer = room.players.find((p: Player) => p.id === item?.authorId);

  return (
    <div className="min-h-screen dot-grid flex flex-col items-center px-3 py-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500" />
        <div className="absolute -top-60 -left-40 w-[500px] h-[500px] rounded-full bg-purple-700/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-cyan-700/8 blur-[120px]" />
      </div>

      {/* ── HEADER ── */}
      <div className="relative w-full max-w-5xl mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <IconEye size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black grad-text">Раскрытие</h1>
              <p className="text-white/35 text-xs">
                История <span className="text-cyan-400 font-bold">{chainOwner.name}</span>
                {' · '}Шаг {chainIndex + 1}/{chainLength}
                {' · '}Цепочка {currentChain + 1}/{totalChains}
              </p>
            </div>
          </div>

          {/* Chain owner avatar */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15">
              <img src={chainOwner.avatar} alt={chainOwner.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white">{chainOwner.name}</div>
              <div className="text-xs text-white/30">Владелец цепочки</div>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-white/25 mb-1.5 font-medium uppercase tracking-wider">
              <span>Цепочка {currentChain + 1}</span>
              <span>{Math.round(progressChain)}%</span>
            </div>
            <div className="h-2 glass rounded-full overflow-hidden border border-white/6">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/30"
                style={{ width: `${progressChain}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-white/20 mb-1 font-medium uppercase tracking-wider">
              <span>Общий прогресс</span>
              <span>{Math.round(progressOverall)}%</span>
            </div>
            <div className="h-1.5 glass rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-red-500 rounded-full transition-all duration-700"
                style={{ width: `${progressOverall}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 mt-3">
          {Array.from({ length: chainLength }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < chainIndex + 1
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : 'bg-white/8'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── CONTENT + CHAT ── */}
      <div className="relative w-full max-w-5xl flex gap-4 flex-1">
        {/* Main */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Author banner */}
          <div className="glass-strong rounded-2xl p-4 flex items-center gap-4 border border-white/7 animate-slide-up">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/12 flex-shrink-0">
              <img
                src={authorPlayer?.avatar || chainOwner.avatar}
                alt={item?.authorName || chainOwner.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-lg">{item?.authorName || '—'}</div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                {item?.type === 'write'
                  ? <><IconPen size={11} /> написал фразу</>
                  : <><IconBrush size={11} /> нарисовал</>
                }
              </div>
            </div>
          </div>

          {/* Item display */}
          <div className="glass-strong rounded-3xl p-6 flex-1 flex items-center justify-center border border-white/7 min-h-64 animate-fade-in shadow-2xl">
            {item ? (
              item.type === 'write' ? (
                <div className="text-center px-4">
                  <div className="text-white/25 text-xs uppercase tracking-widest mb-4 font-medium">Фраза</div>
                  <div
                    className="text-5xl md:text-6xl font-black text-white leading-tight"
                    style={{ textShadow: '0 0 60px rgba(34,211,238,0.35)' }}
                  >
                    "{item.content}"
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="text-white/25 text-xs uppercase tracking-widest font-medium">Рисунок</div>
                  <img
                    src={item.content}
                    alt="Рисунок"
                    className="max-h-80 rounded-2xl border border-white/15 shadow-2xl object-contain"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )
            ) : (
              <div className="text-white/20 text-center">Нет данных</div>
            )}
          </div>

          {/* Next / waiting */}
          {isHost ? (
            <button
              onClick={onNext}
              className={`w-full py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${
                isLast
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 shadow-red-900/40'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 shadow-blue-900/40'
              }`}
            >
              {isLast
                ? <><IconTrophy size={22} /> К результатам!</>
                : <><IconArrowRight size={22} /> Далее</>
              }
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 glass rounded-2xl border border-white/7 text-white/25 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Ждём пока хост переключит...
            </div>
          )}
        </div>

        {/* Chat */}
        <div
          className="w-64 flex-shrink-0 glass-strong border border-white/7 rounded-3xl flex flex-col overflow-hidden hidden lg:flex shadow-xl"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <div className="h-[1px] bg-gradient-to-r from-cyan-500/40 to-transparent" />
          <div className="p-3 border-b border-white/6 flex items-center gap-2">
            <IconChat size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Реакции</span>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {messages.length === 0 && (
              <div className="text-center text-white/20 text-xs py-6">Пиши реакции!</div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.playerId === myPlayer.id ? 'flex-row-reverse' : ''}`}>
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={msg.avatar} alt={msg.playerName} className="w-full h-full object-cover" />
                </div>
                <div className={`max-w-[75%] flex flex-col ${msg.playerId === myPlayer.id ? 'items-end' : ''}`}>
                  <span className="text-[10px] text-white/20 mb-0.5 px-1">{msg.playerName}</span>
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
              placeholder="Реакция..."
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
