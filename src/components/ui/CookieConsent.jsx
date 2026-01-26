import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { saveToStorage, loadFromStorage } from '../../utils/persistence';
import { Botao } from './Botoes';

const Banner = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(181, 126, 220, 0.2);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10000;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 600px) {
    bottom: 80px; /* Acima da TabBar mobile */
    left: 16px;
    right: 16px;
  }
`;

const Texto = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.cores.texto};
  
  strong {
    color: ${({ theme }) => theme.cores.secundaria};
  }
`;

export default function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aceitou = loadFromStorage('cookie_aceito', false);
    if (!aceitou) {
      const timer = setTimeout(() => setVisivel(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const aceitar = () => {
    saveToStorage('cookie_aceito', true);
    setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <Banner>
      <Texto>
        <strong>Sua privacidade é importante.</strong> 🌸 <br />
        Utilizamos cookies para melhorar sua experiência em nossa confeitaria virtual, lembrando seus itens no carrinho e sua posição na página.
      </Texto>
      <Botao onClick={aceitar} style={{ width: '100%' }}>
        Aceitar e Continuar
      </Botao>
    </Banner>
  );
}
