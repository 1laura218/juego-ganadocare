import React, { useState } from 'react';
import {
  Droplets,
  Wheat,
  Sparkles,
  Milk,
  Cross,
  MousePointerClick,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Sun,
  CloudRain,
  Wind,
  ThermometerSun,
  AlertTriangle,
  Leaf,
  Bell,
  Hammer,
  Flower2,
  PackageCheck,
  Sprout,
} from 'lucide-react';
import {
  Animal,
  CareTool,
  FarmState,
  FloatingFeedback,
  PastureItemKind,
  WeatherType,
} from '../types/game';
import {
  FARM_ASSETS,
  PASTURE_ITEM_CONFIG,
  SEASON_LABELS,
  SPECIES_CONFIG,
  WEATHER_LABELS,
  calculateAnimalSellPrice,
  getHealthStatusLabel,
} from '../data/farmCatalog';

interface FarmPastureViewProps {
  state: FarmState;
  autoTick: boolean;
  isMuted: boolean;
  feedbacks: FloatingFeedback[];
  onToggleAutoTick: () => void;
  onToggleMute: () => void;
  onSelectTool: (tool: CareTool) => void;
  onAnimalClick: (animalId: string) => void;
  onDropToolOnAnimal: (animalId: string, tool: Exclude<CareTool, 'INSPECCIONAR'>) => void;
  onCareAction: (animalId: string, action: Exclude<CareTool, 'INSPECCIONAR'>) => void;
  onOpenMilkingGame: (animalId: string) => void;
  onFeedAll: () => void;
  onWaterAll: () => void;
  onMilkAll: () => void;
  onGrazeAll: () => void;
  onRingBell: () => void;
  onCollectPastureItem: (itemId: string) => void;
  onFulfillOrder: (orderId: string) => void;
  onSellAnimal: (animalId: string) => void;
  onPumpWell: () => void;
  onManualPumpWell: () => void;
  onWaterForage: () => void;
  onFertilizeForage: () => void;
  onHarvestForage: () => void;
}

const TOOL_BUTTONS: {
  id: CareTool;
  label: string;
  shortcut: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'INSPECCIONAR', label: 'Inspeccionar', shortcut: '1', icon: MousePointerClick },
  { id: 'ALIMENTAR', label: 'Dar Heno', shortcut: '2', icon: Wheat },
  { id: 'HIDRATAR', label: 'Dar Agua', shortcut: '3', icon: Droplets },
  { id: 'CEPILLAR', label: 'Cepillar', shortcut: '4', icon: Sparkles },
  { id: 'ORDENAR', label: 'Ordeñar', shortcut: '5', icon: Milk },
  { id: 'CURAR', label: 'Curar', shortcut: '6', icon: Cross },
];

const WeatherIcon: React.FC<{ weather: WeatherType; className?: string }> = ({
  weather,
  className = 'w-4 h-4',
}) => {
  switch (weather) {
    case 'SOLEADO':
      return <Sun className={className} />;
    case 'LLUVIA_SUAVE':
      return <CloudRain className={className} />;
    case 'SECO':
      return <ThermometerSun className={className} />;
    case 'FRESCO':
      return <Wind className={className} />;
  }
};

const PastureItemIcon: React.FC<{ kind: PastureItemKind; className?: string }> = ({
  kind,
  className = 'w-4 h-4',
}) => {
  switch (kind) {
    case 'TREBOL':
      return <Sprout className={className} />;
    case 'ABONO':
      return <Leaf className={className} />;
    case 'CERCA_FLOJA':
      return <Hammer className={className} />;
    case 'HIERBA_CURATIVA':
      return <Flower2 className={className} />;
  }
};

const MeterRow: React.FC<{
  label: string;
  value: number;
  fillClass: string;
}> = ({ label, value, fillClass }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#3E3226]">{label}</span>
        <span className="font-mono-nums font-semibold text-[#1E3522]">{clamped}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[#E5DDD0] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${fillClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export const FarmPastureView: React.FC<FarmPastureViewProps> = ({
  state,
  autoTick,
  isMuted,
  feedbacks,
  onToggleAutoTick,
  onToggleMute,
  onSelectTool,
  onAnimalClick,
  onDropToolOnAnimal,
  onCareAction,
  onOpenMilkingGame,
  onFeedAll,
  onWaterAll,
  onMilkAll,
  onGrazeAll,
  onRingBell,
  onCollectPastureItem,
  onFulfillOrder,
  onSellAnimal,
  onPumpWell,
  onManualPumpWell,
  onWaterForage,
  onFertilizeForage,
  onHarvestForage,
}) => {
  const [dragOverAnimalId, setDragOverAnimalId] = useState<string | null>(null);

  const selectedAnimal: Animal | undefined =
    state.animals.find((a) => a.id === state.selectedAnimalId) ?? state.animals[0];

  const weatherMeta = WEATHER_LABELS[state.weather];

  const hungryCount = state.animals.filter((a) => a.hunger < 85).length;
  const thirstyCount = state.animals.filter((a) => a.thirst < 85).length;
  const milkReadyCount = state.animals.filter((a) => a.milkReady >= 1).length;
  const canGrazeCount = state.animals.filter((a) => !a.grazedToday).length;

  const canFulfillOrder = (itemType: FarmState['orders'][number]['itemType'], qty: number) => {
    switch (itemType) {
      case 'MILK':
        return state.inventory.milkLiters >= qty;
      case 'CHEESE':
        return state.inventory.cheeseUnits >= qty;
      case 'COMPOST':
        return state.inventory.compostBags >= qty;
      case 'HAY':
        return state.inventory.hayKg >= qty;
    }
  };

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-6 space-y-5">
      {/* Resource & Weather Strip */}
      <section
        aria-label="Resumen de granja y recursos"
        className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#3E3226]">
          <span className="font-display font-bold text-base text-[#1E3522] font-mono-nums">
            Día {state.day}
          </span>
          <span aria-hidden="true" className="text-[#A89A82]">·</span>
          <span className="font-medium text-[#2F5E39]">{SEASON_LABELS[state.season]}</span>
          <span aria-hidden="true" className="text-[#A89A82]">·</span>
          <span
            className="inline-flex items-center gap-1.5 font-medium text-[#5C402C]"
            title={weatherMeta.effectHint}
          >
            <WeatherIcon weather={state.weather} className="w-4 h-4 text-[#8A5A3B]" />
            {weatherMeta.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5C402C]">Monedas:</span>
            <span className="font-mono-nums font-semibold text-[#1E3522]">
              ${state.inventory.coins}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5C402C]">Heno:</span>
            <span
              className={`font-mono-nums font-semibold ${
                state.inventory.hayKg < 10 ? 'text-[#9F2E22]' : 'text-[#2F5E39]'
              }`}
            >
              {state.inventory.hayKg} kg
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5C402C]">Agua:</span>
            <span
              className={`font-mono-nums font-semibold ${
                state.inventory.waterLiters < 10 ? 'text-[#9F2E22]' : 'text-[#2F5E39]'
              }`}
            >
              {state.inventory.waterLiters} L
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5C402C]">Leche:</span>
            <span className="font-mono-nums font-semibold text-[#1E3522]">
              {state.inventory.milkLiters} L
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5C402C]">Queso:</span>
            <span className="font-mono-nums font-semibold text-[#1E3522]">
              {state.inventory.cheeseUnits} u
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5C402C]">Medicina:</span>
            <span className="font-mono-nums font-semibold text-[#1E3522]">
              {state.inventory.medicineCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAutoTick}
            title="Activar o pausar desgaste gradual en tiempo real"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap cursor-pointer ${
              autoTick
                ? 'bg-[#E4EDE2] border-[#9EBC9B] text-[#1E3522]'
                : 'bg-[#EAE3D2] border-[#C7B9A1] text-[#5C402C]'
            }`}
          >
            {autoTick ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoTick ? 'Ciclo Activo' : 'Pausado'}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-2 rounded-lg bg-[#EAE3D2] border border-[#D6CBB8] text-[#5C402C] hover:text-[#1E3522] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Main 2-Column Interactive Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Primary Interactive Farm Pasture Canvas */}
        <section className="xl:col-span-8 space-y-3.5">
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#7A593E] bg-[#2D4B30] aspect-[16/10] min-h-[430px]">
            <img
              src={FARM_ASSETS.pastureBg}
              alt="Campo de la granja Ganado Care con establo, cultivo de heno y corral"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />

            {/* Weather Atmosphere Layer */}
            {state.weather === 'SECO' && (
              <div className="absolute inset-0 bg-[#A26823]/15 pointer-events-none" />
            )}
            {state.weather === 'LLUVIA_SUAVE' && (
              <div className="absolute inset-0 bg-[#1B3326]/20 pointer-events-none overflow-hidden">
                <div className="grid grid-cols-12 gap-8 h-full opacity-40">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-px h-16 bg-[#D6E8DB] animate-rain-fall mx-auto"
                      style={{ animationDelay: `${(idx % 4) * 0.22}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Zone 1: Water Well (Top Left) */}
            <div className="absolute top-3.5 left-3.5 bg-[#FAF7F0]/95 border border-[#8A5A3B]/65 rounded-xl p-3 w-60 shadow-sm z-20">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#1E3522] flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#2F5E39]" />
                  Pozo de Agua
                </span>
                <span className="font-mono-nums text-xs font-semibold text-[#5C402C]">
                  {Math.round(state.wellCharge)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E3DAC9] overflow-hidden mb-2.5">
                <div
                  className="h-full bg-[#3A7D56] transition-all duration-150"
                  style={{ width: `${state.wellCharge}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onPumpWell}
                  disabled={state.wellCharge < 30}
                  className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-[#2F5E39] text-[#FAF7F0] hover:bg-[#23482B] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Extraer +25 L
                </button>
                <button
                  type="button"
                  onClick={onManualPumpWell}
                  disabled={state.wellCharge >= 100}
                  title="Bombear manija manualmente para recargar el pozo rápido"
                  className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-[#EAE3D2] border border-[#C7B9A1] text-[#1E3522] hover:bg-[#DFD5C0] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Bombear
                </button>
              </div>
            </div>

            {/* Interactive Zone 2: Barn Bell (Top Right) */}
            <div className="absolute top-3.5 right-3.5 z-20">
              <button
                type="button"
                onClick={onRingBell}
                title="Tocar la campana del establo para reunir al rebaño en el corral"
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F0]/95 border border-[#8A5A3B]/65 text-xs font-bold text-[#1E3522] hover:bg-[#EAE3D2] active:scale-[0.97] transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Bell className="w-3.5 h-3.5 text-[#B57428]" />
                Llamar Rebaño
              </button>
            </div>

            {/* Interactive Zone 3: Alfalfa / Forage Crop Plot (Bottom Left) */}
            <div className="absolute bottom-3.5 left-3.5 bg-[#FAF7F0]/95 border border-[#8A5A3B]/65 rounded-xl p-3.5 w-64 shadow-sm z-20">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#1E3522] flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-[#2F5E39]" />
                  Cultivo de Alfalfa
                </span>
                <span className="font-mono-nums text-xs font-semibold text-[#2F5E39]">
                  {Math.round(state.forageField.growth)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E3DAC9] overflow-hidden mb-2">
                <div
                  className="h-full bg-[#4A8B4F] transition-all duration-200"
                  style={{ width: `${Math.min(100, state.forageField.growth)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#5C402C] mb-2.5 font-mono-nums">
                Humedad: {Math.round(state.forageField.moisture)}%
                {state.forageField.fertilized ? ' · Abonado' : ''}
              </p>
              <div className="flex items-center gap-1.5">
                {state.forageField.growth >= 100 ? (
                  <button
                    type="button"
                    onClick={onHarvestForage}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#B57428] text-[#FAF7F0] hover:bg-[#965E1E] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cosechar +28 kg Heno
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onWaterForage}
                      disabled={state.inventory.waterLiters < 10 || state.forageField.moisture >= 98}
                      className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#2F5E39] text-[#FAF7F0] hover:bg-[#23482B] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Regar (-10L)
                    </button>
                    <button
                      type="button"
                      onClick={onFertilizeForage}
                      disabled={state.inventory.compostBags < 1 || state.forageField.fertilized}
                      className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#5C402C] text-[#FAF7F0] hover:bg-[#463020] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Abonar ({state.inventory.compostBags})
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Collectible Pasture Items / Field Chores */}
            {state.pastureItems.map((item) => {
              const cfg = PASTURE_ITEM_CONFIG[item.kind];
              const isChore = item.kind === 'CERCA_FLOJA' || item.kind === 'ABONO';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCollectPastureItem(item.id)}
                  title={cfg.actionHint}
                  style={{ left: `${item.xPercent}%`, top: `${item.yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold shadow-md hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isChore
                      ? 'bg-[#EAE3D2]/95 border-[#8A5A3B] text-[#5C402C]'
                      : 'bg-[#E4EDE2]/95 border-[#2F5E39] text-[#1E3522]'
                  }`}
                >
                  <PastureItemIcon kind={item.kind} className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}

            {/* Interactive Roaming Animals (supports Click + Drag-and-Drop tools) */}
            {state.animals.map((animal, idx) => {
              const isSelected = selectedAnimal?.id === animal.id;
              const isDragTarget = dragOverAnimalId === animal.id;
              const needsUrgentCare =
                animal.isSick || animal.hunger < 35 || animal.thirst < 35 || animal.health < 50;

              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => onAnimalClick(animal.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverAnimalId !== animal.id) {
                      setDragOverAnimalId(animal.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverAnimalId === animal.id) {
                      setDragOverAnimalId(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverAnimalId(null);
                    const tool = e.dataTransfer.getData('text/care-tool') as CareTool | '';
                    if (tool && tool !== 'INSPECCIONAR') {
                      onDropToolOnAnimal(animal.id, tool);
                    }
                  }}
                  style={{
                    left: `${animal.xPercent}%`,
                    top: `${animal.yPercent}%`,
                    animationDelay: `${idx * 0.45}s`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FAF7F0] animate-gentle-bob transition-[left,top,transform] duration-[2200ms] ease-in-out ${
                    isDragTarget
                      ? 'scale-110 z-30'
                      : isSelected
                      ? 'scale-105 z-20'
                      : 'hover:scale-105 z-10'
                  }`}
                >
                  <div
                    className={`relative rounded-xl p-1.5 bg-[#FAF7F0]/95 border-2 transition-colors ${
                      isDragTarget
                        ? 'border-[#B57428] ring-4 ring-[#B57428]/35 shadow-xl'
                        : isSelected
                        ? 'border-[#2F5E39] shadow-lg'
                        : needsUrgentCare
                        ? 'border-[#9F2E22] shadow-md'
                        : 'border-[#7A593E] shadow-sm'
                    }`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-[#EAE3D2]">
                      <img
                        src={animal.portraitUrl}
                        alt={`${animal.name}, ${animal.breedLabel}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>

                    {animal.isSick ? (
                      <span
                        title="Requiere medicina"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#9F2E22] text-[#FAF7F0] flex items-center justify-center border border-[#FAF7F0]"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    ) : animal.milkReady >= 2 ? (
                      <span
                        title="Leche lista para ordeñar"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2F5E39] text-[#FAF7F0] flex items-center justify-center border border-[#FAF7F0]"
                      >
                        <Milk className="w-3.5 h-3.5" />
                      </span>
                    ) : null}

                    <div className="mt-1 px-0.5 text-left">
                      <p className="text-[11px] font-bold text-[#1E3522] leading-tight truncate max-w-[76px]">
                        {animal.name}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <div className="h-1 w-full bg-[#E3DAC9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3E7B48]"
                            style={{ width: `${Math.max(5, animal.hunger)}%` }}
                          />
                        </div>
                        <div className="h-1 w-full bg-[#E3DAC9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8A5A3B]"
                            style={{ width: `${Math.max(5, animal.thirst)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Floating Action Feedbacks */}
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                style={{ left: `${fb.xPercent}%`, top: `${fb.yPercent - 12}%` }}
                className={`absolute z-30 pointer-events-none px-2.5 py-1 rounded-md text-xs font-bold shadow-sm animate-float-up whitespace-nowrap ${
                  fb.tone === 'green'
                    ? 'bg-[#2F5E39] text-[#FAF7F0]'
                    : fb.tone === 'amber'
                    ? 'bg-[#B57428] text-[#FAF7F0]'
                    : fb.tone === 'alert'
                    ? 'bg-[#9F2E22] text-[#FAF7F0]'
                    : 'bg-[#5C402C] text-[#FAF7F0]'
                }`}
              >
                {fb.text}
              </div>
            ))}
          </div>

          {/* Care Tool Selector Bar (Click OR Drag onto animals) */}
          <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-xl p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {TOOL_BUTTONS.map((tool) => {
                  const Icon = tool.icon;
                  const active = state.activeTool === tool.id;
                  const isDraggable = tool.id !== 'INSPECCIONAR';
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      draggable={isDraggable}
                      onDragStart={(e) => {
                        if (isDraggable) {
                          e.dataTransfer.setData('text/care-tool', tool.id);
                          onSelectTool(tool.id);
                        }
                      }}
                      onClick={() => onSelectTool(tool.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#2F5E39] text-[#FAF7F0]'
                          : 'bg-[#EAE3D2] text-[#3E3226] hover:bg-[#DFD5C0]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tool.label}</span>
                      <span className="font-mono-nums opacity-70 text-[10px]">[{tool.shortcut}]</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] text-[#5C402C]">
                Consejo: también puedes <strong>arrastrar</strong> una herramienta sobre cualquier animal.
              </span>
            </div>

            {/* Practical One-Click Herd Bulk Actions */}
            <div className="pt-2.5 border-t border-[#E5DDD0] flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1E3522]">Cuidado práctico del corral:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onGrazeAll}
                  disabled={canGrazeCount === 0 || state.forageField.moisture < 35}
                  title={
                    state.forageField.moisture < 35
                      ? 'Riega la alfalfa para tener pasto fresco disponible'
                      : 'Suelta el rebaño a pastar gratis una vez por día'
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#E4EDE2] border border-[#9EBC9B] text-xs font-semibold text-[#1E3522] hover:bg-[#D5E4D2] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Pastoreo Libre ({canGrazeCount})
                </button>
                <button
                  type="button"
                  onClick={onFeedAll}
                  disabled={hungryCount === 0 || state.inventory.hayKg < 5}
                  className="px-3 py-1.5 rounded-lg bg-[#EAE3D2] border border-[#C7B9A1] text-xs font-semibold text-[#1E3522] hover:bg-[#DFD5C0] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Alimentar Todos ({hungryCount})
                </button>
                <button
                  type="button"
                  onClick={onWaterAll}
                  disabled={thirstyCount === 0 || state.inventory.waterLiters < 5}
                  className="px-3 py-1.5 rounded-lg bg-[#EAE3D2] border border-[#C7B9A1] text-xs font-semibold text-[#1E3522] hover:bg-[#DFD5C0] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Hidratar Todos ({thirstyCount})
                </button>
                <button
                  type="button"
                  onClick={onMilkAll}
                  disabled={milkReadyCount === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#B57428] text-xs font-semibold text-[#FAF7F0] hover:bg-[#965E1E] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Ordeñar Todas ({milkReadyCount})
                </button>
              </div>
            </div>
          </div>

          {/* Rural Village Orders Board */}
          <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#2F5E39]" />
                <h3 className="font-display text-lg font-bold text-[#1E3522]">
                  Encargos del Pueblo (Día {state.day})
                </h3>
              </div>
              <span className="text-xs text-[#5C402C]">
                Entrega pedidos para ganar monedas extra sobre el precio normal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {state.orders.map((order) => {
                const ready = !order.fulfilled && canFulfillOrder(order.itemType, order.requiredQty);
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl p-3.5 border flex flex-col justify-between gap-3 ${
                      order.fulfilled
                        ? 'bg-[#E4EDE2] border-[#9EBC9B]'
                        : 'bg-[#F3EFE6] border-[#DED6C6]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1E3522]">{order.clientName}</p>
                      <p className="text-xs text-[#4A3D31] mt-1">
                        Pide:{' '}
                        <strong className="font-mono-nums">
                          {order.requiredQty}
                        </strong>{' '}
                        {order.itemLabel}
                      </p>
                      <p className="text-xs font-mono-nums font-bold text-[#B57428] mt-1">
                        Pago: +${order.rewardCoins}
                      </p>
                    </div>
                    {order.fulfilled ? (
                      <span className="text-xs font-bold text-[#255931]">Entregado</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onFulfillOrder(order.id)}
                        disabled={!ready}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#2F5E39] text-[#FAF7F0] text-xs font-semibold hover:bg-[#23482B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {ready ? 'Entregar Pedido' : 'Faltan Productos'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right: Animal Care Inspector & Herd Roster */}
        <aside className="xl:col-span-4 space-y-5">
          {selectedAnimal ? (
            <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#C7B9A1] shrink-0 bg-[#EAE3D2]">
                  <img
                    src={selectedAnimal.portraitUrl}
                    alt={selectedAnimal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-2xl font-bold text-[#1E3522] truncate">
                      {selectedAnimal.name}
                    </h2>
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        getHealthStatusLabel(selectedAnimal.health, selectedAnimal.isSick).toneClass
                      }`}
                    >
                      {getHealthStatusLabel(selectedAnimal.health, selectedAnimal.isSick).text}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C402C] font-medium">
                    {selectedAnimal.breedLabel} ·{' '}
                    <span className="font-mono-nums">{selectedAnimal.ageDays}</span> días ·{' '}
                    <span className="font-mono-nums">{selectedAnimal.weightKg}</span> kg
                  </p>
                  <p className="text-xs text-[#4A3D31] leading-snug pt-1">
                    {SPECIES_CONFIG[selectedAnimal.species].description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <MeterRow
                  label="Nutrición"
                  value={selectedAnimal.hunger}
                  fillClass={selectedAnimal.hunger < 35 ? 'bg-[#9F2E22]' : 'bg-[#2F5E39]'}
                />
                <MeterRow
                  label="Hidratación"
                  value={selectedAnimal.thirst}
                  fillClass={selectedAnimal.thirst < 35 ? 'bg-[#9F2E22]' : 'bg-[#4D7C5D]'}
                />
                <MeterRow
                  label="Salud"
                  value={selectedAnimal.health}
                  fillClass={selectedAnimal.health < 45 ? 'bg-[#9F2E22]' : 'bg-[#5E8C4A]'}
                />
                <MeterRow
                  label="Bienestar"
                  value={selectedAnimal.happiness}
                  fillClass="bg-[#B57428]"
                />
              </div>

              {SPECIES_CONFIG[selectedAnimal.species].dailyMilkCapacity > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#EAE3D2] text-xs">
                    <span className="font-semibold text-[#3E3226]">Leche lista para ordeñar</span>
                    <span className="font-mono-nums font-bold text-[#1E3522]">
                      {selectedAnimal.milkReady.toFixed(1)} L /{' '}
                      {SPECIES_CONFIG[selectedAnimal.species].maxMilkStorage} L
                    </span>
                  </div>
                  {selectedAnimal.milkReady >= 1 && (
                    <button
                      type="button"
                      onClick={() => onOpenMilkingGame(selectedAnimal.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-xs font-bold hover:bg-[#23482B] transition-colors cursor-pointer"
                    >
                      Ordeño con Destreza (+Leche Extra)
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onCareAction(selectedAnimal.id, 'ALIMENTAR')}
                  disabled={state.inventory.hayKg < 5 || selectedAnimal.hunger >= 99}
                  className="py-2.5 px-3 rounded-xl bg-[#2F5E39] text-[#FAF7F0] text-xs font-semibold hover:bg-[#23482B] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Alimentar (-5 kg)
                </button>
                <button
                  type="button"
                  onClick={() => onCareAction(selectedAnimal.id, 'HIDRATAR')}
                  disabled={state.inventory.waterLiters < 5 || selectedAnimal.thirst >= 99}
                  className="py-2.5 px-3 rounded-xl bg-[#5C402C] text-[#FAF7F0] text-xs font-semibold hover:bg-[#473121] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Dar Agua (-5 L)
                </button>
                <button
                  type="button"
                  onClick={() => onCareAction(selectedAnimal.id, 'CEPILLAR')}
                  disabled={selectedAnimal.brushedToday}
                  className="py-2.5 px-3 rounded-xl bg-[#EAE3D2] border border-[#C7B9A1] text-[#1E3522] text-xs font-semibold hover:bg-[#DFD5C0] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  {selectedAnimal.brushedToday ? 'Cepillado Hoy' : 'Cepillar y Cuidar'}
                </button>
                {SPECIES_CONFIG[selectedAnimal.species].dailyMilkCapacity > 0 ? (
                  <button
                    type="button"
                    onClick={() => onCareAction(selectedAnimal.id, 'ORDENAR')}
                    disabled={selectedAnimal.milkReady < 1}
                    className="py-2.5 px-3 rounded-xl bg-[#B57428] text-[#FAF7F0] text-xs font-semibold hover:bg-[#965E1E] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ordeño Rápido
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCareAction(selectedAnimal.id, 'CURAR')}
                    disabled={
                      state.inventory.medicineCount < 1 ||
                      (!selectedAnimal.isSick && selectedAnimal.health >= 98)
                    }
                    className="py-2.5 px-3 rounded-xl bg-[#8A5A3B] text-[#FAF7F0] text-xs font-semibold hover:bg-[#6E462D] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Aplicar Medicina
                  </button>
                )}
              </div>

              {SPECIES_CONFIG[selectedAnimal.species].dailyMilkCapacity > 0 &&
                (selectedAnimal.isSick || selectedAnimal.health < 85) && (
                  <button
                    type="button"
                    onClick={() => onCareAction(selectedAnimal.id, 'CURAR')}
                    disabled={state.inventory.medicineCount < 1}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#9F2E22] text-[#FAF7F0] text-xs font-semibold hover:bg-[#82241A] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Tratar Enfermedad (-1 Medicina)
                  </button>
                )}

              <div className="pt-2 border-t border-[#E5DDD0] flex items-center justify-between gap-3">
                <span className="text-xs text-[#5C402C]">
                  Valor en mercado:{' '}
                  <strong className="font-mono-nums text-[#1E3522]">
                    ${calculateAnimalSellPrice(selectedAnimal)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSellAnimal(selectedAnimal.id)}
                  disabled={state.animals.length <= 1}
                  title={
                    state.animals.length <= 1
                      ? 'Debes conservar al menos un animal en la granja'
                      : 'Vender animal en el mercado'
                  }
                  className="px-3.5 py-1.5 rounded-lg border border-[#C7B9A1] text-xs font-semibold text-[#5C402C] hover:bg-[#EAE3D2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Vender Cabeza
                </button>
              </div>
            </div>
          ) : null}

          {/* Herd Roster Quick List */}
          <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#1E3522]">
                Rebaño ({state.animals.length})
              </h3>
              <span className="text-xs text-[#5C402C]">Selecciona para cuidar</span>
            </div>
            <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
              {state.animals.map((animal) => {
                const active = selectedAnimal?.id === animal.id;
                const status = getHealthStatusLabel(animal.health, animal.isSick);
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => onAnimalClick(animal.id)}
                    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#E4EDE2] border-[#2F5E39]'
                        : 'bg-[#F3EFE6] border-transparent hover:border-[#C7B9A1]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={animal.portraitUrl}
                        alt={animal.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1E3522] truncate">{animal.name}</p>
                        <p className="text-[11px] text-[#5C402C] truncate">{animal.breedLabel}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[11px] font-bold ${status.toneClass}`}>{status.text}</p>
                      <p className="text-[11px] font-mono-nums text-[#5C402C]">
                        N:{Math.round(animal.hunger)}% · A:{Math.round(animal.thirst)}%
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field Log */}
          <div className="bg-[#FAF7F0] border border-[#D6CBB8] rounded-2xl p-5 space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#1E3522]">Bitácora de Campo</h3>
            <ul className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {state.logs.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="text-xs text-[#4A3D31] leading-snug border-b border-[#EAE3D2] pb-1.5 last:border-b-0 last:pb-0"
                >
                  <span className="font-mono-nums font-semibold text-[#2F5E39]">Día {entry.day}:</span>{' '}
                  {entry.message}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
