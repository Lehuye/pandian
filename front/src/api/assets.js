import request from './request'

// 获取全部资产
export function getAssetList() {
  return request({ url: '/assets', method: 'get' })
}
// 获取单个资产
export function getAssetById(assetId) {
  return request({ url: `/assets/${assetId}`, method: 'get' })
}
// 【核心】上传图片资产（FormData，摄像头拍照转文件上传）
export function uploadAsset(formData) {
  return request({
    url: '/assets/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
// 修改资产（备注、memberUuid）
export function updateAsset(assetId, data) {
  return request({ url: `/assets/${assetId}`, method: 'put', data })
}
// 删除资产（同时删服务器原图+webp）
export function delAsset(assetId) {
  return request({ url: `/assets/${assetId}`, method: 'delete' })
}
