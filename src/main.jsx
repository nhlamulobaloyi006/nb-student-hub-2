import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';

import App from './App';

/* PWA service worker is auto-registered by vite-plugin-pwa. */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
