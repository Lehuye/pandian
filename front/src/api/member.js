import request from './request'

// 获取全部成员
export function getMemberList() {
  return request({ url: '/member', method: 'get' })
}
// 获取单个成员
export function getMemberByUuid(uuid) {
  return request({ url: `/member/${uuid}`, method: 'get' })
}
// 新增成员
export function addMember(data) {
  return request({ url: '/member', method: 'post', data })
}
// 修改成员
export function updateMember(uuid, data) {
  return request({ url: `/member/${uuid}`, method: 'put', data })
}
// 删除成员
export function delMember(uuid) {
  return request({ url: `/member/${uuid}`, method: 'delete' })
}
