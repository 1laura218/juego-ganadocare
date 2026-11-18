import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { FarmState } from '../types/game';
import { ACHIEVEMENTS_CATALOG } from '../data/farmCatalog';

interface AchievementsViewProps {
  state: FarmState;
  onResetFarm: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ state, onResetFarm }) => {
  const getMetricValue = (key: (typeof ACHIEVEMENTS_CATALOG)[number]['metricKey']): number => {
    switch (key) {
      case 'totalMilkCollected':
        return Math.round(state.stats.totalMilkCollected);
      case 'totalCheeseCrafted':
        return state.stats.totalCheeseCrafted;
      case 'totalHayHarvested':
        return state.stats.totalHayHarvested;
      case 'daysCompleted':
        return state.day;
      case 'herdSize':
        return state.animals.length;
      case 'totalCoinsEarned':
        return state.stats.totalCoinsEarned;
    }
  };

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-6 space-y-8">
      {/* Farm Summary Stats */}
      <section className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1E3522]">
              Libro de Campo y Logros
            </h1>
            <p className="text-sm text-[#4A3D31] mt-1">
              Registro histórico de producción, cuidado del ganado y metas rurales alcanzadas.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetFarm}
            className="px-4 py-2.5 rounded-xl border border-[#C7B9A1] text-xs font-semibold text-[#5C402C] hover:bg-[#EAE3D2] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar Granja
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-[#E5DDD0]">
          <div>
            <p className="text-xs text-[#5C402C]">Días en la Granja</p>
            <p className="font-mono-nums text-2xl font-bold text-[#1E3522]">{state.day}</p>
          </div>
          <div>
            <p className="text-xs text-[#5C402C]">Leche Ordeñada</p>
            <p className="font-mono-nums text-2xl font-bold text-[#2F5E39]">
              {Math.round(state.stats.totalMilkCollected)} L
            </p>
          </div>
          <div>
            <p className="text-xs text-[#5C402C]">Quesos Elaborados</p>
            <p className="font-mono-nums text-2xl font-bold text-[#B57428]">
              {state.stats.totalCheeseCrafted} u
            </p>
          </div>
          <div>
            <p className="text-xs text-[#5C402C]">Heno Cosechado</p>
            <p className="font-mono-nums text-2xl font-bold text-[#5C402C]">
              {state.stats.totalHayHarvested} kg
            </p>
          </div>
          <div>
            <p className="text-xs text-[#5C402C]">Ventas Totales</p>
            <p className="font-mono-nums text-2xl font-bold text-[#1E3522]">
              ${state.stats.totalCoinsEarned}
            </p>
          </div>
        </div>
      </section>

      {/* Milestones Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACHIEVEMENTS_CATALOG.map((ach) => {
          const current = getMetricValue(ach.metricKey);
          const pct = Math.min(100, Math.round((current / ach.target) * 100));
          const completed = current >= ach.target;
          return (
            <div
              key={ach.id}
              className={`rounded-2xl p-6 border space-y-4 ${
                completed
                  ? 'bg-[#E4EDE2] border-[#9EBC9B]'
                  : 'bg-[#FAF7F0] border-[#D6CBB8]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1E3522]">{ach.title}</h2>
                  <p className="text-xs text-[#4A3D31] mt-1 leading-relaxed">{ach.description}</p>
                </div>
                {completed && <CheckCircle2 className="w-5 h-5 text-[#2F5E39] shrink-0" />}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-nums">
                  <span className="text-[#5C402C]">
                    {Math.min(current, ach.target)} / {ach.target}
                  </span>
                  <span className="font-bold text-[#1E3522]">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#DED6C6] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      completed ? 'bg-[#2F5E39]' : 'bg-[#8A5A3B]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
