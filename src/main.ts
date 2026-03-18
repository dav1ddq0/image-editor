/*
 * main.ts
 * Application entry point. Bootstraps Vue, registers Pinia, and mounts the app.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Global stylesheet imported here so design tokens are resolved before component styles
import '@/assets/styles/main.css'

import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
