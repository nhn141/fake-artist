import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../lib/sounds';

export const GuessingView = () => {
  const { roomState, guess, role } = useGame();
  const [guessWord, setGuessWord] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      guess(guessWord.trim());
      setHasGuessed(true);
    }
  };

  if (!roomState) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>

        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🚨</span>
          <h2 className="text-3xl font-black text-white mb-2">Fake Artist Caught!</h2>
          <p className="text-gray-400 font-medium">
            The group has successfully identified the Fake Artist.
          </p>
        </div>

        {isFakeArtist ? (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 font-bold mb-1">YOU WERE CAUGHT!</p>
              <p className="text-sm text-gray-300">But you can still win if you can guess the Secret Word.</p>
              <p className="text-xs text-gray-500 mt-2">Category: {roomState.category}</p>
            </div>

            <form onSubmit={handleGuess} className="flex flex-col gap-4">
              <input
                type="text"
                value={guessWord}
                onChange={(e) => setGuessWord(e.target.value)}
                placeholder="Enter your guess..."
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-bold text-lg"
                disabled={hasGuessed}
              />
              <button
                type="submit"
                disabled={!guessWord.trim() || hasGuessed}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                {hasGuessed ? 'Submitted...' : 'Submit Guess'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <p className="text-green-400 font-bold mb-2">Great job, Artists!</p>
              <p className="text-gray-300">
                You caught the Fake Artist! Now we wait to see if they can guess the secret word:
              </p>
              <p className="text-xl font-black text-white mt-4 bg-black/30 py-2 rounded-lg">
                {role?.secretWord}
              </p>
            </div>
            
            <div className="text-gray-400 animate-pulse text-sm font-medium">
              Waiting for the Fake Artist to guess...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
