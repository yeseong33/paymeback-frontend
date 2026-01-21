import { create } from 'zustand';

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// 초기 테마 결정 (기본값: dark)
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;

  // 저장된 테마가 없으면 기본값 dark 사용
  return 'dark';
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  initialize: () => {
    const theme = get().theme;
    applyTheme(theme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    set({ theme: newTheme });
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  },

  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  },
}));

// 앱 시작 시 테마 적용
if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
}
