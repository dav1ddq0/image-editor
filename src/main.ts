/*
 * main.ts
 * Application entry point. Bootstraps Vue, registers Pinia, and mounts the app.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/styles/main.css'
import vuetify from '@/plugins/vuetify'

import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
