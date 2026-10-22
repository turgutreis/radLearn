import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')

// Entfernt nachträglich injizierte "Powered by Netlify"-Badges (nur direkte Kinder von <body>, nicht die App selbst)
function removeNetlifyBadges() {
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'app') continue
    const tag = el.tagName.toLowerCase()
    const marker = `${tag} ${el.id} ${typeof el.className === 'string' ? el.className : ''}`.toLowerCase()
    const src = (el as HTMLIFrameElement).src || (el as HTMLAnchorElement).href || ''
    const text = (el.textContent || '').toLowerCase()
    if (marker.includes('netlify') || src.includes('netlify') || text.includes('powered by netlify')) {
      el.remove()
    }
  }
}

removeNetlifyBadges()
new MutationObserver(removeNetlifyBadges).observe(document.body, { childList: true })
