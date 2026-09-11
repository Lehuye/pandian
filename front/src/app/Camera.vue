<template>
  <div v-if="visible" class="camera-modal" @click.self="handleClose">
    
    <div class="camera-wrap">
      <div class="scan-line"></div>
      <h3 class="cyber-title">
        <span class="title-bar"></span>
        拍摄资产照片 · {{ asset['序號'] }}
        <span class="title-bar"></span>
      </h3>
      <div class="view-box">
        <!-- Electron端：实时video预览；手机端不会渲染video，直接走原生相机 -->
        <video
          v-if="!photoBase64 && isElectron"
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="video-view"
        ></video>
        <img
          v-else
          :src="photoBase64"
          alt="拍摄预览"
          class="video-view"
        />
        <div class="crosshair"></div>
        <div class="scan-text">
          <span v-if="!photoBase64">REC...</span>
          <span v-else>CAPTURE OK</span>
        </div>
      </div>
      <canvas ref="canvasRef" class="canvas-hide"></canvas>
      <!-- 手机端原生相机隐藏input -->
      <input
        ref="mobileFileRef"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="onMobilePhotoSelect"
      />
      <div class="info-panel">
        <div class="info-title">
          <span class="dot"></span>
          資產資訊 / ASSET INFO
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>序號</label>
            <span>{{ asset['序號'] }}</span>
          </div>
          <div class="info-item">
            <label>PO</label>
            <span>{{ asset['PO'] }}</span>
          </div>
          <div class="info-item">
            <label>入帳日期</label>
            <span>{{ asset['入帳日期'] }}</span>
          </div>
          <div class="info-item">
            <label>資產分類</label>
            <span>{{ asset['資產分類'] }}</span>
          </div>
          <div class="info-item">
            <label>保管部門</label>
            <span>{{ asset['保管部門'] }}</span>
          </div>
          <div class="info-item">
            <label>保管人</label>
            <span>{{ asset['保管人'] }}</span>
          </div>
          <div class="info-item">
            <label>管理員</label>
            <span>{{ asset['管理員'] }}</span>
          </div>
          <div class="info-item">
            <label>名稱</label>
            <span>{{ asset['名稱'] }}</span>
          </div>
          <div class="info-item">
            <label>規格型號</label>
            <span>{{ asset['規格型號'] }}</span>
          </div>
          <div class="info-item">
            <label>存放位置名稱</label>
            <span>{{ asset['存放位置名稱'] }}</span>
          </div>
          <div class="info-item">
            <label>狀態</label>
            <span>{{ asset['狀態'] }}</span>
          </div>
          <div class="info-item">
            <label>財產編號</label>
            <span>{{ asset['財產編號'] }}</span>
          </div>
          <div class="info-item">
            <label>管制編號</label>
            <span>{{ asset['管制編號'] }}</span>
          </div>
          <div class="info-item">
            <label>初盤結果</label>
            <span>{{ asset['初盤結果'] }}</span>
          </div>
          <div class="info-item">
            <label>複盤結果</label>
            <span>{{ asset['複盤結果'] }}</span>
          </div>
          <div class="info-item">
            <label>抽盤結果</label>
            <span>{{ asset['抽盤結果'] }}</span>
          </div>
          <div class="info-item">
            <label>備註</label>
            <span>{{ asset['備註'] }}</span>
          </div>
        </div>
      </div>
      <!-- ==========新增备注输入框，仅拍照完成后显示========== -->
      <div v-if="photoBase64" class="remark-panel">
        <label>本次拍照備註</label>
        <textarea
          v-model="userRemark"
          placeholder="輸入本次拍照備註"
          rows="2"
        ></textarea>
      </div>
      <div class="btn-group">
        <template v-if="!photoBase64">
          <button class="cyber-btn btn-photo" @click="triggerCamera">
            <span>拍照</span>
            <i class="line left"></i>
            <i class="line right"></i>
          </button>
          <button class="cyber-btn btn-cancel" @click="handleClose">
            <span>取消</span>
          </button>
        </template>
        <template v-else>
          <button class="cyber-btn btn-retake" @click="reTake">
            <span>重拍</span>
          </button>
          <button
            class="cyber-btn btn-upload"
            @click="submitUpload"
            :disabled="uploading"
          >
            <span>{{ uploading ? '上传中...' : '上传' }}</span>
            <i class="line left"></i>
            <i class="line right"></i>
          </button>
          <button class="cyber-btn btn-cancel" @click="handleClose">
            <span>取消</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { uploadAsset } from '@/api/assets'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  asset: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close', 'uploadSuccess', 'uploadError'])
const videoRef = ref(null)
const canvasRef = ref(null)
const mobileFileRef = ref(null)
let mediaStream = null
const photoBase64 = ref('')
const uploading = ref(false)
// 新增备注变量
const userRemark = ref('')
// 环境判断
const isElectron = navigator.userAgent.toLowerCase().includes('electron')
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      photoBase64.value = ''
      uploading.value = false
      userRemark.value = '' // 打开弹窗清空备注
      if(isElectron){
        await openCamera()
      }
    } else {
      stopCamera()
      photoBase64.value = ''
      userRemark.value = '' // 关闭弹窗清空备注
    }
  }
)
// Electron桌面端：WebRTC实时预览
async function openCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    })
    videoRef.value.srcObject = mediaStream
  } catch (err) {
    console.error('摄像头异常：', err)
    alert('摄像头打开失败！请检查：\n1.Windows隐私设置已开启摄像头权限给Electron\n2.没有其他软件正在占用摄像头\n3.USB摄像头驱动正常')
    emit('close')
  }
}
// 统一拍照按钮入口：区分环境
function triggerCamera() {
  if(isElectron){
    takePhoto()
  }else if(isMobile){
    // 手机端唤起原生相机
    mobileFileRef.value.click()
  }
}
// Electron截图（canvas捕获video画面）
function takePhoto() {
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 720
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  photoBase64.value = canvas.toDataURL('image/jpeg', 0.85)
}
// 手机原生相机拍完回调，转base64，和原有逻辑打通
function onMobilePhotoSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    photoBase64.value = ev.target.result
  }
  reader.readAsDataURL(file)
  // 清空input，保证重拍可以重复选择同一张
  e.target.value = ''
}
function reTake() {
  photoBase64.value = ''
  userRemark.value = '' //重拍清空备注
  nextTick(() => {
    if (isElectron && videoRef.value) {
      videoRef.value.play().catch(e => console.log('play ignore', e))
    }
  })
}
function base64ToFile(base64Str, fileName) {
  const arr = base64Str.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], fileName, { type: mime })
}
async function submitUpload() {
  if (uploading.value) return
  uploading.value = true
  try {
    // 用財產編號做文件名，或者asset['序號']，你可以自行改
    const file = base64ToFile(photoBase64.value, `${props.asset['財產編號']}.jpg`)
    const formData = new FormData()
    formData.append('assetFile', file)
    formData.append('assetUuid', props.asset['財產編號'])
    // 使用用户输入的备注，为空则用默认文字
    formData.append('remark', userRemark.value || '资产照片')
    const res = await uploadAsset(formData)
    emit('uploadSuccess', res.data)
  } catch (err) {
    console.error('上传异常：', err)
    emit('uploadError', err)
  } finally {
    uploading.value = false
  }
}
function handleClose() {
  stopCamera()
  emit('close')
}
function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
}
onUnmounted(() => stopCamera())
</script>

<style scoped>
:root {
  --bg-modal: rgba(8, 12, 20, 0.75);
  --panel-bg: rgba(15, 23, 42, 0.65);
  --panel-border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #38bdf8;
  --accent-glow: rgba(56, 189, 248, 0.15);
  --text-main: #f1f5f9;
  --text-muted: #64748b;
  --text-label: #94a3b8;
}

/* 遮罩层：高斯模糊，沉浸感暗黑背景 */
.camera-modal {
  position: fixed;
  inset: 0;
  background: var(--bg-modal);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 主面板：极简边缘发光，微玻璃拟态 */
.camera-wrap {
  width: 90%;
  max-width: 580px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(56, 189, 248, 0.05);
}

/* 扫描线：柔和渐变与高斯模糊 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
  box-shadow: 0 0 15px var(--accent-cyan);
  animation: scan 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 2;
}

@keyframes scan {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateY(280px); opacity: 0; }
}

/* 标题栏：现代无衬线字体与微弱衬线装饰 */
.cyber-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-main);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0 0 20px;
}

.title-bar {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15));
}
.cyber-title .title-bar:last-child {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), transparent);
}

/* 取景框：无缝平滑边缘 */
.view-box {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000;
}

.video-view {
  width: 100%;
  display: block;
  object-fit: cover;
}

/* 准心：减弱对比度，增加中心聚焦框 */
.crosshair {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.crosshair::before, .crosshair::after {
  content: "";
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
}
.crosshair::before {
  width: 100%;
  height: 1px;
  top: 50%;
}
.crosshair::after {
  width: 1px;
  height: 100%;
  left: 50%;
}

/* 扫描文字：高科技等宽字体样式 */
.scan-text {
  position: absolute;
  bottom: 12px;
  left: 12px;
  color: var(--accent-cyan);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.canvas-hide {
  display: none;
}

/* 信息面板：模块化卡片设计 */
.info-panel {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 14px 16px;
  border-radius: 10px;
}

.info-title {
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--accent-cyan);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-cyan);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-item {
  display: flex;
  font-size: 12px;
  color: var(--text-muted);
}

.info-item label {
  width: 65px;
  color: var(--text-label);
}

/* 按钮组：扁平、悬浮与微光反馈 */
.btn-group {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cyber-btn {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-main);
  padding: 9px 20px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cyber-btn .line {
  display: none; /* 移除冗余装饰线，提升简洁度 */
}

.cyber-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.cyber-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 特定按钮状态颜色优化 */
.btn-cancel {
  color: var(--text-muted);
}

.btn-retake {
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.05);
}
.btn-retake:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.5);
}

.btn-upload {
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.15);
}
.btn-upload:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.8);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
}
</style>