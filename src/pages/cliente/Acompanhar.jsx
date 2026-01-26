import React, { useEffect, useMemo, useState } from 'react';
import { saveToStorage, loadFromStorage } from '../../utils/persistence';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import styled, { useTheme } from 'styled-components';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineFire,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi2';

import { normalizarCpf, validarCpf } from '../../utils/cpf';
import { statusParaLabel, ORDEM_TIMELINE, STATUS_ICONES } from '../../utils/pedidos';
import { buscarConsultaPorCpfECodigo } from '../../services/pedidos';
import { Container, Card } from '../../components/ui/Base.jsx';
import { Botao } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Grid2, Rotulo } from '../../components/ui/Form.jsx';
import { Select } from '../../components/ui/Dropdown.jsx';

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
    justify-content: flex-start;
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
`;

const Linha = styled.div`
  position: absolute;
  left: calc(50% + 22px);
  right: calc(-50% + 22px);
  top: 21px;
  height: 3px;
  background: ${({ $completa, theme }) => ($completa ? theme.cores.primaria : theme.cores.borda)};
  z-index: 1;

  ${Etapa}:last-child & {
    display: none;
  }
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

  const [cpf, setCpf] = useState(() => loadFromStorage('ultimo_cpf', preCpf));
  const [codigo, setCodigo] = useState(() => loadFromStorage('ultimo_codigo', preCodigo));
  const [consulta, setConsulta] = useState(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (preCpf && preCodigo) {
      handleBuscar(preCpf, preCodigo);
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
      const p = await buscarConsultaPorCpfECodigo(cpfNorm, String(codigoValor).trim().toUpperCase());
      if (!p) {
        toast.error('Pedido não encontrado.');
        setConsulta(null);
        return;
      }
      setConsulta(p);
      saveToStorage('ultimo_cpf', cpfValor);
      saveToStorage('ultimo_codigo', codigoValor);
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

                return (
                  <Etapa key={s}>
                    <Linha $completa={completa} />
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
