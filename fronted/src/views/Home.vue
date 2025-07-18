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
        <button @click="downloadImage" v-if="result.imageUrl">下载封面</button>
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
      result: null,
      imageError: false
    }
  },
  methods: {
    async generate() {
      this.loading = true
      this.error = null
      this.result = null
      this.imageError = false
      
      try {
        const response = await fetch('https://liaorunqing.pythonanywhere.com/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            theme: this.theme,
            characters: this.characters
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `请求失败: ${response.status}`);
        }
        
        const data = await response.json()
        this.result = data
      } catch (e) {
        this.error = `错误: ${e.message}`
        console.error('生成失败:', e)
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
      if (this.result.imageUrl) {
        // 添加时间戳确保下载最新图片
        const timestamp = new Date().getTime();
        const url = `${this.result.imageUrl}?t=${timestamp}`;
        
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${this.theme}剧本封面.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch(error => {
            console.error('图片下载失败:', error);
            alert('封面下载失败，请重试');
          });
      }
    },
    share() {
      if (navigator.share) {
        navigator.share({
          title: `AI生成的${this.theme}剧本杀`,
          text: this.result.script.slice(0, 100) + '...',
          url: window.location.href
        }).catch(error => {
          console.error('分享失败:', error)
          alert('分享失败，请手动复制内容')
        })
      } else {
        const shareText = `AI剧本杀生成器 - ${this.theme}\n\n${this.result.script.slice(0, 500)}...\n\n查看完整内容: ${window.location.href}`
        navigator.clipboard.writeText(shareText)
          .then(() => alert('内容已复制到剪贴板，请粘贴分享'))
          .catch(() => alert('复制失败，请手动复制内容'))
      }
    }
  }
}
</script>

<style scoped>
/* 保持之前的样式不变 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5rem;
}

.input-group {
  margin: 20px 0;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

input, textarea {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, textarea:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

textarea {
  height: 120px;
  resize: vertical;
}

button {
  padding: 14px 28px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 17px;
  font-weight: 600;
  transition: all 0.3s;
  display: block;
  width: 100%;
  margin-top: 10px;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #388e3c;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.error {
  color: #e53935;
  padding: 15px;
  margin: 20px 0;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  background-color: #ffebee;
  font-weight: 500;
}

.result {
  margin-top: 40px;
  border-top: 2px solid #e0e0e0;
  padding-top: 30px;
}

.meta {
  color: #757575;
  font-size: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.image-preview {
  margin-bottom: 30px;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.image-preview img {
  max-width: 100%;
  max-height: 450px;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
  border: 1px solid #eee;
}

.image-preview .error {
  color: #e53935;
  margin-top: 15px;
  font-size: 16px;
}

.script {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.script h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
}

.script pre {
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.8;
  font-size: 16px;
  color: #37474f;
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
}

.actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.actions button {
  flex: 1;
  min-width: 150px;
  background-color: #2196F3;
}

.actions button:nth-child(2) {
  background-color: #9C27B0;
}

.actions button:last-child {
  background-color: #FF9800;
}

@media (max-width: 600px) {
  .container {
    padding: 15px;
  }
  
  .input-group {
    padding: 15px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  button {
    padding: 12px;
  }
}
</style>
