import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LayoutCliente from '../layouts/LayoutCliente';
import LayoutAdmin from '../layouts/LayoutAdmin';
import RotaAdmin from './RotaAdmin';

import Cardapio from '../pages/cliente/Cardapio';
import ProdutoDetalhe from '../pages/cliente/ProdutoDetalhe';
import Carrinho from '../pages/cliente/Carrinho';
import Checkout from '../pages/cliente/Checkout';
import Acompanhar from '../pages/cliente/Acompanhar';
import Pagamento from '../pages/cliente/Pagamento';

import AdminLogin from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import AdminPedidos from '../pages/admin/Pedidos';
import AdminPedidosArquivados from '../pages/admin/PedidosArquivados';
import AdminProdutos from '../pages/admin/Produtos';
import AdminClientes from '../pages/admin/Clientes';
import AdminConfiguracoes from '../pages/admin/Configuracoes';

export default function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<LayoutCliente><Cardapio /></LayoutCliente>} />
      <Route path="/produto/:id" element={<LayoutCliente><ProdutoDetalhe /></LayoutCliente>} />
      <Route path="/carrinho" element={<LayoutCliente><Carrinho /></LayoutCliente>} />
      <Route path="/checkout" element={<LayoutCliente><Checkout /></LayoutCliente>} />
      <Route path="/acompanhar" element={<LayoutCliente><Acompanhar /></LayoutCliente>} />
      <Route path="/pagamento" element={<LayoutCliente><Pagamento /></LayoutCliente>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RotaAdmin><LayoutAdmin><Dashboard /></LayoutAdmin></RotaAdmin>} />
      <Route path="/admin/pedidos" element={<RotaAdmin><LayoutAdmin><AdminPedidos /></LayoutAdmin></RotaAdmin>} />
      <Route path="/admin/pedidos/arquivados" element={<RotaAdmin><LayoutAdmin><AdminPedidosArquivados /></LayoutAdmin></RotaAdmin>} />
      <Route path="/admin/produtos" element={<RotaAdmin><LayoutAdmin><AdminProdutos /></LayoutAdmin></RotaAdmin>} />
      <Route path="/admin/clientes" element={<RotaAdmin><LayoutAdmin><AdminClientes /></LayoutAdmin></RotaAdmin>} />
      <Route path="/admin/configuracoes" element={<RotaAdmin><LayoutAdmin><AdminConfiguracoes /></LayoutAdmin></RotaAdmin>} />
      <Route path="*" element={<LayoutCliente><div>Rota não encontrada: {window.location.pathname}</div></LayoutCliente>} />
    </Routes>
  );
}
