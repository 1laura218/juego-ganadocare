import React from 'react';
import { Sprout, Droplets, HeartPulse, Store } from 'lucide-react';
import { DifficultyMode } from '../types/game';
import { FARM_ASSETS } from '../data/farmCatalog';

interface TitleMenuProps {
  selectedDifficulty: DifficultyMode;
  onSelectDifficulty: (mode: DifficultyMode) => void;
  hasSavedGame: boolean;
  savedDay: number | null;
  onStartNewGame: () => void;
  onContinueGame: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  hasSavedGame,
  savedDay,
  onStartNewGame,
  onContinueGame,
}) => {
  return (
    <main className="max-w-[1320px] mx-auto px-6 py-8 md:py-12">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl overflow-hidden">
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-wide text-[#5C402C]">
              Simulación rural · Cuidado animal · Producción láctea
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1E3522] leading-[1.12] [text-wrap:balance]">
              Cuida tu rebaño y haz florecer tu granja en armonía con la tierra.
            </h1>
            <p className="text-base text-[#3E3226] leading-relaxed max-w-xl">
              En <strong className="font-semibold text-[#1E3522]">Ganado Care</strong> administras un
              potrero vivo en tonos de pradera y tierra fértil. Cultiva alfalfa, bombea agua fresca del pozo,
              alimenta y cepilla a tus vacas, elabora queso artesanal y haz crecer un rebaño sano a lo largo de
              las estaciones.
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-[#1E3522]">
                Modo de granja
              </span>
              <div className="inline-flex p-1 rounded-xl bg-[#EAE3D2] border border-[#D6CBB8] gap-1">
                <button
                  type="button"
                  onClick={() => onSelectDifficulty('ESTANDAR')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedDifficulty === 'ESTANDAR'
                      ? 'bg-[#2F5E39] text-[#FAF7F0]'
                      : 'text-[#5C402C] hover:text-[#1E3522]'
                  }`}
                >
                  Estándar
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDifficulty('DESAFIO')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedDifficulty === 'DESAFIO'
                      ? 'bg-[#5C402C] text-[#FAF7F0]'
                      : 'text-[#5C402C] hover:text-[#1E3522]'
                  }`}
                >
                  Desafío Estacional
                </button>
              </div>
              <p className="text-xs text-[#5C402C]/85">
                {selectedDifficulty === 'ESTANDAR'
                  ? 'Comienzas con $280, buenas reservas de heno y agua para aprender a tu ritmo.'
                  : 'Comienzas con $180 y reservas ajustadas; el clima seco exige atención precisa.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {hasSavedGame && (
                <button
                  type="button"
                  onClick={onContinueGame}
                  className="px-6 py-3 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-sm font-semibold hover:bg-[#23482B] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Continuar Granja (Día {savedDay})
                </button>
              )}
              <button
                type="button"
                onClick={onStartNewGame}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  hasSavedGame
                    ? 'bg-[#EAE3D2] text-[#1E3522] border border-[#C7B9A1] hover:bg-[#DFD5C0]'
                    : 'bg-[#2F5E39] text-[#FAF7F0] hover:bg-[#23482B]'
                }`}
              >
                {hasSavedGame ? 'Iniciar Nueva Granja' : 'Iniciar Granja'}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="lg:col-span-6 relative min-h-[340px] lg:min-h-[480px] bg-[#2F4B32]">
          <img
            src={FARM_ASSETS.pastureBg}
            alt="Vista panorámica del potrero y establo de Ganado Care en tonos verde y tierra"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#162619]/85 via-[#162619]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-[#FAF7F0]">
            <p className="text-xs font-medium text-[#DDE8D8] mb-1">
              Pradera Central · Establo Familiar
            </p>
            <p className="font-display text-xl font-semibold">
              Tres cabezas iniciales listas para pastoreo, ordeño y crianza.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Column Rules & Mechanics Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-xl p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#E4EDE2] text-[#2F5E39] flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#1E3522]">1. Cultiva tu Forraje</h2>
          <p className="text-sm text-[#4A3D31] leading-relaxed">
            Riega y abona la parcela de alfalfa para cosechar heno fresco sin gastar monedas en el mercado.
          </p>
        </div>

        <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-xl p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#EAE1D3] text-[#5C402C] flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#1E3522]">2. Hidrata y Cuida</h2>
          <p className="text-sm text-[#4A3D31] leading-relaxed">
            Extrae agua del pozo, alimenta, cepilla y vigila la salud de cada vaca, ternero y toro.
          </p>
        </div>

        <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-xl p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#E4EDE2] text-[#2F5E39] flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#1E3522]">3. Ordeña y Elabora</h2>
          <p className="text-sm text-[#4A3D31] leading-relaxed">
            Recoge leche fresca de tus vacas y transfórmala en queso artesanal de mayor valor en la quesería.
          </p>
        </div>

        <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-xl p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#EAE1D3] text-[#8A5A3B] flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#1E3522]">4. Mejora la Granja</h2>
          <p className="text-sm text-[#4A3D31] leading-relaxed">
            Aprovecha los precios del mercado rural para ampliar tu corral e instalar bebederos y riego.
          </p>
        </div>
      </section>
    </main>
  );
};
