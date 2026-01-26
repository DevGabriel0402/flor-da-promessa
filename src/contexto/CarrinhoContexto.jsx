import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { saveToStorage, loadFromStorage } from '../utils/persistence';

const CarrinhoContexto = createContext(null);

export const ProvedorCarrinho = ({ children }) => {
  const [itens, setItens] = useState(() => loadFromStorage('carrinho', []));

  useEffect(() => {
    saveToStorage('carrinho', itens);
  }, [itens]);

  const adicionarItem = (produto, quantidade, observacao = '') => {
    setItens((prev) => {
      const idx = prev.findIndex(i => i.produtoId === produto.id);
      if (idx >= 0) {
        const novos = [...prev];
        novos[idx] = {
          ...novos[idx],
          quantidade: novos[idx].quantidade + quantidade,
          observacao: observacao || novos[idx].observacao
        };
        return novos;
      }
      return [...prev, {
        produtoId: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco) || 0,
        fotoUrl: produto.fotoUrl || '',
        quantidade,
        observacao
      }];
    });
  };

  const removerItem = (produtoId) => setItens((prev) => prev.filter(i => i.produtoId !== produtoId));
  const atualizarQuantidade = (produtoId, quantidade) => setItens((prev) => prev.map(i => i.produtoId === produtoId ? { ...i, quantidade } : i));
  const limparCarrinho = () => setItens([]);

  const subtotal = useMemo(() => itens.reduce((acc, i) => acc + (i.preco * i.quantidade), 0), [itens]);
  const totalItens = useMemo(() => itens.reduce((acc, i) => acc + i.quantidade, 0), [itens]);

  const valor = useMemo(() => ({
    itens,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    subtotal,
    totalItens
  }), [itens, subtotal, totalItens]);

  return <CarrinhoContexto.Provider value={valor}>{children}</CarrinhoContexto.Provider>;
};

export const useCarrinho = () => {
  const ctx = useContext(CarrinhoContexto);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de ProvedorCarrinho');
  return ctx;
};
