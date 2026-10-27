import { ref } from 'vue'

export type ThemeMode = 'dark' | 'light'

const THEME_STORAGE_KEY = 'radlearn_theme_mode'

// Default to 'dark' to preserve the original visual experience
const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'dark'
const currentTheme = ref<ThemeMode>(savedTheme)

function updateDom(theme: ThemeMode) {
  if (theme === 'light') {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc')
  } else {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#020617')
  }
}

// Initial apply
updateDom(currentTheme.value)

export function useTheme() {
  function applyTheme(theme: ThemeMode) {
    currentTheme.value = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    updateDom(theme)
  }

  function toggleTheme() {
    applyTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    currentTheme,
    toggleTheme,
    applyTheme
  }
}
