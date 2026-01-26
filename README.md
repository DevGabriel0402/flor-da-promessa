# Flor da Promessa 🌸

Uma aplicação web premium de delivery para alta confeitaria. Desenvolvida com foco em estética, responsividade e uma experiência de usuário impecável.

![Confeitaria Premium](https://res.cloudinary.com/dxs92g9nu/image/upload/v1769405376/flor-da-promessa/logo/jpayqhnvgthltyskyuoe.png)

## ✨ Principais Funcionalidades

### 🛒 Experiência do Cliente (Sem Login)
- **Splash Screen com Marca**: Logo exibido instantaneamente durante o carregamento inicial.
- **Catálogo Dinâmico**: Atualizações de produtos em tempo real, filtros por categoria e busca inteligente.
- **Carrinho de Compras Persistente**: Itens salvos automaticamente e isolados por projeto.
- **Navegação Fluida**: Restauração da posição de rolagem (scroll) e fácil acompanhamento.
- **Checkout Inteligente**: Fluxo simplificado com suporte a Pix, Dinheiro e Cartão, além de preenchimento automático de endereço por CPF.
- **Rastreamento de Pedido**: Visualização de linha do tempo com ícones específicos para cada status.

### 🛡️ Painel Administrativo (Autenticado)
- **Dashboard em Tempo Real**: Visão geral de pedidos, produtos ativos e base de clientes.
- **Kanban Interativo**: Gerenciamento do fluxo de pedidos com interface drag-and-drop no desktop e lista filtrada no mobile.
- **Gestão de Produtos**: CRUD completo com upload de imagens via Cloudinary.
- **Diretório de Clientes**: Histórico de clientes e detalhes de contato.
- **Configuração da Loja**: Controle centralizado de branding, taxas de entrega e horários de funcionamento.

## 🛠️ Tecnologias Utilizadas

- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização**: [Styled Components](https://styled-components.com/) (Arquitetura de UI Modular)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **Mídia**: [Cloudinary](https://cloudinary.com/) (Hospedagem de imagens)
- **Feedback**: [React Hot Toast](https://react-hot-toast.com/)
- **Ícones**: [Lucide (via React Icons)](https://react-icons.github.io/react-icons/)

## 🚀 Como Começar

### Pré-requisitos
- Node.js (Versão LTS recomendada)
- Projeto Firebase com Auth (E-mail/Senha) e Firestore ativados.

### Instalação

1. **Clonar e Instalar**:
```bash
git clone <url-do-repositorio>
cd flor-da-promessa
npm install
```

2. **Configurar Ambiente**:
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_id_de_envio
VITE_FIREBASE_APP_ID=seu_id_do_app
```

3. **Rodar Servidor de Desenvolvimento**:
```bash
npm run dev
```

## 🏗️ Arquitetura do Projeto

Seguimos uma abordagem de UI modular para garantir manutenibilidade e alta performance:

- `src/components/ui/`: Biblioteca de componentes isolados (`Base`, `Botoes`, `Form`, `Dropdown`).
- `src/utils/persistence.js`: Isolamento de dados centralizado com o prefixo `fp_`.
- `src/contexto/`: Uso estratégico de React Context para estado global (Carrinho, Config).
- `src/hooks/`: Hooks customizados para reutilização de lógica (`useScrollRestoration`, etc.).

## 🔐 Segurança e Regras

A implementação inclui `firestore.rules` otimizadas para garantir a privacidade dos dados, permitindo o acompanhamento público de pedidos apenas via correspondência estrita de `codigoConsulta`.

---

*Desenvolvido com carinho para a Flor da Promessa 🌸*