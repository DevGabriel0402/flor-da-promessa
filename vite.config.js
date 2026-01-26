import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Flor da Promessa - Confeitaria',
        short_name: 'Flor da Promessa',
        description: 'Bolos, doces e salgados artesanais feitos com amor.',
        theme_color: '#FFB6C1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://res.cloudinary.com/dxs92g9nu/image/upload/v1769405376/flor-da-promessa/logo/jpayqhnvgthltyskyuoe.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://res.cloudinary.com/dxs92g9nu/image/upload/v1769405376/flor-da-promessa/logo/jpayqhnvgthltyskyuoe.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
