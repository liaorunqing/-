<script setup>
// 确保使用Composition API
</script>

<template>
  <div class="container">
    <h1>AI剧本杀生成器</h1>
    
    <div class="input-group">
      <input v-model="theme" placeholder="输入题材（如：赛博朋克）">
      <textarea v-model="characters" placeholder="输入角色，用/分隔（如：黑客/警察/AI/商人）"></textarea>
      <button @click="generate" :disabled="loading">
        {{ loading ? '生成中...' : '一键生成' }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="result" class="result">
      <div class="meta">生成耗时: {{ result.time }}</div>
      
      <!-- 修改图片显示部分 -->
      <div v-if="result.imageUrl" class="image-preview">
        <h3>剧本封面</h3>
        <img :src="result.imageUrl" alt="剧本封面" @error="handleImageError">
        <p v-if="imageError" class="error">图片加载失败</p>
      </div>
      
      <div class="script">
        <h2>剧本内容</h2>
        <pre>{{ result.script }}</pre>
      </div>
      
      <div class="actions">
        <button @click="downloadScript">下载剧本</button>
        <button @click="downloadImage" v-if="result.image">下载封面</button>
        <button @click="share">分享结果</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      theme: '校园恋爱',
      characters: '学霸/学渣/校花/体育生/班主任',
      loading: false,
      error: null,
      result: null
    }
  },
  methods: {
    async generate() {
      this.loading = true
      this.error = null
      this.result = null
      
      try {
        const response = await fetch('https://liaorunqing.pythonanywhere.com/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            theme: this.theme,
            characters: this.characters
          })
        })
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 添加时间戳防止缓存
        if (data.image) {
          data.imageUrl = `http://localhost:5000/${data.image}?t=${Date.now()}`
        }
        
        this.result = data
      } catch (e) {
        this.error = `错误: ${e.message}`
      } finally {
        this.loading = false
      }
    },

    handleImageError() {
      this.imageError = true
      console.error('图片加载失败')
    },
    downloadScript() {
      const blob = new Blob([this.result.script], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${this.theme}剧本杀.txt`
      link.click()
    },
    downloadImage() {
      if (this.result.image) {
        const link = document.createElement('a')
        link.href = this.result.image
        link.download = `${this.theme}剧本封面.jpg`
        link.click()
      }
    },
    share() {
      if (navigator.share) {
        navigator.share({
          title: `AI生成的${this.theme}剧本杀`,
          text: this.result.script.slice(0, 100) + '...',
          url: window.location.href
        })
      } else {
        alert('复制以下内容分享:\n\n' + this.result.script.slice(0, 500))
      }
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.input-group {
  margin: 20px 0;
}

input, textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  height: 100px;
  resize: vertical;
}

button {
  padding: 12px 25px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.error {
  color: #ff3860;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ff3860;
  border-radius: 4px;
  background-color: #fff5f5;
}

.result {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.meta {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.image-preview {
  margin-bottom: 20px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.image-preview .error {
  color: #ff3860;
  margin-top: 10px;
}

.script {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.script pre {
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  flex: 1;
  background-color: #2196F3;
}

.actions button:nth-child(2) {
  background-color: #9C27B0;
}

.actions button:last-child {
  background-color: #FF9800;
}
</style>