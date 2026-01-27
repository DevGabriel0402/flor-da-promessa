import React, { useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { HiOutlineUser, HiOutlineCurrencyDollar, HiOutlineArrowLeft, HiOutlineArchiveBox } from 'react-icons/hi2';

import { listarPedidosAdmin } from '../../services/pedidos';
import { statusParaLabel } from '../../utils/pedidos';
import { formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row, Badge } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';
import { Select } from '../../components/ui/Dropdown.jsx';

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  background: ${({ theme }) => theme.cores.fundo};
`;

const FiltroContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const BotaoFiltro = styled.button`
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid ${({ theme, $ativo }) => $ativo ? theme.cores.primaria : theme.cores.borda};
  background: ${({ theme, $ativo }) => $ativo ? theme.cores.primaria : 'transparent'};
  color: ${({ theme, $ativo }) => $ativo ? theme.cores.branco : theme.cores.texto};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, $ativo }) => $ativo ? theme.cores.primaria : theme.cores.fundo};
  }
`;

const BadgeStatus = styled.span`
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: ${({ $status, theme }) => {
        if ($status === 'entregue') return '#DBEAFE';
        if ($status === 'cancelado') return '#FEE2E2';
        return theme.cores.fundo;
    }};
  color: ${({ $status, theme }) => {
        if ($status === 'entregue') return '#1E40AF';
        if ($status === 'cancelado') return '#B91C1C';
        return theme.cores.cinza;
    }};
`;

const MobileView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

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

    const pedidosFiltrados = useMemo(() => {
        if (statusFiltro === 'todos') return pedidos;
        return pedidos.filter(p => p.status === statusFiltro);
    }, [pedidos, statusFiltro]);

    return (
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/admin/pedidos" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: theme.cores.fundo,
                        color: theme.cores.texto,
                        border: `1px solid ${theme.cores.borda}`
                    }}>
                        <HiOutlineArrowLeft size={20} />
                    </Link>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Arquivados</h1>
                </div>
                <Badge>{pedidos.length} total</Badge>
            </Row>

            <FiltroContainer>
                <BotaoFiltro $ativo={statusFiltro === 'todos'} onClick={() => setStatusFiltro('todos')}>Todos</BotaoFiltro>
                <BotaoFiltro $ativo={statusFiltro === 'entregue'} onClick={() => setStatusFiltro('entregue')}>Entregues</BotaoFiltro>
                <BotaoFiltro $ativo={statusFiltro === 'cancelado'} onClick={() => setStatusFiltro('cancelado')}>Cancelados</BotaoFiltro>
            </FiltroContainer>

            {carregando && <Card>Carregando arquivados...</Card>}

            {!carregando && (
                <MobileView>
                    {pedidosFiltrados.map(p => {
                        const primeiraImg = p.itens?.[0]?.imagem || 'https://via.placeholder.com/150?text=Sem+Imagem';
                        const dataHora = p.criadoEm?.seconds
                            ? new Date(p.criadoEm.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : '-';

                        return (
                            <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Linha 1: Imagem, Código e Badge */}
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <Thumbnail src={primeiraImg} />
                                        <div style={{ fontWeight: 900, fontSize: 16 }}>#{safeString(p.codigoConsulta)}</div>
                                    </div>
                                    <BadgeStatus $status={p.status}>{statusParaLabel(p.status)}</BadgeStatus>
                                </div>

                                {/* Linha 2: Data e Valor */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.cores.fundo, padding: '8px 12px', borderRadius: 8 }}>
                                    <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>{dataHora}</div>
                                    <strong style={{ fontSize: 15, color: theme.cores.texto }}>{formatarMoeda(p.total)}</strong>
                                </div>

                                <div style={{ borderTop: `1px solid ${theme.cores.borda}`, paddingTop: 10 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>{safeString(p.cliente?.nome)}</div>
                                    <div style={{ fontSize: 12, color: theme.cores.cinza, marginTop: 4 }}>
                                        {p.itens?.map(it => `${it.quantidade}x ${it.nome}`).join(', ')}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {pedidosFiltrados.length === 0 && (
                        <Card style={{ textAlign: 'center', padding: 40, border: '2px dashed #E5E7EB', background: 'transparent' }}>
                            Nenhum pedido encontrado com este filtro.
                        </Card>
                    )}
                </MobileView>
            )}
        </Container>
    );
}
