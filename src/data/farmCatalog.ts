import {
  AchievementDef,
  Animal,
  AnimalSpecies,
  DifficultyMode,
  FarmState,
  MarketPrices,
  PastureItem,
  PastureItemKind,
  SeasonType,
  UpgradeId,
  VillageOrder,
  WeatherType,
} from '../types/game';

export const FARM_ASSETS = {
  pastureBg: '/src/assets/images/farm_pasture_bg_1795015113219.jpg',
  dairyCow: '/src/assets/images/cattle_dairy_cow_1795015114125.jpg',
  brownBull: '/src/assets/images/cattle_brown_bull_1795015114156.jpg',
  calf: '/src/assets/images/cattle_calf_1795015115193.jpg',
  barnMarket: '/src/assets/images/farm_barn_market_1795015116117.jpg',
};

export const SPECIES_CONFIG: Record<
  AnimalSpecies,
  {
    label: string;
    buyPrice: number;
    baseSellValue: number;
    dailyMilkCapacity: number;
    maxMilkStorage: number;
    portraitUrl: string;
    description: string;
  }
> = {
  VACA_LECHERA: {
    label: 'Vaca Lechera',
    buyPrice: 180,
    baseSellValue: 220,
    dailyMilkCapacity: 6,
    maxMilkStorage: 14,
    portraitUrl: FARM_ASSETS.dairyCow,
    description: 'Alta producción diaria de leche fresca cuando está bien nutrida.',
  },
  VACA_CRIOLLA: {
    label: 'Vaca Criolla',
    buyPrice: 150,
    baseSellValue: 190,
    dailyMilkCapacity: 4,
    maxMilkStorage: 10,
    portraitUrl: FARM_ASSETS.dairyCow,
    description: 'Muy resistente al clima seco y gran productora de abono orgánico.',
  },
  TERNERO: {
    label: 'Ternero de Cría',
    buyPrice: 95,
    baseSellValue: 110,
    dailyMilkCapacity: 0,
    maxMilkStorage: 0,
    portraitUrl: FARM_ASSETS.calf,
    description: 'Crece rápidamente con buen forraje y se convierte en adulto a los 6 días.',
  },
  TORO_SEMENTAL: {
    label: 'Toro Semental',
    buyPrice: 240,
    baseSellValue: 310,
    dailyMilkCapacity: 0,
    maxMilkStorage: 0,
    portraitUrl: FARM_ASSETS.brownBull,
    description: 'Aporta vigor al rebaño, permite criar terneros y aumenta su valor por peso.',
  },
};

export const UPGRADE_CATALOG: Record<
  UpgradeId,
  {
    title: string;
    cost: number;
    effectSummary: string;
  }
> = {
  BEBEDERO_AUTO: {
    title: 'Bebedero de Gravedad',
    cost: 160,
    effectSummary: 'Reduce en 45% la pérdida diaria de hidratación del ganado.',
  },
  ESTABLO_REFORZADO: {
    title: 'Establo de Madera y Teja',
    cost: 210,
    effectSummary: 'Protege la salud del rebaño en días secos o de invierno y duplica la recuperación nocturna.',
  },
  RIEGO_PASTURA: {
    title: 'Acequia de Riego Natural',
    cost: 175,
    effectSummary: 'Acelera un 60% el crecimiento diario del cultivo de alfalfa y heno.',
  },
  QUESERIA_ARTESANAL: {
    title: 'Prensa de Queso Doble',
    cost: 195,
    effectSummary: 'Produce 2 quesos artesanales adicionales por cada tanda elaborada en la quesería.',
  },
};

export const PASTURE_ITEM_CONFIG: Record<
  PastureItemKind,
  {
    label: string;
    actionHint: string;
    rewardText: string;
  }
> = {
  TREBOL: {
    label: 'Trébol Tierno',
    actionHint: 'Recoger +6 kg Heno',
    rewardText: '+6 kg Heno',
  },
  ABONO: {
    label: 'Estiércol Fresco',
    actionHint: 'Limpiar (+1 Abono)',
    rewardText: '+1 Abono y corral limpio',
  },
  CERCA_FLOJA: {
    label: 'Cerca Floja',
    actionHint: 'Reparar (+$16)',
    rewardText: '+$16 y +5 Bienestar',
  },
  HIERBA_CURATIVA: {
    label: 'Manzanilla Silvestre',
    actionHint: 'Cosechar (+1 Medicina)',
    rewardText: '+1 Medicina',
  },
};

export const WEATHER_LABELS: Record<WeatherType, { label: string; effectHint: string }> = {
  SOLEADO: { label: 'Soleado', effectHint: 'Buen pastoreo y crecimiento normal del forraje.' },
  LLUVIA_SUAVE: { label: 'Lluvia Suave', effectHint: 'Recarga el pozo y riega la alfalfa automáticamente.' },
  SECO: { label: 'Día Seco', effectHint: 'Aumenta la sed del ganado; conviene hidratar con frecuencia.' },
  FRESCO: { label: 'Brisa Fresca', effectHint: 'Clima templado que favorece el bienestar del rebaño.' },
};

export const SEASON_LABELS: Record<SeasonType, string> = {
  PRIMAVERA: 'Primavera',
  VERANO: 'Verano',
  OTONO: 'Otoño',
  INVIERNO: 'Invierno',
};

export const ACHIEVEMENTS_CATALOG: AchievementDef[] = [
  {
    id: 'primer_ordeno',
    title: 'Primer Ordeño',
    description: 'Recolecta al menos 12 litros de leche fresca en tu establo.',
    target: 12,
    metricKey: 'totalMilkCollected',
  },
  {
    id: 'maestro_quesero',
    title: 'Maestro Quesero',
    description: 'Elabora 6 unidades de queso artesanal en la quesería.',
    target: 6,
    metricKey: 'totalCheeseCrafted',
  },
  {
    id: 'cosecha_verde',
    title: 'Cosecha de Alfalfa',
    description: 'Cosecha 80 kg de heno desde tu propio potrero de pastura.',
    target: 80,
    metricKey: 'totalHayHarvested',
  },
  {
    id: 'rebano_prospero',
    title: 'Rebaño Próspero',
    description: 'Mantén un corral activo con al menos 5 cabezas de ganado.',
    target: 5,
    metricKey: 'herdSize',
  },
  {
    id: 'estacion_completa',
    title: 'Ciclo de Granja',
    description: 'Supera el Día 8 gestionando tus pasturas y recursos.',
    target: 8,
    metricKey: 'daysCompleted',
  },
  {
    id: 'comercio_rural',
    title: 'Comercio Rural',
    description: 'Acumula $650 en ventas totales en el mercado.',
    target: 650,
    metricKey: 'totalCoinsEarned',
  },
];

export const CATTLE_NAMES_POOL = [
  'Trébol',
  'Madera',
  'Bellota',
  'Nube',
  'Pampa',
  'Tierra',
  'Cedro',
  'Pradera',
  'Romero',
  'Oliva',
  'Siena',
  'Albahaca',
];

export function generateDailyPrices(day: number): MarketPrices {
  const wave = Math.sin(day * 1.15);
  const trendLabel: MarketPrices['trendLabel'] =
    wave > 0.3 ? 'Alza' : wave < -0.3 ? 'Baja' : 'Estable';

  const milkPerLiter = Math.round(14 + wave * 3);
  const cheesePerUnit = Math.round(62 + wave * 12);
  const compostPerBag = Math.round(22 + wave * 4);

  return {
    milkPerLiter,
    cheesePerUnit,
    compostPerBag,
    hayBundlePrice: 32,
    waterRefillPrice: 18,
    medicinePrice: 45,
    trendLabel,
  };
}

export function generateDailyOrders(day: number): VillageOrder[] {
  const templates: Omit<VillageOrder, 'id' | 'fulfilled'>[] = [
    {
      clientName: 'Panadería El Roble',
      itemType: 'MILK',
      itemLabel: 'Leche Fresca',
      requiredQty: 4 + (day % 3),
      rewardCoins: (4 + (day % 3)) * 18 + 20,
    },
    {
      clientName: 'Posada del Valle',
      itemType: 'CHEESE',
      itemLabel: 'Queso Artesanal',
      requiredQty: 1 + (day % 2),
      rewardCoins: (1 + (day % 2)) * 78 + 25,
    },
    {
      clientName: 'Vivero Tierra Verde',
      itemType: 'COMPOST',
      itemLabel: 'Sacos de Abono',
      requiredQty: 2,
      rewardCoins: 62,
    },
    {
      clientName: 'Estancia Vecina',
      itemType: 'HAY',
      itemLabel: 'Heno de Alfalfa (kg)',
      requiredQty: 20,
      rewardCoins: 54,
    },
  ];

  const first = templates[day % templates.length];
  const second = templates[(day + 1) % templates.length];
  const third = templates[(day + 2) % templates.length];

  return [first, second, third].map((tpl, idx) => ({
    ...tpl,
    id: `order-d${day}-${idx}`,
    fulfilled: false,
  }));
}

export function createStarterPastureItems(day: number): PastureItem[] {
  return [
    {
      id: `item-trebol-${day}-1`,
      kind: 'TREBOL',
      xPercent: 40,
      yPercent: 40,
    },
    {
      id: `item-abono-${day}-2`,
      kind: 'ABONO',
      xPercent: 79,
      yPercent: 52,
    },
    {
      id: `item-cerca-${day}-3`,
      kind: 'CERCA_FLOJA',
      xPercent: 51,
      yPercent: 83,
    },
  ];
}

export function createStarterHerd(difficulty: DifficultyMode): Animal[] {
  const baseStat = difficulty === 'ESTANDAR' ? 84 : 70;
  return [
    {
      id: 'animal-lucero',
      name: 'Lucero',
      species: 'VACA_LECHERA',
      breedLabel: SPECIES_CONFIG.VACA_LECHERA.label,
      ageDays: 14,
      weightKg: 495,
      hunger: baseStat,
      thirst: baseStat - 4,
      health: 95,
      happiness: 86,
      milkReady: 5,
      isSick: false,
      brushedToday: false,
      grazedToday: false,
      xPercent: 60,
      yPercent: 60,
      portraitUrl: FARM_ASSETS.dairyCow,
    },
    {
      id: 'animal-canela',
      name: 'Canela',
      species: 'TERNERO',
      breedLabel: SPECIES_CONFIG.TERNERO.label,
      ageDays: 2,
      weightKg: 145,
      hunger: baseStat - 6,
      thirst: baseStat,
      health: 92,
      happiness: 88,
      milkReady: 0,
      isSick: false,
      brushedToday: false,
      grazedToday: false,
      xPercent: 74,
      yPercent: 66,
      portraitUrl: FARM_ASSETS.calf,
    },
    {
      id: 'animal-roble',
      name: 'Roble',
      species: 'TORO_SEMENTAL',
      breedLabel: SPECIES_CONFIG.TORO_SEMENTAL.label,
      ageDays: 22,
      weightKg: 640,
      hunger: baseStat + 2,
      thirst: baseStat - 2,
      health: 96,
      happiness: 84,
      milkReady: 0,
      isSick: false,
      brushedToday: false,
      grazedToday: false,
      xPercent: 67,
      yPercent: 76,
      portraitUrl: FARM_ASSETS.brownBull,
    },
  ];
}

export function createInitialFarmState(difficulty: DifficultyMode): FarmState {
  const herd = createStarterHerd(difficulty);
  return {
    phase: 'PLAYING',
    difficulty,
    day: 1,
    season: 'PRIMAVERA',
    weather: 'SOLEADO',
    wellCharge: 100,
    animals: herd,
    selectedAnimalId: herd[0].id,
    activeTool: 'INSPECCIONAR',
    inventory: {
      coins: difficulty === 'ESTANDAR' ? 280 : 180,
      hayKg: difficulty === 'ESTANDAR' ? 45 : 30,
      waterLiters: difficulty === 'ESTANDAR' ? 65 : 45,
      medicineCount: difficulty === 'ESTANDAR' ? 2 : 1,
      milkLiters: 0,
      cheeseUnits: 0,
      compostBags: 1,
    },
    forageField: {
      growth: 65,
      moisture: 70,
      fertilized: false,
    },
    upgrades: {
      BEBEDERO_AUTO: false,
      ESTABLO_REFORZADO: false,
      RIEGO_PASTURA: false,
      QUESERIA_ARTESANAL: false,
    },
    marketPrices: generateDailyPrices(1),
    pastureItems: createStarterPastureItems(1),
    orders: generateDailyOrders(1),
    stats: {
      totalMilkCollected: 0,
      totalCheeseCrafted: 0,
      totalHayHarvested: 0,
      totalCoinsEarned: 0,
      daysWithoutSickness: 0,
      choresCompleted: 0,
      ordersCompleted: 0,
    },
    logs: [
      {
        id: 'log-init',
        day: 1,
        message: 'Comienza la jornada en Ganado Care. Recoge tréboles, cuida el rebaño y cumple pedidos.',
        category: 'cuidado',
      },
    ],
    lastSummary: null,
  };
}

export function getHealthStatusLabel(score: number, isSick: boolean): {
  text: string;
  toneClass: string;
} {
  if (isSick) {
    return { text: 'Enfermo', toneClass: 'text-[#9F2E22]' };
  }
  if (score >= 80) {
    return { text: 'Óptimo', toneClass: 'text-[#255931]' };
  }
  if (score >= 55) {
    return { text: 'Estable', toneClass: 'text-[#6A4A2F]' };
  }
  if (score >= 30) {
    return { text: 'Atención', toneClass: 'text-[#A25C16]' };
  }
  return { text: 'Crítico', toneClass: 'text-[#9F2E22]' };
}

export function calculateAnimalSellPrice(animal: Animal): number {
  const base = SPECIES_CONFIG[animal.species].baseSellValue;
  const healthFactor = animal.isSick ? 0.65 : 0.8 + (animal.health / 100) * 0.35;
  const weightBonus = Math.round((animal.weightKg - 140) * 0.14);
  return Math.max(60, Math.round(base * healthFactor + Math.max(0, weightBonus)));
}
