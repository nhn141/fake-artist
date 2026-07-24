import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../lib/sounds';

export const VotingView = () => {
  const { roomState, playerId, vote, role } = useGame();
  const [votedId, setVotedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw final canvas
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

  const handleVote = (id: string) => {
    if (votedId) return; // already voted
    sounds.playClick();
    setVotedId(id);
    vote(id);
  };

  if (!roomState) return null;

  const hasVoted = !!votedId || !!roomState.votes[playerId!];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white max-w-2xl mx-auto p-4 pt-8">
      <h2 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-2">
        Time to Vote!
      </h2>
      <p className="text-gray-400 text-center mb-6 font-medium">
        Who do you think is the Fake Artist?
      </p>

      {/* Canvas Thumbnail */}
      <div className="bg-white rounded-2xl p-2 shadow-lg mb-8 mx-auto w-48 h-48 sm:w-64 sm:h-64 border-4 border-gray-800">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700 mb-8 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roomState.players.map(p => {
            if (p.id === playerId) return null; // Can't vote for self
            
            const isVoted = votedId === p.id;
            
            return (
              <button
                key={p.id}
                disabled={hasVoted}
                onClick={() => handleVote(p.id)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  isVoted 
                    ? 'bg-violet-600 border-2 border-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                    : hasVoted 
                      ? 'bg-gray-700/50 opacity-50 cursor-not-allowed border border-gray-700' 
                      : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-violet-500 hover:-translate-y-1'
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                ></div>
                <span className="font-bold truncate">{p.nickname}</span>
                {isVoted && <span className="ml-auto text-violet-200 font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        {hasVoted && (
          <div className="mt-8 text-center text-gray-400 animate-pulse font-medium">
            Waiting for other players to vote...
          </div>
        )}
      </div>
    </div>
  );
};
