const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
const backupPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.bak')

const schema = fs.readFileSync(schemaPath, 'utf-8')
fs.copyFileSync(schemaPath, backupPath)
fs.writeFileSync(schemaPath, schema.replace('provider = "sqlite"', 'provider = "postgresql"'))

try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  execSync('npx tsc', { stdio: 'inherit' })
} finally {
  fs.copyFileSync(backupPath, schemaPath)
  fs.unlinkSync(backupPath)
}
