const multer = require('multer')
const fs = require('fs')
const path = require('path')

// 目录定义
const originalDir = path.join(__dirname, '../public/assets/original')
const webpDir = path.join(__dirname, '../public/assets/webp')

// 自动创建文件夹
if (!fs.existsSync(originalDir)) fs.mkdirSync(originalDir, { recursive: true })
if (!fs.existsSync(webpDir)) fs.mkdirSync(webpDir, { recursive: true })

const storage = multer.memoryStorage() // 内存接收文件，方便sharp处理
const upload = multer({ storage: storage })

module.exports = { upload, originalDir, webpDir }
