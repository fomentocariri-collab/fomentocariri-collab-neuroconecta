import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { FocusTimerProvider } from './contexts/FocusTimerContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <FocusTimerProvider>
          <App />
        </FocusTimerProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

