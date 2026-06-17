import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GameProvider } from './context/GameContext';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>
);
