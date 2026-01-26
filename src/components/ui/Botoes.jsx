import styled from 'styled-components';


export const Botao = styled.button`
  border: 0;
  cursor: pointer;
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 800;
  background: ${({ theme }) => theme.cores.primaria};
  color: ${({ theme }) => theme.cores.branco};
  box-shadow: ${({ theme }) => theme.sombras.suave};
  transition: transform 0.06s ease, filter 0.2s ease;
  &:hover { filter: brightness(0.97); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const BotaoSecundario = styled.button`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 16px;
  font-weight: 800;
  background: ${({ theme }) => theme.cores.branco};
  color: ${({ theme }) => theme.cores.texto};
  transition: filter 0.2s ease;
  &:hover { filter: brightness(0.98); }
`;

export const BotaoPerigo = styled(Botao)`
  background: ${({ theme }) => theme.cores.perigo};
`;
