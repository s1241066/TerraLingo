import React, { useEffect, useRef, useState } from 'react';
import { PlanetScene, PlacedBuilding, TilePavingType, WalkingCitizen, CitizenAnimalType, TimeOfDayMode } from './three/PlanetScene';
import {
  BLUEPRINT_CATALOGUE,
  ItemBlueprint,
  CHAPTERS,
  ChapterInfo,
  IslandIncident,
  ISLAND_INCIDENTS,
  ISLAND_THEMES,
  DailyCheckInReward,
} from './data/unit5Data';
import { IslandHUD } from './components/IslandHUD';
import { KingdomShopModal } from './components/KingdomShopModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { ModuleTPR } from './components/modules/ModuleTPR';
import { ModuleALM } from './components/modules/ModuleALM';
import { ModuleCLT } from './components/modules/ModuleCLT';
import { ModuleGTM } from './components/modules/ModuleGTM';
import { ModuleCLL } from './components/modules/ModuleCLL';
import { soundEngine } from './audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Play,
  Award,
  Volume2,
  Calendar,
  Store,
  MessageSquare,
  Compass,
  Coffee,
  Heart,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X,
  Navigation,
  Mic,
  Truck,
  BookOpen,
  PhoneCall,
  Settings,
  GraduationCap,
  ShieldCheck,
  Coins,
  RefreshCw,
  Send,
  Loader2,
} from 'lucide-react';

export type GameRoleMode = 'student' | 'teacher';
const MAX_TEACHER_PROSPERITY = 1200;

interface NpcChatTurn {
  role: 'user' | 'npc';
  textEn: string;
  textZh?: string;
  learningTip?: string;
}

const ANIMAL_META: Record<
  CitizenAnimalType,
  { emoji: string; label: string; quickReplies: string[]; greetingZh: string }
> = {
  rabbit: {
    emoji: '🐰',
    label: '小兔導航員',
    greetingZh: '嗨！我是小兔 Yuki，沿著街道散步時最喜歡幫大家指引方向了！',
    quickReplies: [
      'Excuse me, how do I get to The May Fair Hotel?',
      'Should I turn left or turn right on Berkeley Street?',
      'Is Green Park Station far on foot?',
    ],
  },
  dog: {
    emoji: '🐶',
    label: '小狗禮貌官',
    greetingZh: '汪汪！我是柯基 Toby，街頭問路記得要親切有禮貌喔！',
    quickReplies: [
      'Excuse me, could you tell me the way to the police station?',
      'Thank you so much for helping me!',
      'How do I ask for directions politely?',
    ],
  },
  cat: {
    emoji: '🐱',
    label: '貓咪快遞員',
    greetingZh: '喵～我是貓咪 Leo，每天騎車、搭地鐵在城市裡穿梭送快遞！',
    quickReplies: [
      'Do you go to work by scooter or by metro?',
      'Can I take a red bus to Big Ben?',
      'What is the difference between "take a bus" and "by bus"?',
    ],
  },
  bear: {
    emoji: '🐻',
    label: '小熊旅遊家',
    greetingZh: '哈囉！我是小熊 Emma，最喜歡研究倫敦英式與美式英文的差別！',
    quickReplies: [
      'What does "the Tube" mean in London?',
      'Why do British people say "ground floor"?',
      'Tell me a fun London travel tip!',
    ],
  },
  mouse: {
    emoji: '🐭',
    label: '小老鼠學伴',
    greetingZh: '吱吱！我是暖心小老鼠 Pip，不敢開口說英文時我隨時陪你練習！',
    quickReplies: [
      'I feel nervous about speaking English. Can you help?',
      'Let us practice saying "Excuse me" together!',
      'How do I ask if City Bank is across from the hotel?',
    ],
  },
  bird: {
    emoji: '🐦',
    label: '廣場小飛鳥',
    greetingZh: '啾啾！我從空中看見整個 TerraLingo 探索島的街道囉！',
    quickReplies: [
      'What can you see from the sky?',
      'Where is the Royal Fountain?',
      'Have a wonderful day!',
    ],
  },
};

const NPC_GREETING_POOLS: Record<CitizenAnimalType, string[]> = {
  rabbit: [
    'Hi! I am Yuki the Bunny! Go straight for two blocks to find Green Park Station!',
    'Excuse me! Could you help me check if The May Fair Hotel is on Berkeley Street?',
    'Hop along! Walk straight down Station Road and turn left at the corner!',
  ],
  dog: [
    'Woof woof! I am Toby! Always start with "Excuse me" when asking for directions!',
    'Arf! Walk straight down Berkeley Street and remember to look left and right!',
    'Woof! Stopping at the zebra crosswalk keeps everyone safe on the street!',
  ],
  cat: [
    'Meow! I am Leo! I ride my scooter to deliver parcels, or take the metro on rainy days!',
    'Purr! Did you come to TerraLingo Island by bus, by train, or on foot?',
    'Meow! Remember: we "take a bus", "ride a bike", and "go on foot"!',
  ],
  bear: [
    'Hello friend! I am Emma! In London, people call the subway "the Tube" and fries "chips"!',
    'Good day! In the UK, the ground floor is called the first floor in the US!',
    'Hi there! Would you like some biscuits or cookies by the Royal Fountain?',
  ],
  mouse: [
    'Squeak! Hi, I am Pip! Take a deep breath and say: "Excuse me, how do I get to City Bank?"',
    'Hello buddy! You are doing great! Practice one short English sentence with me!',
    'Squeak! Do not worry about mistakes—asking questions helps your English shine!',
  ],
  bird: [
    'Chirp chirp! Flying high above the Royal Fountain this morning!',
    'Tweet tweet! From the sky, I can see City Bank across from the Supermarket!',
    'Chirp! The cherry blossom trees along Station Road smell wonderful!',
  ],
};

function pickCitizenGreeting(citizen: WalkingCitizen, excludeLine?: string): string {
  const basePool = NPC_GREETING_POOLS[citizen.type] || NPC_GREETING_POOLS.rabbit;
  const combinedPool = citizen.dialogue
    ? [citizen.dialogue, ...basePool.filter(line => line !== citizen.dialogue)]
    : basePool;
  const filtered = excludeLine
    ? combinedPool.filter(line => line !== excludeLine)
    : combinedPool;
  const candidates = filtered.length > 0 ? filtered : combinedPool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<PlanetScene | null>(null);

  // Game & Island State
  const [gameState, setGameState] = useState<'title' | 'playing'>('title');
  const [roleMode, setRoleMode] = useState<GameRoleMode>('student');
  const [coins, setCoins] = useState(150); // Initial student coins
  // Initial student prosperity: starts at 20 (Only Level 1 is open; higher levels unlock progressively)
  const [prosperity, setProsperity] = useState(20);
  const [currentChapter, setCurrentChapter] = useState<ChapterInfo>(CHAPTERS[0]);
  const [activeIslandTier, setActiveIslandTier] = useState(1);
  const [islandBuildingCounts, setIslandBuildingCounts] = useState<Record<number, number>>({
    1: 6,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [timeMode, setTimeMode] = useState<TimeOfDayMode>('day');
  const [isBirdsEyeView, setIsBirdsEyeView] = useState(false);
  const [interactingCitizen, setInteractingCitizen] = useState<WalkingCitizen | null>(null);
  const [citizenGreeting, setCitizenGreeting] = useState<string>('');
  const [npcChatHistory, setNpcChatHistory] = useState<NpcChatTurn[]>([]);
  const [npcQuickReplies, setNpcQuickReplies] = useState<string[]>([]);
  const [npcChatInput, setNpcChatInput] = useState('');
  const [isNpcChatLoading, setIsNpcChatLoading] = useState(false);
  const [showAllQuestsInModal, setShowAllQuestsInModal] = useState(false);

  const isTeacherMode = roleMode === 'teacher';
  const effectiveProsperity = isTeacherMode ? Math.max(prosperity, MAX_TEACHER_PROSPERITY) : prosperity;
  const effectiveCoins = isTeacherMode ? Number.POSITIVE_INFINITY : coins;
  const maxUnlockedTier = Math.max(
    1,
    Math.min(5, CHAPTERS.filter(c => effectiveProsperity >= c.requiredProsperity).length)
  );

  // Adaptive Assessment Difficulty (基礎 easy / 標準 normal / 大師 hard)
  const [adaptiveLevel, setAdaptiveLevel] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);

  // Active Placement, Relocation & Tile Paving
  const [selectedBlueprint, setSelectedBlueprint] = useState<ItemBlueprint | null>(null);
  const [activeRotation, setActiveRotation] = useState(0);
  const [isDemolishMode, setIsDemolishMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [movingBuilding, setMovingBuilding] = useState<PlacedBuilding | null>(null);
  const [isPavingMode, setIsPavingMode] = useState(false);
  const [activePavingType, setActivePavingType] = useState<TilePavingType>('cobblestone');

  // Modals
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeIncident, setActiveIncident] = useState<IslandIncident | null>(null);

  // Daily Check-in state
  const [checkInDay, setCheckInDay] = useState(1);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  // Level Up Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Three.js scene once in stable ref container
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new PlanetScene(mountRef.current);
    planetRef.current = scene;

    // Starter buildings on the expanded island (spaced out cleanly according to multi-tile footprints)
    scene.placeBuilding('bp_metro', 'metro_kiosk', -3, 2, 0, 2, 1);
    scene.placeBuilding('bp_bench', 'bench', -1, 2, 0, 1, 1);
    scene.placeBuilding('bp_streetlamp', 'streetlamp', 1, 1, 0, 1, 1);
    scene.placeBuilding('bp_bank', 'bank_building', 2, 2, 0, 2, 2);
    scene.placeBuilding('bp_street_sign', 'street_sign', 1, 4, 0, 1, 1);
    scene.placeBuilding('bp_oak', 'tree_oak', -3, -3, 0, 1, 1);
    setIslandBuildingCounts(scene.getIslandBuildingCounts());

    // Clicking/Tapping a walking animal (<360ms) zooms the camera in & opens interactive chat + dedicated game!
    scene.onCitizenClick = (citizen: WalkingCitizen) => {
      soundEngine.playClick();
      setIsBirdsEyeView(false);
      scene.focusOnCitizen(citizen);
      const greeting = pickCitizenGreeting(citizen);
      const meta = ANIMAL_META[citizen.type] || ANIMAL_META.rabbit;
      setInteractingCitizen(citizen);
      setCitizenGreeting(greeting);
      setNpcChatHistory([
        {
          role: 'npc',
          textEn: greeting,
          textZh: meta.greetingZh,
        },
      ]);
      setNpcQuickReplies(meta.quickReplies);
      setNpcChatInput('');
      setShowAllQuestsInModal(false);
      soundEngine.speakEnglish(greeting, 'US', undefined, 0.86);
    };

    // Long press on citizen (>360ms) grabs the character to pick up & relocate
    scene.onCitizenLongPressStart = (citizen: WalkingCitizen) => {
      soundEngine.playClick();
      setToastMessage(`🖐️ 已抓起【${citizen.name || 'NPC'}】！拖曳至草地或廣場區塊放開即可安置。`);
    };

    // Dropping citizen onto destination tile
    scene.onCitizenDrop = (citizen: WalkingCitizen, _targetGx: number, _targetGz: number, isValid: boolean) => {
      if (isValid) {
        soundEngine.playPlaceItem();
        setToastMessage(`📍 成功將【${citizen.name || 'NPC'}】安置在指定區塊！✨`);
        soundEngine.speakEnglish('Thank you for placing me here!', 'US');
      } else {
        soundEngine.playError();
        setToastMessage('⚠️ 不能放置在馬路或建築物上！角色已回到安全步道。');
      }
    };

    return () => {
      scene.dispose();
    };
  }, []);

  // Sync paving mode with 3D scene
  useEffect(() => {
    planetRef.current?.setPavingMode(isPavingMode, activePavingType);
  }, [isPavingMode, activePavingType]);

  // Sync edit mode (build, move, paving, demolish) to show dashed grid overlay
  useEffect(() => {
    const editing = Boolean(selectedBlueprint || isMoveMode || isPavingMode || isDemolishMode);
    planetRef.current?.setEditMode(editing);
  }, [selectedBlueprint, isMoveMode, isPavingMode, isDemolishMode]);

  // Sync active multi-tile footprint preview with 3D hover marker
  useEffect(() => {
    if (selectedBlueprint) {
      const fpW = selectedBlueprint.footprint?.w ?? 1;
      const fpD = selectedBlueprint.footprint?.d ?? 1;
      planetRef.current?.setActivePlacementFootprint(fpW, fpD, activeRotation);
    } else if (isMoveMode && movingBuilding) {
      planetRef.current?.setActivePlacementFootprint(
        movingBuilding.footprintW,
        movingBuilding.footprintD,
        activeRotation
      );
    } else {
      planetRef.current?.setActivePlacementFootprint(1, 1, 0);
    }
  }, [selectedBlueprint, isMoveMode, movingBuilding, activeRotation]);

  // Sync click callback when selectedBlueprint, activeRotation, move mode, demolish mode, or paving mode updates
  useEffect(() => {
    if (!planetRef.current) return;
    planetRef.current.onTileClick = (gx, gz, existing) => {
      // 0. Tile Paving Mode Handling (鋪設磁磚)
      if (isPavingMode) {
        if (gx === 0 || gz === 0) {
          soundEngine.playError();
          setToastMessage('⚠️ 車道區域！此處為主要行車幹道，必須保持平整供車輛正常行駛，禁止鋪設磁磚！');
          setTimeout(() => setToastMessage(null), 3500);
          return;
        }
        planetRef.current?.paveTile(gx, gz, activePavingType);
        soundEngine.playPlaceItem();
        const paveLabels: Record<TilePavingType, string> = {
          cobblestone: '歐風石磚',
          red_brick: '英倫紅磚',
          stone_plaza: '大理石板',
          terracotta: '暖橙陶磚',
          wood_deck: '木棧道',
          grass: '青草綠地',
        };
        setToastMessage(`🧱 已將地塊鋪設為【${paveLabels[activePavingType]}】！`);
        setTimeout(() => setToastMessage(null), 2500);
        return;
      }

      // 1. Move Mode Handling
      if (isMoveMode) {
        if (!movingBuilding) {
          if (existing) {
            const picked = planetRef.current?.pickUpBuilding(gx, gz);
            if (picked) {
              setMovingBuilding(picked);
              setActiveRotation(picked.rotationY);
              soundEngine.playClick();
              const bName = BLUEPRINT_CATALOGUE.find(b => b.id === picked.blueprintId)?.chinese || '設施';
              setToastMessage(`🏗️ 已提起【${bName}】，點擊任一空地磚重新擺放！`);
              setTimeout(() => setToastMessage(null), 3000);
            }
          }
          return;
        } else {
          // Multi-tile Collision Check for Relocation Target
          const check = planetRef.current?.canPlaceAt(
            gx,
            gz,
            movingBuilding.footprintW,
            movingBuilding.footprintD,
            activeRotation
          );
          if (!check || !check.canPlace) {
            soundEngine.playError();
            if (check?.reason === 'road_reserved') {
              setToastMessage('⚠️ 交通要道！多格建築的範圍跨越到主要車道，請選擇其他空地或點擊「旋轉」！');
            } else if (check?.reason === 'out_of_bounds') {
              setToastMessage('⚠️ 超出島嶼邊界！請往島嶼內側移動一格再放置。');
            } else {
              const occName = check?.existingBuilding
                ? BLUEPRINT_CATALOGUE.find(b => b.id === check.existingBuilding?.blueprintId)?.chinese || '現有設施'
                : '現有設施';
              setToastMessage(`⚠️ 物體碰撞！建築佔地面積與【${occName}】重疊，請選擇寬敞空地或旋轉方向！`);
            }
            setTimeout(() => setToastMessage(null), 3500);
            return;
          }

          // Safe placement at multi-tile footprint
          planetRef.current?.completeMove(movingBuilding, gx, gz, activeRotation);
          if (planetRef.current) setIslandBuildingCounts(planetRef.current.getIslandBuildingCounts());
          soundEngine.playPlaceItem();
          setMovingBuilding(null);
          setIsMoveMode(false);
          setToastMessage('✅ 設施已成功擺放至新位置！');
          setTimeout(() => setToastMessage(null), 3000);
          return;
        }
      }

      // 2. Demolish Mode Handling
      if (isDemolishMode) {
        if (existing) {
          planetRef.current?.removeBuilding(gx, gz);
          if (planetRef.current) setIslandBuildingCounts(planetRef.current.getIslandBuildingCounts());
          soundEngine.playClick();
          setToastMessage('💥 建築已拆除！空出該地磚！');
          setTimeout(() => setToastMessage(null), 2500);
        }
        return;
      }

      // 3. New Construction Placement Handling
      if (selectedBlueprint) {
        const fpW = selectedBlueprint.footprint?.w ?? 1;
        const fpD = selectedBlueprint.footprint?.d ?? 1;
        const check = planetRef.current?.canPlaceAt(gx, gz, fpW, fpD, activeRotation);
        if (!check || !check.canPlace) {
          soundEngine.playError();
          if (check?.reason === 'road_reserved') {
            setToastMessage('⚠️ 交通要道！此建築佔地範圍跨越主要車道，請往草地內側移動或點擊「旋轉」！');
          } else if (check?.reason === 'out_of_bounds') {
            setToastMessage('⚠️ 超出島嶼邊界！此多格建築無法超出可建範圍，請往內側點擊。');
          } else {
            const occName = check?.existingBuilding
              ? BLUEPRINT_CATALOGUE.find(b => b.id === check.existingBuilding?.blueprintId)?.chinese || '現有建築'
              : '現有建築';
            setToastMessage(`⚠️ 物體碰撞！佔地範圍與【${occName}】重疊，請選擇寬敞空地或旋轉方向！`);
          }
          setTimeout(() => setToastMessage(null), 3500);
          return;
        }

        planetRef.current?.placeBuilding(
          selectedBlueprint.id,
          selectedBlueprint.modelType,
          gx,
          gz,
          activeRotation,
          fpW,
          fpD
        );
        if (planetRef.current) setIslandBuildingCounts(planetRef.current.getIslandBuildingCounts());
        soundEngine.playPlaceItem();
        if (!isTeacherMode) {
          // Increase student prosperity from building
          setProsperity(prev => prev + selectedBlueprint.prosperity);
        }
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
        });
        setToastMessage(
          isTeacherMode
            ? `✨ 成功佈置【${selectedBlueprint.chinese}】（${fpW}×${fpD} 格）！（教師模式：繁榮度滿級／無限金幣）`
            : `✨ 成功建造【${selectedBlueprint.chinese}】（${fpW}×${fpD} 格）！島嶼繁榮度 +${selectedBlueprint.prosperity}`
        );
        setTimeout(() => setToastMessage(null), 3500);
        setSelectedBlueprint(null);
      } else if (existing) {
        // Direct click on any existing island object: Pick up and move it immediately!
        const picked = planetRef.current?.pickUpBuilding(gx, gz);
        if (picked) {
          setMovingBuilding(picked);
          setActiveRotation(picked.rotationY);
          setIsMoveMode(true);
          soundEngine.playClick();
          const bName = BLUEPRINT_CATALOGUE.find(b => b.id === picked.blueprintId)?.chinese || '設施';
          setToastMessage(`🏗️ 已拿起【${bName}】！點擊任一空地磚重新擺放，或點擊「旋轉」調整朝向。`);
          setTimeout(() => setToastMessage(null), 3500);
        }
      }
    };
  }, [selectedBlueprint, activeRotation, isDemolishMode, isMoveMode, movingBuilding, isPavingMode, activePavingType, isTeacherMode]);

  // Update dynamic traffic as student answers more questions
  useEffect(() => {
    planetRef.current?.updateTrafficCount(totalQuestionsAnswered);
  }, [totalQuestionsAnswered]);

  // Chapter & 5-Island Tier Progression based on Effective Island Prosperity
  useEffect(() => {
    let nextChap = CHAPTERS[0];
    for (let i = CHAPTERS.length - 1; i >= 0; i--) {
      if (effectiveProsperity >= CHAPTERS[i].requiredProsperity) {
        nextChap = CHAPTERS[i];
        break;
      }
    }

    if (nextChap.chapter !== currentChapter.chapter) {
      const isUpgrading = nextChap.chapter > currentChapter.chapter;
      if (movingBuilding) {
        planetRef.current?.cancelMove(movingBuilding);
        setMovingBuilding(null);
        setIsMoveMode(false);
      }
      setCurrentChapter(nextChap);
      setActiveIslandTier(nextChap.chapter);
      planetRef.current?.switchIsland(nextChap.chapter);
      if (planetRef.current) setIslandBuildingCounts(planetRef.current.getIslandBuildingCounts());
      if (isUpgrading && !isTeacherMode) {
        const theme = ISLAND_THEMES.find(t => t.tier === nextChap.chapter);
        soundEngine.playLevelUp();
        confetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
        setToastMessage(
          `🎉 恭喜！繁榮度突破解鎖第 ${nextChap.chapter} 座島嶼【${theme?.name || nextChap.title}】！可在左上角隨時切換五大獨立島嶼設計不同地圖！`
        );
        setTimeout(() => setToastMessage(null), 5500);
      }
    }
  }, [effectiveProsperity, currentChapter, isTeacherMode, movingBuilding]);

  // Handle Rewards when answering questions correctly (Coins + Prosperity)
  const handleReward = (earnedCoins: number, earnedProsperity: number) => {
    if (!isTeacherMode) {
      setCoins(c => c + earnedCoins);
      setProsperity(p => p + earnedProsperity);
    }
    setTotalQuestionsAnswered(q => q + 1);

    // Adaptive Assessment Logic
    const newStreak = consecutiveCorrect + 1;
    setConsecutiveCorrect(newStreak);
    if (newStreak >= 2) {
      setAdaptiveLevel('hard');
    } else {
      setAdaptiveLevel('normal');
    }

    setToastMessage(
      isTeacherMode
        ? '✨ 挑戰成功！（教師模式：全遊戲已開放、資源無限暢玩）'
        : `✨ 挑戰成功！獲得 +${earnedCoins} 金幣，島嶼繁榮度 +${earnedProsperity}！`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Switch between Student Mode and Teacher Mode
  const handleChangeRoleMode = (nextMode: GameRoleMode) => {
    if (nextMode === roleMode) return;
    soundEngine.playClick();
    setRoleMode(nextMode);
    if (nextMode === 'teacher') {
      soundEngine.playLevelUp();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setToastMessage('👩‍🏫 已切換至【教師模式】！繁榮度已滿級、所有遊戲直接解鎖，金幣無限暢買所有裝飾！');
    } else {
      setToastMessage('🎓 已切換至【學生模式】！依島嶼繁榮度循序解鎖關卡並累積金幣。');
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Daily Check-In Claim
  const handleClaimCheckIn = (reward: DailyCheckInReward) => {
    if (!isTeacherMode) {
      setCoins(c => c + reward.coins);
    }
    setHasClaimedToday(true);
    setCheckInDay(d => Math.min(d + 1, 7));
    setIsCheckInOpen(false);

    // Auto-enter placement mode for the reward blueprint!
    const bp = BLUEPRINT_CATALOGUE.find(b => b.id === reward.itemBlueprintId);
    if (bp) {
      setSelectedBlueprint(bp);
      setToastMessage(
        isTeacherMode
          ? `🎁 簽到成功！獲得【${bp.chinese}】，請點選島嶼地磚建造！`
          : `🎁 簽到成功！獲得 +${reward.coins} 金幣與【${bp.chinese}】，請點選島嶼地磚建造！`
      );
    } else {
      setToastMessage(isTeacherMode ? '🎁 簽到成功！' : `🎁 簽到成功！獲得 +${reward.coins} 金幣！`);
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Start game & play Suno Jazz Loop continuously
  const handleStartGame = () => {
    soundEngine.playClick();
    soundEngine.startBgm(); // Loops Suno Café Jazz audio file continuously
    setGameState('playing');
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${timeMode === 'night' ? 'dark' : ''}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 pointer-events-auto bg-slate-950/45 backdrop-blur-xs text-white">
          <div className="w-full flex items-center justify-between max-w-5xl">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-950/80 px-3 py-1.5 rounded-full border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TerraLingo · 國二英語 Unit 5 互動探索島</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Suno 原創咖啡爵士背景樂循環播放中</span>
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center max-w-2xl space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-lg text-balance">
              TerraLingo
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-amber-300 drop-shadow-sm">
              Unit 5: How Do We Go to the Hotel?
            </p>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-lg mx-auto font-medium">
              點擊可愛動物島民拉近互動聊天、挑戰實境街頭問路與交通換乘任務，打造屬於你的 TerraLingo 英語島嶼！
            </p>

            {/* Student / Teacher Mode Selector on Title Screen */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
              <button
                onClick={() => handleChangeRoleMode('student')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  roleMode === 'student'
                    ? 'bg-emerald-950/90 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-300/40'
                    : 'bg-slate-900/75 border-slate-700 hover:border-slate-500 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>學生模式</span>
                  </span>
                  {roleMode === 'student' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      已選擇
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  循序漸進模式：累積繁榮度依序解鎖五大遊戲，答題賺取金幣購買島嶼裝飾。
                </p>
              </button>

              <button
                onClick={() => handleChangeRoleMode('teacher')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  roleMode === 'teacher'
                    ? 'bg-indigo-950/90 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-300/40'
                    : 'bg-slate-900/75 border-slate-700 hover:border-slate-500 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>教師模式</span>
                  </span>
                  {roleMode === 'teacher' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-400 text-slate-950">
                      已選擇
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  教學示範專用：起始繁榮度滿級、全遊戲直接開放，金幣無限暢買所有裝飾！
                </p>
              </button>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 active:scale-95 text-white font-black text-lg shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{isTeacherMode ? '以教師模式進入 TerraLingo' : '進入 TerraLingo 開始探索'}</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-300/80 tracking-wide text-center">
            滑鼠拖曳旋轉島嶼 · 滾輪縮放 · 點擊動物角色拉近對話與挑戰專屬關卡 · 答題賺金幣建造 TerraLingo
          </div>
        </div>
      )}

      {/* Level-Up / Milestone Toast */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-slate-900/95 text-white font-black text-xs sm:text-sm border-2 border-amber-400 shadow-2xl flex items-center gap-2 animate-bounce-slight max-w-lg text-center">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Playing Game HUD Overlay (Hidden while interacting with zoomed NPC or full modal so island & NPC stay clear) */}
      {gameState === 'playing' && !interactingCitizen && !activeIncident && (
        <IslandHUD
          prosperity={effectiveProsperity}
          currentChapter={currentChapter}
          activeIslandTier={activeIslandTier}
          maxUnlockedTier={maxUnlockedTier}
          islandBuildingCounts={islandBuildingCounts}
          onSelectIslandTier={tier => {
            if (movingBuilding) {
              planetRef.current?.cancelMove(movingBuilding);
              setMovingBuilding(null);
              setIsMoveMode(false);
            }
            setActiveIslandTier(tier);
            planetRef.current?.switchIsland(tier);
            if (planetRef.current) setIslandBuildingCounts(planetRef.current.getIslandBuildingCounts());
            const theme = ISLAND_THEMES.find(t => t.tier === tier);
            if (theme) {
              setToastMessage(`${theme.emoji} 已切換至【${theme.name}】（獨立地圖配置）！`);
              setTimeout(() => setToastMessage(null), 2500);
            }
          }}
          coins={effectiveCoins}
          roleMode={roleMode}
          adaptiveLevel={adaptiveLevel}
          selectedBlueprint={selectedBlueprint}
          onSelectBlueprint={bp => {
            setSelectedBlueprint(bp);
            setIsDemolishMode(false);
            setIsPavingMode(false);
          }}
          activeRotation={activeRotation}
          onRotateItem={() => setActiveRotation(r => (r + Math.PI / 2) % (Math.PI * 2))}
          onClearTileMode={() => {
            soundEngine.playClick();
            setIsDemolishMode(false);
            setIsMoveMode(false);
            setIsPavingMode(false);
            if (movingBuilding) planetRef.current?.cancelMove(movingBuilding);
            setMovingBuilding(null);
            setSelectedBlueprint(null);
          }}
          isDemolishMode={isDemolishMode}
          onToggleDemolishMode={() => {
            soundEngine.playClick();
            if (isMoveMode && movingBuilding) planetRef.current?.cancelMove(movingBuilding);
            setMovingBuilding(null);
            setIsMoveMode(false);
            setIsPavingMode(false);
            setSelectedBlueprint(null);
            setIsDemolishMode(m => !m);
          }}
          isMoveMode={isMoveMode}
          movingBuildingName={movingBuilding ? BLUEPRINT_CATALOGUE.find(b => b.id === movingBuilding.blueprintId)?.chinese || '設施' : null}
          onToggleMoveMode={() => {
            soundEngine.playClick();
            if (isMoveMode) {
              if (movingBuilding) planetRef.current?.cancelMove(movingBuilding);
              setMovingBuilding(null);
              setIsMoveMode(false);
            } else {
              setIsDemolishMode(false);
              setIsPavingMode(false);
              setSelectedBlueprint(null);
              setIsMoveMode(true);
            }
          }}
          onCancelMove={() => {
            soundEngine.playClick();
            if (movingBuilding) planetRef.current?.cancelMove(movingBuilding);
            setMovingBuilding(null);
            setIsMoveMode(false);
          }}
          isPavingMode={isPavingMode}
          activePavingType={activePavingType}
          onTogglePavingMode={() => {
            soundEngine.playClick();
            if (isPavingMode) {
              setIsPavingMode(false);
            } else {
              setIsMoveMode(false);
              setIsDemolishMode(false);
              setSelectedBlueprint(null);
              if (movingBuilding) planetRef.current?.cancelMove(movingBuilding);
              setMovingBuilding(null);
              setIsPavingMode(true);
            }
          }}
          onSelectPavingType={type => {
            setActivePavingType(type);
          }}
          onOpenIncident={inc => {
            soundEngine.playClick();
            setActiveIncident(inc);
          }}
          onOpenShop={() => {
            soundEngine.playClick();
            setIsShopOpen(true);
          }}
          onOpenCheckIn={() => {
            soundEngine.playClick();
            setIsCheckInOpen(true);
          }}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
          }}
          timeMode={timeMode}
          onCycleTimeMode={() => {
            soundEngine.playClick();
            const next = planetRef.current?.cycleTimeOfDay() || 'day';
            setTimeMode(next);
            const modeLabels: Record<TimeOfDayMode, string> = {
              day: '☀️ 清新白晝',
              sunset: '🌅 倫敦黃昏晚霞',
              night: '🌙 倫敦靜夜星空',
              auto: '⏱️ 自動日夜輪播',
            };
            setToastMessage(`島嶼時光切換至【${modeLabels[next]}】！`);
            setTimeout(() => setToastMessage(null), 2500);
          }}
          onResetCamera={() => {
            soundEngine.playClick();
            setIsBirdsEyeView(false);
            planetRef.current?.resetCamera();
          }}
          isBirdsEyeView={isBirdsEyeView}
          onToggleBirdsEyeView={() => {
            const next = planetRef.current?.toggleBirdsEyeView() ?? false;
            setIsBirdsEyeView(next);
            setToastMessage(
              next
                ? '🦅 已切換至【鳥瞰俯視圖】（正交規劃視角），方便規劃多格建築配置！'
                : '🏝️ 已返回 3D 立體環繞視角！'
            );
            setTimeout(() => setToastMessage(null), 2500);
          }}
        />
      )}

      {/* Kingdom Construction Shop Modal */}
      {isShopOpen && (
        <KingdomShopModal
          currentCoins={effectiveCoins}
          currentChapter={currentChapter.chapter}
          currentProsperity={effectiveProsperity}
          isTeacherMode={isTeacherMode}
          onSelectToBuild={bp => {
            if (!isTeacherMode) {
              setCoins(c => c - bp.costCoins);
            }
            const fpW = bp.footprint?.w ?? 1;
            const fpD = bp.footprint?.d ?? 1;
            setSelectedBlueprint(bp);
            setIsShopOpen(false);
            setToastMessage(`🔨 準備建造【${bp.chinese}】（佔地 ${fpW}×${fpD} 格），請點擊島嶼上的空地！`);
            setTimeout(() => setToastMessage(null), 3500);
          }}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {/* ⚙️ Game Settings Modal (Compact Student Mode vs Teacher Mode) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/45">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-400 shadow-2xl overflow-hidden max-h-[82vh] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/15">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9.5px] uppercase tracking-widest font-black text-indigo-200">
                    Game Mode & Preferences
                  </div>
                  <h2 className="text-base font-black">遊戲設定與模式切換</h2>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="關閉設定"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  選擇遊玩模式（教學展示 / 學生練習）
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  可隨時在此切換模式。切換至教師模式後，將自動解鎖滿級繁榮度、全部關卡與無限金幣。
                </p>
              </div>

              <div className="space-y-3">
                {/* Student Mode Card */}
                <button
                  onClick={() => {
                    handleChangeRoleMode('student');
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    roleMode === 'student'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-400/40 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white">
                          🎓 學生模式（Student Mode）
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                          標準闖關成長體驗
                        </div>
                      </div>
                    </div>
                    {roleMode === 'student' && (
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 使用中
                      </span>
                    )}
                  </div>
                  <ul className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                    <li>• 初始繁榮度 {prosperity} 點、金幣 {coins} 枚</li>
                    <li>• 隨島嶼繁榮度提升依序解鎖五大英語實境小遊戲</li>
                    <li>• 透過挑戰答題賺取金幣，購買建築與島嶼裝飾</li>
                  </ul>
                </button>

                {/* Teacher Mode Card */}
                <button
                  onClick={() => {
                    handleChangeRoleMode('teacher');
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    roleMode === 'teacher'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-400/40 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white">
                          👩‍🏫 教師模式（Teacher Mode）
                        </div>
                        <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">
                          課堂展示・全資源解鎖
                        </div>
                      </div>
                    </div>
                    {roleMode === 'teacher' && (
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 使用中
                      </span>
                    )}
                  </div>
                  <ul className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                    <li>• 島嶼繁榮度一開始即為滿級（{MAX_TEACHER_PROSPERITY} ★滿級），五大主題島嶼全部解鎖可自由切換</li>
                    <li>• 直接開放遊玩全部五大英語小遊戲（街頭導航、問路、快遞、隨堂、熱線）</li>
                    <li className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500 inline shrink-0" />
                      <span>金幣無限（∞），可自由購買並佈置工坊內所有建築與裝飾</span>
                    </li>
                  </ul>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black cursor-pointer transition-colors"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Check-In Modal */}
      {isCheckInOpen && (
        <DailyCheckInModal
          currentDay={checkInDay}
          hasClaimedToday={hasClaimedToday}
          onClaimReward={handleClaimCheckIn}
          onClose={() => setIsCheckInOpen(false)}
        />
      )}

      {/* Incident Mini-Games Triggered by Situations */}
      {activeIncident?.type === 'navigation' && (
        <ModuleTPR
          adaptiveLevel={adaptiveLevel}
          onCompleteMission={(earnedCoins, earnedProsperity) => {
            handleReward(earnedCoins, earnedProsperity);
            setActiveIncident(null);
          }}
          onClose={() => setActiveIncident(null)}
        />
      )}

      {activeIncident?.type === 'courier' && (
        <ModuleALM
          adaptiveLevel={adaptiveLevel}
          onCompleteShift={(earnedCoins, earnedProsperity) => {
            handleReward(earnedCoins, earnedProsperity);
            setActiveIncident(null);
          }}
          onClose={() => setActiveIncident(null)}
        />
      )}

      {activeIncident?.type === 'npc_lost' && (
        <ModuleCLT
          onUnlockReward={(_bpId, pts) => {
            handleReward(75, pts);
          }}
          onClose={() => setActiveIncident(null)}
        />
      )}

      {activeIncident?.type === 'handbook_quiz' && (
        <ModuleGTM
          onEarnPoints={pts => {
            handleReward(80, pts);
            setActiveIncident(null);
          }}
          onClose={() => setActiveIncident(null)}
        />
      )}

      {activeIncident?.type === 'counselor_call' && (
        <ModuleCLL
          onEarnPoints={pts => {
            handleReward(60, pts);
            setActiveIncident(null);
          }}
          onClose={() => setActiveIncident(null)}
        />
      )}

      {/* 🐾 3D 動物角色拉近互動 & 專屬關卡面板 */}
      {interactingCitizen && (() => {
        const meta = ANIMAL_META[interactingCitizen.type] || ANIMAL_META.rabbit;
        const assignedIncident =
          ISLAND_INCIDENTS.find(i => i.id === interactingCitizen.assignedIncidentId) || ISLAND_INCIDENTS[0];
        const isPrimaryUnlocked = isTeacherMode || effectiveProsperity >= assignedIncident.requiredProsperity;

        const closeCitizenModal = () => {
          setInteractingCitizen(null);
          planetRef.current?.clearCitizenFocus();
        };

        const sendNpcDialogue = async (rawText: string) => {
          const text = rawText.trim();
          if (!text || isNpcChatLoading) return;
          soundEngine.playClick();
          setNpcChatInput('');
          const nextHistory: NpcChatTurn[] = [...npcChatHistory, { role: 'user', textEn: text }];
          setNpcChatHistory(nextHistory);
          setIsNpcChatLoading(true);

          try {
            const resp = await fetch('/api/gemini/npc-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                npcName: interactingCitizen.name || meta.label,
                animalSpecies: interactingCitizen.type,
                assignedGameTitle: assignedIncident.titleChinese,
                userMessage: text,
                history: nextHistory.map(h => ({ role: h.role, text: h.textEn })),
              }),
            });
            const data = await resp.json();
            const replyEn = data.replyEn || 'Nice talking with you on TerraLingo Island!';
            setNpcChatHistory(prev => [
              ...prev,
              {
                role: 'npc',
                textEn: replyEn,
                textZh: data.replyZh,
                learningTip: data.learningTip,
              },
            ]);
            if (Array.isArray(data.quickReplies) && data.quickReplies.length > 0) {
              setNpcQuickReplies(data.quickReplies.slice(0, 3));
            }
            soundEngine.speakEnglish(replyEn, 'US', undefined, 0.86);
          } catch {
            const fallbackReply = "Excuse me! Let's practice English together here on TerraLingo Island!";
            setNpcChatHistory(prev => [
              ...prev,
              {
                role: 'npc',
                textEn: fallbackReply,
                textZh: '我們一起在 TerraLingo 島上快樂練習英文吧！',
              },
            ]);
            soundEngine.speakEnglish(fallbackReply, 'US', undefined, 0.86);
          } finally {
            setIsNpcChatLoading(false);
          }
        };

        const getGameIcon = (type: string) => {
          switch (type) {
            case 'navigation':
              return <Compass className="w-5 h-5 text-emerald-400" />;
            case 'npc_lost':
              return <Mic className="w-5 h-5 text-sky-400" />;
            case 'courier':
              return <Truck className="w-5 h-5 text-amber-400" />;
            case 'handbook_quiz':
              return <BookOpen className="w-5 h-5 text-purple-400" />;
            case 'counselor_call':
              return <PhoneCall className="w-5 h-5 text-rose-400" />;
            default:
              return <Play className="w-5 h-5 text-emerald-400" />;
          }
        };

        return (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-end sm:items-center justify-end p-2.5 sm:p-4">
            <div className="pointer-events-auto relative w-full sm:w-[340px] md:w-[360px] rounded-2xl bg-slate-900/95 border-2 border-emerald-400/80 shadow-2xl overflow-hidden flex flex-col max-h-[46vh] sm:max-h-[78vh]">
              {/* Compact Modal Header */}
              <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 border border-white shadow-md flex items-center justify-center text-xl shrink-0">
                    {meta.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-black text-white truncate">
                        {interactingCitizen.name || meta.label}
                      </h3>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold shrink-0">
                        {interactingCitizen.speciesLabel || meta.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-300 font-medium truncate">
                      🔍 面對面互動 · {interactingCitizen.state === 'enjoying_cafe'
                        ? '咖啡廳旁休息'
                        : interactingCitizen.state === 'sightseeing_hotel'
                        ? '飯店前觀光'
                        : interactingCitizen.state === 'waiting_bus'
                        ? '等候紅巴士'
                        : '隨時聊天與挑戰'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeCitizenModal}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-slate-700"
                  aria-label="關閉並恢復全景"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">全景</span>
                </button>
              </div>

              {/* Compact Scrollable Body: 1-to-1 Mapped Game + Interactive Chat */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
                {/* 1. Compact Dedicated Mini-Game Card */}
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    isPrimaryUnlocked
                      ? 'bg-gradient-to-br from-emerald-950/75 to-slate-900 border-emerald-400/70 shadow-md'
                      : 'bg-slate-950/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      專屬關卡 · {assignedIncident.levelTitle}
                    </span>
                    {isPrimaryUnlocked ? (
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> 可立即遊玩
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> 需繁榮度 {assignedIncident.requiredProsperity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      {getGameIcon(assignedIncident.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white leading-snug">
                        {assignedIncident.titleChinese}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {assignedIncident.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    {isPrimaryUnlocked ? (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          closeCitizenModal();
                          setActiveIncident(assignedIncident);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>遊玩這個關卡</span>
                      </button>
                    ) : (
                      <div className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>尚需 {assignedIncident.requiredProsperity - effectiveProsperity} 點繁榮度解鎖</span>
                      </div>
                    )}

                    <button
                      onClick={() => setShowAllQuestsInModal(v => !v)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>全部關卡</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllQuestsInModal ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showAllQuestsInModal && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-700/80 space-y-1.5">
                      {ISLAND_INCIDENTS.filter(i => i.id !== assignedIncident.id).map(inc => {
                        const unlocked = isTeacherMode || effectiveProsperity >= inc.requiredProsperity;
                        return (
                          <div
                            key={inc.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="shrink-0">{getGameIcon(inc.type)}</div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-black text-white truncate">{inc.titleChinese}</div>
                                <div className="text-[10px] text-slate-400">{inc.levelTitle}</div>
                              </div>
                            </div>
                            {unlocked ? (
                              <button
                                onClick={() => {
                                  soundEngine.playClick();
                                  closeCitizenModal();
                                  setActiveIncident(inc);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] cursor-pointer shrink-0"
                              >
                                遊玩
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold shrink-0">
                                🔒 {inc.requiredProsperity}點
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Interactive Animal Dialogue History */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>與 {interactingCitizen.name || meta.label} 英文對話</span>
                    </span>
                    <button
                      onClick={() => {
                        const nextLine = pickCitizenGreeting(interactingCitizen, citizenGreeting);
                        setCitizenGreeting(nextLine);
                        setNpcChatHistory(prev => [...prev, { role: 'npc', textEn: nextLine }]);
                        soundEngine.speakEnglish(nextLine, 'US', undefined, 0.86);
                      }}
                      className="text-[11px] font-black text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> 聽一句新問候
                    </button>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {npcChatHistory.map((turn, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-2xl px-3 py-2 text-xs space-y-1 ${
                            turn.role === 'user'
                              ? 'bg-sky-600 text-white rounded-br-sm'
                              : 'bg-slate-800/95 text-slate-100 border border-slate-700 rounded-bl-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold leading-snug">{turn.textEn}</span>
                            {turn.role === 'npc' && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => soundEngine.speakEnglish(turn.textEn, 'US', undefined, 0.86)}
                                  className="p-1 rounded-md bg-slate-900 hover:bg-sky-500/20 text-sky-300 cursor-pointer"
                                  title="美式發音"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => soundEngine.speakEnglish(turn.textEn, 'US', undefined, 0.62)}
                                  className="px-1 py-0.5 rounded-md bg-cyan-800 hover:bg-cyan-700 text-white text-[9px] font-bold cursor-pointer"
                                  title="慢速播放"
                                >
                                  🐢
                                </button>
                              </div>
                            )}
                          </div>
                          {turn.textZh && (
                            <div className="text-[11px] text-slate-300">{turn.textZh}</div>
                          )}
                          {turn.learningTip && (
                            <div className="text-[10px] text-amber-300/95 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/30">
                              💡 {turn.learningTip}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isNpcChatLoading && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 px-2 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{interactingCitizen.name || meta.label} 正在思考怎麼回答你...</span>
                      </div>
                    )}
                  </div>

                  {/* Clickable Conversation Prompt Chips */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400">點擊對話內容快速發問：</div>
                    <div className="flex flex-wrap gap-1.5">
                      {npcQuickReplies.map((promptText, idx) => (
                        <button
                          key={idx}
                          disabled={isNpcChatLoading}
                          onClick={() => sendNpcDialogue(promptText)}
                          className="text-left px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-900/60 text-sky-200 border border-slate-700 hover:border-sky-400 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          💬 {promptText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Open Chat Input Box */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      sendNpcDialogue(npcChatInput);
                    }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <input
                      type="text"
                      value={npcChatInput}
                      onChange={e => setNpcChatInput(e.target.value)}
                      placeholder="輸入英文或中文跟角色對話（如：Where is City Bank?）"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-xs text-white placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!npcChatInput.trim() || isNpcChatLoading}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>傳送</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-3.5 py-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    soundEngine.playSuccess();
                    if (!isTeacherMode) {
                      setCoins(c => c + 15);
                    }
                    setToastMessage(
                      isTeacherMode
                        ? `🤝 與【${interactingCitizen.name || meta.label}】友善互動完成！`
                        : `🤝 與【${interactingCitizen.name || meta.label}】友善互動，金幣 +15！`
                    );
                    setTimeout(() => setToastMessage(null), 2500);
                    closeCitizenModal();
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Heart className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{isTeacherMode ? '友善擊掌' : '友善擊掌 (+15 金幣)'}</span>
                </button>

                <button
                  onClick={closeCitizenModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer transition-all"
                >
                  返回全景
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
