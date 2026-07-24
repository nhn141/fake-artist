import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../lib/sounds';

export const ResultsView = () => {
  const { roomState, playerId, playAgain } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    sounds.playEnd();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !roomState) return;

    const handleBackToLobby = () => {
      sounds.playClick();
      window.location.reload();
    };

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

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [roomState]);

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId;
  const faPlayer = roomState.players.find(p => p.isFakeArtist);
  
  const faWon = roomState.winner === 'FA';
  
  let resultTitle = '';
  let resultDesc = '';
  
  if (faWon) {
    if (roomState.fakeArtistCaught) {
      resultTitle = 'Fake Artist Wins!';
      resultDesc = 'They were caught, but correctly guessed the secret word!';
    } else {
      resultTitle = 'Fake Artist Escapes!';
      resultDesc = 'The artists failed to catch the Fake Artist!';
    }
  } else {
    resultTitle = 'Artists Win!';
    resultDesc = 'The Fake Artist was caught and failed to guess the word!';
  }

  const handlePlayAgain = () => {
    sounds.playClick();
    playAgain();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 pt-12">
      <div className={`bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg border relative overflow-hidden ${
        faWon ? 'border-red-500/50' : 'border-green-500/50'
      }`}>
        
        {/* Decor */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${
          faWon ? 'bg-red-500' : 'bg-green-500'
        }`}></div>

        <div className="text-center relative z-10 mb-8">
          <span className="text-6xl mb-4 block">
            {faWon ? '🎭' : '🧑‍🎨'}
          </span>
          <h2 className={`text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${
            faWon ? 'from-red-400 to-orange-400' : 'from-green-400 to-emerald-400'
          }`}>
            {resultTitle}
          </h2>
          <p className="text-gray-300 font-medium">{resultDesc}</p>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Secret Word</p>
              <p className="text-xl font-bold text-white">{roomState.secretWord}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Category</p>
              <p className="text-xl font-bold text-white">{roomState.category}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">The Fake Artist was</p>
            <div className="flex items-center justify-center gap-3">
              <div 
                className="w-5 h-5 rounded-full shadow-inner"
                style={{ backgroundColor: faPlayer?.color }}
              ></div>
              <span className="text-2xl font-bold text-red-400">{faPlayer?.nickname}</span>
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handlePlayAgain}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] transform hover:-translate-y-1"
          >
            Play Again
          </button>
        ) : (
          <div className="text-center text-gray-400 animate-pulse bg-gray-800/50 py-4 rounded-xl border border-gray-700/50">
            Waiting for host to restart...
          </div>
        )}
      </div>
    </div>
  );
};
