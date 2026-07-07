import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Initial theme: honor the OS preference;
const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: prefersDark === false ? 'light' : 'dark',
    themes: {
      // Dark Theme
      dark: {
        dark: true,
        colors: {
          background: '#0d0d1a',
          surface:    '#16213e',
          'surface-bright': '#1e2c4f',
          primary:    '#e94560',
          secondary:  '#0f3460',
          error:      '#c0392b',
          info:       '#3b82f6',
          success:    '#22c55e',
          warning:    '#f59e0b',
          'on-background': '#e0e0e0',
          'on-surface':    '#e0e0e0',
          'on-primary':    '#ffffff',
        },
      },
      // Light Theme
      light: {
        dark: false,
        colors: {
          background: '#f4f5fb',
          surface:    '#ffffff',
          'surface-bright': '#ffffff',
          primary:    '#e0344f',
          secondary:  '#dfe4f3',
          error:      '#c0392b',
          info:       '#2563eb',
          success:    '#16a34a',
          warning:    '#d97706',
          'on-background': '#1c2233',
          'on-surface':    '#1c2233',
          'on-primary':    '#ffffff',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'pill' },
    VCard: { rounded: 'xl' },
    VDialog: { transition: 'dialog-bottom-transition' },
    VTextField: { rounded: 'lg' },
    VTextarea: { rounded: 'lg' },
  },
})
