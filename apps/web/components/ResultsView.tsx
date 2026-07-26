import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../lib/sounds';
import confetti from 'canvas-confetti';
import { PlayerAvatar } from './PlayerAvatar';

export const ResultsView = () => {
  const { roomState, playerId, playAgain } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoveredPlayer, setHoveredPlayer] = useState<{ name: string, color: string, x: number, y: number } | null>(null);

  useEffect(() => {
    sounds.stopBGM();
    if (roomState?.winner === 'FA') {
      sounds.playFakeArtistWin();
    } else {
      sounds.playArtistWin();
    }

    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: roomState?.winner === 'FA' ? ['#ef4444', '#f97316', '#000000'] : ['#2dd4bf', '#34d399', '#f472b6']
    });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !roomState) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientWidth * dpr; // Make it square
        drawAll();
      }
    };

    const drawAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background white so downloaded image has a background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const dpr = window.devicePixelRatio || 1;
      ctx.lineWidth = 4 * dpr;

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
  }, [roomState]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !roomState) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    let closestStroke = null;
    let minDistance = 0.05; // ~5% of canvas width threshold

    for (const stroke of roomState.strokes) {
      for (const p of stroke.points) {
        const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closestStroke = stroke;
        }
      }
    }

    if (closestStroke) {
      const player = roomState.players.find(p => p.color === closestStroke.color);
      if (player) {
        setHoveredPlayer({
          name: player.nickname,
          color: player.color,
          x: e.clientX,
          y: e.clientY - 30 // above cursor
        });
        return;
      }
    }
    setHoveredPlayer(null);
  };

  const handleMouseLeave = () => setHoveredPlayer(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `fake-artist-masterpiece.png`;
    a.click();
  };

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId;
  const faPlayer = roomState.players.find(p => p.isFakeArtist);

  const faWon = roomState.winner === 'FA';

  let resultTitle = '';
  let resultDesc = '';

  if (faWon) {
    if (roomState.fakeArtistCaught) {
      resultTitle = 'Fake Artist Thắng!';
      resultDesc = 'Dù bị bắt nhưng họ đã đoán đúng Từ Khóa Bí Mật!';
    } else {
      resultTitle = 'Fake Artist Thắng!';
      resultDesc = 'Các Artist đã không thể tìm ra ai là Fake Artist!';
    }
  } else {
    resultTitle = 'Artists Thắng!';
    resultDesc = 'Fake Artist đã bị bắt và đoán sai từ khóa!';
  }

  const handlePlayAgain = () => {
    sounds.playClick();
    playAgain();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-stone-50 text-stone-800 p-4 pt-12 relative">
      <div className={`bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 w-full max-w-lg border relative overflow-hidden ${faWon ? 'border-red-500/50' : 'border-green-500/50'}`}>

        {/* Decor */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${faWon ? 'bg-rose-400' : 'bg-teal-400'}`}></div>

        <div className="text-center relative z-10 mb-6">
          <span className="text-6xl mb-4 block">
            {faWon ? '🎭' : '🧑‍🎨'}
          </span>
          <h2 className={`text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${faWon ? 'from-red-400 to-orange-400' : 'from-green-400 to-emerald-400'}`}>
            {resultTitle}
          </h2>
          <p className="text-stone-600 font-medium">{resultDesc}</p>
        </div>

        {/* The Masterpiece Canvas */}
        <div className="mb-6 relative">
          <p className="text-center text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Tác phẩm chung</p>
          <div className="bg-white rounded-2xl shadow-inner border-2 border-stone-200 mx-auto w-64 h-64 sm:w-80 sm:h-80 cursor-crosshair relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none rounded-2xl"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={(e) => {
                // simple touch support for tooltip
                const touch = e.touches[0];
                handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as unknown as React.MouseEvent);
              }}
              onTouchEnd={handleMouseLeave}
            />
            <button
              onClick={handleDownload}
              className="absolute -bottom-4 -right-4 bg-sky-500 hover:bg-sky-600 text-white rounded-full p-4 shadow-xl hover:-translate-y-1 transition-all z-10 border-2 border-white"
              title="Lưu Tác Phẩm"
            >
              <svg xmlns="http://www.w3.org/.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>
        </div>

        <div className="bg-stone-50/50 rounded-2xl p-6 mb-8 border border-stone-200 mt-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Từ Khóa Bí Mật</p>
              <p className="text-xl font-bold text-stone-800">{roomState.secretWord}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Chủ Đề</p>
              <p className="text-xl font-bold text-stone-800">{roomState.category}</p>
            </div>
          </div>

          {roomState.guessedWord && (
            <div className="mt-4 pt-4 border-t border-stone-200/50 text-center">
              <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Fake Artist đã đoán</p>
              <p className={`text-xl font-bold ${faWon ? 'text-teal-500' : 'text-rose-500 line-through decoration-rose-300 decoration-2'}`}>
                "{roomState.guessedWord}"
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Fake Artist chính là</p>
            <div className="flex items-center justify-center gap-3">
              {faPlayer && (
                <PlayerAvatar
                  name={faPlayer.nickname}
                  size={48}
                  playerColor={faPlayer.color}
                  className="border-4"
                  style={{ borderColor: faPlayer.color }}
                />
              )}
              <span className="text-2xl font-bold text-rose-600">{faPlayer?.nickname}</span>
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handlePlayAgain}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl shadow-fuchsia-200 transform hover:-translate-y-1"
          >
            Chơi Lại
          </button>
        ) : (
          <div className="text-center text-stone-500 animate-pulse bg-white/50 py-4 rounded-xl border border-stone-200/50">
            Đang chờ chủ phòng bắt đầu ván chơi mới...
          </div>
        )}
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
    </div>
  );
};
