export type GamePhase = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'DAY_SUMMARY' | 'GAME_OVER';

export type ActiveTab = 'POTRERO' | 'MERCADO' | 'QUESERIA' | 'LOGROS';

export type DifficultyMode = 'ESTANDAR' | 'DESAFIO';

export type AnimalSpecies = 'VACA_LECHERA' | 'VACA_CRIOLLA' | 'TERNERO' | 'TORO_SEMENTAL';

export type WeatherType = 'SOLEADO' | 'LLUVIA_SUAVE' | 'SECO' | 'FRESCO';

export type SeasonType = 'PRIMAVERA' | 'VERANO' | 'OTONO' | 'INVIERNO';

export type CareTool = 'INSPECCIONAR' | 'ALIMENTAR' | 'HIDRATAR' | 'CEPILLAR' | 'ORDENAR' | 'CURAR';

export type UpgradeId = 'BEBEDERO_AUTO' | 'ESTABLO_REFORZADO' | 'RIEGO_PASTURA' | 'QUESERIA_ARTESANAL';

export type PastureItemKind = 'TREBOL' | 'ABONO' | 'CERCA_FLOJA' | 'HIERBA_CURATIVA';

export interface PastureItem {
  id: string;
  kind: PastureItemKind;
  xPercent: number;
  yPercent: number;
}

export type OrderItemType = 'MILK' | 'CHEESE' | 'COMPOST' | 'HAY';

export interface VillageOrder {
  id: string;
  clientName: string;
  itemType: OrderItemType;
  itemLabel: string;
  requiredQty: number;
  rewardCoins: number;
  fulfilled: boolean;
}

export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  breedLabel: string;
  ageDays: number;
  weightKg: number;
  hunger: number;      // 0 - 100 (100 = satisfecho)
  thirst: number;      // 0 - 100 (100 = hidratado)
  health: number;      // 0 - 100 (100 = sano)
  happiness: number;   // 0 - 100 (100 = feliz)
  milkReady: number;   // Liters ready to milk (0 - 16)
  isSick: boolean;
  brushedToday: boolean;
  grazedToday: boolean;
  xPercent: number;    // Position inside paddock (15 - 88)
  yPercent: number;    // Position inside paddock (26 - 84)
  portraitUrl: string;
}

export interface Inventory {
  coins: number;
  hayKg: number;
  waterLiters: number;
  medicineCount: number;
  milkLiters: number;
  cheeseUnits: number;
  compostBags: number;
}

export interface ForageField {
  growth: number;      // 0 - 100
  moisture: number;    // 0 - 100
  fertilized: boolean;
}

export interface MarketPrices {
  milkPerLiter: number;
  cheesePerUnit: number;
  compostPerBag: number;
  hayBundlePrice: number;
  waterRefillPrice: number;
  medicinePrice: number;
  trendLabel: 'Alza' | 'Estable' | 'Baja';
}

export interface FloatingFeedback {
  id: string;
  text: string;
  tone: 'green' | 'earth' | 'amber' | 'alert';
  xPercent: number;
  yPercent: number;
}

export interface FieldLogEntry {
  id: string;
  day: number;
  message: string;
  category: 'cuidado' | 'produccion' | 'clima' | 'mercado';
}

export interface DaySummaryData {
  previousDay: number;
  newDay: number;
  newWeather: WeatherType;
  newSeason: SeasonType;
  milkProducedPotential: number;
  forageGrown: number;
  calvesGrown: string[];
  sickAnimals: string[];
  compostCollected: number;
  autoWaterSaved: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  target: number;
  metricKey: 'totalMilkCollected' | 'totalCheeseCrafted' | 'totalHayHarvested' | 'daysCompleted' | 'herdSize' | 'totalCoinsEarned';
}

export interface FarmStats {
  totalMilkCollected: number;
  totalCheeseCrafted: number;
  totalHayHarvested: number;
  totalCoinsEarned: number;
  daysWithoutSickness: number;
  choresCompleted: number;
  ordersCompleted: number;
}

export interface FarmState {
  phase: GamePhase;
  difficulty: DifficultyMode;
  day: number;
  season: SeasonType;
  weather: WeatherType;
  wellCharge: number; // 0 - 100
  animals: Animal[];
  selectedAnimalId: string | null;
  activeTool: CareTool;
  inventory: Inventory;
  forageField: ForageField;
  upgrades: Record<UpgradeId, boolean>;
  marketPrices: MarketPrices;
  pastureItems: PastureItem[];
  orders: VillageOrder[];
  stats: FarmStats;
  logs: FieldLogEntry[];
  lastSummary: DaySummaryData | null;
}
