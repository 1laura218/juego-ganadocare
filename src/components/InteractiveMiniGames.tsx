import React, { useEffect, useRef, useState } from 'react';
import { Milk, Award, X } from 'lucide-react';
import { Animal } from '../types/game';
import { soundEngine } from '../utils/sound';

interface MilkingChallengeModalProps {
  animal: Animal;
  onComplete: (bonusLiters: number) => void;
  onCancel: () => void;
}

export const MilkingChallengeModal: React.FC<MilkingChallengeModalProps> = ({
  animal,
  onComplete,
  onCancel,
}) => {
  const [cursor, setCursor] = useState(15);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [lastResult, setLastResult] = useState<'HIT' | 'MISS' | null>(null);
  const dirRef = useRef(1);
  const posRef = useRef(15);
  const finishedRef = useRef(false);

  const maxAttempts = 4;

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const speed = 92 + attempts * 14;
      let next = posRef.current + dirRef.current * speed * dt;
      if (next >= 96) {
        next = 96;
        dirRef.current = -1;
      } else if (next <= 4) {
        next = 4;
        dirRef.current = 1;
      }
      posRef.current = next;
      setCursor(next);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [attempts]);

  const handleTap = () => {
    if (finishedRef.current) return;
    const isHit = posRef.current >= 34 && posRef.current <= 66;
    const nextAttempts = attempts + 1;
    const nextHits = isHit ? hits + 1 : hits;

    setAttempts(nextAttempts);
    setHits(nextHits);
    setLastResult(isHit ? 'HIT' : 'MISS');

    if (isHit) {
      soundEngine.play('milk');
    } else {
      soundEngine.play('click');
    }

    if (nextAttempts >= maxAttempts) {
      finishedRef.current = true;
      window.setTimeout(() => {
        onComplete(nextHits);
      }, 420);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const baseLiters = Math.floor(animal.milkReady);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#142216]/65 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milking-game-title"
    >
      <div className="w-full max-w-md bg-[#FAF7F0] border-2 border-[#7A593E] rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={animal.portraitUrl}
              alt={animal.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-[#C7B9A1]"
            />
            <div>
              <h2 id="milking-game-title" className="font-display text-xl font-bold text-[#1E3522]">
                Ordeño de {animal.name}
              </h2>
              <p className="text-xs text-[#5C402C]">
                Base: <strong className="font-mono-nums">{baseLiters} L</strong> · Bono actual:{' '}
                <strong className="font-mono-nums text-[#2F5E39]">+{hits} L</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar ordeño manual"
            className="p-1.5 rounded-lg text-[#5C402C] hover:bg-[#EAE3D2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#4A3D31] leading-relaxed">
          Presiona <strong>Ordeñar</strong> (o la tecla <kbd className="px-1.5 py-0.5 rounded bg-[#EAE3D2] font-mono-nums">Espacio</kbd>) cuando el marcador pase por la zona verde central para llenar la cubeta con leche extra.
        </p>

        {/* Rhythm Meter */}
        <div className="space-y-2">
          <div className="relative h-9 rounded-xl bg-[#E3DAC9] border border-[#C7B9A1] overflow-hidden">
            {/* Green sweet spot 34% - 66% */}
            <div
              className="absolute top-0 bottom-0 bg-[#3B7A4B]/35 border-x-2 border-[#2F5E39]"
              style={{ left: '34%', width: '32%' }}
            />
            {/* Moving Marker */}
            <div
              className="absolute top-1 bottom-1 w-3 -ml-1.5 rounded-full bg-[#B57428] border-2 border-[#FAF7F0] shadow"
              style={{ left: `${cursor}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono-nums text-[#5C402C]">
            <span>
              Impulso: {attempts} / {maxAttempts}
            </span>
            <span>
              {lastResult === 'HIT' && (
                <strong className="text-[#255931]">+1 L Leche Extra</strong>
              )}
              {lastResult === 'MISS' && (
                <span className="text-[#8A5A3B]">Ritmo irregular</span>
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTap}
          disabled={attempts >= maxAttempts}
          className="w-full py-3.5 px-5 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-sm font-bold hover:bg-[#23482B] active:scale-[0.98] disabled:opacity-60 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Milk className="w-4 h-4" />
          {attempts >= maxAttempts
            ? `¡Ordeño Completo! +${baseLiters + hits} L`
            : 'Ordeñar Ahora'}
        </button>
      </div>
    </div>
  );
};

interface CheesePressModalProps {
  baseYield: number;
  onComplete: (bonusCheese: number) => void;
  onCancel: () => void;
}

const CHEESE_STEPS = [
  { label: 'Batir la cuajada fresca', action: 'Batir Cuajada' },
  { label: 'Prensar el molde de madera', action: 'Prensar Molde' },
  { label: 'Salar y sellar la corteza', action: 'Salar y Finalizar' },
];

export const CheesePressModal: React.FC<CheesePressModalProps> = ({
  baseYield,
  onComplete,
  onCancel,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [pressProgress, setPressProgress] = useState(0);

  const handleWorkStep = () => {
    const nextProgress = pressProgress + 34;
    if (nextProgress >= 100) {
      soundEngine.play('harvest');
      if (stepIndex + 1 >= CHEESE_STEPS.length) {
        soundEngine.play('bonus');
        onComplete(1);
        return;
      }
      setStepIndex((s) => s + 1);
      setPressProgress(0);
    } else {
      soundEngine.play('chore');
      setPressProgress(nextProgress);
    }
  };

  const currentStep = CHEESE_STEPS[stepIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#142216]/65 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheese-game-title"
    >
      <div className="w-full max-w-md bg-[#FAF7F0] border-2 border-[#7A593E] rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="cheese-game-title" className="font-display text-xl font-bold text-[#1E3522]">
              Prensa Artesanal de Queso
            </h2>
            <p className="text-xs text-[#5C402C]">
              Completa los 3 pasos manuales para obtener <strong className="text-[#2F5E39]">+1 queso extra</strong> ({baseYield + 1} en total).
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar prensa de queso"
            className="p-1.5 rounded-lg text-[#5C402C] hover:bg-[#EAE3D2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {CHEESE_STEPS.map((st, idx) => {
            const done = idx < stepIndex;
            const current = idx === stepIndex;
            return (
              <div
                key={st.label}
                className={`p-2 rounded-lg border text-center font-semibold ${
                  done
                    ? 'bg-[#E4EDE2] border-[#2F5E39] text-[#255931]'
                    : current
                    ? 'bg-[#EAE3D2] border-[#B57428] text-[#1E3522]'
                    : 'bg-[#F3EFE6] border-[#DED6C6] text-[#8A7B68]'
                }`}
              >
                Paso {idx + 1}
              </div>
            );
          })}
        </div>

        <div className="bg-[#F3EFE6] border border-[#DED6C6] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1E3522]">{currentStep.label}</span>
            <span className="font-mono-nums font-semibold text-[#B57428]">
              {Math.min(100, pressProgress)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#E3DAC9] overflow-hidden">
            <div
              className="h-full bg-[#B57428] transition-all duration-150"
              style={{ width: `${Math.min(100, pressProgress)}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleWorkStep}
          className="w-full py-3.5 px-5 rounded-xl bg-[#B57428] text-[#FAF7F0] text-sm font-bold hover:bg-[#965E1E] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          {currentStep.action} (Tocar)
        </button>
      </div>
    </div>
  );
};
