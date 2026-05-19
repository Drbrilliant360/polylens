import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuid()}${ext}`)
  },
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.pdf', '.doc', '.docx', '.txt', '.md']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) return cb(null, true)
  cb(new Error(`File type ${ext} not allowed. Allowed: ${allowed.join(', ')}`))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
})
