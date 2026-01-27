import React, { useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineCurrencyDollar, HiOutlineClock } from 'react-icons/hi2';

import { listarPedidosAdmin, atualizarStatusPedido } from '../../services/pedidos';
import { statusParaLabel, STATUS_PEDIDO, ORDEM_TIMELINE } from '../../utils/pedidos';
import { mascararCpf, formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';
import { Select } from '../../components/ui/Dropdown.jsx';

const KanbanContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  min-height: calc(100vh - 180px);

  @media (max-width: 900px) {
    display: none;
  }
`;

const KanbanColuna = styled.div`
  min-width: 300px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TituloColuna = styled.div`
  font-weight: 900;
  font-size: 14px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.cores.cinza};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 4px;
`;

const Contador = styled.span`
  background: ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
`;

const KanbanCard = styled(Card)`
  padding: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.sombras.media};
    border-color: ${({ theme }) => theme.cores.primariaClara};
  }
`;

const MobileView = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: ${({ $status, theme }) => {
    if ($status === 'recebido') return '#E0E7FF';
    if ($status === 'em_preparo') return '#FEF3C7';
    if ($status === 'saiu_para_entrega') return '#D1FAE5';
    if ($status === 'entregue') return '#DBEAFE';
    return '#F3F4F6';
  }};
  color: ${({ $status, theme }) => {
    if ($status === 'recebido') return '#4338CA';
    if ($status === 'em_preparo') return '#B45309';
    if ($status === 'saiu_para_entrega') return '#047857';
    if ($status === 'entregue') return '#1E40AF';
    return '#4B5563';
  }};
`;

const STATUS_KANBAN_ATIVOS = ['recebido', 'em_preparo', 'saiu_para_entrega'];
const TODOS_STATUS = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue', 'cancelado'];

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const theme = useTheme();

  const carregar = async () => {
    setCarregando(true);
    try {
      // Carrega apenas os pedidos ativos para o Kanban
      const lista = await listarPedidosAdmin({ tipo: 'ativos' });
      setPedidos(lista);
    } catch (e) {
      toast.error('Erro ao carregar pedidos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const alterarStatus = async (pedido, novoStatus) => {
    try {
      await atualizarStatusPedido(pedido.id, novoStatus, pedido.cliente?.cpfNormalizado, pedido.codigoConsulta);
      toast.success('Status atualizado!');

      // Se o novo status for 'entregue' ou 'cancelado', remove da vista principal (vai para arquivados)
      if (['entregue', 'cancelado'].includes(novoStatus)) {
        setPedidos((prev) => prev.filter(p => p.id !== pedido.id));
      } else {
        setPedidos((prev) => prev.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p));
      }
    } catch (e) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const pedidosPorStatus = useMemo(() => {
    const map = {};
    STATUS_KANBAN_ATIVOS.forEach(s => map[s] = pedidos.filter(p => p.status === s));
    return map;
  }, [pedidos]);

  const pedidosFiltradosMobile = useMemo(() => {
    if (statusFiltro === 'todos') return pedidos;
    return pedidos.filter(p => p.status === statusFiltro);
  }, [pedidos, statusFiltro]);

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Pedidos</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="desk-only" style={{ display: 'flex', alignItems: 'center' }}>
            <Contador>{pedidos.length} pedidos no total</Contador>
          </div>
          <div style={{ minWidth: 160, flex: 1 }}>
            <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="todos">Todos Ativos</option>
              {STATUS_KANBAN_ATIVOS.map(s => <option key={s} value={s}>{statusParaLabel(s)}</option>)}
            </Select>
          </div>
        </div>
      </Row>

      {carregando && <Card>Carregando painel...</Card>}

      {!carregando && (
        <>
          {/* Desktop: Kanban */}
          <KanbanContainer>
            {STATUS_KANBAN_ATIVOS.map(s => (
              <KanbanColuna key={s}>
                <TituloColuna>
                  {statusParaLabel(s)}
                  <Contador>{pedidosPorStatus[s]?.length || 0}</Contador>
                </TituloColuna>

                {pedidosPorStatus[s]?.map(p => (
                  <KanbanCard key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, overflow: 'hidden', gap: 8 }}>
                      <strong style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{String(p.codigoConsulta || '')}
                      </strong>
                      <div style={{ fontSize: 11, color: theme.cores.cinza, flexShrink: 0 }}>{String(p.pagamento || '').toUpperCase()}</div>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                      {String(p.cliente?.nome || '')}
                    </div>

                    <div style={{ fontSize: 12, color: theme.cores.cinza, marginBottom: 12 }}>
                      {p.itens?.length} {p.itens?.length === 1 ? 'item' : 'itens'} · {formatarMoeda(p.total)}
                    </div>

                    <Select
                      value={p.status}
                      onChange={(e) => alterarStatus(p, e.target.value)}
                    >
                      {TODOS_STATUS.map(opt => (
                        <option key={opt} value={opt}>{statusParaLabel(opt)}</option>
                      ))}
                    </Select>
                  </KanbanCard>
                ))}

                {pedidosPorStatus[s]?.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: theme.cores.cinza, background: '#F9FAFB', borderRadius: 12, border: '2px dashed #E5E7EB' }}>
                    Vazio
                  </div>
                )}
              </KanbanColuna>
            ))}
          </KanbanContainer>

          {/* Mobile: Lista com Filtro */}
          <MobileView>
            {pedidosFiltradosMobile.map(p => (
              <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 900, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{safeString(p.codigoConsulta)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{safeString(p.cliente?.nome)}</div>
                  </div>
                  <Badge $status={p.status}>{statusParaLabel(p.status)}</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: theme.cores.cinza }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HiOutlineCurrencyDollar /> {formatarMoeda(p.total)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HiOutlineUser /> {safeString(p.cliente?.contato)}
                  </div>
                </div>

                <Select value={p.status} onChange={(e) => alterarStatus(p, e.target.value)}>
                  {TODOS_STATUS.map(opt => (
                    <option key={opt} value={opt}>{statusParaLabel(opt)}</option>
                  ))}
                </Select>
              </Card>
            ))}
            {pedidosFiltradosMobile.length === 0 && <Card>Nenhum pedido encontrado.</Card>}
          </MobileView>
        </>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 900px) {
          .desk-only { display: none; }
        }
        @media (min-width: 901px) {
          .mob-only { display: none; }
        }
      `}} />
    </Container>
  );
}
