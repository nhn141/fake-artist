'use client';

import { GameProvider, useGame } from '../context/GameContext';
import { Lobby } from '../components/Lobby';
import { CanvasView } from '../components/CanvasView';
import { VotingView } from '../components/VotingView';
import { GuessingView } from '../components/GuessingView';
import { ResultsView } from '../components/ResultsView';
import { RoomState } from 'shared';

const GameRouter = () => {
  const { roomState } = useGame();

  if (!roomState) return <Lobby />;

  switch (roomState.state) {
    case RoomState.LOBBY:
      return <Lobby />;
    case RoomState.DRAWING:
      return <CanvasView />;
    case RoomState.VOTING:
      return <VotingView />;
    case RoomState.GUESSING:
      return <GuessingView />;
    case RoomState.END:
      return <ResultsView />;
    default:
      return <Lobby />;
  }
};

export default function Home() {
  return (
    <GameProvider>
      <main className="min-h-screen bg-gray-900 font-sans selection:bg-pink-500/30">
        <GameRouter />
      </main>
    </GameProvider>
  );
}
