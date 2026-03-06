import './assets/main.css'

import { createApp } from 'vue'
import VueDnDKitPlugin, { type IPluginOptions } from '@vue-dnd-kit/core'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(VueDnDKitPlugin, {
  defaultOverlay: {
    styles: {
      // Optional custom styles for drag overlay
      opacity: 0.8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'none',
    },
  },
} as IPluginOptions)
app.use(router)

app.mount('#app')
