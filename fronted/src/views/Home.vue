<template>
  <div class="container">
    <h1>AI剧本杀生成器</h1>
    
    <div class="input-group">
      <input v-model="theme" placeholder="输入题材">
      <textarea v-model="characters" placeholder="输入角色，用/分隔"></textarea>
      <button @click="generate" :disabled="loading">
        {{ loading ? '生成中...' : '一键生成' }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
      <button v-if="result?.imageUrl" @click="openImageDirectly">直接查看封面</button>
    </div>
    
    <div v-if="result" class="result">
      <div class="script">
        <h2>{{ theme }}剧本</h2>
        <pre>{{ result.script }}</pre>
      </div>
      
      <div class="actions">
        <button @click="copyScript">复制剧本</button>
        <button v-if="result.imageUrl" @click="downloadImage">下载封面</button>
        <button v-else @click="retryGenerate">重试生成封面</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      theme: '校园恋爱',
      characters: '学霸/学渣/校花',
      loading: false,
      error: null,
      result: null
    }
  },
  methods: {
    async generate() {
      this.loading = true
      this.error = null
      
      try {
        // 添加超时控制
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 30000)  // 30秒超时
        
        const res = await fetch('https://liaorunqing.pythonanywhere.com/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: this.theme,
            characters: this.characters
          }),
          signal: controller.signal
        })
        
        if (!res.ok) throw new Error('服务器响应异常')
        
        const data = await res.json()
        if (!data.script) throw new Error('剧本生成失败')
        
        this.result = data
      } catch (e) {
        this.error = e.message
        this.result = { 
          script: "请稍后手动刷新重试...",
          imageUrl: "https://via.placeholder.com/512?text=点击重试生成封面"
        }
      } finally {
        this.loading = false
      }
    },
    
    openImageDirectly() {
      window.open(this.result.imageUrl, '_blank')
    },
    
    copyScript() {
      navigator.clipboard.writeText(this.result.script)
        .then(() => alert('剧本已复制!'))
        .catch(() => alert('请手动复制剧本内容'))
    },
    
    async downloadImage() {
      try {
        const link = document.createElement('a')
        link.href = this.result.imageUrl
        link.download = `${this.theme}_封面.jpg`
        link.click()
      } catch (e) {
        this.openImageDirectly()
      }
    },
    
    retryGenerate() {
      this.generate()
    }
  }
}
</script>

<style scoped>
/* 精简样式保证快速加载 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.input-group {
  margin: 20px 0;
}

input, textarea, button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
}

.error {
  color: red;
  padding: 10px;
  border: 1px solid red;
  margin: 10px 0;
}

.result {
  margin-top: 20px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  flex: 1;
}
</style>
