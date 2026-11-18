import React from 'react';
import { ActiveTab, GamePhase } from '../types/game';

interface TopBarProps {
  phase: GamePhase;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onAdvanceDay: () => void;
  onReturnToMenu: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'POTRERO', label: 'Potrero' },
  { id: 'MERCADO', label: 'Mercado' },
  { id: 'QUESERIA', label: 'Quesería' },
  { id: 'LOGROS', label: 'Logros' },
];

export const TopBar: React.FC<TopBarProps> = ({
  phase,
  activeTab,
  onSelectTab,
  onAdvanceDay,
  onReturnToMenu,
}) => {
  const isPlaying = phase === 'PLAYING' || phase === 'PAUSED' || phase === 'DAY_SUMMARY';

  return (
    <header className="w-full bg-[#FAF7F0] border-b border-[#D6CBB8]">
      <div className="max-w-[1380px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={onReturnToMenu}
          className="font-display text-2xl font-bold tracking-tight text-[#1E3522] hover:text-[#2F5E39] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2F5E39]"
        >
          Ganado Care
        </button>

        {/* Zone 2: Clean single-line navigation */}
        <nav className="flex items-center gap-6 overflow-x-auto" aria-label="Navegación principal">
          {isPlaying &&
            NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2F5E39] ${
                    active
                      ? 'text-[#1E3522] border-[#2F5E39]'
                      : 'text-[#5C402C]/75 border-transparent hover:text-[#1E3522] hover:border-[#8A5A3B]/40'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          {isPlaying ? (
            <button
              type="button"
              onClick={onAdvanceDay}
              className="px-5 py-2.5 rounded-lg bg-[#2F5E39] text-[#FAF7F0] text-sm font-semibold hover:bg-[#23482B] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3522]"
            >
              Avanzar Día
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTab('POTRERO')}
              className="px-5 py-2.5 rounded-lg bg-[#5C402C] text-[#FAF7F0] text-sm font-semibold hover:bg-[#493221] transition-colors whitespace-nowrap shrink-0 cursor-pointer opacity-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            >
              Inicio
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
