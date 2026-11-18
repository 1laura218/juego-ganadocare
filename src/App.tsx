/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActiveTab,
  Animal,
  AnimalSpecies,
  CareTool,
  DaySummaryData,
  DifficultyMode,
  FarmState,
  FieldLogEntry,
  FloatingFeedback,
  PastureItem,
  PastureItemKind,
  SeasonType,
  UpgradeId,
  WeatherType,
} from './types/game';
import {
  CATTLE_NAMES_POOL,
  FARM_ASSETS,
  PASTURE_ITEM_CONFIG,
  SPECIES_CONFIG,
  UPGRADE_CATALOG,
  calculateAnimalSellPrice,
  createInitialFarmState,
  createStarterPastureItems,
  generateDailyOrders,
  generateDailyPrices,
} from './data/farmCatalog';
import { soundEngine } from './utils/sound';
import { TopBar } from './components/TopBar';
import { TitleMenu } from './components/TitleMenu';
import { FarmPastureView } from './components/FarmPastureView';
import { MarketView } from './components/MarketView';
import { DairyCraftView } from './components/DairyCraftView';
import { AchievementsView } from './components/AchievementsView';
import { DaySummaryModal } from './components/DaySummaryModal';
import { GameOverModal } from './components/GameOverModal';
import { CheesePressModal, MilkingChallengeModal } from './components/InteractiveMiniGames';

const STORAGE_KEY = 'ganado_care_save_v1';

const SEASONS_ORDER: SeasonType[] = ['PRIMAVERA', 'VERANO', 'OTONO', 'INVIERNO'];
const WEATHERS_BY_SEASON: Record<SeasonType, WeatherType[]> = {
  PRIMAVERA: ['SOLEADO', 'LLUVIA_SUAVE', 'FRESCO', 'SOLEADO'],
  VERANO: ['SOLEADO', 'SECO', 'SOLEADO', 'SECO'],
  OTONO: ['FRESCO', 'LLUVIA_SUAVE', 'SOLEADO', 'FRESCO'],
  INVIERNO: ['FRESCO', 'LLUVIA_SUAVE', 'FRESCO', 'SECO'],
};

const PADDOCK_SLOTS: { x: number; y: number }[] = [
  { x: 58, y: 58 },
  { x: 74, y: 63 },
  { x: 66, y: 76 },
  { x: 83, y: 74 },
  { x: 54, y: 74 },
  { x: 67, y: 54 },
  { x: 82, y: 56 },
  { x: 46, y: 66 },
  { x: 75, y: 82 },
  { x: 60, y: 84 },
];

const FIELD_SPAWN_SPOTS: { x: number; y: number }[] = [
  { x: 38, y: 38 },
  { x: 44, y: 52 },
  { x: 78, y: 46 },
  { x: 86, y: 64 },
  { x: 50, y: 82 },
  { x: 68, y: 42 },
];

function loadSavedState(): FarmState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FarmState;
    if (parsed && Array.isArray(parsed.animals) && parsed.animals.length > 0) {
      return {
        ...parsed,
        pastureItems: Array.isArray(parsed.pastureItems)
          ? parsed.pastureItems
          : createStarterPastureItems(parsed.day || 1),
        orders: Array.isArray(parsed.orders)
          ? parsed.orders
          : generateDailyOrders(parsed.day || 1),
        stats: {
          ...parsed.stats,
          choresCompleted: parsed.stats?.choresCompleted ?? 0,
          ordersCompleted: parsed.stats?.ordersCompleted ?? 0,
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [savedSnapshot, setSavedSnapshot] = useState<FarmState | null>(() => loadSavedState());
  const [difficulty, setDifficulty] = useState<DifficultyMode>('ESTANDAR');
  const [farmState, setFarmState] = useState<FarmState>(() => ({
    ...createInitialFarmState('ESTANDAR'),
    phase: 'TITLE_MENU',
  }));
  const [activeTab, setActiveTab] = useState<ActiveTab>('POTRERO');
  const [autoTick, setAutoTick] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [milkingAnimalId, setMilkingAnimalId] = useState<string | null>(null);
  const [cheeseGameOpen, setCheeseGameOpen] = useState<boolean>(false);

  const pushFeedback = useCallback(
    (text: string, tone: FloatingFeedback['tone'], xPercent: number, yPercent: number) => {
      const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setFeedbacks((prev) => [...prev, { id, text, tone, xPercent, yPercent }]);
      window.setTimeout(() => {
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      }, 1250);
    },
    []
  );

  const showNotice = useCallback((msg: string) => {
    setBannerNotice(msg);
  }, []);

  useEffect(() => {
    if (!bannerNotice) return;
    const timer = window.setTimeout(() => setBannerNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [bannerNotice]);

  // Persist active game state
  useEffect(() => {
    if (farmState.phase === 'PLAYING' || farmState.phase === 'DAY_SUMMARY') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(farmState));
        setSavedSnapshot(farmState);
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [farmState]);

  // Real-time gentle simulation tick + roaming cattle + pasture collectibles during PLAYING
  useEffect(() => {
    if (farmState.phase !== 'PLAYING' || !autoTick) return;

    const interval = window.setInterval(() => {
      setFarmState((prev) => {
        if (prev.phase !== 'PLAYING') return prev;
        const thirstRate = prev.weather === 'SECO' ? 1.5 : 0.9;
        const autoDrinkReduction = prev.upgrades.BEBEDERO_AUTO ? 0.55 : 1;
        const hungerRate = prev.difficulty === 'DESAFIO' ? 1.25 : 0.9;

        const updatedAnimals = prev.animals.map((a) => {
          const nextHunger = Math.max(0, a.hunger - hungerRate);
          const nextThirst = Math.max(0, a.thirst - thirstRate * autoDrinkReduction);
          let nextHealth = a.health;
          if (nextHunger < 20 || nextThirst < 20 || a.isSick) {
            nextHealth = Math.max(0, a.health - 1.1);
          }

          // Gentle roaming inside the paddock boundaries
          const shouldStep = Math.random() < 0.45;
          const deltaX = shouldStep ? (Math.random() - 0.5) * 9 : 0;
          const deltaY = shouldStep ? (Math.random() - 0.5) * 7 : 0;
          const nextX = Math.max(46, Math.min(88, a.xPercent + deltaX));
          const nextY = Math.max(48, Math.min(84, a.yPercent + deltaY));

          return {
            ...a,
            hunger: nextHunger,
            thirst: nextThirst,
            health: nextHealth,
            xPercent: nextX,
            yPercent: nextY,
          };
        });

        const surviving = updatedAnimals.filter((a) => a.health > 0);
        if (surviving.length === 0) {
          return {
            ...prev,
            animals: [],
            phase: 'GAME_OVER',
          };
        }

        // Occasionally spawn an interactive collectible/chore in the field (max 4 at once)
        let nextItems = prev.pastureItems;
        if (prev.pastureItems.length < 4 && Math.random() < 0.35) {
          const kinds: PastureItemKind[] = ['TREBOL', 'ABONO', 'CERCA_FLOJA', 'HIERBA_CURATIVA'];
          const kind = kinds[Math.floor(Math.random() * kinds.length)];
          const spot = FIELD_SPAWN_SPOTS[Math.floor(Math.random() * FIELD_SPAWN_SPOTS.length)];
          const newItem: PastureItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            kind,
            xPercent: Math.max(32, Math.min(88, spot.x + (Math.random() - 0.5) * 6)),
            yPercent: Math.max(30, Math.min(85, spot.y + (Math.random() - 0.5) * 6)),
          };
          nextItems = [...prev.pastureItems, newItem];
        }

        const growthStep =
          prev.forageField.moisture > 25 ? (prev.upgrades.RIEGO_PASTURA ? 2.5 : 1.5) : 0.4;

        return {
          ...prev,
          wellCharge: Math.min(100, prev.wellCharge + 4),
          forageField: {
            ...prev.forageField,
            growth: Math.min(100, prev.forageField.growth + growthStep),
            moisture: Math.max(0, prev.forageField.moisture - (prev.weather === 'LLUVIA_SUAVE' ? 0 : 0.7)),
          },
          animals: surviving,
          pastureItems: nextItems,
          selectedAnimalId:
            surviving.some((a) => a.id === prev.selectedAnimalId) ? prev.selectedAnimalId : surviving[0].id,
        };
      });
    }, 3600);

    return () => window.clearInterval(interval);
  }, [farmState.phase, autoTick]);

  // Keyboard shortcuts 1-6 for quick care tools
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (farmState.phase !== 'PLAYING' || activeTab !== 'POTRERO' || milkingAnimalId || cheeseGameOpen) return;
      const map: Record<string, CareTool> = {
        '1': 'INSPECCIONAR',
        '2': 'ALIMENTAR',
        '3': 'HIDRATAR',
        '4': 'CEPILLAR',
        '5': 'ORDENAR',
        '6': 'CURAR',
      };
      if (map[e.key]) {
        setFarmState((prev) => ({ ...prev, activeTool: map[e.key] }));
        soundEngine.play('click');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [farmState.phase, activeTab, milkingAnimalId, cheeseGameOpen]);

  const appendLog = (
    logs: FieldLogEntry[],
    day: number,
    message: string,
    category: FieldLogEntry['category']
  ) => {
    const entry: FieldLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      day,
      message,
      category,
    };
    return [entry, ...logs].slice(0, 24);
  };

  const handleStartNewGame = () => {
    soundEngine.play('day');
    const fresh = createInitialFarmState(difficulty);
    setFarmState(fresh);
    setActiveTab('POTRERO');
  };

  const handleContinueGame = () => {
    if (!savedSnapshot) return;
    soundEngine.play('click');
    setFarmState({ ...savedSnapshot, phase: 'PLAYING' });
    setActiveTab('POTRERO');
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleCareAction = useCallback(
    (animalId: string, action: Exclude<CareTool, 'INSPECCIONAR'>) => {
      setFarmState((prev) => {
        const target = prev.animals.find((a) => a.id === animalId);
        if (!target) return prev;

        if (action === 'ALIMENTAR') {
          if (prev.inventory.hayKg < 5) {
            showNotice('No tienes suficiente heno. Cosecha alfalfa, recoge trébol o compra en el Mercado.');
            return prev;
          }
          if (target.hunger >= 99) {
            showNotice(`${target.name} ya está completamente satisfecho.`);
            return prev;
          }
          soundEngine.play('feed');
          pushFeedback('+30 Nutrición', 'green', target.xPercent, target.yPercent);
          return {
            ...prev,
            inventory: { ...prev.inventory, hayKg: prev.inventory.hayKg - 5 },
            animals: prev.animals.map((a) =>
              a.id === animalId
                ? {
                    ...a,
                    hunger: Math.min(100, a.hunger + 30),
                    happiness: Math.min(100, a.happiness + 6),
                    weightKg: a.weightKg + 2,
                  }
                : a
            ),
            logs: appendLog(prev.logs, prev.day, `Alimentaste con heno fresco a ${target.name}.`, 'cuidado'),
          };
        }

        if (action === 'HIDRATAR') {
          if (prev.inventory.waterLiters < 5) {
            showNotice('Sin agua en la reserva. Bombea el pozo en el potrero.');
            return prev;
          }
          if (target.thirst >= 99) {
            showNotice(`${target.name} ya está bien hidratado.`);
            return prev;
          }
          soundEngine.play('water');
          pushFeedback('+35 Hidratación', 'green', target.xPercent, target.yPercent);
          return {
            ...prev,
            inventory: { ...prev.inventory, waterLiters: prev.inventory.waterLiters - 5 },
            animals: prev.animals.map((a) =>
              a.id === animalId
                ? {
                    ...a,
                    thirst: Math.min(100, a.thirst + 35),
                    happiness: Math.min(100, a.happiness + 4),
                  }
                : a
            ),
            logs: appendLog(prev.logs, prev.day, `Hidrataste con agua fresca a ${target.name}.`, 'cuidado'),
          };
        }

        if (action === 'CEPILLAR') {
          if (target.brushedToday) {
            showNotice(`${target.name} ya fue cepillado en esta jornada.`);
            return prev;
          }
          soundEngine.play('brush');
          pushFeedback('+16 Bienestar', 'amber', target.xPercent, target.yPercent);
          return {
            ...prev,
            animals: prev.animals.map((a) =>
              a.id === animalId
                ? {
                    ...a,
                    brushedToday: true,
                    happiness: Math.min(100, a.happiness + 16),
                    health: Math.min(100, a.health + 4),
                  }
                : a
            ),
            logs: appendLog(prev.logs, prev.day, `Cepillaste y cuidaste el pelaje de ${target.name}.`, 'cuidado'),
          };
        }

        if (action === 'ORDENAR') {
          if (SPECIES_CONFIG[target.species].dailyMilkCapacity <= 0) {
            showNotice(`${target.name} no produce leche.`);
            return prev;
          }
          if (target.milkReady < 1) {
            showNotice(`${target.name} aún no tiene leche lista para ordeñar.`);
            return prev;
          }
          const collected = Math.floor(target.milkReady);
          soundEngine.play('milk');
          pushFeedback(`+${collected} L Leche`, 'amber', target.xPercent, target.yPercent);
          return {
            ...prev,
            inventory: {
              ...prev.inventory,
              milkLiters: prev.inventory.milkLiters + collected,
            },
            stats: {
              ...prev.stats,
              totalMilkCollected: prev.stats.totalMilkCollected + collected,
            },
            animals: prev.animals.map((a) =>
              a.id === animalId
                ? {
                    ...a,
                    milkReady: Math.max(0, a.milkReady - collected),
                    happiness: Math.min(100, a.happiness + 3),
                  }
                : a
            ),
            logs: appendLog(
              prev.logs,
              prev.day,
              `Ordeñaste ${collected} L de leche fresca de ${target.name}.`,
              'produccion'
            ),
          };
        }

        if (action === 'CURAR') {
          if (prev.inventory.medicineCount < 1) {
            showNotice('No tienes medicina veterinaria. Cómprala en el Mercado o busca manzanilla en el campo.');
            return prev;
          }
          if (!target.isSick && target.health >= 98) {
            showNotice(`${target.name} goza de excelente salud.`);
            return prev;
          }
          soundEngine.play('heal');
          pushFeedback('Salud Restaurada', 'green', target.xPercent, target.yPercent);
          return {
            ...prev,
            inventory: { ...prev.inventory, medicineCount: prev.inventory.medicineCount - 1 },
            animals: prev.animals.map((a) =>
              a.id === animalId
                ? {
                    ...a,
                    isSick: false,
                    health: Math.min(100, a.health + 40),
                    happiness: Math.min(100, a.happiness + 10),
                  }
                : a
            ),
            logs: appendLog(prev.logs, prev.day, `Aplicaste medicina veterinaria a ${target.name}.`, 'cuidado'),
          };
        }

        return prev;
      });
    },
    [pushFeedback, showNotice]
  );

  const handleAnimalClick = (animalId: string) => {
    setFarmState((prev) => ({ ...prev, selectedAnimalId: animalId }));
    if (farmState.activeTool === 'INSPECCIONAR') {
      soundEngine.play('click');
      return;
    }
    handleCareAction(animalId, farmState.activeTool);
  };

  const handleDropToolOnAnimal = (animalId: string, tool: Exclude<CareTool, 'INSPECCIONAR'>) => {
    setFarmState((prev) => ({ ...prev, selectedAnimalId: animalId }));
    handleCareAction(animalId, tool);
  };

  // Bulk practical actions for the whole herd
  const handleFeedAll = () => {
    setFarmState((prev) => {
      let remainingHay = prev.inventory.hayKg;
      let fedCount = 0;
      const updated = prev.animals.map((a) => {
        if (a.hunger < 85 && remainingHay >= 5) {
          remainingHay -= 5;
          fedCount += 1;
          pushFeedback('+30 Nutrición', 'green', a.xPercent, a.yPercent);
          return {
            ...a,
            hunger: Math.min(100, a.hunger + 30),
            happiness: Math.min(100, a.happiness + 5),
            weightKg: a.weightKg + 2,
          };
        }
        return a;
      });
      if (fedCount === 0) return prev;
      soundEngine.play('feed');
      showNotice(`Alimentaste a ${fedCount} animal(es) del corral.`);
      return {
        ...prev,
        inventory: { ...prev.inventory, hayKg: remainingHay },
        animals: updated,
        logs: appendLog(prev.logs, prev.day, `Alimentaste a ${fedCount} animal(es) en grupo.`, 'cuidado'),
      };
    });
  };

  const handleWaterAll = () => {
    setFarmState((prev) => {
      let remainingWater = prev.inventory.waterLiters;
      let wateredCount = 0;
      const updated = prev.animals.map((a) => {
        if (a.thirst < 85 && remainingWater >= 5) {
          remainingWater -= 5;
          wateredCount += 1;
          pushFeedback('+35 Hidratación', 'green', a.xPercent, a.yPercent);
          return {
            ...a,
            thirst: Math.min(100, a.thirst + 35),
            happiness: Math.min(100, a.happiness + 4),
          };
        }
        return a;
      });
      if (wateredCount === 0) return prev;
      soundEngine.play('water');
      showNotice(`Hidrataste a ${wateredCount} animal(es) del corral.`);
      return {
        ...prev,
        inventory: { ...prev.inventory, waterLiters: remainingWater },
        animals: updated,
        logs: appendLog(prev.logs, prev.day, `Hidrataste a ${wateredCount} animal(es) en grupo.`, 'cuidado'),
      };
    });
  };

  const handleMilkAll = () => {
    setFarmState((prev) => {
      let collectedTotal = 0;
      let cowsMilked = 0;
      const updated = prev.animals.map((a) => {
        if (SPECIES_CONFIG[a.species].dailyMilkCapacity > 0 && a.milkReady >= 1) {
          const collected = Math.floor(a.milkReady);
          collectedTotal += collected;
          cowsMilked += 1;
          pushFeedback(`+${collected} L Leche`, 'amber', a.xPercent, a.yPercent);
          return {
            ...a,
            milkReady: Math.max(0, a.milkReady - collected),
            happiness: Math.min(100, a.happiness + 3),
          };
        }
        return a;
      });
      if (collectedTotal === 0) return prev;
      soundEngine.play('milk');
      showNotice(`Ordeñaste ${collectedTotal} L en total (${cowsMilked} vaca(s)).`);
      return {
        ...prev,
        animals: updated,
        inventory: {
          ...prev.inventory,
          milkLiters: prev.inventory.milkLiters + collectedTotal,
        },
        stats: {
          ...prev.stats,
          totalMilkCollected: prev.stats.totalMilkCollected + collectedTotal,
        },
        logs: appendLog(
          prev.logs,
          prev.day,
          `Ordeño grupal: recolectaste ${collectedTotal} L de leche fresca.`,
          'produccion'
        ),
      };
    });
  };

  const handleGrazeAll = () => {
    setFarmState((prev) => {
      if (prev.forageField.moisture < 35) {
        showNotice('La pastura está seca. Riega la alfalfa para soltar al rebaño a pastar.');
        return prev;
      }
      let grazedCount = 0;
      const updated = prev.animals.map((a) => {
        if (!a.grazedToday) {
          grazedCount += 1;
          pushFeedback('+15 Pastoreo', 'green', a.xPercent, a.yPercent);
          return {
            ...a,
            grazedToday: true,
            hunger: Math.min(100, a.hunger + 15),
            happiness: Math.min(100, a.happiness + 8),
          };
        }
        return a;
      });
      if (grazedCount === 0) return prev;
      soundEngine.play('feed');
      showNotice(`${grazedCount} animal(es) pastaron trébol fresco sin gastar heno.`);
      return {
        ...prev,
        animals: updated,
        forageField: {
          ...prev.forageField,
          moisture: Math.max(0, prev.forageField.moisture - 10),
        },
        logs: appendLog(
          prev.logs,
          prev.day,
          `Pastoreo libre: ${grazedCount} animal(es) comieron hierba fresca.`,
          'cuidado'
        ),
      };
    });
  };

  const handleRingBell = () => {
    soundEngine.play('bell');
    setFarmState((prev) => ({
      ...prev,
      animals: prev.animals.map((a, idx) => {
        const slot = PADDOCK_SLOTS[idx % PADDOCK_SLOTS.length];
        return {
          ...a,
          xPercent: slot.x,
          yPercent: slot.y,
        };
      }),
    }));
    showNotice('Tocaste la campana del establo: el rebaño se reunió en el corral.');
  };

  const handleCollectPastureItem = (itemId: string) => {
    setFarmState((prev) => {
      const item = prev.pastureItems.find((i) => i.id === itemId);
      if (!item) return prev;

      const cfg = PASTURE_ITEM_CONFIG[item.kind];
      soundEngine.play('chore');
      pushFeedback(cfg.rewardText, item.kind === 'CERCA_FLOJA' ? 'amber' : 'green', item.xPercent, item.yPercent);

      let nextInv = { ...prev.inventory };
      let nextAnimals = prev.animals;

      if (item.kind === 'TREBOL') {
        nextInv.hayKg += 6;
      } else if (item.kind === 'ABONO') {
        nextInv.compostBags += 1;
      } else if (item.kind === 'CERCA_FLOJA') {
        nextInv.coins += 16;
        nextAnimals = prev.animals.map((a) => ({
          ...a,
          happiness: Math.min(100, a.happiness + 5),
        }));
      } else if (item.kind === 'HIERBA_CURATIVA') {
        nextInv.medicineCount += 1;
      }

      return {
        ...prev,
        inventory: nextInv,
        animals: nextAnimals,
        pastureItems: prev.pastureItems.filter((i) => i.id !== itemId),
        stats: {
          ...prev.stats,
          choresCompleted: prev.stats.choresCompleted + 1,
          totalCoinsEarned:
            item.kind === 'CERCA_FLOJA' ? prev.stats.totalCoinsEarned + 16 : prev.stats.totalCoinsEarned,
        },
        logs: appendLog(prev.logs, prev.day, `Tarea de campo (${cfg.label}): ${cfg.rewardText}.`, 'cuidado'),
      };
    });
  };

  const handleFulfillOrder = (orderId: string) => {
    setFarmState((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order || order.fulfilled) return prev;

      const inv = { ...prev.inventory };
      if (order.itemType === 'MILK') {
        if (inv.milkLiters < order.requiredQty) return prev;
        inv.milkLiters -= order.requiredQty;
      } else if (order.itemType === 'CHEESE') {
        if (inv.cheeseUnits < order.requiredQty) return prev;
        inv.cheeseUnits -= order.requiredQty;
      } else if (order.itemType === 'COMPOST') {
        if (inv.compostBags < order.requiredQty) return prev;
        inv.compostBags -= order.requiredQty;
      } else if (order.itemType === 'HAY') {
        if (inv.hayKg < order.requiredQty) return prev;
        inv.hayKg -= order.requiredQty;
      }

      inv.coins += order.rewardCoins;
      soundEngine.play('bonus');
      showNotice(`¡Pedido entregado a ${order.clientName}! Ganaste $${order.rewardCoins}.`);

      return {
        ...prev,
        inventory: inv,
        orders: prev.orders.map((o) => (o.id === orderId ? { ...o, fulfilled: true } : o)),
        stats: {
          ...prev.stats,
          ordersCompleted: prev.stats.ordersCompleted + 1,
          totalCoinsEarned: prev.stats.totalCoinsEarned + order.rewardCoins,
        },
        logs: appendLog(
          prev.logs,
          prev.day,
          `Entregaste pedido a ${order.clientName} por $${order.rewardCoins}.`,
          'mercado'
        ),
      };
    });
  };

  const handleCompleteMilkingGame = (bonusLiters: number) => {
    if (!milkingAnimalId) return;
    setFarmState((prev) => {
      const target = prev.animals.find((a) => a.id === milkingAnimalId);
      if (!target) return prev;
      const base = Math.floor(target.milkReady);
      const total = base + bonusLiters;
      soundEngine.play('bonus');
      pushFeedback(`+${total} L (+${bonusLiters} Bono)`, 'amber', target.xPercent, target.yPercent);
      showNotice(`¡Ordeño de ${target.name} completado! Recogiste ${total} L de leche.`);
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          milkLiters: prev.inventory.milkLiters + total,
        },
        stats: {
          ...prev.stats,
          totalMilkCollected: prev.stats.totalMilkCollected + total,
        },
        animals: prev.animals.map((a) =>
          a.id === milkingAnimalId
            ? {
                ...a,
                milkReady: Math.max(0, a.milkReady - base),
                happiness: Math.min(100, a.happiness + 8),
              }
            : a
        ),
        logs: appendLog(
          prev.logs,
          prev.day,
          `Ordeño manual con destreza en ${target.name}: +${total} L de leche.`,
          'produccion'
        ),
      };
    });
    setMilkingAnimalId(null);
  };

  const handleCompleteCheeseGame = (bonusCheese: number) => {
    setFarmState((prev) => {
      if (prev.inventory.milkLiters < 4) return prev;
      const baseYield = prev.upgrades.QUESERIA_ARTESANAL ? 3 : 1;
      const totalYield = baseYield + bonusCheese;
      showNotice(`¡Prensado artesanal perfecto! Elaboraste ${totalYield} queso(s).`);
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          milkLiters: prev.inventory.milkLiters - 4,
          cheeseUnits: prev.inventory.cheeseUnits + totalYield,
        },
        stats: {
          ...prev.stats,
          totalCheeseCrafted: prev.stats.totalCheeseCrafted + totalYield,
        },
        logs: appendLog(
          prev.logs,
          prev.day,
          `Prensado artesanal completo: elaboraste ${totalYield} queso(s).`,
          'produccion'
        ),
      };
    });
    setCheeseGameOpen(false);
  };

  const handlePumpWell = () => {
    setFarmState((prev) => {
      if (prev.wellCharge < 30) return prev;
      soundEngine.play('water');
      pushFeedback('+25 L Agua', 'green', 18, 24);
      return {
        ...prev,
        wellCharge: Math.max(0, prev.wellCharge - 35),
        inventory: {
          ...prev.inventory,
          waterLiters: prev.inventory.waterLiters + 25,
        },
        logs: appendLog(prev.logs, prev.day, 'Extrajiste 25 L de agua fresca del pozo.', 'cuidado'),
      };
    });
  };

  const handleManualPumpWell = () => {
    soundEngine.play('water');
    setFarmState((prev) => ({
      ...prev,
      wellCharge: Math.min(100, prev.wellCharge + 14),
    }));
  };

  const handleWaterForage = () => {
    setFarmState((prev) => {
      if (prev.inventory.waterLiters < 10) return prev;
      soundEngine.play('water');
      pushFeedback('+35% Humedad', 'green', 20, 78);
      return {
        ...prev,
        inventory: { ...prev.inventory, waterLiters: prev.inventory.waterLiters - 10 },
        forageField: {
          ...prev.forageField,
          moisture: Math.min(100, prev.forageField.moisture + 35),
          growth: Math.min(100, prev.forageField.growth + 12),
        },
      };
    });
  };

  const handleFertilizeForage = () => {
    setFarmState((prev) => {
      if (prev.inventory.compostBags < 1 || prev.forageField.fertilized) return prev;
      soundEngine.play('feed');
      pushFeedback('Alfalfa Abonada', 'earth', 20, 78);
      return {
        ...prev,
        inventory: { ...prev.inventory, compostBags: prev.inventory.compostBags - 1 },
        forageField: {
          ...prev.forageField,
          fertilized: true,
          growth: Math.min(100, prev.forageField.growth + 18),
        },
      };
    });
  };

  const handleHarvestForage = () => {
    setFarmState((prev) => {
      if (prev.forageField.growth < 100) return prev;
      soundEngine.play('harvest');
      pushFeedback('+28 kg Heno', 'amber', 22, 76);
      return {
        ...prev,
        inventory: { ...prev.inventory, hayKg: prev.inventory.hayKg + 28 },
        stats: {
          ...prev.stats,
          totalHayHarvested: prev.stats.totalHayHarvested + 28,
        },
        forageField: {
          growth: 10,
          moisture: Math.max(25, prev.forageField.moisture - 20),
          fertilized: false,
        },
        logs: appendLog(prev.logs, prev.day, 'Cosechaste 28 kg de heno de tu cultivo de alfalfa.', 'produccion'),
      };
    });
  };

  const handleSellAnimal = (animalId: string) => {
    setFarmState((prev) => {
      if (prev.animals.length <= 1) return prev;
      const target = prev.animals.find((a) => a.id === animalId);
      if (!target) return prev;
      const price = calculateAnimalSellPrice(target);
      const remaining = prev.animals.filter((a) => a.id !== animalId);
      soundEngine.play('coin');
      showNotice(`Vendiste a ${target.name} por $${price}.`);
      return {
        ...prev,
        animals: remaining,
        selectedAnimalId: remaining[0].id,
        inventory: { ...prev.inventory, coins: prev.inventory.coins + price },
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + price,
        },
        logs: appendLog(prev.logs, prev.day, `Vendiste a ${target.name} en el mercado por $${price}.`, 'mercado'),
      };
    });
  };

  const handleBuySupply = (type: 'HAY' | 'WATER' | 'MEDICINE' | 'COMPOST') => {
    setFarmState((prev) => {
      const p = prev.marketPrices;
      if (type === 'HAY' && prev.inventory.coins >= p.hayBundlePrice) {
        soundEngine.play('coin');
        showNotice('Compraste 25 kg de heno.');
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            coins: prev.inventory.coins - p.hayBundlePrice,
            hayKg: prev.inventory.hayKg + 25,
          },
        };
      }
      if (type === 'WATER' && prev.inventory.coins >= p.waterRefillPrice) {
        soundEngine.play('coin');
        showNotice('Compraste 30 L de agua.');
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            coins: prev.inventory.coins - p.waterRefillPrice,
            waterLiters: prev.inventory.waterLiters + 30,
          },
        };
      }
      if (type === 'MEDICINE' && prev.inventory.coins >= p.medicinePrice) {
        soundEngine.play('coin');
        showNotice('Añadiste 1 botiquín veterinario.');
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            coins: prev.inventory.coins - p.medicinePrice,
            medicineCount: prev.inventory.medicineCount + 1,
          },
        };
      }
      if (type === 'COMPOST' && prev.inventory.coins >= 26) {
        soundEngine.play('coin');
        showNotice('Compraste 2 sacos de abono.');
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            coins: prev.inventory.coins - 26,
            compostBags: prev.inventory.compostBags + 2,
          },
        };
      }
      return prev;
    });
  };

  const handleBuyAnimal = (species: AnimalSpecies) => {
    setFarmState((prev) => {
      const cfg = SPECIES_CONFIG[species];
      if (prev.animals.length >= 10 || prev.inventory.coins < cfg.buyPrice) return prev;
      const usedNames = new Set(prev.animals.map((a) => a.name));
      const availableName =
        CATTLE_NAMES_POOL.find((n) => !usedNames.has(n)) ?? `Res ${prev.animals.length + 1}`;
      const slot = PADDOCK_SLOTS[prev.animals.length % PADDOCK_SLOTS.length];
      const newAnimal: Animal = {
        id: `animal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: availableName,
        species,
        breedLabel: cfg.label,
        ageDays: species === 'TERNERO' ? 1 : 10,
        weightKg: species === 'TERNERO' ? 130 : species === 'TORO_SEMENTAL' ? 580 : 440,
        hunger: 82,
        thirst: 82,
        health: 95,
        happiness: 85,
        milkReady: species === 'VACA_LECHERA' ? 3 : 0,
        isSick: false,
        brushedToday: false,
        grazedToday: false,
        xPercent: slot.x,
        yPercent: slot.y,
        portraitUrl: cfg.portraitUrl,
      };
      soundEngine.play('coin');
      showNotice(`${newAnimal.name} (${cfg.label}) se unió a tu potrero.`);
      return {
        ...prev,
        inventory: { ...prev.inventory, coins: prev.inventory.coins - cfg.buyPrice },
        animals: [...prev.animals, newAnimal],
        selectedAnimalId: newAnimal.id,
        logs: appendLog(
          prev.logs,
          prev.day,
          `Adquiriste a ${newAnimal.name} (${cfg.label}) por $${cfg.buyPrice}.`,
          'mercado'
        ),
      };
    });
  };

  const handleSellProduct = (product: 'MILK' | 'CHEESE' | 'COMPOST', sellAll: boolean) => {
    setFarmState((prev) => {
      const p = prev.marketPrices;
      if (product === 'MILK' && prev.inventory.milkLiters >= 1) {
        const qty = sellAll ? prev.inventory.milkLiters : 1;
        const earned = qty * p.milkPerLiter;
        soundEngine.play('coin');
        showNotice(`Vendiste ${qty} L de leche por $${earned}.`);
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            milkLiters: prev.inventory.milkLiters - qty,
            coins: prev.inventory.coins + earned,
          },
          stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + earned },
        };
      }
      if (product === 'CHEESE' && prev.inventory.cheeseUnits >= 1) {
        const qty = sellAll ? prev.inventory.cheeseUnits : 1;
        const earned = qty * p.cheesePerUnit;
        soundEngine.play('coin');
        showNotice(`Vendiste ${qty} queso(s) artesanal(es) por $${earned}.`);
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            cheeseUnits: prev.inventory.cheeseUnits - qty,
            coins: prev.inventory.coins + earned,
          },
          stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + earned },
        };
      }
      if (product === 'COMPOST' && prev.inventory.compostBags >= 1) {
        const qty = prev.inventory.compostBags;
        const earned = qty * p.compostPerBag;
        soundEngine.play('coin');
        showNotice(`Vendiste ${qty} saco(s) de abono por $${earned}.`);
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            compostBags: 0,
            coins: prev.inventory.coins + earned,
          },
          stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + earned },
        };
      }
      return prev;
    });
  };

  const handleBuyUpgrade = (upgradeId: UpgradeId) => {
    setFarmState((prev) => {
      const upg = UPGRADE_CATALOG[upgradeId];
      if (prev.upgrades[upgradeId] || prev.inventory.coins < upg.cost) return prev;
      soundEngine.play('harvest');
      showNotice(`Instalaste la mejora: ${upg.title}.`);
      return {
        ...prev,
        inventory: { ...prev.inventory, coins: prev.inventory.coins - upg.cost },
        upgrades: { ...prev.upgrades, [upgradeId]: true },
        logs: appendLog(prev.logs, prev.day, `Mejora instalada: ${upg.title}.`, 'mercado'),
      };
    });
  };

  const handleCraftCheese = () => {
    setFarmState((prev) => {
      if (prev.inventory.milkLiters < 4) return prev;
      const yieldCount = prev.upgrades.QUESERIA_ARTESANAL ? 3 : 1;
      soundEngine.play('harvest');
      showNotice(`Elaboraste ${yieldCount} queso(s) artesanal(es).`);
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          milkLiters: prev.inventory.milkLiters - 4,
          cheeseUnits: prev.inventory.cheeseUnits + yieldCount,
        },
        stats: {
          ...prev.stats,
          totalCheeseCrafted: prev.stats.totalCheeseCrafted + yieldCount,
        },
        logs: appendLog(
          prev.logs,
          prev.day,
          `Elaboraste ${yieldCount} queso(s) artesanal(es) con 4 L de leche.`,
          'produccion'
        ),
      };
    });
  };

  const handleBreedCalf = () => {
    setFarmState((prev) => {
      if (prev.animals.length >= 10 || prev.inventory.hayKg < 12) return prev;
      const usedNames = new Set(prev.animals.map((a) => a.name));
      const calfName =
        CATTLE_NAMES_POOL.find((n) => !usedNames.has(n)) ?? `Ternero ${prev.animals.length + 1}`;
      const slot = PADDOCK_SLOTS[prev.animals.length % PADDOCK_SLOTS.length];
      const calf: Animal = {
        id: `animal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: calfName,
        species: 'TERNERO',
        breedLabel: SPECIES_CONFIG.TERNERO.label,
        ageDays: 1,
        weightKg: 95,
        hunger: 85,
        thirst: 85,
        health: 96,
        happiness: 90,
        milkReady: 0,
        isSick: false,
        brushedToday: false,
        grazedToday: false,
        xPercent: slot.x,
        yPercent: slot.y,
        portraitUrl: FARM_ASSETS.calf,
      };
      soundEngine.play('heal');
      showNotice(`¡Bienvenido al corral! Nació el ternero ${calf.name}.`);
      return {
        ...prev,
        inventory: { ...prev.inventory, hayKg: prev.inventory.hayKg - 12 },
        animals: [...prev.animals, calf],
        selectedAnimalId: calf.id,
        logs: appendLog(prev.logs, prev.day, `Nació un nuevo ternero en la granja: ${calf.name}.`, 'cuidado'),
      };
    });
  };

  const handleAdvanceDay = () => {
    soundEngine.play('day');
    setFarmState((prev) => {
      const nextDay = prev.day + 1;
      const seasonIndex = Math.floor((nextDay - 1) / 4) % SEASONS_ORDER.length;
      const nextSeason = SEASONS_ORDER[seasonIndex];
      const weatherPool = WEATHERS_BY_SEASON[nextSeason];
      const nextWeather = weatherPool[(nextDay - 1) % weatherPool.length];

      const thirstDecayBase = prev.weather === 'SECO' ? 24 : 16;
      const thirstDecay = Math.round(thirstDecayBase * (prev.upgrades.BEBEDERO_AUTO ? 0.55 : 1));
      const hungerDecay = prev.difficulty === 'DESAFIO' ? 21 : 16;

      let totalMilkPotential = 0;
      const calvesGrown: string[] = [];
      const sickAnimals: string[] = [];

      const updatedAnimals: Animal[] = prev.animals.map((a) => {
        const nextAge = a.ageDays + 1;
        let nextSpecies = a.species;
        let nextBreed = a.breedLabel;
        let nextPortrait = a.portraitUrl;

        if (a.species === 'TERNERO' && nextAge >= 6) {
          nextSpecies = 'VACA_LECHERA';
          nextBreed = SPECIES_CONFIG.VACA_LECHERA.label;
          nextPortrait = FARM_ASSETS.dairyCow;
          calvesGrown.push(a.name);
        }

        const nextHunger = Math.max(0, a.hunger - hungerDecay);
        const nextThirst = Math.max(0, a.thirst - thirstDecay);

        let nextHealth = a.health;
        let nextSick = a.isSick;

        if (nextHunger < 25 || nextThirst < 25) {
          nextHealth = Math.max(0, nextHealth - 18);
          if (!nextSick && nextHealth < 65) {
            nextSick = true;
          }
        } else if (nextHunger >= 55 && nextThirst >= 55 && !nextSick) {
          const recovery = prev.upgrades.ESTABLO_REFORZADO ? 12 : 6;
          nextHealth = Math.min(100, nextHealth + recovery);
        }

        if (nextSick) {
          nextHealth = Math.max(0, nextHealth - (prev.upgrades.ESTABLO_REFORZADO ? 6 : 12));
          sickAnimals.push(a.name);
        }

        let nextHappiness = a.happiness;
        if (!a.brushedToday) {
          nextHappiness = Math.max(15, nextHappiness - 6);
        }
        if (nextWeather === 'SOLEADO' || nextWeather === 'FRESCO') {
          nextHappiness = Math.min(100, nextHappiness + 4);
        }

        const cfg = SPECIES_CONFIG[nextSpecies];
        let addedMilk = 0;
        if (cfg.dailyMilkCapacity > 0 && !nextSick && nextHunger >= 40 && nextThirst >= 40) {
          const careMultiplier = (nextHunger + nextThirst + nextHappiness) / 300;
          addedMilk = Number((cfg.dailyMilkCapacity * (0.65 + careMultiplier * 0.45)).toFixed(1));
          totalMilkPotential += addedMilk;
        }

        return {
          ...a,
          ageDays: nextAge,
          species: nextSpecies,
          breedLabel: nextBreed,
          portraitUrl: nextPortrait,
          weightKg: a.weightKg + (nextHunger >= 50 ? 4 : 0),
          hunger: nextHunger,
          thirst: nextThirst,
          health: nextHealth,
          happiness: nextHappiness,
          isSick: nextSick,
          milkReady: Math.min(cfg.maxMilkStorage, Number((a.milkReady + addedMilk).toFixed(1))),
          brushedToday: false,
          grazedToday: false,
        };
      });

      const surviving = updatedAnimals.filter((a) => a.health > 0);
      if (surviving.length === 0) {
        return {
          ...prev,
          day: nextDay,
          animals: [],
          phase: 'GAME_OVER',
        };
      }

      const nextMoisture =
        nextWeather === 'LLUVIA_SUAVE'
          ? 95
          : Math.max(10, prev.forageField.moisture - (nextWeather === 'SECO' ? 24 : 12));
      const baseForageGain = nextMoisture >= 40 ? 22 : 10;
      const fertilizedBonus = prev.forageField.fertilized ? 14 : 0;
      const riegoMultiplier = prev.upgrades.RIEGO_PASTURA ? 1.6 : 1;
      const forageGrown = Math.round((baseForageGain + fertilizedBonus) * riegoMultiplier);
      const nextForageGrowth = Math.min(100, prev.forageField.growth + forageGrown);

      const compostCollected = Math.max(1, Math.floor(surviving.length / 2));
      const rainwaterBonus = nextWeather === 'LLUVIA_SUAVE' ? 20 : 0;

      const summary: DaySummaryData = {
        previousDay: prev.day,
        newDay: nextDay,
        newWeather: nextWeather,
        newSeason: nextSeason,
        milkProducedPotential: totalMilkPotential,
        forageGrown,
        calvesGrown,
        sickAnimals,
        compostCollected,
        autoWaterSaved: prev.upgrades.BEBEDERO_AUTO ? 1 : 0,
      };

      return {
        ...prev,
        phase: 'DAY_SUMMARY',
        day: nextDay,
        season: nextSeason,
        weather: nextWeather,
        wellCharge: 100,
        animals: surviving,
        selectedAnimalId:
          surviving.some((a) => a.id === prev.selectedAnimalId) ? prev.selectedAnimalId : surviving[0].id,
        inventory: {
          ...prev.inventory,
          waterLiters: prev.inventory.waterLiters + rainwaterBonus,
          compostBags: prev.inventory.compostBags + compostCollected,
        },
        forageField: {
          ...prev.forageField,
          growth: nextForageGrowth,
          moisture: nextMoisture,
        },
        marketPrices: generateDailyPrices(nextDay),
        pastureItems: createStarterPastureItems(nextDay),
        orders: generateDailyOrders(nextDay),
        lastSummary: summary,
        logs: appendLog(
          prev.logs,
          nextDay,
          `Inició el Día ${nextDay} (${nextSeason.toLowerCase()}, clima ${nextWeather.toLowerCase().replace('_', ' ')}).`,
          'clima'
        ),
      };
    });
  };

  const handleResetFarm = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSavedSnapshot(null);
    const fresh = createInitialFarmState(difficulty);
    setFarmState(fresh);
    setActiveTab('POTRERO');
    soundEngine.play('day');
  };

  const milkingTargetAnimal = milkingAnimalId
    ? farmState.animals.find((a) => a.id === milkingAnimalId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EFE6] text-[#1E3522]">
      <TopBar
        phase={farmState.phase}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          soundEngine.play('click');
          setActiveTab(tab);
        }}
        onAdvanceDay={handleAdvanceDay}
        onReturnToMenu={() => {
          soundEngine.play('click');
          setFarmState((prev) => ({ ...prev, phase: 'TITLE_MENU' }));
        }}
      />

      {bannerNotice && (
        <div className="max-w-[1380px] mx-auto w-full px-6 pt-3">
          <div className="bg-[#2F5E39] text-[#FAF7F0] text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between gap-4">
            <span>{bannerNotice}</span>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="text-[#DDE8D8] hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {farmState.phase === 'TITLE_MENU' ? (
        <TitleMenu
          selectedDifficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          hasSavedGame={Boolean(savedSnapshot && savedSnapshot.animals.length > 0)}
          savedDay={savedSnapshot?.day ?? null}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
        />
      ) : (
        <main className="flex-1 pb-10">
          {activeTab === 'POTRERO' && (
            <FarmPastureView
              state={farmState}
              autoTick={autoTick}
              isMuted={isMuted}
              feedbacks={feedbacks}
              onToggleAutoTick={() => setAutoTick((v) => !v)}
              onToggleMute={handleToggleMute}
              onSelectTool={(tool) => {
                soundEngine.play('click');
                setFarmState((prev) => ({ ...prev, activeTool: tool }));
              }}
              onAnimalClick={handleAnimalClick}
              onDropToolOnAnimal={handleDropToolOnAnimal}
              onCareAction={handleCareAction}
              onOpenMilkingGame={(id) => {
                soundEngine.play('click');
                setMilkingAnimalId(id);
              }}
              onFeedAll={handleFeedAll}
              onWaterAll={handleWaterAll}
              onMilkAll={handleMilkAll}
              onGrazeAll={handleGrazeAll}
              onRingBell={handleRingBell}
              onCollectPastureItem={handleCollectPastureItem}
              onFulfillOrder={handleFulfillOrder}
              onSellAnimal={handleSellAnimal}
              onPumpWell={handlePumpWell}
              onManualPumpWell={handleManualPumpWell}
              onWaterForage={handleWaterForage}
              onFertilizeForage={handleFertilizeForage}
              onHarvestForage={handleHarvestForage}
            />
          )}

          {activeTab === 'MERCADO' && (
            <MarketView
              state={farmState}
              onBuySupply={handleBuySupply}
              onBuyAnimal={handleBuyAnimal}
              onSellProduct={handleSellProduct}
              onBuyUpgrade={handleBuyUpgrade}
            />
          )}

          {activeTab === 'QUESERIA' && (
            <DairyCraftView
              state={farmState}
              onCraftCheese={handleCraftCheese}
              onOpenCheeseGame={() => {
                soundEngine.play('click');
                setCheeseGameOpen(true);
              }}
              onBreedCalf={handleBreedCalf}
            />
          )}

          {activeTab === 'LOGROS' && (
            <AchievementsView state={farmState} onResetFarm={handleResetFarm} />
          )}
        </main>
      )}

      {milkingTargetAnimal && (
        <MilkingChallengeModal
          animal={milkingTargetAnimal}
          onComplete={handleCompleteMilkingGame}
          onCancel={() => setMilkingAnimalId(null)}
        />
      )}

      {cheeseGameOpen && (
        <CheesePressModal
          baseYield={farmState.upgrades.QUESERIA_ARTESANAL ? 3 : 1}
          onComplete={handleCompleteCheeseGame}
          onCancel={() => setCheeseGameOpen(false)}
        />
      )}

      {farmState.phase === 'DAY_SUMMARY' && farmState.lastSummary && (
        <DaySummaryModal
          summary={farmState.lastSummary}
          onContinue={() => {
            soundEngine.play('click');
            setFarmState((prev) => ({ ...prev, phase: 'PLAYING' }));
          }}
        />
      )}

      {farmState.phase === 'GAME_OVER' && (
        <GameOverModal state={farmState} onRestart={handleResetFarm} />
      )}
    </div>
  );
}
