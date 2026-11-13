import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Trash2, Undo, Redo, Sparkles } from 'lucide-react';

type Point = { x: number; y: number };
type Line = { points: Point[]; color: string; size: number };

const PROMPTS = [
  "Draw your current mood.",
  "Explain your favorite algorithm without words.",
  "Design the worst UI possible.",
  "Draw what you think AI looks like.",
  "Draw a neural network from memory."
];

type AnalysisResult = {
  text: string;
  conf: number;
  objs: string;
  error?: boolean;
};

const ScribbleBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dprRef = useRef(1);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const colorRef = useRef('#e4e4e7');
  const sizeRef = useRef(2);

  const [lines, setLines] = useState<Line[]>([]);
  const [redoStack, setRedoStack] = useState<Line[]>([]);
  const [color, setColor] = useState('#e4e4e7');
  const [aiResponse, setAiResponse] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [promptStr] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const linesRef = useRef<Line[]>([]);

  const colors = ['#e4e4e7', '#f87171', '#3b82f6', '#fbbf24', '#0c0c0c']; // Paper/notebook colors + eraser

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }
  }, []);

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, line: Line) => {
    if (line.points.length === 0) return;
    if (line.points.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = line.color;
      ctx.arc(line.points[0].x, line.points[0].y, line.size / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(line.points[0].x, line.points[0].y);
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.size;
    for (let i = 1; i < line.points.length; i++) {
      ctx.lineTo(line.points[i].x, line.points[i].y);
    }
    ctx.stroke();
  }, []);

  const redraw = useCallback((allLines: Line[]) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const width = canvas.width / dprRef.current;
    const height = canvas.height / dprRef.current;

    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    drawGrid(ctx, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    allLines.forEach(line => drawLine(ctx, line));
  }, [drawGrid, drawLine]);

  // Size the backing store to the rendered size (crisp on retina, no distortion).
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      dprRef.current = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctxRef.current = canvas.getContext('2d');
      redraw(linesRef.current);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  // Repaint committed strokes whenever the drawing changes.
  useEffect(() => {
    linesRef.current = lines;
    redraw(lines);
  }, [lines, redraw]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    isDrawingRef.current = true;
    const point = getPoint(e);
    pointsRef.current = [point];
    setAiResponse(null);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = colorRef.current;
    ctx.beginPath();
    ctx.arc(point.x, point.y, sizeRef.current / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    e.preventDefault();

    const point = getPoint(e);
    const points = pointsRef.current;
    const previous = points[points.length - 1];
    if (!previous) return;

    // Ignore sub-pixel jitter so strokes stay smooth and cheap.
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 1.5) return;

    points.push(point);

    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = sizeRef.current;
    ctx.stroke();
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (e && canvasRef.current?.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }

    const points = pointsRef.current;
    pointsRef.current = [];

    if (points.length > 0) {
      const line: Line = { points, color: colorRef.current, size: sizeRef.current };
      setLines(prev => [...prev, line]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    const newLines = [...lines];
    const last = newLines.pop();
    if (last) {
      setRedoStack(prev => [...prev, last]);
      setLines(newLines);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const item = newRedo.pop();
    if (item) {
      setLines(prev => [...prev, item]);
      setRedoStack(newRedo);
    }
  };

  const handleAnalyze = async () => {
    if (lines.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAnalyzing(true);
    setAiResponse(null);

    // Actual client-side canvas analysis
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Count non-black pixels (drawn pixels)
      let drawnPixels = 0;
      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
        if (a > 20 && (r > 30 || g > 30 || b > 30)) {
          drawnPixels++;
          const px = (i / 4) % canvas.width;
          const py = Math.floor((i / 4) / canvas.width);
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }

      const totalPixels = canvas.width * canvas.height;
      const coverage = totalPixels > 0 ? (drawnPixels / totalPixels) * 100 : 0;
      const strokeCount = lines.length;
      const bboxWidth = maxX - minX;
      const bboxHeight = maxY - minY;
      const aspectRatio = bboxWidth > 0 && bboxHeight > 0 ? (bboxWidth / bboxHeight).toFixed(2) : '0';
      const density = bboxWidth > 0 && bboxHeight > 0 
        ? (drawnPixels / (bboxWidth * bboxHeight) * 100).toFixed(1) 
        : '0';

      // Generate interpretation based on real drawing properties
      let interpretation = '';
      let detectedPattern = '';
      const conf = Math.min(99, Math.max(12, Math.round(coverage * 8 + strokeCount * 3)));

      if (strokeCount === 0) {
        interpretation = "You clicked analyze on a blank canvas.\nAre you testing my error handling or is this a minimalist masterpiece? \nQuote: 'I see a polar bear blinking in a blizzard.'";
        detectedPattern = 'existential void';
      } else if (strokeCount === 1 && coverage < 1) {
        interpretation = "A single, decisive mark.\n'One stroke is all it takes' - Dua Lipa, probably.\nAre you trying to escape the matrix with a single vector?";
        detectedPattern = 'lonely vector';
      } else if (coverage > 15) {
        interpretation = "Heavy ink detected.\nEither you're deeply expressive, or you just reinvented the 'Dark Theme' manually. \nPun: I gotta say, this drawing looks pretty 'sketchy'.";
        detectedPattern = 'chaotic void (O(n^2) complexity)';
      } else if (strokeCount > 15) {
        interpretation = `${strokeCount} strokes detected.\nAh, the classic 'spaghetti code' approach but translated to MS Paint. \nQuote: 'Art is never finished, only abandoned.' (Please abandon this).`;
        detectedPattern = 'spaghetti art';
      } else if (Number(aspectRatio) > 2) {
        interpretation = "Wide horizontal architecture.\nLooks like a timeline of my unresolved bugs.\nPun: I'm really 'drawn' to your horizontal scalability.";
        detectedPattern = 'horizontal scalability';
      } else if (Number(aspectRatio) < 0.5) {
        interpretation = "Tall vertical stack.\nIs this a binary tree or your unresolved JavaScript Promises stacking up? \nPun: You really set a high 'bar' here.";
        detectedPattern = 'call stack overflow';
      } else if (strokeCount <= 4 && coverage < 3) {
        interpretation = "A few deliberate marks (maybe 'AN' or 'hi'?).\nModel says: I'm 40% sure this is a word, and 60% sure it's a cry for help. \nPun: You made a great 'point' with this one.";
        detectedPattern = 'cryptic hieroglyphs';
      } else if (Number(density) > 30) {
        interpretation = "Densely packed strokes.\nThis has the 'I tried to fix a Git merge conflict by mashing the keyboard' energy. \nQuote: 'Chaos isn't a pit, it's a canvas.'";
        detectedPattern = 'merge conflict';
      } else {
        interpretation = `Scattered strokes across ${coverage.toFixed(1)}% of the canvas.\nLooks like an unsupervised neural network trying to understand itself. \nPun: You really 'drew' out the suspense on this one.`;
        detectedPattern = 'unsupervised learning';
      }

      setAiResponse({
        text: interpretation,
        conf: conf,
        objs: `${strokeCount} strokes, ${coverage.toFixed(1)}% coverage, ${detectedPattern}`,
        error: false
      });

    } catch {
      setAiResponse({
        text: "Canvas analysis failed.\nThe drawing exists but I couldn't read it.",
        conf: 0,
        objs: "error",
        error: true
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative group/board">
      <div className="font-code text-tiny mb-4 absolute -top-12 left-0 hidden md:block rotate-[-2deg]" style={{ color: 'var(--text-muted)' }}>
        "proof that engineers cannot draw"
      </div>
      <div className="font-code text-tiny mb-4 absolute -right-4 top-20 hidden md:block rotate-[5deg] origin-left" style={{ color: 'var(--text-muted)' }}>
        "system architecture at 2 AM"
      </div>
      
      <div className="border border-[#27272a] bg-[#0c0c0c] p-1 flex flex-col md:flex-row gap-4">
        
        <div className="flex-1 relative" ref={containerRef}>
          <div className="absolute top-3 left-3 md:top-4 md:left-4 font-code text-tiny pointer-events-none select-none z-10 max-w-[70%]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            {promptStr}
          </div>
          <canvas
            ref={canvasRef}
            className="block w-full h-[320px] md:h-[400px] bg-[#111] cursor-crosshair touch-none select-none"
            aria-label="Scribble board — draw with a mouse, stylus, or finger"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onLostPointerCapture={() => stopDrawing()}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex gap-2 z-10">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setColor(c)}
                aria-label={c === '#0c0c0c' ? 'Eraser' : `Draw in ${c}`}
                aria-pressed={color === c}
                className={`w-8 h-8 md:w-6 md:h-6 rounded-sm border ${color === c ? 'border-white' : 'border-[#27272a]'}`}
                style={{ backgroundColor: c === '#0c0c0c' ? '#111' : c }}
                title={c === '#0c0c0c' ? 'Eraser' : 'Color'}
              >
                {c === '#0c0c0c' && <Eraser size={14} className="m-auto text-dim" />}
              </button>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex gap-1 bg-[#0c0c0c] border border-[#27272a] p-1 z-10">
            <button onClick={handleUndo} disabled={lines.length === 0} aria-label="Undo" className="p-2 md:p-1 hover:text-white text-dim disabled:opacity-30"><Undo size={14}/></button>
            <button onClick={handleRedo} disabled={redoStack.length === 0} aria-label="Redo" className="p-2 md:p-1 hover:text-white text-dim disabled:opacity-30"><Redo size={14}/></button>
            <button onClick={() => { setLines([]); setRedoStack([]); setAiResponse(null); }} aria-label="Clear board" className="p-2 md:p-1 hover:text-red-400 text-dim"><Trash2 size={14}/></button>
          </div>
        </div>

        <div className="w-full md:w-64 flex flex-col gap-4 p-4 border-t md:border-t-0 md:border-l border-[#27272a] bg-[#0a0a0a]">
          <h3 className="font-code text-tiny" style={{ color: 'var(--text-muted)' }}>SCRIBBLE BOARD</h3>
          <p className="font-serif text-small italic" style={{ color: 'var(--text-dim)' }}>Go ahead. Draw your masterpiece. Or whatever that is.</p>
          
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || lines.length === 0}
            className="mt-2 md:mt-4 border border-[#27272a] hover:border-accent p-3 md:p-2 font-mono text-tiny flex items-center justify-center gap-2 group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} className="group-hover:text-accent" />
            [ WHAT IS THIS? ]
          </button>

          {isAnalyzing && (
            <div className="mt-4 font-code text-tiny animate-pulse" style={{ color: 'var(--text-muted)' }}>
              {'>'} sending artifact to model...<br/>
              {'>'} computing probabilities...
            </div>
          )}

          {aiResponse && !isAnalyzing && (
            <div className={`mt-4 border p-4 text-small font-sans bg-black ${aiResponse.error ? 'border-red-900' : 'border-[#27272a]'}`}>
              <div className="font-code text-tiny border-b border-[#27272a] pb-2 mb-2" style={{ color: 'var(--text-muted)' }}>MODEL INTERPRETATION</div>
              <p className={`whitespace-pre-line mb-4 ${aiResponse.error ? 'text-red-400' : ''}`} style={aiResponse.error ? {} : { color: 'var(--text-muted)' }}>"{aiResponse.text}"</p>
              {!aiResponse.error && (
                <div className="font-code text-tiny flex flex-col gap-1" style={{ color: 'var(--text-dim)' }}>
                  <div>Objects: {aiResponse.objs}</div>
                  <div>Confidence: <span style={{ color: 'var(--stat-color)' }}>{aiResponse.conf}%</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScribbleBoard;
