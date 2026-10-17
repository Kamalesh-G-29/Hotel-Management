import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function mediaStoragePlugin() {
  const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads')
  const IMAGES_DIR = path.join(UPLOAD_DIR, 'images')
  const VIDEOS_DIR = path.join(UPLOAD_DIR, 'videos')
  const DATA_DIR = path.resolve(process.cwd(), 'data')
  const HOTELS_FILE = path.join(DATA_DIR, 'hotels.json')

  for (const dir of [UPLOAD_DIR, IMAGES_DIR, VIDEOS_DIR, DATA_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  const ALLOWED_IMAGES = ['.jpg', '.jpeg', '.png', '.webp']
  const ALLOWED_VIDEOS = ['.mp4', '.webm']
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024

  return {
    name: 'media-storage-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          res.statusCode = 200
          res.end()
          return
        }

        if (req.url === '/api/upload' && req.method === 'POST') {
          let chunks = []
          let totalLength = 0

          req.on('data', (chunk) => {
            chunks.push(chunk)
            totalLength += chunk.length
            if (totalLength > 65 * 1024 * 1024) {
              res.statusCode = 413
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'File size limit exceeded (Max 50MB).' }))
              req.destroy()
            }
          })

          req.on('end', () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8')
              const payload = JSON.parse(rawBody)
              const { filename, type, data, category = 'image' } = payload

              if (!filename || !data) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Missing filename or file data.' }))
                return
              }

              const ext = path.extname(filename).toLowerCase()
              const isVideo = category === 'video' || ALLOWED_VIDEOS.includes(ext)
              const isImage = category === 'image' || ALLOWED_IMAGES.includes(ext)

              if (isVideo && !ALLOWED_VIDEOS.includes(ext)) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Unsupported video format. Allowed: MP4, WEBM.' }))
                return
              }
              if (isImage && !ALLOWED_IMAGES.includes(ext)) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Unsupported image format. Allowed: JPG, JPEG, PNG, WEBP.' }))
                return
              }

              const base64Index = data.indexOf(';base64,')
              const base64Data = base64Index !== -1 ? data.slice(base64Index + 8) : data
              const buffer = Buffer.from(base64Data, 'base64')

              if (isImage && buffer.length > MAX_IMAGE_SIZE) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Image exceeds 10MB limit.' }))
                return
              }
              if (isVideo && buffer.length > MAX_VIDEO_SIZE) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Video exceeds 50MB limit.' }))
                return
              }

              const cleanName = path
                .basename(filename, ext)
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .slice(0, 40)
              const uniqueFilename = `${Date.now()}_${cleanName}${ext}`
              const targetDir = isVideo ? VIDEOS_DIR : IMAGES_DIR
              const targetPath = path.join(targetDir, uniqueFilename)

              fs.writeFileSync(targetPath, buffer)

              const publicUrl = isVideo
                ? `/uploads/videos/${uniqueFilename}`
                : `/uploads/images/${uniqueFilename}`

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  success: true,
                  url: publicUrl,
                  filename: uniqueFilename,
                  originalName: filename,
                  size: buffer.length,
                  type: type || (isVideo ? 'video/mp4' : 'image/jpeg'),
                  category: isVideo ? 'video' : 'image',
                }),
              )
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message || 'File upload failed.' }))
            }
          })
          return
        }

        if (req.url === '/api/hotels') {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(HOTELS_FILE)) {
                const content = fs.readFileSync(HOTELS_FILE, 'utf-8')
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(content)
                return
              }
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end('[]')
              return
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: e.message }))
              return
            }
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (c) => (body += c))
            req.on('end', () => {
              try {
                fs.writeFileSync(HOTELS_FILE, body, 'utf-8')
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: e.message }))
              }
            })
            return
          }
        }

        if (req.url && req.url.startsWith('/api/media') && req.method === 'DELETE') {
          try {
            const urlObj = new URL(req.url, 'http://localhost')
            const mediaUrl = urlObj.searchParams.get('url')
            if (mediaUrl && mediaUrl.startsWith('/uploads/')) {
              const relPath = mediaUrl.replace(/^\/uploads\//, '')
              const fullPath = path.resolve(UPLOAD_DIR, relPath)
              if (fullPath.startsWith(UPLOAD_DIR) && fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
              }
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
            return
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
            return
          }
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), mediaStoragePlugin()],
})
