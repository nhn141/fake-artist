import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { StrokePoint } from 'shared';
import { sounds } from '../lib/sounds';

export const CanvasView = () => {
  const { roomState, playerId, drawStroke, role } = useGame();
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
      setTimeLeft(remaining);

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
    <div className="flex flex-col h-screen bg-gray-900 text-white max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center p-4 bg-gray-800 shadow-md z-10">
        <div>
          <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">
            Round {roomState.roundNumber} / 2
          </div>
          <div className="text-xl font-bold text-pink-400">
            Category: <span className="text-white">{roomState.category}</span>
          </div>
        </div>
        
        {role?.isFakeArtist ? (
          <div className="text-right">
            <div className="text-sm font-bold text-red-500 bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/50">
              YOU ARE THE FAKE ARTIST
            </div>
            <div className="text-xs text-gray-400 mt-1">Blend in!</div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-sm font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/50">
              Word: {role?.secretWord}
            </div>
            <div className="text-xs text-gray-400 mt-1">Find the Fake Artist!</div>
          </div>
        )}
      </div>

      {/* Turn Indicator */}
      <div className={`p-3 text-center font-bold text-lg transition-colors ${isMyTurn ? 'bg-violet-600' : 'bg-gray-800 border-b border-gray-700'}`}>
        {isMyTurn ? (
          <div className="flex items-center justify-center gap-2">
            <span className="animate-pulse">🎨 YOUR TURN!</span>
            <span className="bg-white/20 px-2 py-1 rounded-md text-sm">{timeLeft}s</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: currentTurnPlayer?.color }}
            ></div>
            {currentTurnPlayer?.nickname} is drawing...
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
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-800 pb-8 flex gap-4 h-24">
        {isMyTurn && hasDrawnStroke && (
          <>
            <button
              onClick={handleUndo}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Undo
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.4)]"
            >
              Submit Stroke
            </button>
          </>
        )}
        {isMyTurn && !hasDrawnStroke && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">
            Draw exactly 1 continuous stroke on the canvas above.
          </div>
        )}
      </div>
    </div>
  );
};
