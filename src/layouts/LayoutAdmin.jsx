import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentList,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiArrowRightOnRectangle,
  HiOutlineArchiveBox
} from 'react-icons/hi2';
import { sairAdmin } from '../services/auth';
import toast from 'react-hot-toast';
import { useConfig } from '../contexto/ConfigContexto';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding-bottom: 70px; /* Espaço para a TabBar */
  }
`;

const Side = styled.aside`
  background: ${({ theme }) => theme.cores.branco};
  border-right: 1px solid ${({ theme }) => theme.cores.borda};
  padding: 16px;
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 900px) {
    display: none; /* Esconde a sidebar no mobile */
  }
`;

const TopoMobile = styled.header`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: ${({ theme }) => theme.cores.branco};
    border-bottom: 2px solid ${({ theme }) => theme.cores.fundo};
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    max-height: 64px;
  }
`;

const Marca = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 16px;
  background: ${({ theme }) => theme.cores.primariaClara};
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 12px;
`;

const Nome = styled.span`
  font-weight: 900;
  color: ${({ theme }) => theme.cores.secundaria};

`;

const Menu = styled.nav`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  color: ${({ theme }) => theme.cores.texto};
  transition: all 0.2s ease;
  &.active { 
    background: ${({ theme }) => theme.cores.primariaClara}; 
    color: ${({ theme }) => theme.cores.secundaria}; 
    font-weight: 800;
  }
  &:hover:not(.active) {
    background: ${({ theme }) => theme.cores.fundo};
  }
`;

const Main = styled.main`
  padding: 24px;
  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const Sair = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.branco};
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${({ theme }) => theme.cores.perigo};
  &:hover {
    background: #FEF2F2;
  }
`;

const TabBar = styled.nav`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: ${({ theme }) => theme.cores.branco};
    border-top: 1px solid ${({ theme }) => theme.cores.borda};
    box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
    justify-content: space-around;
    align-items: center;
    z-index: 100;
    padding: 0 4px;
  }
`;

const TabItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.cores.cinza};
  font-size: 10px;
  font-weight: 700;
  text-decoration: none;
  flex: 1;
  padding: 8px 0;

  &.active {
    color: ${({ theme }) => theme.cores.primaria};
  }
`;

export default function LayoutAdmin({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { config } = useConfig();

  const handleSair = async () => {
    try {
      await sairAdmin();
      toast.success('Você saiu do painel.');
      navigate('/admin/login');
    } catch (e) {
      toast.error('Não foi possível sair.');
    }
  };

  const menuItems = [
    { to: '/admin', end: true, label: 'Início', icon: HiOutlineSquares2X2 },
    { to: '/admin/pedidos', label: 'Pedidos', icon: HiOutlineClipboardDocumentList },
    { to: '/admin/produtos', label: 'Produtos', icon: HiOutlineTag },
    { to: '/admin/clientes', label: 'Clientes', icon: HiOutlineUsers },
    { to: '/admin/configuracoes', label: 'Ajustes', icon: HiOutlineCog6Tooth },
  ];

  return (
    <Wrapper>
      {/* Sidebar Desktop */}
      <Side>
        <div>
          <Marca to="/">
            <Logo src={config?.logoUrl} alt={config?.nomeLoja} style={{ height: 32, width: 'auto' }} />
            {config?.nomeLoja && <Nome>{config?.nomeLoja}</Nome>}
          </Marca>

          <Menu>
            {menuItems.map(item => (
              <Item key={item.to} to={item.to} end={item.end}>
                <item.icon size={20} />
                {item.label}
              </Item>
            ))}
          </Menu>
        </div>

        <Sair onClick={handleSair} type="button">
          <HiArrowRightOnRectangle size={20} /> Sair
        </Sair>
      </Side>

      <TopoMobile>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo src={config?.logoUrl} alt={config?.nomeLoja} style={{ width: 24, height: 24 }} />
          <div style={{ fontWeight: 900, color: '#2E2E2E' }}>Painel Admin</div>
        </div>
        <button
          onClick={handleSair}
          style={{ border: 0, background: 'transparent', color: '#EF4444' }}
          aria-label="Sair"
        >
          <HiArrowRightOnRectangle size={24} />
        </button>
      </TopoMobile>

      <Main>{children}</Main>

      {/* TabBar Mobile */}
      <TabBar>
        {menuItems.map(item => (
          <TabItem key={item.to} to={item.to} end={item.end}>
            <item.icon size={22} />
            {item.label}
          </TabItem>
        ))}
      </TabBar>
    </Wrapper>
  );
}
