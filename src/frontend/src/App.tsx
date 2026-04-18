import { Suspense, lazy, useEffect } from "react";
import { useInputListener } from "./hooks/useGameLoop";
import { useGameStore } from "./store/gameStore";
import { GamePhase } from "./types/game";

// Lazy pages for bundle splitting
const LobbyPage = lazy(() => import("./pages/Lobby"));
const GameCanvasPage = lazy(() => import("./pages/GameCanvas"));
const GameOverPage = lazy(() => import("./pages/GameOver"));

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="tactical-text text-primary pulse-tactical">LOADING...</p>
      </div>
    </div>
  );
}

function AppRouter() {
  const phase = useGameStore((s) => s.phase);

  // Attach global keyboard/mouse listeners
  useInputListener();

  return (
    <div
      className="fixed inset-0 bg-background overflow-hidden"
      style={{ colorScheme: "dark" }}
    >
      <Suspense fallback={<LoadingScreen />}>
        {phase === GamePhase.Lobby && <LobbyPage />}
        {phase === GamePhase.InGame && <GameCanvasPage />}
        {phase === GamePhase.GameOver && <GameOverPage />}
      </Suspense>
    </div>
  );
}

export default function App() {
  // Set dark class on html element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <AppRouter />;
}
