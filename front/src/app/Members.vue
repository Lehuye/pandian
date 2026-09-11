<template>
  <div class="container">
    <input
      v-model="searchKey"
      class="search-input"
      placeholder="搜索姓名/工号/工位/位置"
    />
    <div class="member">
      <ul>
        <li v-for="m in tableData" :key="m.uuid" :style="{backgroundImage: `url(${m.src})`}" @click="openCamera(m)">
          <div class="member-info">
            <div class="name">{{ m.name }}</div>
            <div class="meta">工号：{{ m.jobNumber }}</div>
            <div class="meta">工位：{{ m.station }}</div>
            <div class="meta">位置：{{ m.location }}</div>
          </div>
        </li>
      </ul>
    </div>

    <Camera
      :visible="cameraVisible"
      :member="currentMember"
      @close="cameraVisible = false"
      @upload="handleUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Camera from './Camera.vue'

const searchKey = ref('')
const cameraVisible = ref(false)
const currentMember = ref(null)

const memberList = ref([
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
])

const tableData = computed(() => {
  if (!searchKey.value) return memberList.value
  const kw = searchKey.value.toLowerCase()
  return memberList.value.filter(item =>
    Object.values(item).some(v => String(v).toLowerCase().includes(kw))
  )
})

function openCamera(member) {
  currentMember.value = member
  cameraVisible.value = true
}

// 上传回调：拿到base64+成员信息，更新头像
function handleUpload(payload) {
  console.log('待上传数据', payload)
  const target = memberList.value.find(item => item.uuid === payload.member.uuid)
  if (target) {
    target.src = payload.base64
  }
  cameraVisible.value = false
}
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-width: 1280px;
  min-height: 100vh;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 10% 0%, rgba(0, 255, 255, 0.08), transparent 40%),
    radial-gradient(circle at 90% 100%, rgba(255, 0, 128, 0.08), transparent 40%),
    #07090f;
  color: #e6f7ff;
}

.search-input {
  padding: 8px 12px;
  width: 320px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 2px;
  background: rgba(0, 20, 40, 0.6);
  color: #fff;
  outline: none;
  letter-spacing: 2px;
  box-shadow:
    0 0 10px rgba(0, 255, 255, 0.25),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.search-input::placeholder {
  color: rgba(0, 255, 255, 0.45);
}

.member ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.member ul li {
  aspect-ratio: 1 / 1;
  background-size: cover;
  background-position: center;
  position: relative;
  color: #fff;
  padding:12px;
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.35);
  border-radius: 2px;
  box-shadow:
    0 0 12px rgba(0, 255, 255, 0.25),
    inset 0 0 18px rgba(0, 0, 0, 0.6);
  clip-path: polygon(
    0 10px, 10px 0,
    calc(100% - 10px) 0, 100% 10px,
    100% calc(100% - 10px), calc(100% - 10px) 100%,
    10px 100%, 0 calc(100% - 10px)
  );
  transition: all 0.25s ease;
}

.member ul li::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85));
  z-index: 1;
}

.member ul li::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  z-index: 3;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.member ul li:hover{
  transform: translateY(-4px);
  border-color: #00ffff;
  box-shadow:
    0 0 22px rgba(0, 255, 255, 0.55),
    inset 0 0 22px rgba(0, 255, 255, 0.15);
}
.member ul li:hover::after {
  transform: scaleX(1);
}

.member-info {
  position: absolute;
  bottom:12px;
  left:12px;
  z-index:2;
}
.name {
  font-size:18px;
  font-weight:bold;
  margin-bottom:4px;
  letter-spacing:2px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.9);
}
.meta {
  font-size:13px;
  line-height:1.4;
  color: rgba(200, 240, 255, 0.85);
  letter-spacing:1px;
}

/* 响应式适配手机 */
@media screen and (max-width:1280px) {
  .container{
    min-width:unset;
  }
  .member ul {
    grid-template-columns: repeat(3,1fr);
  }
}
@media screen and (max-width:768px) {
  .member ul {
    grid-template-columns: repeat(2,1fr);
    gap:12px;
  }
  .search-input{
    width:100%;
  }
}
@media screen and (max-width:480px) {
  .member ul {
    grid-template-columns: repeat(1,1fr);
  }
}
</style>
