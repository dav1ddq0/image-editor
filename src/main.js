/*
 * main.js
 *
 * Application entry point. This file bootstraps the Vue 3 application by:
 *   1. Creating the root Vue app instance from the top-level App component.
 *   2. Registering the Pinia store plugin so all child components can access
 *      reactive global state via `useXxxStore()` composables.
 *   3. Importing the global stylesheet that defines CSS custom properties
 *      (design tokens) shared across every component.
 *   4. Mounting the app into the `#app` div defined in index.html.
 */

// createApp – factory function that creates a new Vue application instance
import { createApp } from 'vue'

// createPinia – factory that creates the Pinia state-management plugin instance
import { createPinia } from 'pinia'

// Global stylesheet: contains CSS variables (colors, spacing, transitions, etc.)
// imported here so it is applied before any component styles are resolved
import '@/assets/styles/main.css'

// Root component – the single component that owns the full page layout
import App from './App.vue'

// Create the Vue application instance, passing the root component
const app = createApp(App)

// Register Pinia as a Vue plugin so every component tree can call useStore()
app.use(createPinia())

// Mount the application into the DOM element with id="app" (defined in index.html)
app.mount('#app')
