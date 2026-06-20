import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, History, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenHistory }) => {
  const { isDarkMode, setIsDarkMode } = useApp();

  return (
    <header id="appHeader" className="flex items-center justify-between pb-2 md:pb-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand-500/20 font-display">
          Ω
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-100 dark:to-brand-500 bg-clip-text text-transparent font-display align-middle flex items-center gap-1.5">
            OMOΓΛИФ
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300">
              PRO
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* История генераций */}
        <button
          id="openHistoryBtn"
          onClick={onOpenHistory}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label="История генераций"
          title="История генераций"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Смена темы */}
        <button
          id="themeToggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label="Смена темы"
          title="Смена темы"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Открытие настроек */}
        <button
          id="openModalBtn"
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
          aria-label="Настройки"
          title="Настройки"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
