import { execSync } from 'child_process'
import { readFileSync, writeFileSync, renameSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const schemaPath = join(root, 'server', 'prisma', 'schema.prisma')
const backupPath = join(root, 'server', 'prisma', 'schema.prisma.bak')

const schema = readFileSync(schemaPath, 'utf-8')
renameSync(schemaPath, backupPath)
writeFileSync(schemaPath, schema.replace('provider = "sqlite"', 'provider = "postgresql"'))

try {
  execSync('npx prisma generate', { cwd: join(root, 'server'), stdio: 'inherit' })
} finally {
  renameSync(backupPath, schemaPath)
}

execSync('npm run build', { cwd: root, stdio: 'inherit' })
