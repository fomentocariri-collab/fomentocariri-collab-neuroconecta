import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { FocusTimerProvider } from './contexts/FocusTimerContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FocusTimerProvider>
        <App />
      </FocusTimerProvider>
    </AuthProvider>
  </StrictMode>,
);
