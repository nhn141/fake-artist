import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { StrokePoint } from 'shared';
import { sounds } from '../lib/sounds';
import { PlayerAvatar } from './PlayerAvatar';
import { EmojiFloating } from './EmojiFloating';

export const CanvasView = () => {
  const { roomState, playerId, drawStroke, role, emojis, sendEmoji } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnStroke, setHasDrawnStroke] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const currentStrokeRef = useRef<StrokePoint[]>([]);
  const hasDrawnStrokeRef = useRef<boolean>(false);
  const myColorRef = useRef<string>('#fff');

  const isMyTurn = roomState?.currentTurnPlayerId === playerId;
  const myPlayer = roomState?.players.find(p => p.id === playerId);
  const myColor = myPlayer?.color || '#fff';

  // Keep refs updated for interval closures
  useEffect(() => {
    hasDrawnStrokeRef.current = hasDrawnStroke;
    myColorRef.current = myColor;
  }, [hasDrawnStroke, myColor]);

  const currentTurnPlayer = roomState?.players.find(p => p.id === roomState?.currentTurnPlayerId);

  // Redraw canvas whenever room strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !roomState) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (containerRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = containerRef.current.clientWidth * dpr;
        canvas.height = containerRef.current.clientHeight * dpr;
        drawAll();
      }
    };

    // Initial size
    if (canvas.width === 0) {
      resizeCanvas();
    }

    window.addEventListener('resize', resizeCanvas);

    const drawAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const dpr = window.devicePixelRatio || 1;
      ctx.lineWidth = 4 * dpr;

      // Draw finalized strokes from state
      roomState.strokes.forEach(stroke => {
        if (stroke.points.length === 0) return;
        ctx.strokeStyle = stroke.color;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x * canvas.width, stroke.points[i].y * canvas.height);
        }
        ctx.stroke();
      });

      // Draw current pending stroke
      const current = currentStrokeRef.current;
      if (current.length > 0) {
        ctx.strokeStyle = myColor;
        ctx.beginPath();
        ctx.moveTo(current[0].x * canvas.width, current[0].y * canvas.height);
        for (let i = 1; i < current.length; i++) {
          ctx.lineTo(current[i].x * canvas.width, current[i].y * canvas.height);
        }
        ctx.stroke();
      }
    };

    drawAll();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [roomState?.strokes, myColor, hasDrawnStroke]); // hasDrawnStroke included to re-trigger on undo/stop

  // Play sound when turn starts
  useEffect(() => {
    if (isMyTurn) {
      sounds.playTurn();
    }
  }, [isMyTurn]);

  // Timer logic
  useEffect(() => {
    if (!roomState?.turnStartTime || !isMyTurn) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - roomState.turnStartTime!;
      const remaining = Math.max(0, 15 - Math.floor(elapsed / 1000));

      setTimeLeft(prev => {
        if (remaining <= 5 && remaining > 0 && remaining !== prev) {
          sounds.playTick();
        }
        return remaining;
      });

      // Auto submit slightly before server timeout or exactly at 0 if we have a stroke
      if (remaining <= 0 && isMyTurn && currentStrokeRef.current.length > 0) {
        drawStroke({ points: currentStrokeRef.current, color: myColorRef.current });
        setIsDrawing(false);
        setHasDrawnStroke(true); // Ensure it's marked as drawn so they can't draw again
        clearInterval(interval); // Prevent multiple submissions
      }
    }, 100);

    return () => clearInterval(interval);
  }, [roomState?.turnStartTime, isMyTurn]);

  // Reset local stroke when turn ends
  useEffect(() => {
    if (!isMyTurn) {
      currentStrokeRef.current = [];
      setHasDrawnStroke(false);
      setIsDrawing(false);
    }
  }, [isMyTurn]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMyTurn || hasDrawnStroke) return;

    setIsDrawing(true);
    sounds.startScratch();
    const pos = getCoordinates(e);
    currentStrokeRef.current = [pos];

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const dpr = window.devicePixelRatio || 1;
      ctx.strokeStyle = myColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4 * dpr;
      ctx.beginPath();
      ctx.moveTo(pos.x * canvas.width, pos.y * canvas.height);
      ctx.lineTo(pos.x * canvas.width, pos.y * canvas.height);
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isMyTurn || hasDrawnStroke) return;

    const pos = getCoordinates(e);
    const lastPos = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    if (!lastPos) return;

    currentStrokeRef.current.push(pos);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const dpr = window.devicePixelRatio || 1;
      ctx.strokeStyle = myColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4 * dpr;
      ctx.beginPath();
      ctx.moveTo(lastPos.x * canvas.width, lastPos.y * canvas.height);
      ctx.lineTo(pos.x * canvas.width, pos.y * canvas.height);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    sounds.stopScratch();
    if (isDrawing && currentStrokeRef.current.length > 0) {
      setIsDrawing(false);
      setHasDrawnStroke(true);
    }
  };

  const handleUndo = () => {
    sounds.playClick();
    currentStrokeRef.current = [];
    setHasDrawnStroke(false);
  };

  const handleSubmit = () => {
    if (currentStrokeRef.current.length > 0) {
      sounds.playSubmit();
      drawStroke({ points: currentStrokeRef.current, color: myColor });
      // We do not clear the stroke here. It will be cleared when the turn naturally ends via server broadcast.
    }
  };

  if (!roomState) return null;

  return (
    <div className="flex flex-col h-screen bg-stone-50 text-stone-800 max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md z-10">
        <div>
          <div className="text-xs text-stone-500 font-bold tracking-wider uppercase mb-1">
            Vòng {roomState.roundNumber} / 2
          </div>
          <div className="text-xl font-bold text-rose-500">
            Chủ đề: <span className="text-stone-800">{roomState.category}</span>
          </div>
        </div>

        {role?.isFakeArtist ? (
          <div className="text-right">
            <div className="text-sm font-bold text-rose-500 bg-rose-400/20 px-3 py-1 rounded-lg border border-red-500/50">
              BẠN LÀ FAKE ARTIST
            </div>
            <div className="text-xs text-stone-500 mt-1">Hãy giả vờ là mình biết từ khóa!</div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-sm font-bold text-teal-600 bg-teal-400/20 px-3 py-1 rounded-lg border border-green-500/50">
              Từ khóa: {role?.secretWord}
            </div>
            <div className="text-xs text-stone-500 mt-1">Tìm ra Fake Artist!</div>
          </div>
        )}
      </div>

      {/* Color Legend & Players */}
      <div className="px-4 py-2 bg-stone-100 flex gap-3 overflow-x-auto border-b border-stone-200 hide-scrollbar">
        {roomState.players.map(p => (
          <div key={p.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${p.id === roomState.currentTurnPlayerId ? 'bg-white shadow-sm border border-stone-300 transform scale-105' : 'opacity-60 bg-stone-200'}`}>
            <PlayerAvatar name={p.nickname} size={16} playerColor={p.color} className="border shadow-sm" style={{ borderColor: p.color }} />
            <span className="text-stone-700 ml-1">{p.nickname}</span>
            <div className="w-3 h-3 rounded-full border border-white shadow-sm ml-1" style={{ backgroundColor: p.color }}></div>
          </div>
        ))}
      </div>

      {/* Turn Indicator */}
      <div className={`p-3 text-center font-bold text-lg transition-colors ${isMyTurn ? 'bg-sky-400 text-white shadow-inner' : 'bg-white border-b border-stone-200'}`}>
        {isMyTurn ? (
          <div className="flex items-center justify-center gap-2">
            <span className="animate-pulse">🎨 ĐẾN LƯỢT BẠN!</span>
            <span className="bg-white/20 px-2 py-1 rounded-md text-sm">{timeLeft}s</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-stone-600">
            <PlayerAvatar 
              name={currentTurnPlayer?.nickname || ''} 
              size={20} 
              playerColor={currentTurnPlayer?.color} 
              className="border-2" 
              style={{ borderColor: currentTurnPlayer?.color }} 
            />
            {currentTurnPlayer?.nickname} đang vẽ...
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-grow relative bg-white m-4 rounded-2xl shadow-xl overflow-hidden" ref={containerRef}>
        {/* We use touch-none to prevent browser scroll when drawing on mobile */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Overlay if not turn */}
        {!isMyTurn && (
          <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
        )}

        {/* Floating Emojis */}
        {emojis.map(e => (
          <EmojiFloating key={e.id} emoji={e.emoji} xPos={e.x} />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-white pb-8 flex gap-4 h-24">
        {isMyTurn && hasDrawnStroke && (
          <>
            <button
              onClick={handleUndo}
              className="flex-1 bg-stone-100 hover:bg-stone-300 text-stone-700 font-bold py-3 rounded-xl transition-colors"
            >
              Hoàn Tác (Undo)
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200"
            >
              Hoàn tất
            </button>
          </>
        )}
        {isMyTurn && !hasDrawnStroke && (
          <div className="flex-1 flex items-center justify-center text-stone-500 text-sm font-medium">
            Hãy vẽ đúng 1 nét liên tục trên khung vẽ.
          </div>
        )}
        {!isMyTurn && (
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
            <span className="text-stone-400 font-bold text-xs sm:text-sm uppercase tracking-wider">Thả Cảm Xúc</span>
            <div className="flex gap-3 sm:gap-4">
              {['😂', '🤔', '🎨', '😱', '👏', '👎'].map(e => (
                <button
                  key={e}
                  onClick={() => { sounds.playClick(); sendEmoji(e); }}
                  className="text-2xl sm:text-3xl hover:-translate-y-2 transition-all active:scale-95 bg-stone-100 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full shadow-sm border border-stone-200 hover:bg-white hover:shadow-md"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
