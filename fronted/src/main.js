import { createApp } from 'vue'
import App from './views/Home.vue'

// 创建Vue应用
const app = createApp(App)

// 挂载到DOM
app.mount('#app')