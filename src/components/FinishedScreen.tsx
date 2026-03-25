import { useState } from 'react';
import { Room, Player } from '../types';
import {
  IconTrophy, IconRefresh, IconLogout, IconArrowRight, IconArrowLeft, IconCheck, IconX, IconBook, IconStar
} from './Icons';

interface Props {
  room: Room;
  myPlayer: Player;
  finishedData: { players: Player[]; chains: Record<string, any[]> };
  onRestart: () => void;
  onLeave: () => void;
}

const MEDAL_COLORS = [
  'from-amber-400 to-yellow-500',
  'from-gray-300 to-gray-400',
  'from-amber-700 to-amber-800',
];

const MEDAL_LABELS = ['1 место', '2 место', '3 место'];

// Confetti dots (deterministic, no Math.random in render)
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  w: ((i * 7 + 3) % 12) + 4,
  h: ((i * 5 + 2) % 10) + 4,
  l: ((i * 13 + 1) % 100),
  t: ((i * 17 + 5) % 100),
  color: ['#22d3ee', '#3b82f6', '#ef4444', '#a855f7', '#f59e0b', '#10b981'][i % 6],
  delay: (i * 0.15) % 3,
  dur: ((i * 3 + 2) % 3) + 2,
}));

export default function FinishedScreen({ room, myPlayer, finishedData, onRestart, onLeave }: Props) {
  const [viewingChain, setViewingChain] = useState<string | null>(null);
  const [chainStep, setChainStep] = useState(0);
  const isHost = myPlayer.id === room.hostId;
  const { players, chains } = finishedData;

  const openChain = (id: string) => { setViewingChain(id); setChainStep(0); };
  const closeChain = () => { setViewingChain(null); setChainStep(0); };
  const chainOwner = viewingChain ? players.find((p: Player) => p.id === viewingChain) : null;
  const chain = viewingChain ? (chains[viewingChain] || []) : [];

  return (
    <div className="min-h-screen dot-grid flex flex-col items-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/12 via-transparent to-red-900/12" />
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-25 animate-float"
            style={{
              width: c.w, height: c.h,
              left: `${c.l}%`, top: `${c.t}%`,
              backgroundColor: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
            }}
          />
        ))}
      </div>

      {/* ── CHAIN VIEWER MODAL ── */}
      {viewingChain && chainOwner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center px-4 animate-fade-in">
          <div className="w-full max-w-2xl glass-strong border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal top accent */}
            <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500" />

            {/* Header */}
            <div className="p-5 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/12">
                  <img src={chainOwner.avatar} alt={chainOwner.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-black text-white text-lg">История {chainOwner.name}</div>
                  <div className="text-white/35 text-xs">Шаг {chainStep + 1} из {chain.length}</div>
                </div>
              </div>
              <button
                onClick={closeChain}
                className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Steps timeline */}
            <div className="flex gap-1.5 px-5 pt-4">
              {chain.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setChainStep(i)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    i === chainStep
                      ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                      : i < chainStep
                      ? 'bg-blue-600/50'
                      : 'bg-white/8 hover:bg-white/15'
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="p-6 min-h-72 flex flex-col items-center justify-center gap-5">
              {chain[chainStep] ? (
                <>
                  <div className="flex items-center gap-3 self-start w-full">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={players.find((p: Player) => p.id === chain[chainStep].authorId)?.avatar || chainOwner.avatar}
                        alt={chain[chainStep].authorName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-white font-bold">{chain[chainStep].authorName}</div>
                      <div className="text-white/35 text-xs">
                        {chain[chainStep].type === 'write' ? 'написал фразу' : 'нарисовал'}
                      </div>
                    </div>
                  </div>

                  {chain[chainStep].type === 'write' ? (
                    <div className="text-4xl font-black text-white text-center leading-tight px-4"
                      style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
                      "{chain[chainStep].content}"
                    </div>
                  ) : chain[chainStep].content ? (
                    <img
                      src={chain[chainStep].content}
                      alt="Рисунок"
                      className="max-h-72 rounded-2xl border border-white/15 shadow-2xl object-contain"
                    />
                  ) : (
                    <div className="text-white/25 text-center">Рисунок не сохранён</div>
                  )}
                </>
              ) : (
                <div className="text-white/25">Нет данных</div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-5 border-t border-white/8 flex gap-3">
              <button
                onClick={() => setChainStep(s => Math.max(0, s - 1))}
                disabled={chainStep === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all font-bold"
              >
                <IconArrowLeft size={16} /> Назад
              </button>
              {chainStep < chain.length - 1 ? (
                <button
                  onClick={() => setChainStep(s => Math.min(chain.length - 1, s + 1))}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  Вперёд <IconArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={closeChain}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:from-emerald-400 hover:to-teal-500 transition-all"
                >
                  <IconCheck size={16} /> Закрыть
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TITLE ── */}
      <div className="relative text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-2xl shadow-amber-500/30">
          <IconTrophy size={40} className="text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black grad-text mb-2">Игра окончена!</h1>
        <p className="text-white/40 text-lg">Посмотрите что получилось у каждого</p>
      </div>

      {/* ── CHAINS GRID ── */}
      <div className="relative w-full max-w-5xl mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-5">
          <IconBook size={18} className="text-cyan-400" />
          <h2 className="text-xl font-black text-white">Истории игроков</h2>
          <span className="ml-auto text-white/25 text-sm">{players.length} цепочек</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.map((player: Player) => {
            const playerChain = chains[player.id] || [];
            const lastItem = playerChain[playerChain.length - 1];
            const firstItem = playerChain[0];
            return (
              <button
                key={player.id}
                onClick={() => openChain(player.id)}
                className="group relative glass-strong border border-white/8 rounded-3xl p-4 flex flex-col items-center gap-3 hover:border-cyan-400/35 hover:bg-white/6 transition-all hover:scale-[1.03] active:scale-[0.97] overflow-hidden text-left"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-all rounded-3xl" />

                {/* Avatar */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/12 shadow-lg">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                </div>

                <div className="relative font-bold text-white text-sm text-center truncate w-full">
                  {player.name}
                </div>

                {/* Preview of last item */}
                <div className="relative w-full">
                  {lastItem?.type === 'draw' && lastItem?.content ? (
                    <img
                      src={lastItem.content}
                      alt="preview"
                      className="w-full h-20 rounded-xl object-cover border border-white/8 opacity-70 group-hover:opacity-100 transition-all"
                    />
                  ) : firstItem?.type === 'write' ? (
                    <div className="text-xs text-white/35 text-center italic line-clamp-2 px-1">
                      "{firstItem.content}"
                    </div>
                  ) : (
                    <div className="w-full h-14 rounded-xl glass border border-white/6 flex items-center justify-center text-white/15 text-xs">
                      нет данных
                    </div>
                  )}
                </div>

                <div className="relative flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                  {playerChain.length} шагов <IconArrowRight size={11} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PLAYERS PODIUM ── */}
      <div className="relative w-full max-w-5xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-5">
          <IconStar size={18} className="text-amber-400" />
          <h2 className="text-xl font-black text-white">Все игроки</h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {players.map((player: Player, i: number) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                player.id === myPlayer.id
                  ? 'bg-cyan-500/10 border-cyan-500/35'
                  : 'glass border-white/8'
              }`}
            >
              {i < 3 ? (
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${MEDAL_COLORS[i]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-black">{i + 1}</span>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-white/40 text-xs font-bold">{i + 1}</span>
                </div>
              )}
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-white">{player.name}</span>
              {i < 3 && <span className="text-xs text-white/35">{MEDAL_LABELS[i]}</span>}
              {player.id === myPlayer.id && <span className="text-cyan-400 text-xs font-bold">(Это ты)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="relative flex gap-4 flex-wrap justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {isHost && (
          <button
            onClick={onRestart}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/40"
          >
            <IconRefresh size={22} /> Играть ещё раз!
          </button>
        )}
        <button
          onClick={onLeave}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl glass border border-white/12 hover:border-white/25 hover:bg-white/8 transition-all hover:scale-105 active:scale-95"
        >
          <IconLogout size={22} /> В главное меню
        </button>
      </div>
    </div>
  );
}
