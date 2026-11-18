import React from 'react';
import { FarmState } from '../types/game';

interface GameOverModalProps {
  state: FarmState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onRestart }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#142216]/70 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#C7B9A1] rounded-2xl p-7 space-y-5 shadow-xl">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#9F2E22]">Fin del ciclo de granja</p>
          <h2 id="gameover-title" className="font-display text-2xl font-bold text-[#1E3522]">
            El corral ha quedado vacío
          </h2>
          <p className="text-sm text-[#4A3D31] leading-relaxed">
            La falta prolongada de hidratación, alimento o cuidados veterinarios afectó a tu último animal
            en el Día {state.day}.
          </p>
        </div>

        <div className="bg-[#F3EFE6] border border-[#DED6C6] rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[#5C402C]">Días Sobrevividos</p>
            <p className="font-mono-nums text-lg font-bold text-[#1E3522]">{state.day}</p>
          </div>
          <div>
            <p className="text-[#5C402C]">Leche Recolectada</p>
            <p className="font-mono-nums text-lg font-bold text-[#2F5E39]">
              {Math.round(state.stats.totalMilkCollected)} L
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 px-5 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-sm font-semibold hover:bg-[#23482B] transition-colors cursor-pointer"
        >
          Jugar de Nuevo
        </button>
      </div>
    </div>
  );
};
