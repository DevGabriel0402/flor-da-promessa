import styled from 'styled-components';

export const Campo = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  outline: none;
  background: ${({ theme }) => theme.cores.branco};
  &:focus { border-color: ${({ theme }) => theme.cores.primaria}; 
  box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.primariaClara}; }
`;

export const AreaTexto = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  outline: none;
  background: ${({ theme }) => theme.cores.branco};
  resize: vertical;
  &:focus { border-color: ${({ theme }) => theme.cores.primaria}; 
  box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.primariaClara}; }
`;

export const Rotulo = styled.label`
  font-size: 12px;
  color: ${({ theme }) => theme.cores.cinza};
  font-weight: 700;
`;

export const Grupo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;
