import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.jfif'],
      manifest: {
        name: 'Medispond AI',
        short_name: 'PharmAssist',
        description: 'نظام الرد الآلي الذكي لعملاء الصيدلية',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192.png', // تعديل المسار بإزالة ./public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512.jfif',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: '/pwa-512.jfif',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; worker-src 'self' blob:; frame-src https://accounts.google.com https://www.gstatic.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://www.gstatic.com https://n8n.srv1133301.hstgr.cloud http://localhost:5173 http://localhost:5000 http://localhost:3000 https://jypewluarjjsrkpicipv.supabase.co https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com wss://jypewluarjjsrkpicipv.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: https://jypewluarjjsrkpicipv.supabase.co;"
    }
  }
})