import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { RoomState } from 'shared';
import { sounds } from '../lib/sounds';

export const Lobby = () => {
  const { roomState, playerId, createRoom, joinRoom, startGame, error } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const savedName = sessionStorage.getItem('fake_artist_nickname');
    if (savedName) setNickname(savedName);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.init();
    sounds.playClick();
    if (roomCode && nickname) {
      joinRoom(roomCode, nickname);
    }
  };

  const handleCreate = () => {
    sounds.init();
    sounds.playClick();
    if (nickname) {
      sessionStorage.setItem('fake_artist_nickname', nickname);
      createRoom();
    } else {
      alert('Please enter a nickname first');
    }
  };

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-8 animate-pulse text-center">
          A Fake Artist <br className="md:hidden" /> Goes to New York
        </h1>
        
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-500/50">{error}</div>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Your Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder="Enter nickname..."
                maxLength={15}
              />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">JOIN ROOM</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono uppercase tracking-wider"
                placeholder="ROOM CODE"
                maxLength={4}
              />
              <button 
                type="submit"
                disabled={!roomCode || !nickname}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.5)]"
              >
                Join
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] transform hover:-translate-y-1"
            >
              Create New Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting in Lobby
  const handleStart = () => {
    sounds.playClick();
    startGame();
  };

  if (roomState && roomState.state === RoomState.LOBBY) {
    const isHost = roomState.hostId === playerId;
    
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 pt-12">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-700 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <h2 className="text-xl text-gray-400 font-medium text-center mb-2">Room Code</h2>
            <div className="text-6xl font-black text-center tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-8 font-mono">
              {roomState.roomCode}
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-4 mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Players ({roomState.players.length}/10)
              </h3>
              <div className="space-y-3">
                {roomState.players.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-inner"
                        style={{ backgroundColor: p.color }}
                      ></div>
                      <span className={`font-semibold ${p.id === playerId ? 'text-white' : 'text-gray-300'}`}>
                        {p.nickname} {p.id === playerId && '(You)'}
                      </span>
                    </div>
                    {p.isHost && (
                      <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-md font-bold">HOST</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost ? (
              <button
                onClick={handleStart}
                disabled={roomState.players.length < 4}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)] transform hover:-translate-y-1 disabled:hover:translate-y-0"
              >
                {roomState.players.length < 4 ? 'Waiting for more players (min 4)...' : 'Start Game'}
              </button>
            ) : (
              <div className="text-center text-gray-400 animate-pulse bg-gray-800/50 py-4 rounded-xl border border-gray-700/50">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null; // Should not render if in game
};
