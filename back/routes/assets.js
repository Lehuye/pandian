var express = require('express');
var router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 目录定义
const originalDir = path.join(__dirname, '../public/assets/original');
const webpDir = path.join(__dirname, '../public/assets/webp');
// 自动创建文件夹
if (!fs.existsSync(originalDir)) fs.mkdirSync(originalDir, { recursive: true });
if (!fs.existsSync(webpDir)) fs.mkdirSync(webpDir, { recursive: true });

// multer 内存存储
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 限制10MB
});

// 内存模拟数据库，重启丢失
let assetList = [];
let assetIdSeq = 1;

/**
 * GET /assets
 * 获取全部资产列表
 */
router.get('/', function (req, res, next) {
  res.json({
    code: 200,
    data: assetList
  });
});

/**
 * GET /assets/:assetId
 * 获取单个资产详情
 */
router.get('/:assetId', function (req, res, next) {
  const assetId = parseInt(req.params.assetId);
  const asset = assetList.find(item => item.assetId === assetId);
  if (!asset) {
    return res.status(404).json({ code: 404, msg: '资产不存在' });
  }
  res.json({ code: 200, data: asset });
});

/**
 * POST /assets/upload
 * 上传图片资产：保存原图 + webp压缩图
 * formData: assetFile, memberUuid, remark
 */
router.post('/upload', upload.single('assetFile'), async function (req, res, next) {
  try {
    const { assetUuid, remark = '' } = req.body;
    if (!req.file) {
      return res.status(400).json({ code: 400, msg: '请选择图片文件' });
    }
    if (!assetUuid) {
      return res.status(400).json({ code: 400, msg: 'assetUuid不能为空' });
    }
    // 文件名只用assetUuid+时间戳，不要拼接remark，防止中文/特殊字符报错
    const ext = path.extname(req.file.originalname);
    const baseName = `${assetUuid}_${Date.now()}`;
    const originalFileName = `${assetUuid}_${baseName}_${remark}_${ext}`;
    const webpFileName = `${assetUuid}_${baseName}_${remark}_${ext}` + '.webp';
    const originalSavePath = path.join(originalDir, originalFileName);
    const webpSavePath = path.join(webpDir, webpFileName);

    // 保存原图
    fs.writeFileSync(originalSavePath, req.file.buffer);
    // sharp压缩转webp，宽最大1200，质量80
    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpSavePath);

    // 静态访问地址
    const originalUrl = `/assets/original/${originalFileName}`;
    const webpUrl = `/assets/webp/${webpFileName}`;
    conso
    const newAsset = {
      assetId: assetIdSeq++,
      assetUuid,
      remark,
      originalUrl,
      webpUrl,
      originalFileName,
      webpFileName,
      createTime: new Date().toISOString()
    };
    assetList.push(newAsset);
    res.json({
      code: 200,
      msg: '上传成功',
      data: newAsset
    });
  } catch (err) {
    console.error('图片处理失败：', err);
    res.status(500).json({ code: 500, msg: '图片处理失败' });
  }
});

/**
 * PUT /assets/:assetId
 * 修改资产（只改备注、memberUuid，不重新上传图片）
 */
router.put('/:assetId', function (req, res, next) {
  const assetId = parseInt(req.params.assetId);
  const { memberUuid, remark } = req.body;
  const assetIndex = assetList.findIndex(item => item.assetId === assetId);
  if (assetIndex === -1) {
    return res.status(404).json({ code: 404, msg: '资产不存在' });
  }
  assetList[assetIndex] = {
    ...assetList[assetIndex],
    ...(memberUuid !== undefined ? { memberUuid } : {}),
    ...(remark !== undefined ? { remark } : {})
  };
  res.json({ code: 200, msg: '更新成功', data: assetList[assetIndex] });
});

/**
 * DELETE /assets/:assetId
 * 删除资产：同时删除磁盘上原图、webp文件 + 内存记录
 */
router.delete('/:assetId', function (req, res, next) {
  const assetId = parseInt(req.params.assetId);
  const asset = assetList.find(item => item.assetId === assetId);
  if (!asset) {
    return res.status(404).json({ code: 404, msg: '资产不存在' });
  }
  try {
    // 删除原图
    const originalPath = path.join(originalDir, asset.originalFileName);
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    // 删除webp
    const webpPath = path.join(webpDir, asset.webpFileName);
    if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
  } catch (e) {
    console.warn('删除磁盘文件警告：', e);
  }
  // 删除内存记录
  assetList = assetList.filter(item => item.assetId !== assetId);
  res.json({ code: 200, msg: '资产已删除，文件清理完成' });
});

module.exports = router;
