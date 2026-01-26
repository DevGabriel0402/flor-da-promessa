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
