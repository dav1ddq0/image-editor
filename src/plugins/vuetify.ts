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
          primary:                    '#f6a2b0',
          'on-primary':               '#5d0917',
          'primary-container':        '#8b0e23',
          'on-primary-container':     '#fad1d8',
          secondary:                  '#d7c1c5',
          'on-secondary':             '#3e282c',
          'secondary-container':      '#5d3c41',
          'on-secondary-container':   '#ebe0e2',
          tertiary:                   '#eae0ae',
          'on-tertiary':              '#514715',
          'tertiary-container':       '#796a20',
          'on-tertiary-container':    '#f4efd7',
          error:                      '#f1ada7',
          'on-error':                 '#58140e',
          'error-container':          '#841f15',
          'on-error-container':       '#f8d6d3',
          info:                       '#3b82f6',
          success:                    '#22c55e',
          warning:                    '#f59e0b',
          background:                 '#100e0f',
          'on-background':            '#e7e4e4',
          surface:                    '#100e0f',
          'on-surface':               '#e7e4e4',
          'surface-variant':          '#574245',
          'on-surface-variant':       '#d3c5c7',
          outline:                    '#a78b8f',
          'outline-variant':          '#574245',
          'surface-dim':              '#100e0f',
          'surface-bright':           '#413a3b',
          'surface-container-lowest': '#0b0a0a',
          'surface-container-low':    '#1b1818',
          'surface-container':        '#201d1d',
          'surface-container-high':   '#2e292a',
          'surface-container-highest': '#3b3536',
          'inverse-surface':          '#e7e4e4',
          'inverse-on-surface':       '#363031',
          'inverse-primary':          '#ba122e',
        },
      },
      // Light Theme
      light: {
        dark: false,
        colors: {
          primary:                    '#ba122e',
          'on-primary':               '#ffffff',
          'primary-container':        '#fad1d8',
          'on-primary-container':     '#2e050c',
          secondary:                  '#7c5057',
          'on-secondary':             '#ffffff',
          'secondary-container':      '#ebe0e2',
          'on-secondary-container':   '#1f1416',
          tertiary:                   '#a18d2b',
          'on-tertiary':              '#ffffff',
          'tertiary-container':       '#f4efd7',
          'on-tertiary-container':    '#28230b',
          error:                      '#af291d',
          'on-error':                 '#ffffff',
          'error-container':          '#f8d6d3',
          'on-error-container':       '#2c0a07',
          info:                       '#2563eb',
          success:                    '#16a34a',
          warning:                    '#d97706',
          background:                 '#fafafa',
          'on-background':            '#1b1818',
          surface:                    '#fafafa',
          'on-surface':               '#1b1818',
          'surface-variant':          '#e9e2e3',
          'on-surface-variant':       '#574245',
          outline:                    '#916e74',
          'outline-variant':          '#d3c5c7',
          'surface-dim':              '#e0dcdd',
          'surface-bright':           '#fafafa',
          'surface-container-lowest': '#ffffff',
          'surface-container-low':    '#f5f4f4',
          'surface-container':        '#f1efef',
          'surface-container-high':   '#ece9ea',
          'surface-container-highest': '#e7e4e4',
          'inverse-surface':          '#363031',
          'inverse-on-surface':       '#f3f1f2',
          'inverse-primary':          '#f6a2b0',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'pill' },
    VCard: { rounded: '12', color: 'surface-container-high' },
    VDialog: { transition: 'dialog-bottom-transition' },
    VTextField: { rounded: 'lg' },
    VTextarea: { rounded: 'lg' },
    VSlider: {
      color:           'primary',
      trackColor:      'on-surface-variant',
      trackFillColor:  'primary',
      thumbColor:      'primary',
      thumbSize:       18,
      trackSize:       4,
      elevation:       0,
    },
  },
})
