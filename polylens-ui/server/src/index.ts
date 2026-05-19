import app from './app'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const PORT = process.env.PORT || 3001
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

app.listen(PORT, () => {
  console.log(`PolicyLens API running on http://localhost:${PORT}`)
})
