import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../lib/sounds';
import { PlayerAvatar } from './PlayerAvatar';

export const VotingView = () => {
  const { roomState, playerId, vote, role } = useGame();
  const [votedId, setVotedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw final canvas
  useEffect(() => {
    sounds.startBGM('suspense');
    return () => sounds.stopBGM();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !roomState) return;

    // Set a fixed aspect ratio for thumbnail
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientWidth * dpr; // Square
        drawAll();
      }
    };

    const drawAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const dpr = window.devicePixelRatio || 1;
      ctx.lineWidth = 3 * dpr;

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
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [roomState?.strokes]);

  const [hoveredPlayer, setHoveredPlayer] = useState<{name: string, color: string, x: number, y: number} | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!roomState || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Find the closest stroke
    const threshold = 0.05; // 5% of canvas width
    let closestStroke = null;
    let minDistance = threshold;

    for (const stroke of roomState.strokes) {
      for (const point of stroke.points) {
        const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closestStroke = stroke;
        }
      }
    }

    if (closestStroke) {
      const player = roomState.players.find(p => p.color === closestStroke?.color);
      if (player) {
        setHoveredPlayer({
          name: player.nickname,
          color: player.color,
          x: e.clientX,
          y: e.clientY
        });
        return;
      }
    }
    
    setHoveredPlayer(null);
  };

  const handleMouseLeave = () => setHoveredPlayer(null);

  const handleVote = (id: string) => {
    if (votedId) return; // already voted
    sounds.playClick();
    setVotedId(id);
    vote(id);
  };

  if (!roomState) return null;

  const hasVoted = !!votedId || !!roomState.votes[playerId!];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-800 max-w-2xl mx-auto p-4 pt-8">
      <h2 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-sky-400 mb-2">
        Đã đến lúc bình chọn Fake Artist!
      </h2>
      <p className="text-stone-500 text-center mb-6 font-medium">
        Theo bạn, ai là Fake Artist?
      </p>

      {/* Canvas Thumbnail */}
      <div className="bg-white rounded-2xl p-2 shadow-lg mb-8 mx-auto w-48 h-48 sm:w-64 sm:h-64 border-4 border-gray-800">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full cursor-help" 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Tooltip */}
      {hoveredPlayer && (
        <div 
          className="fixed pointer-events-none z-50 bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 transition-opacity"
          style={{ left: hoveredPlayer.x, top: hoveredPlayer.y, transform: 'translate(-50%, -100%)' }}
        >
          <PlayerAvatar 
            name={hoveredPlayer.name} 
            size={20} 
            playerColor={hoveredPlayer.color} 
            className="border-2"
            style={{ borderColor: hoveredPlayer.color }}
          />
          {hoveredPlayer.name}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 border border-stone-200 mb-8 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roomState.players.map(p => {
            if (p.id === playerId) return null; // Can't vote for self

            const isVoted = votedId === p.id;

            return (
              <button
                key={p.id}
                disabled={hasVoted}
                onClick={() => handleVote(p.id)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${isVoted
                    ? 'bg-sky-400 text-white border-2 border-violet-400 shadow-lg shadow-sky-200'
                    : hasVoted
                      ? 'bg-stone-100 opacity-50 cursor-not-allowed border border-stone-200'
                      : 'bg-stone-100 hover:bg-stone-300 border border-stone-300 hover:border-violet-500 hover:-translate-y-1'
                  }`}
              >
                <PlayerAvatar name={p.nickname} size={28} playerColor={p.color} className="border-2" style={{ borderColor: p.color }} />
                <span className="font-bold truncate">{p.nickname}</span>
                {isVoted && <span className="ml-auto text-violet-200 font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        {hasVoted && (
          <div className="mt-8 text-center text-stone-500 animate-pulse font-medium">
            Đang chờ những người khác bình chọn...
          </div>
        )}
      </div>
    </div>
  );
};
