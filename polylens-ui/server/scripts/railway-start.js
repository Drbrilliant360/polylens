const { execSync } = require('child_process')
const path = require('path')

process.chdir(path.join(__dirname, '..'))

console.log('[railway] Pushing database schema...')
try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' })
} catch (e) {
  console.error('[railway] Schema push failed:', e.message)
  process.exit(1)
}

console.log('[railway] Starting server...')
require('../dist/index.js')
