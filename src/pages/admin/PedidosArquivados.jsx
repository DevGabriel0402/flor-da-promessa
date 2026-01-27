import React, { useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineCurrencyDollar } from 'react-icons/hi2';

import { listarPedidosAdmin, atualizarStatusPedido } from '../../services/pedidos';
import { statusParaLabel } from '../../utils/pedidos';
import { formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';
import { Select } from '../../components/ui/Dropdown.jsx';

const MobileView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: ${({ $status }) => {
        if ($status === 'entregue') return '#DBEAFE';
        if ($status === 'cancelado') return '#FEE2E2';
        return '#F3F4F6';
    }};
  color: ${({ $status }) => {
        if ($status === 'entregue') return '#1E40AF';
        if ($status === 'cancelado') return '#B91C1C';
        return '#4B5563';
    }};
`;

const STATUS_ARQUIVADOS = ['entregue', 'cancelado'];
const TODOS_STATUS = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue', 'cancelado'];

export default function AdminPedidosArquivados() {
    const [pedidos, setPedidos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [statusFiltro, setStatusFiltro] = useState('todos');
    const theme = useTheme();

    const carregar = async () => {
        setCarregando(true);
        try {
            const lista = await listarPedidosAdmin({ tipo: 'arquivados' });
            setPedidos(lista);
        } catch (e) {
            toast.error('Erro ao carregar pedidos arquivados.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => { carregar(); }, []);

    const alterarStatus = async (pedido, novoStatus) => {
        try {
            await atualizarStatusPedido(pedido.id, novoStatus, pedido.cliente?.cpfNormalizado, pedido.codigoConsulta);
            toast.success('Status atualizado!');

            // Se mudar para um status ATIVO, remove da vista de arquivados
            if (!STATUS_ARQUIVADOS.includes(novoStatus)) {
                setPedidos((prev) => prev.filter(p => p.id !== pedido.id));
            } else {
                setPedidos((prev) => prev.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p));
            }
        } catch (e) {
            toast.error('Erro ao atualizar status.');
        }
    };

    const pedidosFiltrados = useMemo(() => {
        if (statusFiltro === 'todos') return pedidos;
        return pedidos.filter(p => p.status === statusFiltro);
    }, [pedidos, statusFiltro]);

    return (
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Row>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Pedidos Arquivados</h1>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 160, flex: 1 }}>
                        <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                            <option value="todos">Todos Arquivados</option>
                            {STATUS_ARQUIVADOS.map(s => <option key={s} value={s}>{statusParaLabel(s)}</option>)}
                        </Select>
                    </div>
                </div>
            </Row>

            {carregando && <Card>Carregando arquivados...</Card>}

            {!carregando && (
                <MobileView>
                    {pedidosFiltrados.map(p => (
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
                    {pedidosFiltrados.length === 0 && (
                        <Card style={{ textAlign: 'center', padding: 40, border: '2px dashed #E5E7EB', background: 'transparent' }}>
                            Nenhum pedido arquivado encontrado.
                        </Card>
                    )}
                </MobileView>
            )}
        </Container>
    );
}
