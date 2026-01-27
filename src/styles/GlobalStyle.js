import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body { height: 100%; }

  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    background: ${({ theme }) => theme.cores.fundo};
    color: ${({ theme }) => theme.cores.texto};
  }

  a { color: inherit; text-decoration: none; }
  button, input, select, textarea {
    font: inherit;
  }

  ::selection {
    background: ${({ theme }) => theme.cores.fundo};
  }
    ::-webkit-scrollbar {
    background: ${({ theme }) => theme.cores.fundo};
    width: 12px;
    }
    ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.cores.primariaClara};
    border-radius: 999px;

    }
`;
