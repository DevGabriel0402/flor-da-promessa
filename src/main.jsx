import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { limparStorageAntigo } from './utils/storageCleanup';

// Clear unrelated data from localhost:5173
limparStorageAntigo();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registrado coretamente:', registration))
      .catch(error => console.log('Erro ao registrar SW:', error));
  });
}
