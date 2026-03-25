import { useState } from 'react';
import {
  IconUser, IconPlay, IconHome,
  IconArrowRight, IconTimer, IconRefresh, IconWifi, IconWifiOff, IconPalette
} from './Icons';

// Avatar images from Dicebear (URL-based, no emojis)
const AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=0d47a1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna&backgroundColor=b71c1c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo&backgroundColor=006064',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=4a148c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel&backgroundColor=1b5e20',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Blaze&backgroundColor=e65100',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Storm&backgroundColor=37474f',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Neon&backgroundColor=880e4f',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Comet&backgroundColor=0277bd',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Vega&backgroundColor=558b2f',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=4e342e',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Echo&backgroundColor=283593',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Frost&backgroundColor=00838f',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ghost&backgroundColor=424242',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Titan&backgroundColor=6a1b9a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Quasar&backgroundColor=c62828',
];

interface Props {
  onCreate: (name: string, avatar: string, roundTime: number, totalRounds: number) => void;
  onJoin: (code: string, name: string, avatar: string) => void;
  connected: boolean;
}

const HOW_TO = [
  {
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=120&h=120&fit=crop&auto=format',
    title: 'Пиши фразу',
    desc: 'Придумай любую фразу — чем безумнее, тем веселее!',
    color: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/25',
  },
  {
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&h=120&fit=crop&auto=format',
    title: 'Рисуй',
    desc: 'Нарисуй то что написал предыдущий игрок',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/25',
  },
  {
    img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=120&h=120&fit=crop&auto=format',
    title: 'Смейся!',
    desc: 'Раскрой цепочки и посмотри как всё исказилось',
    color: 'from-red-500/20 to-red-600/5',
    border: 'border-red-500/25',
  },
];

export default function HomeScreen({ onCreate, onJoin, connected }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [code, setCode] = useState('');
  const [roundTime, setRoundTime] = useState(60);
  const [totalRounds, setTotalRounds] = useState(4);
  const [showAvatars, setShowAvatars] = useState(false);

  const handleCreate = () => { if (!name.trim()) return; onCreate(name.trim(), avatar, roundTime, totalRounds); };
  const handleJoin   = () => { if (!name.trim() || !code.trim()) return; onJoin(code.trim().toUpperCase(), name.trim(), avatar); };

  return (
    <div className="min-h-screen dot-grid flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-700/12 blur-[120px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-red-700/12 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* ── LOGO ── */}
      <div className="relative mb-10 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg neon-cyan">
            <IconPalette size={30} className="text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight">
            <span className="grad-text">Gartic</span>
            <span className="text-white"> Phone</span>
          </h1>
        </div>
        <p className="text-white/45 text-lg font-medium tracking-wide">
          Рисуй · Угадывай · Смейся вместе
        </p>

        {/* Connection indicator */}
        <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          connected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
        }`}>
          {connected
            ? <><IconWifi size={12} /> Сервер онлайн</>
            : <><IconWifiOff size={12} /> Нет соединения</>
          }
        </div>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="relative w-full max-w-[440px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Glow layer */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/15 via-blue-600/8 to-red-500/15 blur-2xl" />

        <div className="relative glass-strong rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500" />

          <div className="p-6">
            {/* Avatar + Name */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest mb-2.5">
                <IconUser size={13} /> Профиль игрока
              </label>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setShowAvatars(v => !v)}
                  className="w-14 h-14 rounded-2xl border-2 border-white/15 bg-white/5 hover:border-cyan-400/60 transition-all hover:scale-105 active:scale-95 flex-shrink-0 overflow-hidden"
                  title="Сменить аватар"
                >
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                </button>
                <input
                  className="flex-1 bg-white/7 border border-white/12 rounded-2xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/70 focus:bg-white/10 transition-all text-base font-semibold"
                  placeholder="Введи своё имя..."
                  value={name}
                  maxLength={20}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
                />
              </div>

              {showAvatars && (
                <div className="mt-3 grid grid-cols-8 gap-1.5 p-3 glass rounded-2xl">
                  {AVATARS.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => { setAvatar(a); setShowAvatars(false); }}
                      className={`w-9 h-9 rounded-xl overflow-hidden transition-all hover:scale-110 active:scale-95 border-2 ${
                        avatar === a ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' : 'border-transparent hover:border-white/30'
                      }`}
                    >
                      <img src={a} alt={`avatar-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-5 p-1 bg-white/4 rounded-2xl border border-white/6">
              <button
                onClick={() => setTab('create')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  tab === 'create'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg neon-cyan'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <IconHome size={15} /> Создать
              </button>
              <button
                onClick={() => setTab('join')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  tab === 'join'
                    ? 'bg-gradient-to-r from-blue-600 to-red-500 text-white shadow-lg neon-blue'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <IconArrowRight size={15} /> Войти
              </button>
            </div>

            {tab === 'create' ? (
              <div className="space-y-4">
                {/* Round time */}
                <div className="p-4 glass rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/60">
                      <IconTimer size={15} className="text-cyan-400" />
                      Время раунда
                    </label>
                    <span className="text-cyan-400 font-black text-lg">{roundTime}<span className="text-sm font-normal text-white/40">с</span></span>
                  </div>
                  <input type="range" min={20} max={180} step={10} value={roundTime}
                    onChange={e => setRoundTime(+e.target.value)} className="w-full cursor-pointer" />
                  <div className="flex justify-between text-xs text-white/25">
                    <span>20с — быстро</span><span>180с — расслабленно</span>
                  </div>
                </div>

                {/* Total rounds */}
                <div className="p-4 glass rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/60">
                      <IconRefresh size={15} className="text-blue-400" />
                      Количество раундов
                    </label>
                    <span className="text-blue-400 font-black text-lg">{totalRounds}</span>
                  </div>
                  <input type="range" min={2} max={10} step={1} value={totalRounds}
                    onChange={e => setTotalRounds(+e.target.value)} className="w-full cursor-pointer" />
                  <div className="flex justify-between text-xs text-white/25">
                    <span>2 — коротко</span><span>10 — длинно</span>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || !connected}
                  className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-cyan-500 via-blue-600 to-red-500 hover:from-cyan-400 hover:via-blue-500 hover:to-red-400 disabled:opacity-35 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2"
                >
                  <IconPlay size={18} /> Создать игру
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest mb-2.5">
                    <IconLink size={13} /> Код комнаты
                  </label>
                  <input
                    className="w-full glass border border-white/12 rounded-2xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/70 transition-all text-3xl font-black tracking-[0.5em] text-center uppercase"
                    placeholder="XXXXXX"
                    value={code}
                    maxLength={6}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  />
                  <p className="text-white/25 text-xs text-center mt-2">Попроси у хоста код комнаты</p>
                </div>
                <button
                  onClick={handleJoin}
                  disabled={!name.trim() || code.length < 4 || !connected}
                  className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-red-500 hover:from-blue-500 hover:via-indigo-500 hover:to-red-400 disabled:opacity-35 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2"
                >
                  <IconArrowRight size={18} /> Войти в игру
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HOW TO PLAY ── */}
      <div className="relative mt-10 w-full max-w-2xl grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {HOW_TO.map((item, i) => (
          <div
            key={i}
            className={`relative glass rounded-2xl p-4 flex flex-col items-center gap-3 border ${item.border} overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${item.color} pointer-events-none`} />
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="relative text-center">
              <div className="font-bold text-white text-sm mb-1">{item.title}</div>
              <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
            </div>
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/8 border border-white/12 text-xs font-black text-white/50">{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Bottom watermark */}
      <div className="relative mt-8 text-white/15 text-xs text-center">
        Многопользовательская игра в реальном времени
      </div>
    </div>
  );
}

// Need this import for IconLink
function IconLink({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
