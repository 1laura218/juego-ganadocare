import React from 'react';
import { Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimalSpecies, FarmState, UpgradeId } from '../types/game';
import { FARM_ASSETS, SPECIES_CONFIG, UPGRADE_CATALOG } from '../data/farmCatalog';

interface MarketViewProps {
  state: FarmState;
  onBuySupply: (type: 'HAY' | 'WATER' | 'MEDICINE' | 'COMPOST') => void;
  onBuyAnimal: (species: AnimalSpecies) => void;
  onSellProduct: (product: 'MILK' | 'CHEESE' | 'COMPOST', sellAll: boolean) => void;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  state,
  onBuySupply,
  onBuyAnimal,
  onSellProduct,
  onBuyUpgrade,
}) => {
  const { inventory, marketPrices, upgrades } = state;

  const TrendIcon =
    marketPrices.trendLabel === 'Alza'
      ? TrendingUp
      : marketPrices.trendLabel === 'Baja'
      ? TrendingDown
      : Minus;

  const herdFull = state.animals.length >= 10;

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-6 space-y-8">
      {/* Market Banner Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl overflow-hidden">
        <div className="lg:col-span-7 p-8 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5C402C]">
              <span>Plaza Rural</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#2F5E39]">
                <TrendIcon className="w-3.5 h-3.5" />
                Demanda de hoy: {marketPrices.trendLabel}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#1E3522]">
              Mercado de la Granja
            </h1>
            <p className="text-sm text-[#4A3D31] leading-relaxed max-w-2xl">
              Vende la leche fresca, el queso artesanal y el abono orgánico de tu granja. Invierte tus
              monedas en nuevas cabezas de ganado, suministros veterinarios y mejoras permanentes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#E5DDD0]">
            <div>
              <p className="text-xs text-[#5C402C]">Tu Capital</p>
              <p className="font-mono-nums text-xl font-bold text-[#1E3522]">${inventory.coins}</p>
            </div>
            <div>
              <p className="text-xs text-[#5C402C]">Leche ({marketPrices.milkPerLiter}$/L)</p>
              <p className="font-mono-nums text-xl font-bold text-[#2F5E39]">{inventory.milkLiters} L</p>
            </div>
            <div>
              <p className="text-xs text-[#5C402C]">Queso ({marketPrices.cheesePerUnit}$/u)</p>
              <p className="font-mono-nums text-xl font-bold text-[#B57428]">{inventory.cheeseUnits} u</p>
            </div>
            <div>
              <p className="text-xs text-[#5C402C]">Rebaño Actual</p>
              <p className="font-mono-nums text-xl font-bold text-[#1E3522]">{state.animals.length} / 10</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 min-h-[220px] bg-[#3E2E21]">
          <img
            src={FARM_ASSETS.barnMarket}
            alt="Granero y puesto rural de venta de lácteos y forraje"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Sell Farm Products & Buy Supplies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sell Column */}
        <section className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#1E3522]">Vender Producción</h2>
            <span className="text-xs text-[#5C402C] font-mono-nums">
              Precio del Día {state.day}
            </span>
          </div>

          <div className="divide-y divide-[#E5DDD0]">
            {/* Milk */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Leche Fresca</p>
                <p className="text-xs text-[#5C402C]">
                  Tienes <span className="font-mono-nums font-semibold">{inventory.milkLiters} L</span> · Precio:{' '}
                  <span className="font-mono-nums font-semibold">${marketPrices.milkPerLiter}/L</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSellProduct('MILK', false)}
                  disabled={inventory.milkLiters < 1}
                  className="px-3 py-2 rounded-lg bg-[#EAE3D2] text-xs font-semibold text-[#1E3522] hover:bg-[#DFD5C0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Vender 1 L
                </button>
                <button
                  type="button"
                  onClick={() => onSellProduct('MILK', true)}
                  disabled={inventory.milkLiters < 1}
                  className="px-3.5 py-2 rounded-lg bg-[#2F5E39] text-xs font-semibold text-[#FAF7F0] hover:bg-[#23482B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Vender Todo (+${inventory.milkLiters * marketPrices.milkPerLiter})
                </button>
              </div>
            </div>

            {/* Cheese */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Queso Artesanal</p>
                <p className="text-xs text-[#5C402C]">
                  Tienes <span className="font-mono-nums font-semibold">{inventory.cheeseUnits} u</span> · Precio:{' '}
                  <span className="font-mono-nums font-semibold">${marketPrices.cheesePerUnit}/u</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSellProduct('CHEESE', false)}
                  disabled={inventory.cheeseUnits < 1}
                  className="px-3 py-2 rounded-lg bg-[#EAE3D2] text-xs font-semibold text-[#1E3522] hover:bg-[#DFD5C0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Vender 1 u
                </button>
                <button
                  type="button"
                  onClick={() => onSellProduct('CHEESE', true)}
                  disabled={inventory.cheeseUnits < 1}
                  className="px-3.5 py-2 rounded-lg bg-[#B57428] text-xs font-semibold text-[#FAF7F0] hover:bg-[#965E1E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Vender Todo (+${inventory.cheeseUnits * marketPrices.cheesePerUnit})
                </button>
              </div>
            </div>

            {/* Compost */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Sacos de Abono Orgánico</p>
                <p className="text-xs text-[#5C402C]">
                  Tienes <span className="font-mono-nums font-semibold">{inventory.compostBags}</span> sacos · Precio:{' '}
                  <span className="font-mono-nums font-semibold">${marketPrices.compostPerBag}/u</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSellProduct('COMPOST', true)}
                  disabled={inventory.compostBags < 1}
                  className="px-3.5 py-2 rounded-lg bg-[#5C402C] text-xs font-semibold text-[#FAF7F0] hover:bg-[#473121] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Vender Todo (+${inventory.compostBags * marketPrices.compostPerBag})
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Buy Supplies Column */}
        <section className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#1E3522]">Comprar Suministros</h2>
          <div className="divide-y divide-[#E5DDD0]">
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Fardo de Heno (+25 kg)</p>
                <p className="text-xs text-[#5C402C]">Reserva actual: {inventory.hayKg} kg</p>
              </div>
              <button
                type="button"
                onClick={() => onBuySupply('HAY')}
                disabled={inventory.coins < marketPrices.hayBundlePrice}
                className="px-4 py-2 rounded-lg bg-[#2F5E39] text-xs font-semibold text-[#FAF7F0] hover:bg-[#23482B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap font-mono-nums"
              >
                Comprar ${marketPrices.hayBundlePrice}
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Cisterna de Agua (+30 L)</p>
                <p className="text-xs text-[#5C402C]">Reserva actual: {inventory.waterLiters} L</p>
              </div>
              <button
                type="button"
                onClick={() => onBuySupply('WATER')}
                disabled={inventory.coins < marketPrices.waterRefillPrice}
                className="px-4 py-2 rounded-lg bg-[#2F5E39] text-xs font-semibold text-[#FAF7F0] hover:bg-[#23482B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap font-mono-nums"
              >
                Comprar ${marketPrices.waterRefillPrice}
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Botiquín Veterinario (+1 Medicina)</p>
                <p className="text-xs text-[#5C402C]">En reserva: {inventory.medicineCount} unidades</p>
              </div>
              <button
                type="button"
                onClick={() => onBuySupply('MEDICINE')}
                disabled={inventory.coins < marketPrices.medicinePrice}
                className="px-4 py-2 rounded-lg bg-[#5C402C] text-xs font-semibold text-[#FAF7F0] hover:bg-[#473121] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap font-mono-nums"
              >
                Comprar ${marketPrices.medicinePrice}
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1E3522]">Abono Fértil (+2 Sacos)</p>
                <p className="text-xs text-[#5C402C]">Acelera el crecimiento de la alfalfa</p>
              </div>
              <button
                type="button"
                onClick={() => onBuySupply('COMPOST')}
                disabled={inventory.coins < 26}
                className="px-4 py-2 rounded-lg bg-[#5C402C] text-xs font-semibold text-[#FAF7F0] hover:bg-[#473121] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap font-mono-nums"
              >
                Comprar $26
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Buy Livestock */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#1E3522]">Adquirir Ganado</h2>
          <span className="text-xs text-[#5C402C]">
            Capacidad del potrero: <strong className="font-mono-nums">{state.animals.length}/10</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Object.keys(SPECIES_CONFIG) as AnimalSpecies[]).map((speciesKey) => {
            const cfg = SPECIES_CONFIG[speciesKey];
            const canAfford = inventory.coins >= cfg.buyPrice;
            return (
              <div
                key={speciesKey}
                className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#EAE3D2] border border-[#D6CBB8]">
                    <img
                      src={cfg.portraitUrl}
                      alt={cfg.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#1E3522]">{cfg.label}</h3>
                    <p className="text-xs text-[#4A3D31] leading-relaxed mt-1">{cfg.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBuyAnimal(speciesKey)}
                  disabled={!canAfford || herdFull}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-xs font-semibold hover:bg-[#23482B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-mono-nums"
                >
                  {herdFull ? 'Potrero Lleno' : `Comprar · $${cfg.buyPrice}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Farm Upgrades */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#1E3522]">Mejoras de la Granja</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(Object.keys(UPGRADE_CATALOG) as UpgradeId[]).map((upgId) => {
            const upg = UPGRADE_CATALOG[upgId];
            const owned = upgrades[upgId];
            const canAfford = inventory.coins >= upg.cost;
            return (
              <div
                key={upgId}
                className={`rounded-2xl p-6 border flex items-center justify-between gap-5 ${
                  owned
                    ? 'bg-[#E4EDE2] border-[#9EBC9B]'
                    : 'bg-[#FAF7F0] border-[#D6CBB8]'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-[#1E3522]">{upg.title}</h3>
                  <p className="text-xs text-[#4A3D31] leading-relaxed">{upg.effectSummary}</p>
                </div>
                {owned ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#255931] shrink-0 whitespace-nowrap">
                    <Check className="w-4 h-4" />
                    Instalado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onBuyUpgrade(upgId)}
                    disabled={!canAfford}
                    className="px-4 py-2.5 rounded-xl bg-[#5C402C] text-[#FAF7F0] text-xs font-semibold hover:bg-[#473121] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 font-mono-nums whitespace-nowrap"
                  >
                    Instalar · ${upg.cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
