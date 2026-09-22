import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const firebaseServiceWorkerTemplate = resolve(__dirname, 'public/firebase-messaging-sw.js')

function firebaseMessagingServiceWorker(env: Record<string, string>): Plugin {
  const template = readFileSync(firebaseServiceWorkerTemplate, 'utf8')
  const source = template
    .replace('__VITE_FIREBASE_API_KEY__', env.VITE_FIREBASE_apikey ?? '')
    .replace('__VITE_FIREBASE_AUTH_DOMAIN__', env.VITE_authDomain ?? '')
    .replace('__VITE_FIREBASE_PROJECT_ID__', env.VITE_FIREBASE_projectId ?? '')
    .replace('__VITE_FIREBASE_STORAGE_BUCKET__', env.VITE_FIREBASE_storageBucket ?? '')
    .replace('__VITE_FIREBASE_MESSAGING_SENDER_ID__', env.VITE_FIREBASE_messagingSenderId ?? '')
    .replace('__VITE_FIREBASE_APP_ID__', env.VITE_FIREBASE_appId ?? '')

  return {
    name: 'firebase-messaging-service-worker',
    configureServer(server) {
      server.middlewares.use('/firebase-messaging-sw.js', (_request, response) => {
        response.setHeader('Content-Type', 'application/javascript')
        response.end(source)
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'firebase-messaging-sw.js',
        source
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      firebaseMessagingServiceWorker(env),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.jfif'],
      manifest: {
        name: 'Mujeeb AI',
        short_name: 'Mujeeb AI',
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
  }
})