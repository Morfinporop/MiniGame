import { useRef, useState, useEffect, useCallback } from 'react';
import {
  IconBrush, IconFill, IconEraser, IconUndo, IconRedo, IconTrash, IconCheck, IconPalette
} from './Icons';

interface Props {
  onExport: (dataUrl: string) => void;
}

const PALETTE: string[] = [
  '#FFFFFF', '#E5E5E5', '#9CA3AF', '#4B5563', '#1C1C1E', '#000000',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6',
  '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6',
  '#FCA5A5', '#FCD34D', '#86EFAC', '#7DD3FC', '#C4B5FD', '#FDA4AF',
  '#7F1D1D', '#78350F', '#14532D', '#1E3A5F', '#3B0764', '#831843',
];

const BRUSH_SIZES = [
  { px: 3,  label: 'XS' },
  { px: 7,  label: 'S' },
  { px: 14, label: 'M' },
  { px: 24, label: 'L' },
  { px: 40, label: 'XL' },
];

const BG_COLOR = '#0d1726';

export default function DrawingCanvas({ onExport }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(7);
  const [tool, setTool] = useState<'brush' | 'fill' | 'eraser'>('brush');
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const canUndoRef = useRef(false);
  const [histVersion, setHistVersion] = useState(0); // force re-render for button states

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(img);
    if (historyRef.current.length > 40) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    canUndoRef.current = historyIndexRef.current > 0;
    setHistVersion(v => v + 1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, [saveHistory]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0] || e.changedTouches[0];
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * sx, y: ((e as React.MouseEvent).clientY - rect.top) * sy };
  };

  const floodFill = (canvas: HTMLCanvasElement, x: number, y: number, hex: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    const px = Math.round(x), py = Math.round(y);
    const idx = (py * canvas.width + px) * 4;
    const tR = d[idx], tG = d[idx+1], tB = d[idx+2], tA = d[idx+3];
    const h = hex.replace('#','');
    const fR = parseInt(h.slice(0,2),16), fG = parseInt(h.slice(2,4),16), fB = parseInt(h.slice(4,6),16);
    if (tR===fR && tG===fG && tB===fB) return;
    const match = (i: number) =>
      Math.abs(d[i]-tR)<35 && Math.abs(d[i+1]-tG)<35 && Math.abs(d[i+2]-tB)<35 && Math.abs(d[i+3]-tA)<35;
    const stack = [px + py*canvas.width];
    const vis = new Uint8Array(canvas.width*canvas.height);
    while (stack.length) {
      const p = stack.pop()!;
      if (vis[p]) continue;
      vis[p] = 1;
      const i = p*4;
      if (!match(i)) continue;
      d[i]=fR; d[i+1]=fG; d[i+2]=fB; d[i+3]=255;
      const x2 = p%canvas.width, y2 = Math.floor(p/canvas.width);
      if (x2>0) stack.push(p-1);
      if (x2<canvas.width-1) stack.push(p+1);
      if (y2>0) stack.push(p-canvas.width);
      if (y2<canvas.height-1) stack.push(p+canvas.width);
    }
    ctx.putImageData(img, 0, 0);
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    if (tool === 'fill') {
      saveHistory();
      floodFill(canvas, pos.x, pos.y, color);
      return;
    }
    setIsDrawing(true);
    lastPos.current = pos;
    saveHistory();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const actualColor = tool === 'eraser' ? BG_COLOR : color;
    const actualSize = tool === 'eraser' ? brushSize * 2.5 : brushSize;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, actualSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = actualColor;
    ctx.fill();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    const actualColor = tool === 'eraser' ? BG_COLOR : color;
    const actualSize = tool === 'eraser' ? brushSize * 2.5 : brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = actualColor;
    ctx.lineWidth = actualSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPos.current = null;
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHistVersion(v => v + 1);
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHistVersion(v => v + 1);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;
  void histVersion; // used to trigger re-render

  const TOOLS = [
    { id: 'brush',  Icon: IconBrush,  label: 'Кисть' },
    { id: 'fill',   Icon: IconFill,   label: 'Заливка' },
    { id: 'eraser', Icon: IconEraser, label: 'Ластик' },
  ] as const;

  return (
    <div className="flex flex-col gap-3 w-full select-none">
      {/* ── TOOLBAR ── */}
      <div className="glass-strong rounded-2xl border border-white/7 p-3 flex flex-wrap items-center gap-3 shadow-lg">

        {/* Tools */}
        <div className="flex gap-1.5">
          {TOOLS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                tool === id
                  ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-900/30'
                  : 'glass border-white/8 text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Undo / Redo / Clear */}
        <div className="flex gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Отменить (Ctrl+Z)"
            className="p-2 rounded-xl glass border border-white/8 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <IconUndo size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Повторить"
            className="p-2 rounded-xl glass border border-white/8 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <IconRedo size={16} />
          </button>
          <button
            onClick={clear}
            title="Очистить холст"
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <IconTrash size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Brush sizes */}
        <div className="flex gap-1.5 items-center">
          {BRUSH_SIZES.map(({ px, label }) => (
            <button
              key={px}
              onClick={() => setBrushSize(px)}
              title={`${label} (${px}px)`}
              className={`flex items-center justify-center rounded-xl transition-all border ${
                brushSize === px
                  ? 'border-cyan-400/60 bg-cyan-500/15'
                  : 'border-white/10 glass hover:border-white/25'
              }`}
              style={{ width: 34, height: 34 }}
            >
              <div
                className="rounded-full"
                style={{
                  width: Math.min(px * 0.8 + 4, 26),
                  height: Math.min(px * 0.8 + 4, 26),
                  backgroundColor: tool === 'eraser' ? 'rgba(255,255,255,0.2)' : color,
                  border: tool === 'eraser' ? '1.5px dashed rgba(255,255,255,0.4)' : 'none',
                }}
              />
            </button>
          ))}
        </div>

        {/* Send button */}
        <div className="ml-auto">
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              onExport(canvas.toDataURL('image/png', 0.85));
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
          >
            <IconCheck size={16} /> Отправить
          </button>
        </div>
      </div>

      {/* ── COLOR PALETTE ── */}
      <div className="glass-strong rounded-2xl border border-white/7 p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <IconPalette size={15} className="text-white/30 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5 flex-1">
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('brush'); }}
                title={c}
                className={`rounded-lg transition-all hover:scale-110 active:scale-95 border-2 flex-shrink-0 ${
                  color === c && tool !== 'eraser'
                    ? 'border-white scale-110 shadow-lg shadow-black/40'
                    : 'border-transparent hover:border-white/40'
                }`}
                style={{ backgroundColor: c, width: 28, height: 28 }}
              />
            ))}

            {/* Custom color picker */}
            <label className="cursor-pointer flex-shrink-0" title="Свой цвет">
              <div
                className="w-7 h-7 rounded-lg border-2 border-dashed border-white/30 hover:border-white/60 transition-all flex items-center justify-center text-white/40 hover:text-white/70 text-base font-bold"
              >
                +
              </div>
              <input
                type="color"
                value={color}
                onChange={e => { setColor(e.target.value); setTool('brush'); }}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </label>
          </div>

          {/* Current color */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2 border-l border-white/8">
            <div
              className="w-8 h-8 rounded-xl border-2 border-white/20 shadow-inner flex-shrink-0"
              style={{ backgroundColor: tool === 'eraser' ? BG_COLOR : color }}
            />
            <span className="text-[10px] text-white/30 font-mono hidden sm:block">
              {tool === 'eraser' ? 'ЛАСТИК' : color.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── CANVAS ── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/12 shadow-2xl"
        style={{ touchAction: 'none', background: BG_COLOR }}
      >
        {/* Grid overlay hint */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          className="w-full block"
          style={{
            touchAction: 'none',
            cursor: tool === 'fill' ? 'cell'
                  : tool === 'eraser' ? 'crosshair'
                  : 'crosshair',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  );
}
