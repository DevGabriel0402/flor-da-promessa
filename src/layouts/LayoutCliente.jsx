import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineClipboardDocumentList,
  HiOutlineUserCircle
} from 'react-icons/hi2';
import { useCarrinho } from '../contexto/CarrinhoContexto';
import { useConfig } from '../contexto/ConfigContexto';

const Wrapper = styled.div`
  min-height: 100vh;
  padding-bottom: 76px;
`;

const Topo = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${({ theme }) => theme.cores.branco};
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
`;

const TopoInner = styled.div`
  max-width: ${({ theme }) => theme.larguras.conteudo};
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Marca = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
`;

const Nome = styled.span`
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-weight: 900;
  font-size: 18px;
  color: ${({ theme }) => theme.cores.secundaria};
`;

const Conteudo = styled.main`
  max-width: ${({ theme }) => theme.larguras.conteudo};
  margin: 0 auto;

`;

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: ${({ theme }) => theme.cores.branco};
  border-top: 1px solid ${({ theme }) => theme.cores.borda};
  box-shadow: ${({ theme }) => theme.sombras.media};
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 60;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  font-size: 10px;
  color: ${({ $ativo, theme }) => ($ativo ? theme.cores.primaria : theme.cores.cinza)};
  position: relative;
`;

const Bolinha = styled.span`
  position: absolute;
  top: -6px;
  right: -8px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: ${({ theme }) => theme.cores.perigo};
  color: ${({ theme }) => theme.cores.branco};
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
`;

export default function LayoutCliente({ children }) {
  const { totalItens } = useCarrinho();
  const { config } = useConfig();
  const { pathname } = useLocation();

  return (
    <Wrapper>
      <Topo>
        <TopoInner>
          <Marca to="/">
            <Logo src={config?.logoUrl} alt={config?.nomeLoja} style={{ height: 32, width: 'auto' }} />
            {config?.nomeLoja && <Nome>{config?.nomeLoja}</Nome>}
          </Marca>
          <Link to="/acompanhar" aria-label="Acompanhar pedido">
            <HiOutlineClipboardDocumentList size={26} color="#6B7280" />
          </Link>
        </TopoInner>
      </Topo>

      <Conteudo>{children}</Conteudo>

      <Nav>
        <NavItem to="/" $ativo={pathname === '/'}>
          <HiOutlineHome size={22} />
          Início
        </NavItem>
        <NavItem to="/carrinho" $ativo={pathname === '/carrinho'}>
          <HiOutlineShoppingBag size={22} />
          {totalItens > 0 && <Bolinha>{totalItens}</Bolinha>}
          Carrinho
        </NavItem>
        <NavItem to="/acompanhar" $ativo={pathname === '/acompanhar'}>
          <HiOutlineClipboardDocumentList size={22} />
          Pedidos
        </NavItem>
        {/* <NavItem to="/admin/login" $ativo={pathname.startsWith('/admin')}>
          <HiOutlineUserCircle size={22} />
          Admin
        </NavItem> */}
      </Nav>
    </Wrapper>
  );
}
