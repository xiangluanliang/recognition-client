<template>
  <div class="verify-container">
    <div class="verify-box">
      <div class="verify-header">
        <h2>验证ing</h2>
        <p>请点击所有包含 <span class="highlight">苏老师 </span> 👩‍🏫的照片</p>
      </div>

      <div class="image-grid">
        <div
          class="image-cell"
          v-for="(img, idx) in displayedImages"
          :key="idx"
          @click="toggleSelection(idx)"
        >
          <img :src="img.url" alt="验证码图" />
        </div>
      </div>

      <div class="result" :class="{ success: isSuccess, error: isError }">
        {{ result }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 图片池，correct 标记哪些是“符合要求”的
const allImages = ref([
  { url: '/verify/s_1.png', correct: true },
  { url: '/verify/s_2.png', correct: true },
  { url: '/verify/s_3.png', correct: true },
  { url: '/verify/s_4.png', correct: true },
  { url: '/verify/s_5.png', correct: true },
  { url: '/verify/s_6.png', correct: false },
  { url: '/verify/s_7.png', correct: false },
  { url: '/verify/s_8.png', correct: false },
  { url: '/verify/s_9.png', correct: false },
  { url: '/verify/s_10.png', correct: false },
  { url: '/verify/s_11.png', correct: false },
  { url: '/verify/s_12.png', correct: false },
  { url: '/verify/s_13.png', correct: false },
  { url: '/verify/s_14.png', correct: false },
  { url: '/verify/s_15.png', correct: false },

])

const displayedImages = ref<{ url: string; correct: boolean; index: number }[]>([])
const usedIndexes = ref(new Set<number>())
const selectedCorrectIndexes = ref(new Set<number>()) // 已正确点过的 correct 图片的 index

const result = ref('')
const isSuccess = ref(false)
const isError = ref(false)

// 初始化：从所有图片中随机挑9张
function initDisplay() {
  usedIndexes.value.clear()
  selectedCorrectIndexes.value.clear()
  result.value = ''
  isSuccess.value = false
  isError.value = false

  const pool = [...Array(allImages.value.length).keys()]
  pool.sort(() => Math.random() - 0.5)

  displayedImages.value = pool.slice(0, 9).map(i => {
    usedIndexes.value.add(i)
    return { ...allImages.value[i], index: i }
  })
}

// 点击处理
function toggleSelection(pos: number) {
  const clicked = displayedImages.value[pos]
  if (!clicked) return

  if (clicked.correct) {
    if (selectedCorrectIndexes.value.has(clicked.index)) return
    selectedCorrectIndexes.value.add(clicked.index)

    // 尝试用未用过的 correct:true 图片替换
    const availableCorrectIndexes = allImages.value
      .map((_, i) => i)
      .filter(i => allImages.value[i].correct && !usedIndexes.value.has(i))

    if (availableCorrectIndexes.length > 0) {
      // 替换成一个新的正确图片，保证展示里还有正确的
      const newIndex = availableCorrectIndexes[Math.floor(Math.random() * availableCorrectIndexes.length)]
      usedIndexes.value.add(newIndex)
      displayedImages.value[pos] = { ...allImages.value[newIndex], index: newIndex }
    } else {
      // 没有多余正确图了，尝试用未用过的错误图替换
      const availableWrongIndexes = allImages.value
        .map((_, i) => i)
        .filter(i => !allImages.value[i].correct && !usedIndexes.value.has(i))

      if (availableWrongIndexes.length > 0) {
        const newIndex = availableWrongIndexes[Math.floor(Math.random() * availableWrongIndexes.length)]
        usedIndexes.value.add(newIndex)
        displayedImages.value[pos] = { ...allImages.value[newIndex], index: newIndex }
      } else {
        // 图片池用完，直接移除这张图（或不替换）
        displayedImages.value.splice(pos, 1)
      }
    }

    const totalCorrect = allImages.value.filter(i => i.correct).length
    if (selectedCorrectIndexes.value.size === totalCorrect) {
      result.value = '🎉 验证成功，跳转中...'
      isSuccess.value = true
      setTimeout(() => {
        localStorage.setItem('isVerified', 'true')
        router.push('/')
      }, 1200)
    }
  } else {
    result.value = '❌ 验证失败，请重新开始'
    isError.value = true
    setTimeout(() => {
      initDisplay()
    }, 1200)
  }
}


onMounted(() => {
  initDisplay()
})
</script>

<style scoped>
.verify-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-box {
  width: 460px;
  padding: 40px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.verify-header h2 {
  color: #303133;
  font-size: 22px;
  margin-bottom: 5px;
}

.verify-header p {
  margin-top: 5px;
  margin-bottom: 20px;
  color: #666;
  font-size: 15px;
}

.highlight {
  color: #d81b60;
  font-weight: bold;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 120px);
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.image-cell {
  width: 120px;
  height: 120px;
  border: 3px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
}

.image-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.submit-btn {
  background-color: #1976d2;
  color: white;
  padding: 10px 25px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;
}

.submit-btn:hover {
  background-color: #125ea2;
}

.result {
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
}

.result.success {
  color: green;
}

.result.error {
  color: red;
}
</style>
