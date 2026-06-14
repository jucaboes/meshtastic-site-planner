import { createApp } from 'vue'
import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { saveParams } from './persist'
import { useStore } from './store'

// Colombia fork — polyfill crypto.randomUUID for non-secure contexts (HTTP over LAN IP).
// crypto.randomUUID is undefined outside HTTPS/localhost; crypto.getRandomValues is available
// in all modern browsers regardless of secure-context status.
if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID !== 'function') {
  (crypto as any).randomUUID = () =>
    (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}

const app = createApp(App)
const pinia = createPinia()

// Persist the site parameters across reloads (#12): debounced so rapid edits
// (slider drags, typing) collapse into one write.
pinia.use(({ store }) => {
  if (store.$id !== 'store') return
  let timer: ReturnType<typeof setTimeout> | undefined
  store.$subscribe((_mutation, state) => {
    clearTimeout(timer)
    timer = setTimeout(() => saveParams(state.splatParams), 400)
  })
})

app.use(pinia)
app.mount('#app')

// A shared permalink (#9) was applied during store init; persist it and clear
// the hash so subsequent edits win on the next reload.
useStore(pinia).consumeSharedLink()

// Register the PWA service worker (#11) in production only, so it never
// intercepts Vite's dev server or HMR.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

