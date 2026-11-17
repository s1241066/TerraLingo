import React, { useState, useEffect, useRef } from 'react';
import {
  generateRandomNavigationStage,
  NavigationStage,
  TextbookRescueQuestion,
  getRandomTextbookRescueQuestion,
} from '../../data/unit5Data';
import { soundEngine } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Heart,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Compass,
  Coins,
  Lightbulb,
  MapPin,
  Navigation,
  Footprints,
  Shuffle,
  BookOpen,
  HelpCircle,
  Trophy,
  Sparkles,
  Eye,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface ModuleTPRProps {
  onCompleteMission: (coins: number, prosperity: number) => void;
  onClose: () => void;
  adaptiveLevel?: 'easy' | 'normal' | 'hard';
}

const TOTAL_STAGES = 5; // 每次要玩五道隨機的題目才算完成這部分

export const ModuleTPR: React.FC<ModuleTPRProps> = ({ onCompleteMission, onClose, adaptiveLevel = 'normal' }) => {
  // Mode selection: 街區實境走位導航 vs 課本實境情境救援題庫
  const [activeTab, setActiveTab] = useState<'map_nav' | 'textbook_quiz'>('map_nav');

  // ==========================================
  // 🧭 模式 1：街區實境走位導航 State (每次需通關 5 道隨機題目)
  // ==========================================
  const [round, setRound] = useState(1);
  const [completedStagesCount, setCompletedStagesCount] = useState(0);
  const [isAllFiveCleared, setIsAllFiveCleared] = useState(false);
  const [currentMission, setCurrentMission] = useState<NavigationStage>(() => generateRandomNavigationStage(1));

  // Adaptive adjustments based on student level
  const bonusTime = adaptiveLevel === 'easy' ? 10 : adaptiveLevel === 'hard' ? -2 : 0;
  const initialTime = currentMission.timeLimit + bonusTime;

  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [stamina, setStamina] = useState(100);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'cleared' | 'failed'>('ready');
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(currentMission.startPos);
  const [pathTrail, setPathTrail] = useState<{ x: number; y: number }[]>([currentMission.startPos]);
  const [playerPath, setPlayerPath] = useState<('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showScaffoldHint, setShowScaffoldHint] = useState(adaptiveLevel === 'easy');

  // 🎧 聽力先行與分段提示 State (Scaffolded Listening & Graduated Hints)
  // 規則：一開始不給句子，先聽語音，依錯誤次數分段提示，第 3 次錯誤給答案，答對後給完整句子
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);
  const [hasListenedAudio, setHasListenedAudio] = useState(false);

  // 🚦 行人安全素養與交通號誌 State (Traffic Light & Pedestrian Safety Literacy)
  const [trafficLight, setTrafficLight] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [trafficCountdown, setTrafficCountdown] = useState(6);
  const [hasLookedBothWays, setHasLookedBothWays] = useState(false);
  const [safetyViolations, setSafetyViolations] = useState(0);
  const [safetyBonusCount, setSafetyBonusCount] = useState(0);
  const [safetyToast, setSafetyToast] = useState<{ msg: string; type: 'success' | 'warn' | 'danger' } | null>(null);

  const timerRef = useRef<number | null>(null);

  // ==========================================
  // 📋 模式 2：課本實境情境救援題庫 State (每次隨機出題)
  // ==========================================
  const [currentQuiz, setCurrentQuiz] = useState<TextbookRescueQuestion>(() => getRandomTextbookRescueQuestion());
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // 方向對照資訊
  const DIR_INFO: Record<'UP' | 'DOWN' | 'LEFT' | 'RIGHT', { en: string; zh: string }> = {
    UP: { en: 'Go straight / Walk ahead', zh: '直走' },
    DOWN: { en: 'Turn back / Down', zh: '後退' },
    LEFT: { en: 'Turn left', zh: '左轉' },
    RIGHT: { en: 'Turn right', zh: '右轉' },
  };

  // 提取關鍵方向動詞與介系詞
  const getDirectionKeywords = (sentence: string) => {
    const keywords: string[] = [];
    const lower = sentence.toLowerCase();
    if (lower.includes('go straight') || lower.includes('straight')) keywords.push('Go straight (直走)');
    if (lower.includes('turn left') || lower.includes('left')) keywords.push('Turn left (左轉)');
    if (lower.includes('turn right') || lower.includes('right')) keywords.push('Turn right (右轉)');
    if (lower.includes('walk along')) keywords.push('Walk along (沿著走)');
    if (lower.includes('cross') || lower.includes('across')) keywords.push('Cross (過馬路)');
    if (lower.includes('next to')) keywords.push('next to (在旁邊)');
    if (lower.includes('between')) keywords.push('between (在兩者之間)');
    if (lower.includes('opposite')) keywords.push('opposite (在對面)');
    if (lower.includes('on the corner')) keywords.push('on the corner (在轉角)');
    if (lower.includes('on your right')) keywords.push('on your right (在你右手邊)');
    if (lower.includes('on your left')) keywords.push('on your left (在你左手邊)');
    return keywords.length > 0 ? keywords : ['Turn left / Turn right', 'Go straight'];
  };

  const getHalfSentenceHint = (sentence: string) => {
    const parts = sentence.split(/,|\band\b/i);
    const firstPart = parts[0]?.trim() || sentence.slice(0, Math.floor(sentence.length * 0.45));
    return `"${firstPart}..." （請專心聆聽後半句語音以辨識最終目的地）`;
  };

  // 播放當前導航語音（美式標準發音，支援正常語速 0.86 與慢速 0.62）
  const playPromptAudio = (rate = 0.86) => {
    const isSlow = rate < 0.78;
    setIsAudioPlaying(!isSlow);
    setIsSlowPlaying(isSlow);
    setHasListenedAudio(true);
    soundEngine.speakEnglish(currentMission.audioPrompt, 'US', undefined, rate);
    setTimeout(() => {
      setIsAudioPlaying(false);
      setIsSlowPlaying(false);
    }, isSlow ? 5200 : 3600);
  };

  // 播放課本情境題語音（美式標準發音，支援正常與慢速）
  const playQuizAudio = (rate = 0.86) => {
    const textToSpeak = currentQuiz.audioPrompt || currentQuiz.question;
    soundEngine.speakEnglish(textToSpeak, 'US', undefined, rate);
  };

  // 🎲 隨機更換當前題目 (保留目前關卡進度)
  const handleRandomizeCurrentStage = () => {
    soundEngine.playClick();
    const nextStage = generateRandomNavigationStage(round, currentMission.presetId);
    setCurrentMission(nextStage);
    setGameState('ready');
    setCurrentStep(0);
    setMistakeCount(0);
    setHasListenedAudio(false);
    setTimeLeft(nextStage.timeLimit + bonusTime);
    setStamina(100);
    setPlayerPos(nextStage.startPos);
    setPathTrail([nextStage.startPos]);
    setPlayerPath([]);
    setFeedbackMsg('');
    setShowScaffoldHint(adaptiveLevel === 'easy');
    setTrafficLight('GREEN');
    setTrafficCountdown(6);
    setHasLookedBothWays(false);
    setSafetyToast(null);
  };

  // 🎲 隨機切換至全新的課本救援題目
  const handleRandomizeQuizQuestion = () => {
    soundEngine.playClick();
    const nextQ = getRandomTextbookRescueQuestion(currentQuiz.id);
    setCurrentQuiz(nextQ);
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
  };

  // 開始實境走位 (一開始不顯示句子，先讓學生聆聽英語語音)
  const startMission = () => {
    setGameState('playing');
    setCurrentStep(0);
    setMistakeCount(0);
    setTimeLeft(initialTime);
    setStamina(100);
    setPlayerPos(currentMission.startPos);
    setPathTrail([currentMission.startPos]);
    setPlayerPath([]);
    setFeedbackMsg('');
    setTrafficLight('GREEN');
    setTrafficCountdown(6);
    setHasLookedBothWays(false);
    setSafetyToast(null);
    playPromptAudio();
  };

  // 👀 行人「停看聽」確認左右路況
  const handleLookBothWays = () => {
    if (gameState !== 'playing') return;
    soundEngine.playSuccess();
    setHasLookedBothWays(true);
    setSafetyToast({
      msg: '👀 已落實「停看聽」！左右張望確認無來車，行人安全素養優秀！',
      type: 'success',
    });
  };

  // 🚦 紅綠燈號誌週期循環 (綠燈 6 秒 -> 黃燈 2 秒 -> 紅燈 5 秒)
  useEffect(() => {
    if (gameState !== 'playing' || activeTab !== 'map_nav') return;

    const interval = window.setInterval(() => {
      setTrafficCountdown(prev => {
        if (prev <= 1) {
          if (trafficLight === 'GREEN') {
            setTrafficLight('YELLOW');
            return 2;
          } else if (trafficLight === 'YELLOW') {
            setTrafficLight('RED');
            return 5;
          } else {
            setTrafficLight('GREEN');
            return 6;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, activeTab, trafficLight]);

  // 倒數計時器
  useEffect(() => {
    if (gameState === 'playing' && activeTab === 'map_nav') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFailure('時間到了！深呼吸，放輕鬆再來試一次！');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, activeTab]);

  const handleFailure = (msg: string) => {
    soundEngine.playError();
    setGameState('failed');
    setFeedbackMsg(msg);
    setShowScaffoldHint(true);
  };

  const calculateNextPos = (pos: { x: number; y: number }, dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    switch (dir) {
      case 'UP':
        return { x: pos.x, y: Math.max(0, pos.y - 1) };
      case 'DOWN':
        return { x: pos.x, y: Math.min(3, pos.y + 1) };
      case 'LEFT':
        return { x: Math.max(0, pos.x - 1), y: pos.y };
      case 'RIGHT':
        return { x: Math.min(4, pos.x + 1), y: pos.y };
    }
  };

  const handleDirectionInput = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState !== 'playing') return;

    soundEngine.playClick();
    const expected = currentMission.correctPath[currentStep];
    const nextPos = calculateNextPos(playerPos, dir);
    const isCrossingStreet = nextPos.x !== playerPos.x || nextPos.y !== playerPos.y;

    // 🚦 斑馬線與紅綠燈碰撞安全判定 (Traffic Light & Pedestrian Safety Check)
    let currentHp = stamina;
    if (isCrossingStreet) {
      if (trafficLight === 'RED') {
        // 🚨 違規闖紅燈！扣減 30 體力值
        const penalty = 30;
        currentHp = Math.max(0, stamina - penalty);
        setStamina(currentHp);
        setSafetyViolations(v => v + 1);
        soundEngine.playError();
        setSafetyToast({
          msg: '🚨 違規闖紅燈！未遵守交通號誌，扣減 30 體力值！過馬路務必遵守「紅燈停、綠燈行，行人停看聽」！',
          type: 'danger',
        });

        if (currentHp <= 0) {
          handleFailure('⚠️ 行人安全亮紅燈！因違規闖紅燈扣光體力值！過馬路切記遵守交通安全！');
          return;
        }
      } else if (trafficLight === 'YELLOW') {
        // ⚠️ 黃燈搶快過馬路
        const penalty = 10;
        currentHp = Math.max(0, stamina - penalty);
        setStamina(currentHp);
        soundEngine.playError();
        setSafetyToast({
          msg: '⚠️ 黃燈搶快過斑馬線較危險！扣減 10 體力值。在路口應停等下一個綠燈！',
          type: 'warn',
        });

        if (currentHp <= 0) {
          handleFailure('⚠️ 搶快穿越馬路導致體力耗盡！請在路口停等綠燈！');
          return;
        }
      } else {
        // 🟢 綠燈安全過馬路
        if (hasLookedBothWays) {
          currentHp = Math.min(100, stamina + 10);
          setStamina(currentHp);
          setSafetyBonusCount(b => b + 1);
          setHasLookedBothWays(false);
          setSafetyToast({
            msg: '🌟 完美行人素養！綠燈且落實「停看聽」左右看，體力值 +10！',
            type: 'success',
          });
        } else {
          currentHp = Math.min(100, stamina + 4);
          setStamina(currentHp);
          setSafetyBonusCount(b => b + 1);
          setSafetyToast({
            msg: '✅ 遵守綠燈走斑馬線！體力值 +4！(提示：過馬路前按「停看聽」可獲 +10！)',
            type: 'success',
          });
        }
      }
    }

    if (dir === expected) {
      soundEngine.playSuccess();
      const nextStep = currentStep + 1;
      setPlayerPos(nextPos);
      setPathTrail(prev => [...prev, nextPos]);

      const newPath = [...playerPath, dir];
      setPlayerPath(newPath);
      setCurrentStep(nextStep);

      // Authentic Street Location feedback
      let streetHint = '';
      if (nextPos.x === currentMission.targetPos.x && nextPos.y === currentMission.targetPos.y) {
        streetHint = `🎉 順利抵達【${currentMission.target}】！第 ${round}/5 題通關！`;
      } else if (nextPos.y === 1) {
        streetHint = '📍 目前位於 Stratton Street！請留意語音轉向指示！';
      } else if (nextPos.y === 2) {
        streetHint = '📍 目前位於 Piccadilly Road！繼續跟隨英語語音前進！';
      } else if (nextPos.y === 3) {
        streetHint = '📍 目前位於 Station Road！注意前方路口！';
      } else if (nextPos.x === 2) {
        streetHint = '📍 正沿著 Berkeley Street 直行！';
      } else {
        streetHint = '方向完全正確，繼續跟隨英語指示前進！';
      }
      setFeedbackMsg(streetHint);

      if (nextStep >= currentMission.correctPath.length) {
        const nextCompleted = Math.max(completedStagesCount, round);
        setCompletedStagesCount(nextCompleted);

        if (round >= TOTAL_STAGES) {
          // 全部五題完成！
          setIsAllFiveCleared(true);
          setGameState('cleared');
          soundEngine.playLevelUp();
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
          });
        } else {
          // 單關通過
          setGameState('cleared');
          soundEngine.playLevelUp();
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } else {
      soundEngine.playError();
      const newMistakes = mistakeCount + 1;
      setMistakeCount(newMistakes);

      const penalty = 20;
      const newStamina = Math.max(0, currentHp - penalty);
      setStamina(newStamina);
      setShowScaffoldHint(true);

      const expectedInfo = DIR_INFO[expected];

      if (newMistakes === 1) {
        setFeedbackMsg(`⚠️ 方向走反囉！【階段 1 提示已解鎖】：請查看下方的核心方向關鍵詞，再聽一次語音！`);
      } else if (newMistakes === 2) {
        setFeedbackMsg(`⚠️ 第二次走偏！【階段 2 提示已解鎖】：已揭示前半句結構與地標提示！`);
      } else {
        // 第三次錯誤：全面揭曉正確答案與走法！
        setFeedbackMsg(`🎯【階段 3 答案已揭曉】：下一步請點擊【${expectedInfo.zh} (${expected})】！完整句子已解開！`);
      }

      if (newStamina <= 0) {
        handleFailure('體力耗盡！請參考完整提示與中文指引，再出發一次！');
      }
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    if (activeTab !== 'map_nav') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleDirectionInput('UP');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleDirectionInput('DOWN');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleDirectionInput('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleDirectionInput('RIGHT');
      if (e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleLookBothWays();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentStep, stamina, playerPos, activeTab, trafficLight, hasLookedBothWays, mistakeCount]);

  // 前往下一道隨機題目 (1 -> 2 -> 3 -> 4 -> 5)
  const handleProceedNextRound = () => {
    if (round < TOTAL_STAGES) {
      const nextRound = round + 1;
      const nextStage = generateRandomNavigationStage(nextRound, currentMission.presetId);
      setCurrentMission(nextStage);
      setRound(nextRound);
      setGameState('ready');
      setMistakeCount(0);
      setHasListenedAudio(false);
      setPlayerPos(nextStage.startPos);
      setPathTrail([nextStage.startPos]);
      setShowScaffoldHint(adaptiveLevel === 'easy');
      setFeedbackMsg('');
      soundEngine.playClick();
    }
  };

  // 五關全部完成結算
  const handleFinishAllFive = () => {
    soundEngine.playLevelUp();
    // 總共 5 關獎勵：450 金幣，175 繁榮度
    onCompleteMission(450, 175);
    onClose();
  };

  // 重新再來一輪五關隨機考驗
  const handleRestartFiveRounds = () => {
    setRound(1);
    setCompletedStagesCount(0);
    setIsAllFiveCleared(false);
    const firstStage = generateRandomNavigationStage(1);
    setCurrentMission(firstStage);
    setGameState('ready');
    setPlayerPos(firstStage.startPos);
    setPathTrail([firstStage.startPos]);
    setShowScaffoldHint(adaptiveLevel === 'easy');
    setFeedbackMsg('');
    setSafetyViolations(0);
    setSafetyBonusCount(0);
    setTrafficLight('GREEN');
    setTrafficCountdown(6);
    setHasLookedBothWays(false);
    setSafetyToast(null);
    soundEngine.playClick();
  };

  // 提前退出時結算已通過的關卡
  const handleSafeClose = () => {
    if (completedStagesCount > 0) {
      onCompleteMission(completedStagesCount * 90, completedStagesCount * 35);
    }
    onClose();
  };

  // 課本題庫答題處理
  const handleSelectQuizOption = (optionIndex: number) => {
    if (isQuizSubmitted) return;

    setSelectedQuizOption(optionIndex);
    setIsQuizSubmitted(true);

    const isCorrect = optionIndex === currentQuiz.correctIndex;
    if (isCorrect) {
      soundEngine.playSuccess();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setQuizScore(s => s + 1);
      // TTS 美式朗讀正確答案
      soundEngine.speakEnglish(currentQuiz.options[optionIndex].text, 'US');
      onCompleteMission(85, 30);
    } else {
      soundEngine.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/45 select-none">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-2xl shadow-2xl border-2 border-emerald-400 overflow-hidden flex flex-col max-h-[84vh]">
        {/* Header */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-xl shadow-xs shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-emerald-100 flex items-center gap-1.5 flex-wrap">
                <span>街頭導航救援</span>
                <span className="bg-emerald-950/80 text-[10px] px-1.5 py-0.2 rounded-full font-black border border-emerald-400/40 text-emerald-200">
                  {activeTab === 'map_nav' ? `第 ${round}/${TOTAL_STAGES} 關` : `答對 ${quizScore} 題`}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black leading-tight truncate flex items-center gap-1.5">
                <span>街頭實境救援</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-white/20 text-emerald-50 hidden sm:inline">
                  Unit 5 實境地圖
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Randomize Button */}
            <button
              onClick={activeTab === 'map_nav' ? handleRandomizeCurrentStage : handleRandomizeQuizQuestion}
              title="隨機換一題（保持當前進度）"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[11px] shadow-sm transition-all cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              <span className="hidden sm:inline">隨機換題</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleSafeClose}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold flex items-center justify-center transition-transform active:scale-90 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher: 街區走位導航 vs 課本情境救援題庫 */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-2.5 pt-1 gap-1.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('map_nav');
            }}
            className={`flex-1 py-1.5 px-2.5 rounded-t-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'map_nav'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-x-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>🧭 街區實境走位</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
              {completedStagesCount}/{TOTAL_STAGES}
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('textbook_quiz');
            }}
            className={`flex-1 py-1.5 px-2.5 rounded-t-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'textbook_quiz'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-x-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📋 情境救援題庫</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 🧭 TAB 1: 街區實境走位導航 (Interactive Map Navigation) */}
        {/* ========================================================= */}
        {activeTab === 'map_nav' && (
          <div className="p-2.5 sm:p-3.5 flex-1 overflow-y-auto space-y-2.5">
            {/* 5-Stage Visual Progress Bar */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-300">
                  🎯 5 題救援通關進度：
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(step => {
                    const isDone = completedStagesCount >= step;
                    const isCurrent = round === step && !isAllFiveCleared;
                    return (
                      <div
                        key={step}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300 scale-110 font-black'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isDone ? '✓' : step}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] font-bold text-slate-400">
                {isAllFiveCleared ? (
                  <span className="text-emerald-400 font-black">★ 全部 5 題已通過！</span>
                ) : (
                  <span>
                    第 <strong className="text-amber-400">{round}</strong> / 5 題（剩餘 {TOTAL_STAGES - round} 題）
                  </span>
                )}
              </div>
            </div>

            {/* Scenario Header — Destination strictly hidden until solved or 3 mistakes */}
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-xs border border-emerald-300 shrink-0">
                  {gameState === 'cleared' || mistakeCount >= 3 ? currentMission.targetIcon : '🎧'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700">
                      {currentMission.sourcePage || 'Unit 5 聽力導航考驗'}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">
                      起點：{currentMission.startPos.name}（需走 {currentMission.correctPath.length} 步）
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                    {gameState === 'cleared' || mistakeCount >= 3 ? (
                      <span>🎯 目的地：【{currentMission.target}】</span>
                    ) : (
                      <span>🎯 目的地：請聆聽語音指示尋找（保密中）</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {gameState === 'cleared' || mistakeCount >= 3
                      ? currentMission.targetDesc
                      : '題幹不提供目的地名稱，請專心聆聽英語指路方向並觀察街道名牌！'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
                <button
                  onClick={() => playPromptAudio(0.86)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-[11px] shadow-xs transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isAudioPlaying ? '播放中...' : '正常語速 🔊'}</span>
                </button>

                <button
                  onClick={() => playPromptAudio(0.62)}
                  title="以慢速清晰朗讀英語指路"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-black text-[11px] shadow-xs transition-all cursor-pointer"
                >
                  <span>🐢</span>
                  <span>{isSlowPlaying ? '慢速播放中...' : '慢速播放'}</span>
                </button>

                <button
                  onClick={handleRandomizeCurrentStage}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 shadow-2xs transition-transform active:scale-90 cursor-pointer"
                  title="隨機換另一個考驗"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 🎧 聽力先行與分段提示卡片 (Scaffolded Audio Prompt Card) */}
            {mistakeCount === 0 ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/50 border-2 border-amber-500/50 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                      <Volume2 className={`w-4 h-4 ${isAudioPlaying || isSlowPlaying ? 'animate-bounce text-amber-300' : 'text-amber-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black text-amber-300">
                          🎧 沉浸式英語聽力指路（文字與目的地皆已隱藏）
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 text-[9px] font-bold border border-amber-600/60">
                          先聽後走
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                        請仔細聆聽語音中的街區數量、街道名稱與轉向，或點擊「慢速播放」逐字確認！
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => playPromptAudio(0.86)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isAudioPlaying ? '播放中...' : '重聽語音 🔊'}</span>
                    </button>
                    <button
                      onClick={() => playPromptAudio(0.62)}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      <span>🐢</span>
                      <span>{isSlowPlaying ? '慢速中...' : '慢速'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : mistakeCount === 1 ? (
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border-2 border-amber-500/70 shadow-md space-y-1.5 animate-pulse-subtle">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>💡 階段 1 鷹架提示（核心動詞與介系詞已解鎖）：</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playPromptAudio(0.86)}
                      className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" /> 正常語速
                    </button>
                    <button
                      onClick={() => playPromptAudio(0.62)}
                      className="text-[10px] font-bold text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      🐢 慢速播放
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {getDirectionKeywords(currentMission.audioPrompt).map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-amber-900/90 border border-amber-400 text-amber-200 font-black text-[11px] shadow-2xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  提示：句子完整文字依然遮蔽中，請根據關鍵詞辨別走向，注意路口轉角！
                </p>
              </div>
            ) : mistakeCount === 2 ? (
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-orange-950/70 to-slate-900 border-2 border-orange-500/70 shadow-md space-y-1.5 animate-pulse-subtle">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="text-[11px] font-black text-orange-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>💡 階段 2 鷹架提示（前半句結構已解鎖）：</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playPromptAudio(0.86)}
                      className="text-[10px] font-bold text-orange-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" /> 正常語速
                    </button>
                    <button
                      onClick={() => playPromptAudio(0.62)}
                      className="text-[10px] font-bold text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      🐢 慢速播放
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-black text-amber-100 tracking-wide">
                  {getHalfSentenceHint(currentMission.audioPrompt)}
                </p>
                <p className="text-[10px] text-orange-200/90 font-medium">
                  {currentMission.hint || '在十字路口注意路牌方向！'}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-2 border-rose-500 shadow-lg space-y-2">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="text-[11px] font-black text-rose-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>🎯 階段 3 答案解鎖（錯誤滿 3 次：完整句子與正確走法已公開）：</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playPromptAudio(0.86)}
                      className="text-[10px] font-black text-rose-200 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> 完整朗讀
                    </button>
                    <button
                      onClick={() => playPromptAudio(0.62)}
                      className="text-[10px] font-black text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      🐢 慢速朗讀
                    </button>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/90 border border-rose-500/40 space-y-1">
                  <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                    "{currentMission.audioPrompt}"
                  </p>
                  <p className="text-[11px] font-bold text-slate-300">
                    中文翻譯：{currentMission.chinesePrompt}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-0.5 text-xs font-black text-emerald-300">
                  <span>👉 當前第 {currentStep + 1} 步正確方向：</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black shadow-xs">
                    【{DIR_INFO[currentMission.correctPath[currentStep]]?.zh || '直走'} ({currentMission.correctPath[currentStep]})】
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">（請點下方亮起的方向鍵）</span>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 🗺️ 精緻化實境街區 2D 互動地圖 (清晰路名路牌 + 細緻道路 + 完整地名) */}
            {/* ========================================================= */}
            <div className="relative p-2.5 rounded-2xl bg-slate-950 border-2 border-slate-700/80 shadow-inner overflow-hidden">
              {/* Map Header Bar with Traffic Light Signal (out of map grid so zero overlap!) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300 font-black">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Street Navigation Map（依路牌找路線）：</span>
                </div>

                {/* 🚦 Real-time Traffic Signal & Pedestrian Crossing Widget */}
                <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 shadow-sm flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        trafficLight === 'RED'
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)] ring-1 ring-white scale-110'
                          : 'bg-rose-950/40 opacity-30'
                      }`}
                      title="紅燈停"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        trafficLight === 'YELLOW'
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)] ring-1 ring-white scale-110'
                          : 'bg-amber-950/40 opacity-30'
                      }`}
                      title="黃燈注意"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        trafficLight === 'GREEN'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] ring-1 ring-white scale-110'
                          : 'bg-emerald-950/40 opacity-30'
                      }`}
                      title="綠燈行"
                    />
                  </div>

                  <div className="flex items-center gap-1 font-mono font-black text-[10px]">
                    {trafficLight === 'GREEN' ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <span>🚶‍♂️</span>
                        <span>{trafficCountdown}s 綠燈行</span>
                      </span>
                    ) : trafficLight === 'YELLOW' ? (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <span>🏃‍♂️</span>
                        <span>{trafficCountdown}s 注意</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-0.5">
                        <span>🛑</span>
                        <span>{trafficCountdown}s 紅燈停</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Map Viewport (5 Cols x 4 Rows with Slim Asphalt Roads & Crisp Unobstructed Street Signs) */}
              <div className="relative w-full min-h-[300px] sm:min-h-[340px] bg-[#0b131e] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                {/* Subtle Park & City Block Grass Quadrants */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.12),transparent_65%)] pointer-events-none" />

                {/* Slim Horizontal Roads (Row 1: 37%, Row 2: 61%, Row 3: 85%) */}
                <div className="absolute left-0 right-0 top-[37%] -translate-y-1/2 h-4 bg-[#171921] border-y border-slate-600/50 flex items-center pointer-events-none">
                  <div className="w-full border-t border-dashed border-white/40" />
                </div>

                <div className="absolute left-0 right-0 top-[61%] -translate-y-1/2 h-4 bg-[#171921] border-y border-slate-600/50 flex items-center pointer-events-none">
                  <div className="w-full border-t border-dashed border-white/40" />
                </div>

                <div className="absolute left-0 right-0 top-[85%] -translate-y-1/2 h-4 bg-[#171921] border-y border-slate-600/50 flex items-center pointer-events-none">
                  <div className="w-full border-t border-dashed border-white/40" />
                </div>

                {/* Slim Vertical Roads (Col 0: 10%, Col 2: 50%, Col 4: 90%) */}
                <div className="absolute top-0 bottom-0 left-[10%] -translate-x-1/2 w-4 bg-[#171921] border-x border-slate-600/50 flex justify-center pointer-events-none">
                  <div className="h-full border-l border-dashed border-white/40" />
                </div>

                <div className="absolute top-0 bottom-0 left-[50%] -translate-x-1/2 w-4 bg-[#171921] border-x border-slate-600/50 flex justify-center pointer-events-none">
                  <div className="h-full border-l border-dashed border-white/40" />
                </div>

                <div className="absolute top-0 bottom-0 left-[90%] -translate-x-1/2 w-4 bg-[#171921] border-x border-slate-600/50 flex justify-center pointer-events-none">
                  <div className="h-full border-l border-dashed border-white/40" />
                </div>

                {/* Subtle Connector Walkways for Col 1 (30%) & Col 3 (70%) */}
                <div className="absolute top-[37%] bottom-[15%] left-[30%] -translate-x-1/2 w-1.5 bg-slate-700/35 pointer-events-none" />
                <div className="absolute top-[37%] bottom-[15%] left-[70%] -translate-x-1/2 w-1.5 bg-slate-700/35 pointer-events-none" />

                {/* ========================================================= */}
                {/* 🚧 清晰街道名牌（放置於無地標遮擋的路口與空路段上，z-20 清楚可見） */}
                {/* ========================================================= */}
                {/* Vertical Road Signs */}
                <div className="absolute left-[10%] top-[13%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/95 text-emerald-200 text-[9.5px] sm:text-[10.5px] font-black border border-emerald-400/70 shadow-md whitespace-nowrap">
                    Second Street
                  </span>
                </div>
                <div className="absolute left-[50%] top-[24.5%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/95 text-emerald-200 text-[9.5px] sm:text-[10.5px] font-black border border-emerald-400/70 shadow-md whitespace-nowrap">
                    Berkeley Street
                  </span>
                </div>
                <div className="absolute left-[90%] top-[13%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-purple-950/95 text-purple-200 text-[9.5px] sm:text-[10.5px] font-black border border-purple-400/70 shadow-md whitespace-nowrap">
                    Spring Road
                  </span>
                </div>

                {/* Horizontal Road Signs */}
                <div className="absolute left-[50%] top-[37%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-950/95 text-blue-200 text-[9.5px] sm:text-[10.5px] font-black border border-blue-400/80 shadow-md whitespace-nowrap">
                    Stratton Street
                  </span>
                </div>
                <div className="absolute left-[30%] top-[61%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-teal-950/95 text-teal-200 text-[9.5px] sm:text-[10.5px] font-black border border-teal-400/80 shadow-md whitespace-nowrap">
                    Piccadilly Road
                  </span>
                </div>
                <div className="absolute left-[70%] top-[61%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:block">
                  <span className="px-2 py-0.5 rounded-md bg-teal-950/95 text-teal-200 text-[9.5px] sm:text-[10.5px] font-black border border-teal-400/80 shadow-md whitespace-nowrap">
                    Piccadilly Road
                  </span>
                </div>
                <div className="absolute left-[30%] top-[73.5%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950/95 text-indigo-200 text-[9.5px] sm:text-[10.5px] font-black border border-indigo-400/80 shadow-md whitespace-nowrap">
                    ↓ Station Road
                  </span>
                </div>
                <div className="absolute left-[70%] top-[73.5%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:block">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950/95 text-indigo-200 text-[9.5px] sm:text-[10.5px] font-black border border-indigo-400/80 shadow-md whitespace-nowrap">
                    ↓ Station Road
                  </span>
                </div>

                {/* Placed Landmarks on the Map (Full English Name Displayed, No Destination Highlight) */}
                {currentMission.landmarks.map(lm => {
                  const posX = 10 + lm.x * 20;
                  const posY = 13 + lm.y * 24;

                  return (
                    <div
                      key={lm.id}
                      style={{ left: `${posX}%`, top: `${posY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform"
                    >
                      <div
                        className={`relative px-1.5 py-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 shadow-md max-w-[92px] sm:max-w-[116px] ${
                          lm.type === 'hotel'
                            ? 'bg-amber-950/95 border-amber-600/80 text-amber-100'
                            : lm.type === 'restaurant'
                            ? 'bg-orange-950/95 border-orange-600/80 text-orange-100'
                            : lm.type === 'station'
                            ? 'bg-rose-950/95 border-rose-600/80 text-rose-100'
                            : lm.type === 'hospital'
                            ? 'bg-red-950/95 border-red-600/80 text-red-100'
                            : lm.type === 'bank'
                            ? 'bg-emerald-950/95 border-emerald-600/80 text-emerald-100'
                            : lm.type === 'supermarket'
                            ? 'bg-teal-950/95 border-teal-600/80 text-teal-100'
                            : lm.type === 'post'
                            ? 'bg-blue-950/95 border-blue-600/80 text-blue-100'
                            : lm.type === 'police'
                            ? 'bg-indigo-950/95 border-indigo-600/80 text-indigo-100'
                            : lm.type === 'fire'
                            ? 'bg-amber-950/95 border-amber-500/80 text-amber-100'
                            : lm.type === 'park'
                            ? 'bg-green-950/95 border-green-600/80 text-green-100'
                            : 'bg-slate-900/95 border-slate-700/80 text-slate-100'
                        }`}
                      >
                        <span className="text-lg sm:text-xl leading-none drop-shadow-sm">{lm.icon}</span>
                        <div className="text-[8px] sm:text-[9px] font-black leading-tight text-center whitespace-normal break-words">
                          {lm.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Start Point Marker */}
                {(() => {
                  const startX = 10 + currentMission.startPos.x * 20;
                  const startY = 13 + currentMission.startPos.y * 24;
                  return (
                    <div
                      style={{ left: `${startX}%`, top: `${Math.min(96, startY + 9)}%` }}
                      className="absolute -translate-x-1/2 z-20 pointer-events-none"
                    >
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-700 text-rose-100 font-bold text-[8px] border border-rose-400 shadow-sm whitespace-nowrap">
                        🚩 Start
                      </span>
                    </div>
                  );
                })()}

                {/* Path History Trail (Breadcrumbs) */}
                {pathTrail.map((p, idx) => {
                  const posX = 10 + p.x * 20;
                  const posY = 13 + p.y * 24;
                  return (
                    <div
                      key={idx}
                      style={{ left: `${posX}%`, top: `${posY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 border border-emerald-200 animate-ping" />
                    </div>
                  );
                })}

                {/* Moving Player Avatar */}
                {(() => {
                  const posX = 10 + playerPos.x * 20;
                  const posY = 13 + playerPos.y * 24;
                  return (
                    <div
                      style={{ left: `${posX}%`, top: `${posY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 ease-out flex flex-col items-center pointer-events-none"
                    >
                      <div className="px-1 py-0.2 rounded-full bg-emerald-500 text-white font-black text-[7.5px] whitespace-nowrap shadow-sm border border-emerald-200 flex items-center gap-0.5 mb-0.5 animate-bounce">
                        <Footprints className="w-2 h-2" />
                        <span>救援中</span>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 border-2 border-white text-base flex items-center justify-center shadow-lg ring-2 ring-emerald-400/50">
                        🏃‍♂️
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* GPS Live Status Line */}
              <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    當前指令：第 <strong className="text-emerald-400">{currentStep}</strong> / {currentMission.correctPath.length} 步
                  </span>
                </div>
                <div className="text-emerald-400 font-black">
                  {gameState === 'cleared' || mistakeCount >= 3
                    ? `目標：${currentMission.target}`
                    : '🎯 目的地：請仔細聆聽語音指示'}
                </div>
              </div>
            </div>

            {/* Pedagogical Hint */}
            {showScaffoldHint && (
              <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-600/50 text-[11px] font-bold text-sky-200 flex items-start gap-1.5 shadow-sm">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-300">課本引導提示：</span>
                  <span>{currentMission.hint}</span>
                </div>
              </div>
            )}

            {/* HUD Status Bar: Time, Stamina & Pedestrian Safety Signal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">剩餘時間</span>
                <span
                  className={`text-base font-black tabular-nums ${
                    timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {timeLeft} 秒
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-center gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>體力值 (HP)</span>
                  </span>
                  <span className="font-mono font-black text-amber-300">
                    {stamina} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-600">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stamina <= 30
                        ? 'bg-rose-500 animate-pulse'
                        : stamina <= 60
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${stamina}%` }}
                  />
                </div>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center justify-between transition-colors ${
                  trafficLight === 'GREEN'
                    ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                    : trafficLight === 'YELLOW'
                    ? 'bg-amber-950/70 border-amber-500/70 text-amber-300'
                    : 'bg-rose-950/70 border-rose-500/70 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded border border-slate-700">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trafficLight === 'RED' ? 'bg-rose-500 animate-ping' : 'bg-rose-950 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trafficLight === 'YELLOW' ? 'bg-amber-400 animate-ping' : 'bg-amber-950 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trafficLight === 'GREEN' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-950 opacity-40'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-black">
                    {trafficLight === 'GREEN' ? '🟢 行人綠燈' : trafficLight === 'YELLOW' ? '🟡 注意減速' : '🔴 紅燈請停'}
                  </span>
                </div>
                <span className="text-xs font-mono font-black px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700">
                  {trafficCountdown}s
                </span>
              </div>
            </div>

            {/* Pedestrian Safety Toast & Action Feedback */}
            {safetyToast && (
              <div
                className={`p-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all animate-bounce-slight ${
                  safetyToast.type === 'danger'
                    ? 'bg-rose-950 text-rose-200 border-2 border-rose-500 ring-2 ring-rose-500/40'
                    : safetyToast.type === 'warn'
                    ? 'bg-amber-950 text-amber-200 border border-amber-500'
                    : 'bg-emerald-950 text-emerald-200 border border-emerald-500'
                }`}
              >
                {safetyToast.type === 'danger' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                ) : safetyToast.type === 'warn' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{safetyToast.msg}</span>
              </div>
            )}

            {/* Real-time Navigation Feedback Toast */}
            {feedbackMsg && (
              <div
                className={`p-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
                  gameState === 'failed'
                    ? 'bg-rose-950/70 text-rose-200 border border-rose-600'
                    : 'bg-emerald-950/70 text-emerald-200 border border-emerald-600'
                }`}
              >
                {gameState === 'failed' ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Gameplay Action Area: Virtual D-Pad / Interactive Arrows + 停看聽 */}
            {gameState === 'playing' ? (
              <div className="flex flex-col items-center justify-center pt-0.5 pb-1">
                <div className="text-[10px] font-bold text-slate-400 mb-1.5">
                  請依照英語指路點擊方向鍵（或使用鍵盤 W/A/S/D、方向鍵；空白鍵停看聽）：
                </div>
                <div className="grid grid-cols-3 gap-1.5 w-48 sm:w-56">
                  <div />
                  {(() => {
                    const isAns = mistakeCount >= 3 && currentMission.correctPath[currentStep] === 'UP';
                    return (
                      <button
                        onClick={() => handleDirectionInput('UP')}
                        className={`h-11 rounded-xl active:scale-90 font-black flex flex-col items-center justify-center shadow-md border-2 transition-all cursor-pointer ${
                          isAns
                            ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400 scale-105 animate-pulse shadow-lg'
                            : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white border-emerald-300'
                        }`}
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold uppercase mt-0.5">
                          {isAns ? '👉 正確直走' : '直走 UP'}
                        </span>
                      </button>
                    );
                  })()}
                  <div />

                  {(() => {
                    const isAns = mistakeCount >= 3 && currentMission.correctPath[currentStep] === 'LEFT';
                    return (
                      <button
                        onClick={() => handleDirectionInput('LEFT')}
                        className={`h-11 rounded-xl active:scale-90 font-black flex flex-col items-center justify-center shadow-md border-2 transition-all cursor-pointer ${
                          isAns
                            ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400 scale-105 animate-pulse shadow-lg'
                            : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white border-emerald-300'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold uppercase mt-0.5">
                          {isAns ? '👉 正確左轉' : '左轉 LEFT'}
                        </span>
                      </button>
                    );
                  })()}

                  {/* 👀 Center Button: 停看聽 (Look Left & Right) */}
                  <button
                    onClick={handleLookBothWays}
                    disabled={hasLookedBothWays}
                    className={`h-11 rounded-xl font-black flex flex-col items-center justify-center shadow-md border-2 transition-all cursor-pointer ${
                      hasLookedBothWays
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
                        : 'bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-90 text-white border-amber-300 animate-pulse'
                    }`}
                    title="過馬路前落實停看聽（或按空白鍵）"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-[7.5px] font-extrabold uppercase mt-0.5">
                      {hasLookedBothWays ? '✅ 已停看' : '👀 停看聽'}
                    </span>
                  </button>

                  {(() => {
                    const isAns = mistakeCount >= 3 && currentMission.correctPath[currentStep] === 'RIGHT';
                    return (
                      <button
                        onClick={() => handleDirectionInput('RIGHT')}
                        className={`h-11 rounded-xl active:scale-90 font-black flex flex-col items-center justify-center shadow-md border-2 transition-all cursor-pointer ${
                          isAns
                            ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400 scale-105 animate-pulse shadow-lg'
                            : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white border-emerald-300'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold uppercase mt-0.5">
                          {isAns ? '👉 正確右轉' : '右轉 RIGHT'}
                        </span>
                      </button>
                    );
                  })()}

                  <div />
                  {(() => {
                    const isAns = mistakeCount >= 3 && currentMission.correctPath[currentStep] === 'DOWN';
                    return (
                      <button
                        onClick={() => handleDirectionInput('DOWN')}
                        className={`h-11 rounded-xl active:scale-90 font-black flex flex-col items-center justify-center shadow-md border-2 transition-all cursor-pointer ${
                          isAns
                            ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400 scale-105 animate-pulse shadow-lg'
                            : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white border-emerald-300'
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold uppercase mt-0.5">
                          {isAns ? '👉 正確後退' : '後退 DOWN'}
                        </span>
                      </button>
                    );
                  })()}
                  <div />
                </div>

                <div className="mt-2 text-center text-[10px] text-slate-400 font-medium">
                  🚦 <strong className="text-amber-300">行人安全素養守則：</strong>
                  <span>紅燈停、綠燈行，過馬路前請按【👀 停看聽】（空白鍵）！違規闖紅燈扣 30 HP！</span>
                </div>
              </div>
            ) : gameState === 'ready' ? (
              <div className="text-center py-3.5 space-y-2 bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700">
                <p className="text-xs text-slate-300 font-medium">
                  倫敦街道錯綜複雜且設有多個街口！請仔細聽英語語音（可選正常或慢速）並查看路牌，帶領角色安全走過街區找出隱藏的目的地！
                </p>
                <div className="flex justify-center gap-2.5">
                  <button
                    onClick={startMission}
                    className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    開始第 {round} 關街區導航 🚀
                  </button>
                  <button
                    onClick={handleRandomizeCurrentStage}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 font-bold text-xs border border-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>換一題</span>
                  </button>
                </div>
              </div>
            ) : gameState === 'cleared' ? (
              isAllFiveCleared ? (
                /* ========================================================= */
                /* 🏆 五道隨機題目全數完成！終極大結算卡片 */
                /* ========================================================= */
                <div className="text-center py-4 space-y-2.5 bg-gradient-to-b from-emerald-950/80 via-teal-950/80 to-slate-900 rounded-2xl p-4 border-2 border-amber-400 shadow-xl">
                  <div className="inline-flex p-3 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-lg animate-bounce">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-amber-300">
                    🏆 恭喜！五道街頭實境導航考驗全數達成！
                  </h3>
                  <p className="text-xs text-slate-200 max-w-md mx-auto">
                    太厲害了！你已成功指引 5 位市民與旅客抵達目的地，倫敦街道路牌與方向動詞已完全熟練！
                  </p>
                  <div className="flex justify-center items-center gap-5 py-1.5 bg-slate-900/80 rounded-xl max-w-sm mx-auto border border-emerald-500/40">
                    <span className="flex items-center gap-1 font-black text-amber-400 text-sm">
                      <Coins className="w-4 h-4 fill-amber-400" /> +450 建設金幣
                    </span>
                    <span className="font-black text-emerald-400 text-sm">
                      +175 島嶼繁榮度
                    </span>
                  </div>

                  {/* 🏅 行人交通安全素養認證 (Pedestrian Safety Literacy Certificate) */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 max-w-sm mx-auto text-left space-y-1 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>🏅 行人交通安全素養認證：合格通過！</span>
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center justify-between">
                      <span>
                        違規闖紅燈：<strong className={`font-bold ${safetyViolations > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{safetyViolations} 次</strong>
                      </span>
                      <span>
                        安全通行獎勵：<strong className="text-emerald-400 font-bold">+{safetyBonusCount} 次</strong>
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      遵守號誌「紅燈停、綠燈行」，過馬路落實「停看聽」，獲頒安全城市模範行人素養認證！
                    </p>
                  </div>

                  {/* 📚 答對完整句子與課本句型解析卡片 (Full Sentence & Direction Breakdown) */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/50 max-w-sm mx-auto text-left space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>🎉 答對解鎖：完整指路英語句子與解析</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playPromptAudio(0.86)}
                          className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> 朗讀複習 🔊
                        </button>
                        <button
                          onClick={() => playPromptAudio(0.62)}
                          className="text-[10px] font-bold text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          🐢 慢速
                        </button>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                      <div className="text-xs sm:text-sm font-black text-amber-200">
                        "{currentMission.audioPrompt}"
                      </div>
                      <div className="text-[10.5px] font-medium text-slate-300">
                        中文含義：{currentMission.chinesePrompt}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-300 space-y-0.5 pt-0.5">
                      <div>
                        🚩 <strong className="text-emerald-400">完整走向步數：</strong>
                        <span>{currentMission.correctPath.map(p => DIR_INFO[p].zh).join(' ➡️ ')}</span>
                      </div>
                      <div>
                        🧭 <strong className="text-emerald-400">課本重點解析：</strong>
                        <span>{currentMission.targetDesc || '從起點出發，依序轉向並在轉角抵達目的地！'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2.5 pt-1 flex-wrap">
                    <button
                      onClick={handleFinishAllFive}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      領取全部獎勵並返回島嶼建設 🏝️
                    </button>
                    <button
                      onClick={handleRestartFiveRounds}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 再挑戰新一輪 5 題 🔁
                    </button>
                  </div>
                </div>
              ) : (
                /* 單題通關卡片 (第 1~4 題) */
                <div className="text-center py-3.5 space-y-2 bg-emerald-950/60 rounded-2xl p-4 border-2 border-emerald-500">
                  <div className="inline-flex p-2 rounded-full bg-emerald-500 text-white shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-300">
                    🎉 第 {round}/5 題通關！成功抵達【{currentMission.targetChinese}】
                  </h3>
                  <p className="text-xs text-slate-300">
                    方向指引非常精確！還需要完成 <span className="font-black text-amber-300">{TOTAL_STAGES - round}</span> 道題目即可達成完整救援！
                  </p>
                  <div className="flex justify-center items-center gap-4 py-0.5">
                    <span className="flex items-center gap-1 font-black text-amber-400 text-xs">
                      <Coins className="w-3.5 h-3.5 fill-amber-400" /> 目前累計 +{round * 90} 金幣
                    </span>
                    <span className="font-black text-emerald-400 text-xs">
                      +{round * 35} 繁榮度
                    </span>
                  </div>

                  {/* 📚 單題答對完整句子與課本句型解析卡片 */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/50 max-w-sm mx-auto text-left space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>🎉 答對解鎖：完整指路英語句子與解析</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playPromptAudio(0.86)}
                          className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> 朗讀複習 🔊
                        </button>
                        <button
                          onClick={() => playPromptAudio(0.62)}
                          className="text-[10px] font-bold text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          🐢 慢速
                        </button>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                      <div className="text-xs sm:text-sm font-black text-amber-200">
                        "{currentMission.audioPrompt}"
                      </div>
                      <div className="text-[10.5px] font-medium text-slate-300">
                        中文含義：{currentMission.chinesePrompt}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-300 space-y-0.5 pt-0.5">
                      <div>
                        🚩 <strong className="text-emerald-400">完整走向步數：</strong>
                        <span>{currentMission.correctPath.map(p => DIR_INFO[p].zh).join(' ➡️ ')}</span>
                      </div>
                      <div>
                        🧭 <strong className="text-emerald-400">課本重點解析：</strong>
                        <span>{currentMission.targetDesc || '從起點出發，依序轉向並在轉角抵達目的地！'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={startMission}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-600 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 重新走一次本題
                    </button>
                    <button
                      onClick={handleProceedNextRound}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>前進第 {round + 1} 關隨機考驗 ({round + 1}/5) ➡️</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-3 space-y-2 bg-rose-950/50 rounded-2xl p-3.5 border-2 border-rose-600">
                <h3 className="text-sm sm:text-base font-black text-rose-300">差一點點！方向走偏了</h3>
                <p className="text-xs text-slate-300">
                  別灰心！看看上方的街道名牌與提示，再挑戰一次！
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={startMission}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md cursor-pointer"
                  >
                    重新挑戰 🔁
                  </button>
                  <button
                    onClick={handleRandomizeCurrentStage}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>換別題</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 📋 TAB 2: 課本實境情境救援題庫 (Textbook Scenario Rescue) */}
        {/* ========================================================= */}
        {activeTab === 'textbook_quiz' && (
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-2.5">
            {/* Question Info Bar */}
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-xs border border-indigo-300 shrink-0">
                  {currentQuiz.characterAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-950 text-amber-300 border border-amber-700">
                      {currentQuiz.badge}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700">
                      {currentQuiz.sourcePage}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 mt-0.5">
                    求援者：<span className="text-white font-extrabold">{currentQuiz.character}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  onClick={() => playQuizAudio(0.86)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 active:scale-95 text-white font-black text-[11px] shadow-xs transition-all cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>美式朗讀 🔊</span>
                </button>

                <button
                  onClick={() => playQuizAudio(0.62)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-black text-[11px] shadow-xs transition-all cursor-pointer"
                >
                  <span>🐢</span>
                  <span>慢速</span>
                </button>

                <button
                  onClick={handleRandomizeQuizQuestion}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow-xs transition-transform active:scale-95 cursor-pointer"
                  title="隨機換一題"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>換題</span>
                </button>
              </div>
            </div>

            {/* Situation Card */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span>街頭求援情境描述（Situation Briefing）：</span>
              </div>
              <p className="text-xs font-bold text-slate-100">
                "{currentQuiz.situation}"
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {currentQuiz.situationChinese}
              </p>
            </div>

            {/* Question Prompt */}
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-0.5">
              <div className="text-[10px] font-black uppercase text-amber-300">救援考驗題目（Question）：</div>
              <div className="text-sm font-black text-amber-100">
                {currentQuiz.question}
              </div>
              <div className="text-[11px] font-bold text-slate-300">
                {currentQuiz.questionChinese}
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                請點選正確的指路 / 交通答案：
              </div>
              {currentQuiz.options.map((opt, idx) => {
                const isSelected = selectedQuizOption === idx;
                const isCorrectOption = idx === currentQuiz.correctIndex;

                let optStyle = 'bg-slate-800 border-slate-700 hover:border-amber-400 hover:bg-slate-800/80 text-white';

                if (isQuizSubmitted) {
                  if (isCorrectOption) {
                    optStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/50';
                  } else if (isSelected && !isCorrectOption) {
                    optStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/50';
                  } else {
                    optStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isQuizSubmitted}
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full p-2.5 rounded-xl border-2 text-left transition-all flex flex-col gap-0.5 cursor-pointer ${optStyle}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono font-black text-xs shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm">
                          {opt.text}
                        </span>
                      </div>
                      {isQuizSubmitted && isCorrectOption && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-black text-[10px] shrink-0">
                          ✓ 正確答案
                        </span>
                      )}
                      {isQuizSubmitted && isSelected && !isCorrectOption && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-black text-[10px] shrink-0">
                          ✕ 答錯
                        </span>
                      )}
                    </div>
                    {opt.chinese && (
                      <div className="text-[11px] text-slate-400 pl-7">
                        {opt.chinese}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Feedback Card */}
            {isQuizSubmitted && (
              <div
                className={`p-3.5 rounded-2xl border-2 space-y-1.5 animate-bounce-slight ${
                  selectedQuizOption === currentQuiz.correctIndex
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                    : 'bg-rose-950/60 border-rose-500 text-rose-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                    {selectedQuizOption === currentQuiz.correctIndex ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">太棒了！救援成功！+85 金幣，+30 繁榮度！</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-300">差一點點！仔細研讀課文詳解：</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 font-mono font-bold">
                    出處：{currentQuiz.sourcePage}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-semibold leading-relaxed">
                  💡 <strong>課本詳解：</strong>{currentQuiz.explanation}
                </div>

                <div className="text-[11px] text-amber-300 font-extrabold pt-1 border-t border-white/10">
                  📌 <strong>文法金律：</strong>{currentQuiz.keyRule}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleRandomizeQuizQuestion}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>隨機下一題救援題 ➡️</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
