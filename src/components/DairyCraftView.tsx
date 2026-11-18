import React from 'react';
import { FarmState } from '../types/game';
import { FARM_ASSETS } from '../data/farmCatalog';

interface DairyCraftViewProps {
  state: FarmState;
  onCraftCheese: () => void;
  onOpenCheeseGame: () => void;
  onBreedCalf: () => void;
}

export const DairyCraftView: React.FC<DairyCraftViewProps> = ({
  state,
  onCraftCheese,
  onOpenCheeseGame,
  onBreedCalf,
}) => {
  const { inventory, upgrades, animals, marketPrices } = state;
  const milkCost = 4;
  const cheeseYield = upgrades.QUESERIA_ARTESANAL ? 3 : 1;
  const canCraftCheese = inventory.milkLiters >= milkCost;

  const hasHealthyCow = animals.some(
    (a) =>
      (a.species === 'VACA_LECHERA' || a.species === 'VACA_CRIOLLA') &&
      !a.isSick &&
      a.health >= 70 &&
      a.happiness >= 65
  );
  const hasHealthyBull = animals.some(
    (a) => a.species === 'TORO_SEMENTAL' && !a.isSick && a.health >= 70
  );
  const herdHasRoom = animals.length < 10;
  const canBreed = hasHealthyCow && hasHealthyBull && herdHasRoom && inventory.hayKg >= 12;

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-6 space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl overflow-hidden">
        <div className="lg:col-span-5 min-h-[260px] bg-[#3E2E21]">
          <img
            src={FARM_ASSETS.barnMarket}
            alt="Lechería y quesería artesanal del establo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-4">
          <p className="text-xs font-semibold text-[#5C402C]">
            Transformación Láctea · Crianza Responsable
          </p>
          <h1 className="font-display text-3xl font-bold text-[#1E3522]">
            Quesería y Crianza del Establo
          </h1>
          <p className="text-sm text-[#4A3D31] leading-relaxed">
            Convierte la leche fresca en queso artesanal de forma rápida o usa la prensa manual para
            obtener piezas adicionales. También puedes criar nuevos terneros cuando tu rebaño esté sano.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cheese Making */}
        <section className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-7 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[#1E3522]">
                Elaborar Queso Artesanal
              </h2>
              <span className="font-mono-nums text-xs font-semibold text-[#B57428]">
                Valor hoy: ${marketPrices.cheesePerUnit}/u
              </span>
            </div>
            <p className="text-sm text-[#4A3D31] leading-relaxed">
              Cada tanda utiliza <strong className="font-mono-nums">{milkCost} L</strong> de leche fresca
              para madurar <strong className="font-mono-nums">{cheeseYield}</strong>{' '}
              {cheeseYield === 1 ? 'queso artesanal' : 'quesos artesanales'} (o{' '}
              <strong className="text-[#2F5E39]">+1 queso extra</strong> usando la prensa manual).
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E5DDD0] text-sm">
              <div>
                <p className="text-xs text-[#5C402C]">Leche disponible</p>
                <p className="font-mono-nums text-lg font-bold text-[#1E3522]">
                  {inventory.milkLiters} L
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5C402C]">Quesos en despensa</p>
                <p className="font-mono-nums text-lg font-bold text-[#2F5E39]">
                  {inventory.cheeseUnits} u
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onCraftCheese}
              disabled={!canCraftCheese}
              className="py-3 px-4 rounded-xl bg-[#EAE3D2] border border-[#C7B9A1] text-[#1E3522] text-xs font-bold hover:bg-[#DFD5C0] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {canCraftCheese
                ? `Elaborado Rápido (+${cheeseYield} u)`
                : `Requiere ${milkCost} L Leche`}
            </button>
            <button
              type="button"
              onClick={onOpenCheeseGame}
              disabled={!canCraftCheese}
              className="py-3 px-4 rounded-xl bg-[#B57428] text-[#FAF7F0] text-xs font-bold hover:bg-[#965E1E] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Prensa Manual (+{cheeseYield + 1} u)
            </button>
          </div>
        </section>

        {/* Calf Breeding */}
        <section className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-7 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[#1E3522]">
                Crianza de Ternero
              </h2>
              <span className="font-mono-nums text-xs font-semibold text-[#2F5E39]">
                Rebaño: {animals.length}/10
              </span>
            </div>
            <p className="text-sm text-[#4A3D31] leading-relaxed">
              Si cuentas con una vaca sana, un toro semental vigoroso y <strong className="font-mono-nums">12 kg</strong>{' '}
              de heno extra para cuidados natales, puedes sumar un nuevo ternero a tu potrero sin comprarlo.
            </p>
            <ul className="space-y-1.5 text-xs pt-2 border-t border-[#E5DDD0]">
              <li className={hasHealthyCow ? 'text-[#255931] font-semibold' : 'text-[#9F2E22]'}>
                {hasHealthyCow ? '✓ Vaca adulta sana y feliz disponible' : '✗ Requiere vaca adulta con salud ≥70% y bienestar ≥65%'}
              </li>
              <li className={hasHealthyBull ? 'text-[#255931] font-semibold' : 'text-[#9F2E22]'}>
                {hasHealthyBull ? '✓ Toro semental sano disponible' : '✗ Requiere un toro semental sano (≥70%)'}
              </li>
              <li className={inventory.hayKg >= 12 ? 'text-[#255931] font-semibold' : 'text-[#9F2E22]'}>
                {inventory.hayKg >= 12 ? '✓ Reserva de heno suficiente (12 kg)' : '✗ Faltan reservas de heno (12 kg)'}
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onBreedCalf}
            disabled={!canBreed}
            className="w-full py-3 px-5 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-sm font-semibold hover:bg-[#23482B] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {herdHasRoom ? 'Registrar Nuevo Ternero (-12 kg Heno)' : 'Potrero Completo (10/10)'}
          </button>
        </section>
      </div>
    </div>
  );
};
