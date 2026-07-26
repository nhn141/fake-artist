import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { RoomState } from 'shared';
import { sounds } from '../lib/sounds';
import { PlayerAvatar } from './PlayerAvatar';

export const Lobby = () => {
  const { roomState, playerId, createRoom, joinRoom, startGame, setReady, error } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem('fake_artist_nickname');
    if (savedName) setNickname(savedName);
  }, []);

  useEffect(() => {
    if (roomState?.state === RoomState.LOBBY) {
      sounds.startBGM('lobby');
    } else {
      sounds.stopBGM();
    }
    return () => sounds.stopBGM();
  }, [roomState?.state]);

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
      <div className="flex flex-col items-center justify-center h-screen bg-stone-50 text-stone-800 p-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-sky-400 mb-8 animate-pulse text-center">
          A Fake Artist <br className="md:hidden" /> Goes to New York
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 w-full max-w-md border border-stone-200">
          {error && <div className="bg-rose-400/20 text-rose-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-500/50">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-500 mb-2">Biệt danh</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-stone-100 text-stone-800 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder="Nhập biệt danh của bạn..."
                maxLength={15}
              />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-300"></div>
              <span className="flex-shrink-0 mx-4 text-stone-400 text-sm font-medium">VÀO PHÒNG CHƠI</span>
              <div className="flex-grow border-t border-stone-300"></div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-stone-100 text-stone-800 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono uppercase tracking-wider"
                placeholder="MÃ PHÒNG"
                maxLength={4}
              />
              <button
                type="submit"
                disabled={!roomCode || !nickname}
                className="bg-sky-400 text-white hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-sky-200"
              >
                Vào
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-300"></div>
              <span className="flex-shrink-0 mx-4 text-stone-400 text-sm font-medium">HOẶC</span>
              <div className="flex-grow border-t border-stone-300"></div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-rose-400 to-sky-400 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl shadow-rose-200 transform hover:-translate-y-1"
            >
              Tạo phòng chơi mới
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                sounds.playClick();
                setShowRules(!showRules);
              }}
              className="w-full flex items-center justify-between bg-white border border-stone-300 hover:bg-stone-100 text-stone-600 font-medium py-3 px-4 rounded-xl transition-all"
            >
              <span>Luật chơi</span>
              <span>{showRules ? '▲' : '▼'}</span>
            </button>

            {showRules && (
              <div className="mt-2 p-4 bg-white/80 border border-stone-300 rounded-xl text-sm text-stone-600 space-y-3">
                <p><strong>🎨 A Fake Artist Goes to New York</strong> là game dành cho 4-10 người.</p>
                <ul className="list-disc pl-5 space-y-1 text-stone-500">
                  <li>Mọi người đều nhận được một chủ đề và một <strong>Từ Khóa Bí Mật</strong> thuộc chủ đề đó (VD: chủ đề động vật, từ khóa con chó), NGOẠI TRỪ 1 người bị chọn ngẫu nhiên làm <strong>Fake Artist</strong>, người đó chỉ biết chủ đề, không biết từ khóa.</li>
                  <li>Lần lượt từng người sẽ vẽ <strong>MỘT NÉT DUY NHẤT</strong> lên bức tranh chung (phân biệt từng người qua màu sắc). (Vẽ 2 vòng).</li>
                  <li>Mọi người phải vẽ sao cho người khác biết mình biết từ khóa, nhưng không được vẽ quá rõ để lộ từ khóa cho <strong>Fake Artist</strong> đoán được.</li>
                  <li><strong>Fake Artist</strong> phải vẽ "hùa" theo để giả vờ như mình cũng biết từ khóa.</li>
                </ul>
                <p><strong>🏆 Phán xét:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-stone-500">
                  <li>Sau khi vẽ xong, mọi người bình chọn xem ai là <strong>Fake Artist</strong>.</li>
                  <li>Nếu <strong>Fake Artist</strong> KHÔNG bị phát hiện ➡️ <strong>Fake Artist Thắng!</strong></li>
                  <li>Nếu bị phát hiện, <strong>Fake Artist</strong> có cơ hội cuối để đoán Từ Khóa. Nếu đoán <strong>ĐÚNG</strong> ➡️ <strong>Fake Artist Thắng!</strong></li>
                  <li>Đoán <strong>SAI</strong> ➡️ <strong>Những người còn lại Thắng!</strong></li>
                </ul>
              </div>
            )}
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
    const myPlayer = roomState.players.find(p => p.id === playerId);
    const isReady = myPlayer?.isReady || false;
    const allOthersReady = roomState.players.filter(p => !p.isHost).every(p => p.isReady);

    return (
      <div className="flex flex-col items-center min-h-screen bg-stone-50 text-stone-800 p-4 pt-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 w-full max-w-lg border border-stone-200 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <h2 className="text-xl text-stone-500 font-medium text-center mb-2">MÃ PHÒNG</h2>
            <div className="text-6xl font-black text-center tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-sky-400 mb-8 font-mono">
              {roomState.roomCode}
            </div>

            <div className="bg-stone-50/50 rounded-2xl p-4 mb-8">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">
                Players ({roomState.players.length}/10)
              </h3>
              <div className="space-y-3">
                {roomState.players.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar
                        name={p.nickname}
                        size={36}
                        playerColor={p.color}
                        className="border-[3px]"
                        style={{ borderColor: p.color }}
                      />
                      <span className={`font-semibold ${p.id === playerId ? 'text-stone-800' : 'text-stone-600'}`}>
                        {p.nickname} {p.id === playerId && '(Bạn)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isHost && (
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-md font-bold border border-sky-200">HOST</span>
                      )}
                      {!p.isHost && (
                        <span className={`text-xs px-2 py-1 rounded-md font-bold border ${p.isReady ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                          {p.isReady ? 'READY' : 'WAITING'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isHost ? (
              <button
                onClick={handleStart}
                disabled={roomState.players.length < 4 || !allOthersReady}
                className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 disabled:from-stone-300 disabled:to-stone-400 disabled:text-stone-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl shadow-emerald-200 transform hover:-translate-y-1 disabled:hover:translate-y-0"
              >
                {roomState.players.length < 4
                  ? 'Chờ đủ người chơi (tối thiểu 4)...'
                  : !allOthersReady
                    ? 'Chờ tất cả người chơi sẵn sàng...'
                    : 'Bắt đầu'}
              </button>
            ) : (
              <button
                onClick={() => { sounds.playClick(); setReady(!isReady); }}
                className={`w-full font-bold py-4 px-4 rounded-xl transition-all shadow-xl transform hover:-translate-y-1 ${isReady ? 'bg-stone-200 hover:bg-stone-300 text-stone-700 shadow-stone-200' : 'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white shadow-emerald-200'}`}
              >
                {isReady ? 'Hủy' : 'Sẵn sàng'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null; // Should not render if in game
};
