var express = require('express');
var router = express.Router();

// 内存临时数据库，服务重启数据清空
let memberList = [
  {
    uuid: '1',
    name: '张三',
    src: 'https://picsum.photos/id/1005/300/300',
    jobNumber: 'EMP001',
    station: 'A03',
    location: 'A区3楼'
  },
  {
    uuid: '2',
    name: '李四',
    src: 'https://picsum.photos/id/1012/300/300',
    jobNumber: 'EMP002',
    station: 'B05',
    location: 'B区1楼'
  },
  {
    uuid: '3',
    name: '王五',
    src: 'https://picsum.photos/id/1025/300/300',
    jobNumber: 'EMP003',
    station: 'A07',
    location: 'A区3楼'
  },
  {
    uuid: '4',
    name: '赵六',
    src: 'https://picsum.photos/id/1027/300/300',
    jobNumber: 'EMP004',
    station: 'C02',
    location: 'C区2楼'
  },
  {
    uuid: '5',
    name: '钱七',
    src: 'https://picsum.photos/id/1074/300/300',
    jobNumber: 'EMP005',
    station: 'D09',
    location: 'D区1楼'
  },
  {
    uuid: '6',
    name: '孙八',
    src: 'https://picsum.photos/id/1066/300/300',
    jobNumber: 'EMP006',
    station: 'A12',
    location: 'A区4楼'
  }
];

// 1. GET /member 获取全部成员列表
router.get('/', function(req, res, next) {
  res.json({
    code: 200,
    data: memberList
  });
});

// 2. GET /member/:uuid 根据uuid查询单个成员
router.get('/:uuid', function(req, res, next) {
  const uuid = req.params.uuid;
  const member = memberList.find(item => item.uuid === uuid);
  if (!member) {
    return res.status(404).json({ code:404, msg: '成员不存在' });
  }
  res.json({ code:200, data: member });
});

// 3. POST /member 新增成员（uuid前端传入，保证唯一）
router.post('/', function(req, res, next) {
  const newMember = req.body;
  // 校验必填uuid
  if (!newMember.uuid) {
    return res.status(400).json({ code:400, msg: 'uuid不能为空' });
  }
  // 判断uuid是否重复
  const exist = memberList.find(item => item.uuid === newMember.uuid);
  if(exist){
    return res.status(400).json({ code:400, msg: 'uuid已存在' });
  }
  memberList.push(newMember);
  res.json({ code:200, msg:'新增成功', data: newMember });
});

// 4. PUT /member/:uuid 修改成员信息
router.put('/:uuid', function(req, res, next) {
  const uuid = req.params.uuid;
  const updateData = req.body;
  const index = memberList.findIndex(item => item.uuid === uuid);
  if(index === -1){
    return res.status(404).json({ code:404, msg: '成员不存在' });
  }
  memberList[index] = { ...memberList[index], ...updateData };
  res.json({ code:200, msg:'更新成功', data: memberList[index] });
});

// 5. DELETE /member/:uuid 删除成员
router.delete('/:uuid', function(req, res, next) {
  const uuid = req.params.uuid;
  const beforeLen = memberList.length;
  memberList = memberList.filter(item => item.uuid !== uuid);
  if(memberList.length === beforeLen){
    return res.status(404).json({ code:404, msg: '成员不存在' });
  }
  res.json({ code:200, msg:'删除成功' });
});

// 6. POST /member/uploadAvatar 头像上传接口（接收base64，对接前端拍照组件）
router.post('/uploadAvatar', function(req, res, next) {
  const { uuid, base64Img } = req.body;
  if(!uuid || !base64Img){
    return res.status(400).json({code:400, msg:'缺少uuid或图片base64'});
  }
  const member = memberList.find(item => item.uuid === uuid);
  if(!member){
    return res.status(404).json({code:404, msg:'成员不存在'});
  }
  // 这里：如果你想更新内存里头像src，可以打开下面一行
  // member.src = base64Img;
  res.json({ code:200, msg: '头像上传成功', uuid });
});

module.exports = router;
