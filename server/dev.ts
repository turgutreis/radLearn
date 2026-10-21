// Startet parallel das Bun-Backend (Port 3001) und den Vite Vue 3 Dev-Server (Port 5173)
const backend = Bun.spawn(['bun', '--watch', 'server/index.ts'], {
  stdout: 'inherit',
  stderr: 'inherit'
})

const frontend = Bun.spawn(['bunx', 'vite', '--host'], {
  stdout: 'inherit',
  stderr: 'inherit'
})

process.on('SIGINT', () => {
  backend.kill()
  frontend.kill()
  process.exit(0)
})
