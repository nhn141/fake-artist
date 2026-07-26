import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../lib/sounds';

export const GuessingView = () => {
  const { roomState, guessWord: submitGuess, role } = useGame();
  const [guessWord, setGuessWord] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    sounds.startBGM('suspense');
    return () => sounds.stopBGM();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !roomState) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientWidth * dpr;
        drawAll();
      }
    };

    const drawAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const dpr = window.devicePixelRatio || 1;
      ctx.lineWidth = 3 * dpr;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [roomState]);

  const isFakeArtist = role?.isFakeArtist;

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessWord.trim()) {
      sounds.playSubmit();
      submitGuess(guessWord.trim());
      setHasGuessed(true);
    }
  };

  if (!roomState) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-800 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 w-full max-w-md border border-stone-200 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>

        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🚨</span>
          <h2 className="text-3xl font-black text-stone-800 mb-2">Fake Artist Đã Bị Bắt!</h2>
          <p className="text-stone-500 font-medium">
            Mọi người đã bình chọn chính xác Fake Artist.
          </p>
        </div>

        {isFakeArtist ? (
          <div className="space-y-6">
            <div className="bg-rose-400/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-rose-600 font-bold mb-1">BẠN ĐÃ BỊ PHÁT HIỆN!</p>
              <p className="text-sm text-stone-600">Nhưng bạn vẫn có thể thắng nếu đoán đúng Từ Khóa Bí Mật.</p>
              <p className="text-xs text-stone-400 mt-2">Chủ đề: {roomState.category}</p>
            </div>

            <form onSubmit={handleGuess} className="flex flex-col gap-4">
              <input
                type="text"
                value={guessWord}
                onChange={(e) => setGuessWord(e.target.value)}
                placeholder="Nhập từ khóa..."
                className="w-full bg-stone-100 text-stone-800 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-bold text-lg"
                disabled={hasGuessed}
              />
              <button
                type="submit"
                disabled={!guessWord.trim() || hasGuessed}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                {hasGuessed ? 'Đã Gửi...' : 'Xác nhận'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-teal-400/10 border border-green-500/30 rounded-xl p-6">
              <p className="text-teal-600 font-bold mb-2">Làm tốt lắm các Artist!</p>
              <p className="text-stone-600">
                Bạn đã bắt được Fake Artist! Hãy chờ xem họ có đoán được từ khóa không nhé!
              </p>
              <p className="text-xl font-black text-stone-800 mt-4 bg-stone-200/50 py-2 rounded-lg">
                {role?.secretWord}
              </p>
            </div>

            <div className="text-stone-500 animate-pulse text-sm font-medium">
              Đang chờ Fake Artist đoán...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
