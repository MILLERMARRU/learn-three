import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ══ Despliegues nuevos: una pestaña abierta puede pedir el chunk de una etapa que ya no existe ───────
// Vite avisa con `vite:preloadError`; se recarga la página para traer la versión nueva.
// El seguro de 10 s evita un bucle de recargas si el error persiste (por ejemplo, sin conexión).
window.addEventListener('vite:preloadError', (evento) => {
  const ultima = Number(sessionStorage.getItem('recarga-chunk') ?? 0)
  if (Date.now() - ultima < 10_000) return
  evento.preventDefault()
  sessionStorage.setItem('recarga-chunk', String(Date.now()))
  window.location.reload()
})

// ══ Foco tras un clic de mouse o táctil: el botón lo suelta para que Enter siga siendo el atajo de la etapa ───────
// Los clics generados con Enter o Espacio (detail === 0) conservan el foco: quien navega con teclado no lo pierde.
document.addEventListener('click', (evento) => {
  if (evento.detail === 0) return
  const boton = (evento.target as Element | null)?.closest('button')
  if (boton && boton === document.activeElement) boton.blur()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
