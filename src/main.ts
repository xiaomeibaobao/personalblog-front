import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import '@wangeditor/editor/dist/css/style.css'
import '@/styles/global.scss'
import dayjs from '@/utils/dayjs'

const app = createApp(App)
app.config.globalProperties.$dayjs = dayjs
app.use(createPinia())
app.use(ElementPlus, {
  locale: zhCn,  // 使用中文
})
app.use(router)
app.mount('#app')