import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiTrash, HiMinus, HiPlus } from 'react-icons/hi2';

import { useCarrinho } from '../../contexto/CarrinhoContexto';
import { formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row } from '../../components/ui/Base.jsx';
import { Botao, BotaoSecundario } from '../../components/ui/Botoes.jsx';

const Item = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Nome = styled.div`
  font-weight: 900;
`;

const Obs = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.cores.cinza};
`;

const Quant = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.branco};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Carrinho() {
  const navigate = useNavigate();
  const { itens, subtotal, removerItem, atualizarQuantidade, limparCarrinho } = useCarrinho();
  const theme = useTheme();

  if (itens.length === 0) {
    return (
      <Container style={{ paddingBottom: 28 }}>
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🛍️</div>
          Seu carrinho está vazio.
          <div style={{ marginTop: 14 }}>
            <BotaoSecundario as={Link} to="/">Ver cardápio</BotaoSecundario>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 28 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Carrinho</h1>

      {itens.map((i) => (
        <Item key={i.produtoId}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Lado esquerdo: Foto | Nome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
              <img
                src={i.fotoUrl || 'https://picsum.photos/seed/flor/200/200'}
                alt={i.nome}
                style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover' }}
              />

              <div style={{ flex: 1 }}>
                <Nome style={{ fontSize: 16 }}>{i.nome}</Nome>
                {i.observacao ? <Obs>Obs: {i.observacao}</Obs> : null}

                <Quant style={{ marginTop: 8 }}>
                  <QBtn
                    type="button"
                    onClick={() => {
                      if (i.quantidade <= 1) {
                        removerItem(i.produtoId);
                        toast.success('Item removido.');
                      } else {
                        atualizarQuantidade(i.produtoId, i.quantidade - 1);
                      }
                    }}
                    style={{ width: 32, height: 32 }}
                  >
                    <HiMinus size={14} />
                  </QBtn>
                  <strong style={{ fontSize: 16 }}>{i.quantidade}</strong>
                  <QBtn type="button" onClick={() => atualizarQuantidade(i.produtoId, i.quantidade + 1)} style={{ width: 32, height: 32 }}><HiPlus size={14} /></QBtn>
                </Quant>
              </div>
            </div>

            {/* Lado direito: Valor | Excluir */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 }}>
              <button
                type="button"
                onClick={() => {
                  removerItem(i.produtoId);
                  toast.success('Item removido.');
                }}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: theme.cores.perigo, padding: 4 }}
                aria-label="Remover"
              >
                <HiTrash size={24} />
              </button>

              <div style={{ fontWeight: 900, color: theme.cores.primaria, fontSize: 18 }}>
                {formatarMoeda(i.preco * i.quantidade)}
              </div>
            </div>
          </div>
        </Item>
      ))}

      <Card>
        <Row>
          <strong>Subtotal</strong>
          <strong style={{ color: theme.cores.primaria, fontSize: 20 }}>{formatarMoeda(subtotal)}</strong>
        </Row>
      </Card>

      <Botao onClick={() => navigate('/checkout')} style={{ padding: 16, fontSize: 16 }}>Finalizar Pedido</Botao>

      <BotaoSecundario
        type="button"
        onClick={() => {
          limparCarrinho();
          toast.success('Carrinho limpo.');
        }}
        style={{ marginTop: 4 }}
      >
        Limpar carrinho
      </BotaoSecundario>
    </Container>
  );
}
