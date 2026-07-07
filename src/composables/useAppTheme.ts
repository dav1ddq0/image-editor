import { computed } from 'vue'
import { useTheme } from 'vuetify'

const STORAGE_KEY = 'image-editor-theme'
const THEME_COLOR: Record<'light' | 'dark', string> = {
  dark:  '#16213e',
  light: '#ffffff',
}

function syncThemeColorMeta(name: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return

  document.querySelectorAll('meta[name="theme-color"]').forEach((el, i) => {
    if (i === 0) {
      el.removeAttribute('media')
      el.setAttribute('content', THEME_COLOR[name])
    } else {
      el.remove()
    }
  })
}

export function useAppTheme() {
  const theme = useTheme()

  // Apply a previously saved preference once
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (saved === 'light' || saved === 'dark') {
    theme.change(saved)
    syncThemeColorMeta(saved)
  }

  const isDark = computed(() => theme.name.value === 'dark')

  function toggle(): void {
    const next = isDark.value ? 'light' : 'dark'
    theme.change(next)
    syncThemeColorMeta(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-mode / storage-disabled browsers: theme still works for the session.
    }
  }

  return { isDark, toggle }
}
