import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const { theme, toggleTheme } = useThemeStore();

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
};
