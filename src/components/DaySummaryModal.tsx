import React from 'react';
import { DaySummaryData } from '../types/game';
import { SEASON_LABELS, WEATHER_LABELS } from '../data/farmCatalog';

interface DaySummaryModalProps {
  summary: DaySummaryData;
  onContinue: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({ summary, onContinue }) => {
  const weatherMeta = WEATHER_LABELS[summary.newWeather];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#142216]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-summary-title"
    >
      <div className="w-full max-w-lg bg-[#FAF7F0] border border-[#C7B9A1] rounded-2xl p-7 space-y-5 shadow-xl">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#5C402C]">
            Cierre del Día {summary.previousDay}
          </p>
          <h2 id="day-summary-title" className="font-display text-2xl font-bold text-[#1E3522]">
            Amanece el Día {summary.newDay} · {SEASON_LABELS[summary.newSeason]}
          </h2>
          <p className="text-xs text-[#2F5E39] font-medium">
            Clima de hoy: {weatherMeta.label} — {weatherMeta.effectHint}
          </p>
        </div>

        <div className="bg-[#F3EFE6] border border-[#DED6C6] rounded-xl p-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#4A3D31]">Leche generada por vacas nutridas</span>
            <span className="font-mono-nums font-bold text-[#2F5E39]">
              +{summary.milkProducedPotential.toFixed(1)} L en ubres
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#4A3D31]">Crecimiento de alfalfa</span>
            <span className="font-mono-nums font-bold text-[#2F5E39]">
              +{summary.forageGrown}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#4A3D31]">Abono orgánico recolectado</span>
            <span className="font-mono-nums font-bold text-[#5C402C]">
              +{summary.compostCollected} saco(s)
            </span>
          </div>
          {summary.calvesGrown.length > 0 && (
            <div className="pt-2 border-t border-[#DED6C6] text-xs font-semibold text-[#255931]">
              Crecimiento: {summary.calvesGrown.join(', ')} alcanzó la etapa adulta.
            </div>
          )}
          {summary.sickAnimals.length > 0 && (
            <div className="pt-2 border-t border-[#DED6C6] text-xs font-semibold text-[#9F2E22]">
              Alerta veterinaria: {summary.sickAnimals.join(', ')} necesita atención médica.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3 px-5 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-sm font-semibold hover:bg-[#23482B] transition-colors cursor-pointer"
        >
          Comenzar Jornada
        </button>
      </div>
    </div>
  );
};
