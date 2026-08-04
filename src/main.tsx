import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ConvexProvider} from 'convex/react';
import App from './App.tsx';
import {convex} from './convex.ts';
import {ConvexAuthBridge} from './components/auth/ConvexAuthBridge.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <ConvexAuthBridge>
        <App />
      </ConvexAuthBridge>
    </ConvexProvider>
  </StrictMode>,
);
