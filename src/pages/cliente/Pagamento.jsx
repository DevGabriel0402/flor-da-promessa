import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveToStorage, loadFromStorage, removeFromStorage } from '../../utils/persistence';
import toast from 'react-hot-toast';
import styled, { useTheme, keyframes } from 'styled-components';
import { HiOutlineDocumentDuplicate, HiOutlineCheckCircle } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { Container, Card, Row } from '../../components/ui/Base.jsx';
import { Botao, BotaoSecundario } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Rotulo } from '../../components/ui/Form.jsx';
import { useConfig } from '../../contexto/ConfigContexto';
import { formatarMoeda } from '../../utils/mascaras';

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const StatusAguardando = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.cores.secundaria};
  font-weight: 700;
  font-size: 14px;
  margin: 10px 0;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const PIX_COPIA_COLA = "00020101021126360014br.gov.bcb.pix0114632800640001035204000053039865802BR5921WELLINGTON M FERREIRA6013BELO HORIZONT62070503***63042E0A";

export default function Pagamento() {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { config } = useConfig();

    const [pedido] = useState(() => location.state?.pedido || loadFromStorage('pedido_em_pagamento', null));
    const total = pedido?.total || 0;
    const codigoConsulta = pedido?.codigoConsulta || '';

    const [copiado, setCopiado] = useState(() => loadFromStorage('pix_copiado', false));
    const [tempoRestante, setTempoRestante] = useState(0);

    useEffect(() => {
        let interval;
        if (tempoRestante > 0) {
            interval = setInterval(() => {
                setTempoRestante(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [tempoRestante]);

    useEffect(() => {
        if (!pedido) {
            navigate('/acompanhar');
        }
    }, [pedido, navigate]);

    const handleCopiar = () => {
        navigator.clipboard.writeText(PIX_COPIA_COLA);
        setCopiado(true);
        saveToStorage('pix_copiado', true);
        setTempoRestante(30);
        toast.success('Código PIX copiado!');
    };

    const handleIrParaAcompanhar = () => {
        removeFromStorage('pedido_em_pagamento');
        removeFromStorage('pix_copiado');
        navigate('/acompanhar', { state: { cpf: pedido?.cliente?.cpfNormalizado, codigo: codigoConsulta } });
    };

    const handleWhatsApp = () => {
        const fone = config?.contato?.whatsapp || '5531973056756';
        const item = pedido?.itens?.[0] || {};

        const texto = `Olá! Realizei o pagamento do pedido via PIX e estou enviando o comprovante.

*Pedido:* #${codigoConsulta}
*Produto:* ${item.nome || 'N/A'}
*Quantidade:* ${item.quantidade || 1}
*Tipo:* ${pedido?.tipoPedido === 'delivery' ? 'Entrega' : 'Retirada'}
*Valor Total:* ${formatarMoeda(total)}`;

        window.open(`https://wa.me/${fone.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`, '_blank');
    };

    if (!pedido) return null;

    return (
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Pagamento via PIX</h1>

            <Card style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, color: '#6B7280' }}>Valor do pedido</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: theme.cores.primaria }}>
                    {formatarMoeda(total)}
                </div>
                <div style={{ fontSize: 13, background: theme.cores.fundo, padding: '4px 10px', borderRadius: 8, alignSelf: 'center' }}>
                    Pedido #<strong>{codigoConsulta}</strong>
                </div>
            </Card>

            <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <strong>PIX Copia e Cola</strong>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                    Copie o código abaixo e cole no seu aplicativo do banco para pagar.
                </p>

                <Grupo style={{ position: 'relative' }}>
                    <Campo
                        value={PIX_COPIA_COLA}
                        readOnly
                        disabled
                        style={{ paddingRight: 50, fontSize: 13, cursor: 'text', opacity: 1, background: '#F9FAFB' }}
                    />
                    <button
                        onClick={handleCopiar}
                        style={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 0,
                            background: theme.cores.primaria,
                            color: 'white',
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: theme.sombras.suave
                        }}
                    >
                        {copiado ? <HiOutlineCheckCircle size={20} /> : <HiOutlineDocumentDuplicate size={20} />}
                    </button>
                </Grupo>

                {copiado && (
                    <div style={{ textAlign: 'center' }}>
                        <StatusAguardando>
                            <HiOutlineCheckCircle size={20} />
                            Aguardando confirmação de pagamento...
                        </StatusAguardando>

                        <Botao
                            onClick={handleWhatsApp}
                            style={{
                                width: '100%',
                                background: '#25D366',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                marginTop: 10
                            }}
                        >
                            <FaWhatsapp size={24} />
                            Enviar comprovante no WhatsApp
                        </Botao>
                    </div>
                )}
            </Card>

            {copiado && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <BotaoSecundario
                        onClick={handleIrParaAcompanhar}
                        style={{ width: '100%' }}
                        disabled={tempoRestante > 0}
                    >
                        {tempoRestante > 0 ? `Aguarde ${tempoRestante}s para acompanhar` : 'Já paguei, acompanhar pedido'}
                    </BotaoSecundario>
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0 }}>
                        {tempoRestante > 0
                            ? 'Estamos preparando o sistema para seu acompanhamento...'
                            : 'Após o pagamento, nosso sistema processará seu pedido em instantes.'}
                    </p>
                </div>
            )}
        </Container>
    );
}
