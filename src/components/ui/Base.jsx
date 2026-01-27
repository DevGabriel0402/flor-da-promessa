import styled from 'styled-components';



export const Container = styled.div`
  max-width: ${({ theme }) => theme.larguras.conteudo};
  margin: 0 auto;
  padding: 16px;
  
  @media (max-width: 600px) {
    padding: 12px;
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.cores.branco};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.bordas.raioGrande};
  box-shadow: ${({ theme }) => theme.sombras.suave};
  padding: 16px;
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    & > * {
      width: 100%;
    }
  }
`;

export const Badge = styled.span`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.cores.primariaClara};
  color: ${({ theme }) => theme.cores.secundaria};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

export const ModalConteudo = styled(Card)`
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalEntra 0.3s ease-out;

  &::-webkit-scrollbar {
  background: transparent;
  }

  @keyframes modalEntra {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
