import React from 'react';
import { Toaster } from 'react-hot-toast';
import { GlobalStyle } from './styles/GlobalStyle';
import RouterApp from './app/Router';
import { ProvedorCarrinho } from './contexto/CarrinhoContexto';
import { useScrollRestoration } from './hooks/useScrollRestoration';
import CookieConsent from './components/ui/CookieConsent.jsx';

import { ProvedorConfig } from './contexto/ConfigContexto';

import { BrowserRouter } from 'react-router-dom';

function AppContent() {
  useScrollRestoration();
  return (
    <ProvedorConfig>
      <GlobalStyle />
      <Toaster position="top-center" />
      <ProvedorCarrinho>
        <RouterApp />
        <CookieConsent />
      </ProvedorCarrinho>
    </ProvedorConfig>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
