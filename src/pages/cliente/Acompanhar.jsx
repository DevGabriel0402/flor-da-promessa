import React, { useEffect, useMemo, useState } from 'react';
import { saveToStorage, loadFromStorage } from '../../utils/persistence';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import styled, { useTheme, keyframes, css } from 'styled-components';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineFire,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi2';

import { normalizarCpf, validarCpf } from '../../utils/cpf';
import { statusParaLabel, ORDEM_TIMELINE, STATUS_ICONES } from '../../utils/pedidos';
import { buscarConsultaPorCpfECodigo, buscarPedidoPorCpfECodigoAdmin, buscarPedidoPorCodigoApenas } from '../../services/pedidos';
import { Container, Card } from '../../components/ui/Base.jsx';
import { Botao } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Grid2, Rotulo } from '../../components/ui/Form.jsx';
import { Select } from '../../components/ui/Dropdown.jsx';

const animarLinhaHoriz = keyframes`
  0% { width: 0%; opacity: 0.5; }
  50% { opacity: 1; }
  100% { width: 100%; opacity: 0.5; }
`;

const animarLinhaVert = keyframes`
  0% { height: 0%; opacity: 0.5; }
  50% { opacity: 1; }
  100% { height: 100%; opacity: 0.5; }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
  position: relative;
  overflow-x: auto;
  padding-bottom: 10px;
  gap: 4px;
  /* Hide scrollbar but allow scrolling */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 30px;
    padding-left: 20px;
    overflow-x: hidden;
  }
`;

const Etapa = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 90px;
  text-align: center;

  @media (max-width: 600px) {
    flex-direction: row;
    min-width: unset;
    text-align: left;
    gap: 16px;
  }
`;

const Linha = styled.div`
  position: absolute;
  background: ${({ $completa, theme }) => ($completa ? theme.cores.primaria : theme.cores.borda)};
  z-index: 1;

  @media (min-width: 601px) {
    left: calc(50% + 22px);
    right: calc(-50% + 22px);
    top: 21px;
    height: 3px;
  }

  @media (max-width: 600px) {
    left: 21px;
    top: 44px;
    bottom: -30px; /* Bridge the gap to the next item */
    width: 3px;
  }

  ${Etapa}:last-child & {
    display: none;
  }

  /* Animação de carregamento infinito (0% a 100%) */
  ${({ $animando, theme }) => $animando && css`
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      background: ${theme.cores.primaria};
      
      @media (min-width: 601px) {
        height: 100%;
        animation: ${animarLinhaHoriz} 2s ease-in-out infinite;
      }
      
      @media (max-width: 600px) {
        width: 100%;
        animation: ${animarLinhaVert} 2s ease-in-out infinite;
      }
    }
  `}
`;

const IconeCirculo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $ativa, theme }) => ($ativa ? theme.cores.primaria : theme.cores.branco)};
  color: ${({ $ativa, theme }) => ($ativa ? theme.cores.branco : theme.cores.cinza)};
  border: 2px solid ${({ $ativa, theme }) => ($ativa ? theme.cores.primaria : theme.cores.borda)};
  z-index: 2;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: ${({ $ativa, theme }) => ($ativa ? '0 4px 12px rgba(181, 126, 220, 0.3)' : 'none')};
`;

const TextoEtapa = styled.div`
  margin-top: 12px;
  padding: 0 4px;

  @media (max-width: 600px) {
    margin-top: 0;
  }
`;

const NomeEtapa = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${({ $ativa }) => ($ativa ? 900 : 700)};
  color: ${({ $ativa, theme }) => ($ativa ? theme.cores.texto : theme.cores.cinza)};
`;

const IconeMap = {
  HiOutlineClipboardDocumentList,
  HiOutlineFire,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle
};

export default function Acompanhar() {
  const location = useLocation();
  const theme = useTheme();
  const preCpf = location.state?.cpf || '';
  const preCodigo = location.state?.codigo || '';

  // Prioriza dados vindos da navegação (estágio anterior) sobre o storage local
  const [cpf, setCpf] = useState(() => preCpf || loadFromStorage('ultimo_cpf', ''));
  const [codigo, setCodigo] = useState(() => preCodigo || loadFromStorage('ultimo_codigo', ''));
  const [consulta, setConsulta] = useState(() => {
    // Se temos dados de navegação, ignoramos a consulta salva anteriormente
    if (preCpf && preCodigo) return null;
    return loadFromStorage('ultima_consulta', null);
  });
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    // Se veio de navegação direta (ex: checkout)
    if (preCpf && preCodigo) {
      handleBuscar(preCpf, preCodigo);
    }
    // Ou se temos dados salvos mas não temos a consulta carregada (fallback extra)
    else if (cpf && codigo && !consulta) {
      handleBuscar(cpf, codigo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const posAtual = useMemo(() => {
    const st = consulta?.status;
    const idx = ORDEM_TIMELINE.indexOf(st);
    return idx >= 0 ? idx : -1;
  }, [consulta]);

  const handleBuscar = async (cpfValor = cpf, codigoValor = codigo) => {
    if (!validarCpf(cpfValor)) {
      toast.error('CPF inválido.');
      return;
    }
    if (!codigoValor || String(codigoValor).trim().length < 3) {
      toast.error('Informe o código de consulta.');
      return;
    }

    setBuscando(true);
    try {
      const cpfNorm = normalizarCpf(cpfValor);
      const codigoFmt = String(codigoValor).trim().toUpperCase();

      // Tenta busca rápida via coleção de consultas (ID: CPF_CODIGO)
      let p = await buscarConsultaPorCpfECodigo(cpfNorm, codigoFmt);

      // Fallback: Se não encontrou na consulta, tenta buscar diretamente nos pedidos pelo código
      // Isso ajuda se houver divergência no CPF salvo vs informado
      // Fallback 1: Busca direta na coleção de pedidos (CPF + Código)
      if (!p) {
        const pDireto = await buscarPedidoPorCpfECodigoAdmin(cpfNorm, codigoFmt);
        if (pDireto) p = pDireto;
      }

      // Fallback 2: Busca apenas pelo código (Se o CPF salvo estiver errado)
      if (!p) {
        const pCodigo = await buscarPedidoPorCodigoApenas(codigoFmt);
        if (pCodigo) p = pCodigo;
      }

      if (!p) {
        toast.error('Pedido não encontrado.');
        setConsulta(null);
        return;
      }
      setConsulta(p);
      saveToStorage('ultimo_cpf', cpfValor);
      saveToStorage('ultimo_codigo', codigoValor);
      saveToStorage('ultima_consulta', p);
    } catch (e) {
      toast.error('Não foi possível buscar o pedido.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 28 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Acompanhar pedido</h1>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Grupo>
          <Rotulo>CPF</Rotulo>
          <Campo value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="CPF" />
        </Grupo>
        <Grupo>
          <Rotulo>Código de consulta</Rotulo>
          <Campo value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: A7K3D2" />
        </Grupo>
        <Botao type="button" onClick={() => handleBuscar()} disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar pedido'}
        </Botao>
      </Card>

      {consulta && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Detalhes do Pedido</h2>
            <div style={{ fontSize: 13, background: theme.cores.fundo, padding: '4px 10px', borderRadius: 8, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              #<strong>{String(consulta.codigoConsulta || '')}</strong>
            </div>
          </div>

          <div style={{ fontSize: 14 }}>
            Status: <strong>{String(statusParaLabel(consulta.status) || '')}</strong>
          </div>

          {consulta.status === 'cancelado' ? (
            <div style={{
              marginTop: 20,
              padding: 20,
              background: '#FEF2F2',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: theme.cores.perigo,
              border: '1px solid #FEE2E2'
            }}>
              <HiOutlineXCircle size={24} />
              <strong style={{ fontWeight: 900 }}>Este pedido foi cancelado.</strong>
            </div>
          ) : (
            <Timeline>
              {ORDEM_TIMELINE.map((s, idx) => {
                const IconeComp = IconeMap[STATUS_ICONES[s]];
                const ativa = idx <= posAtual;
                const completa = idx < posAtual;
                // Anima se for o status atual, não for o primeiro (recebido) e não for o último
                const animando = idx === posAtual && s !== 'recebido' && idx < ORDEM_TIMELINE.length - 1;

                return (
                  <Etapa key={s}>
                    <Linha $completa={completa} $animando={animando} />
                    <IconeCirculo $ativa={ativa}>
                      {IconeComp && <IconeComp size={22} />}
                    </IconeCirculo>
                    <TextoEtapa>
                      <NomeEtapa $ativa={ativa}>
                        {statusParaLabel(s)}
                      </NomeEtapa>
                    </TextoEtapa>
                  </Etapa>
                );
              })}
            </Timeline>
          )}
        </Card>
      )}
    </Container>
  );
}
