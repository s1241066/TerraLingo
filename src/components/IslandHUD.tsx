import React, { useState } from 'react';
import {
  ItemBlueprint,
  ChapterInfo,
  CHAPTERS,
  IslandIncident,
  ISLAND_INCIDENTS,
  ISLAND_THEMES,
  DAILY_ENGLISH_CHALLENGES,
} from '../data/unit5Data';
import { TilePavingType, TimeOfDayMode } from '../three/PlanetScene';
import { soundEngine } from '../audio/soundEngine';
import {
  Store,
  Calendar,
  Compass,
  Music,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Coins,
  Trash2,
  AlertCircle,
  Move,
  Grid,
  Lock,
  CheckCircle2,
  Sparkles,
  Clock,
  Settings,
  GraduationCap,
  Mic,
  RefreshCw,
  BookOpen,
  Globe,
  Eye,
} from 'lucide-react';

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

interface IslandHUDProps {
  prosperity: number;
  currentChapter: ChapterInfo;
  activeIslandTier: number;
  maxUnlockedTier: number;
  islandBuildingCounts?: Record<number, number>;
  onSelectIslandTier: (tier: number) => void;
  coins: number;
  roleMode: 'student' | 'teacher';
  adaptiveLevel: 'easy' | 'normal' | 'hard';
  selectedBlueprint: ItemBlueprint | null;
  onSelectBlueprint: (bp: ItemBlueprint | null) => void;
  activeRotation: number;
  onRotateItem: () => void;
  onClearTileMode: () => void;
  isDemolishMode: boolean;
  onToggleDemolishMode: () => void;
  isMoveMode: boolean;
  movingBuildingName: string | null;
  onToggleMoveMode: () => void;
  onCancelMove: () => void;
  isPavingMode: boolean;
  activePavingType: TilePavingType;
  onTogglePavingMode: () => void;
  onSelectPavingType: (type: TilePavingType) => void;
  onOpenIncident: (incident: IslandIncident) => void;
  onOpenShop: () => void;
  onOpenCheckIn: () => void;
  onOpenSettings: () => void;
  timeMode: TimeOfDayMode;
  onCycleTimeMode: () => void;
  onResetCamera: () => void;
  isBirdsEyeView: boolean;
  onToggleBirdsEyeView: () => void;
}

export const IslandHUD: React.FC<IslandHUDProps> = ({
  prosperity,
  currentChapter,
  activeIslandTier,
  maxUnlockedTier,
  islandBuildingCounts,
  onSelectIslandTier,
  coins,
  roleMode,
  adaptiveLevel,
  selectedBlueprint,
  onSelectBlueprint,
  activeRotation,
  onRotateItem,
  onClearTileMode,
  isDemolishMode,
  onToggleDemolishMode,
  isMoveMode,
  movingBuildingName,
  onToggleMoveMode,
  onCancelMove,
  isPavingMode,
  activePavingType,
  onTogglePavingMode,
  onSelectPavingType,
  onOpenIncident,
  onOpenShop,
  onOpenCheckIn,
  onOpenSettings,
  timeMode,
  onCycleTimeMode,
  onResetCamera,
  isBirdsEyeView,
  onToggleBirdsEyeView,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'incidents' | 'backpack' | 'music'>('incidents');
  const [isIslandMenuOpen, setIsIslandMenuOpen] = useState(false);

  // Daily English Challenge state (rotates through Word of the Day & Sentence Patterns)
  const [challengeIdx, setChallengeIdx] = useState<number>(() => {
    const dayIndex = new Date().getDate();
    return dayIndex % DAILY_ENGLISH_CHALLENGES.length;
  });
  const [isChallengeCollapsed, setIsChallengeCollapsed] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micFeedback, setMicFeedback] = useState<string | null>(null);

  // Suno BGM Controls
  const [isBgmPlaying, setIsBgmPlaying] = useState(soundEngine.getBgmStatus());
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted());

  const handleToggleBgm = () => {
    const status = soundEngine.toggleBgm();
    setIsBgmPlaying(status);
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    soundEngine.setMasterMute(newMuted);
    setIsMuted(newMuted);
  };

  const isTeacherMode = roleMode === 'teacher';
  const currentChallenge = DAILY_ENGLISH_CHALLENGES[challengeIdx] || DAILY_ENGLISH_CHALLENGES[0];
  const currentIslandTheme = ISLAND_THEMES.find(t => t.tier === activeIslandTier) || ISLAND_THEMES[0];

  const handleRotateChallenge = () => {
    soundEngine.playClick();
    setMicFeedback(null);
    setChallengeIdx(prev => {
      if (DAILY_ENGLISH_CHALLENGES.length <= 1) return 0;
      let next = Math.floor(Math.random() * DAILY_ENGLISH_CHALLENGES.length);
      if (next === prev) next = (prev + 1) % DAILY_ENGLISH_CHALLENGES.length;
      return next;
    });
  };

  const handlePracticeMic = () => {
    soundEngine.playClick();
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRec) {
      soundEngine.speakEnglish(currentChallenge.english, 'US', undefined, 0.86);
      setMicFeedback('已為你示範標準發音，請跟著大聲唸一遍！（瀏覽器不支援即時收音）');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setIsListeningMic(true);
      setMicFeedback('🎤 請唸出上方英文內容...');

      rec.onresult = (ev: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
        const spoken = ev.results?.[0]?.[0]?.transcript || '';
        setIsListeningMic(false);
        if (spoken.trim()) {
          soundEngine.playSuccess();
          setMicFeedback(`✨ 聽起來很棒！「${spoken}」`);
        } else {
          setMicFeedback('未偵測到清晰聲音，再試一次或點擊上方示範發音！');
        }
      };
      rec.onerror = () => {
        setIsListeningMic(false);
        soundEngine.speakEnglish(currentChallenge.english, 'US', undefined, 0.86);
        setMicFeedback('麥克風權限未開啟，已播放示範發音供你跟讀！');
      };
      rec.onend = () => {
        setIsListeningMic(false);
      };
      rec.start();
    } catch {
      setIsListeningMic(false);
      soundEngine.speakEnglish(currentChallenge.english, 'US', undefined, 0.86);
      setMicFeedback('已播放示範發音，請跟著唸一遍！');
    }
  };

  // Chapter progress calculation
  const nextChapter = CHAPTERS.find(c => c.chapter === currentChapter.chapter + 1);
  const progressPercent = isTeacherMode
    ? 100
    : nextChapter
    ? Math.min(100, Math.round(((prosperity - currentChapter.requiredProsperity) / (nextChapter.requiredProsperity - currentChapter.requiredProsperity)) * 100))
    : 100;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none flex flex-col justify-between p-2.5 sm:p-4">
      {/* Top Header: Compact Island Info + Daily Challenge (Left) & Compact Utilities (Right) */}
      <div className="flex items-start justify-between gap-2">
        {/* Left Column: Compact Island Header + 5-Island Selector + Slim Daily English Challenge Card */}
        <div className="flex flex-col gap-2 items-start w-[260px] sm:w-[285px]">
          <div className="pointer-events-auto relative w-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              {currentIslandTheme.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 truncate">
                  {currentIslandTheme.name}
                </span>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsIslandMenuOpen(v => !v);
                  }}
                  title="切換已解鎖的五大主題島嶼"
                  className="text-[9.5px] px-1.5 py-0.5 rounded-md font-black bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 flex items-center gap-0.5 cursor-pointer active:scale-95"
                >
                  <Globe className="w-2.5 h-2.5" />
                  <span>{activeIslandTier}/5</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenSettings();
                  }}
                  title="點擊切換學生模式 / 教師模式"
                  className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-0.5 transition-all cursor-pointer active:scale-95 ${
                    isTeacherMode
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  <GraduationCap className="w-2.5 h-2.5" />
                  <span>{isTeacherMode ? '教師' : '學生'}</span>
                </button>
              </div>

              {/* Prosperity progress bar */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-16 sm:w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 tabular-nums truncate">
                  {isTeacherMode
                    ? `${prosperity} ★滿`
                    : `${prosperity}${nextChapter ? `/${nextChapter.requiredProsperity}` : ' ★'}`}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Gold Coins */}
            <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">
              <Coins className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="text-sm font-black font-mono leading-none">
                {isTeacherMode ? '∞' : coins}
              </span>
            </div>

            {/* 5-Island Selector Popover */}
            {isIslandMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-slate-900 border-2 border-sky-400 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-800 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span>五大獨立主題島嶼</span>
                  </span>
                  <button
                    onClick={() => setIsIslandMenuOpen(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer"
                  >
                    收合
                  </button>
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {ISLAND_THEMES.map(theme => {
                    const unlocked = isTeacherMode || theme.tier <= maxUnlockedTier;
                    const isActive = theme.tier === activeIslandTier;
                    return (
                      <button
                        key={theme.tier}
                        disabled={!unlocked}
                        onClick={() => {
                          if (!unlocked) return;
                          soundEngine.playClick();
                          onSelectIslandTier(theme.tier);
                          setIsIslandMenuOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl border text-left transition-all flex items-start gap-2 ${
                          isActive
                            ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-500 ring-1 ring-sky-400'
                            : unlocked
                            ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-sky-400 cursor-pointer'
                            : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-lg shrink-0">{theme.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                              {theme.tier}. {theme.name}
                            </span>
                            {isActive ? (
                              <span className="text-[9.5px] font-black text-sky-600 dark:text-sky-400 shrink-0">
                                檢視中
                              </span>
                            ) : unlocked ? (
                              <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                已解鎖
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-bold text-rose-500 flex items-center gap-0.5 shrink-0">
                                <Lock className="w-2.5 h-2.5" /> {theme.requiredProsperity}
                              </span>
                            )}
                          </div>
                          <div className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            🗺️ 獨立地圖 · 已建 {islandBuildingCounts?.[theme.tier] ?? 0} 座建築
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Slim Daily English Challenge Card */}
          <div className="pointer-events-auto w-full bg-white/95 dark:bg-slate-900/95 border border-amber-300 dark:border-amber-700/70 rounded-2xl shadow-md px-3 py-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-300 truncate">
                  Daily English Challenge
                </span>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={handleRotateChallenge}
                  title="隨機切換單字或句型"
                  className="p-1 rounded-md hover:bg-amber-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 cursor-pointer active:scale-90"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsChallengeCollapsed(v => !v)}
                  title={isChallengeCollapsed ? '展開每日挑戰' : '收合每日挑戰'}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  {isChallengeCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {!isChallengeCollapsed && (
              <div className="mt-1.5 space-y-1.5">
                {/* Clickable Immediate Pronunciation Area */}
                <button
                  onClick={() => {
                    soundEngine.speakEnglish(currentChallenge.english, 'US', undefined, 0.86);
                  }}
                  title="點擊立即播放美式標準發音"
                  className="w-full text-left px-2.5 py-1.5 rounded-xl bg-amber-50/90 dark:bg-slate-800/90 hover:bg-amber-100/90 dark:hover:bg-slate-800 border border-amber-200 dark:border-slate-700 transition-colors cursor-pointer group flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                      {currentChallenge.english}
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate mt-0.5">
                      {currentChallenge.kind === 'word' ? 'Word' : 'Pattern'} · {currentChallenge.chinese}
                    </div>
                  </div>
                  <span className="p-1 rounded-md bg-amber-500 text-white shrink-0 group-hover:scale-105 transition-transform">
                    <Volume2 className="w-3 h-3" />
                  </span>
                </button>

                {/* Compact Controls Row */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => soundEngine.speakEnglish(currentChallenge.english, 'US', undefined, 0.86)}
                    className="flex-1 py-1 px-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-2.5 h-2.5" />
                    <span>美式</span>
                  </button>
                  <button
                    onClick={() => soundEngine.speakEnglish(currentChallenge.english, 'US', undefined, 0.62)}
                    className="py-1 px-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-black text-[10px] cursor-pointer active:scale-95"
                    title="慢速仔細聽發音"
                  >
                    🐢 慢速
                  </button>
                  <button
                    onClick={handlePracticeMic}
                    className={`py-1 px-2 rounded-lg font-black text-[10px] flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isListeningMic
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Mic className="w-2.5 h-2.5" />
                    <span>{isListeningMic ? '收音' : '口說'}</span>
                  </button>
                </div>

                {micFeedback && (
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2 py-0.5 leading-snug">
                    {micFeedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Cluster: Compact Buttons + Bird's-Eye View */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
          {/* Construction Shop */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenShop();
            }}
            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-[11px] shadow-md flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">工坊</span>
          </button>

          {/* Move / Relocate Building Mode */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMoveMode();
            }}
            title="移動現有建築設施"
            className={`px-2.5 py-2 rounded-xl border font-black text-[11px] shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              isMoveMode
                ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isMoveMode ? '完成' : '移動'}</span>
          </button>

          {/* Tile Paving Mode */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onTogglePavingMode();
            }}
            title="鋪設磁磚地磚"
            className={`px-2.5 py-2 rounded-xl border font-black text-[11px] shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              isPavingMode
                ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-300'
                : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isPavingMode ? '完成' : '鋪磚'}</span>
          </button>

          {/* Demolish Mode */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleDemolishMode();
            }}
            title="拆除回收設施"
            className={`p-2 rounded-xl border font-black text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer ${
              isDemolishMode
                ? 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-300'
                : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Daily Check-In */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCheckIn();
            }}
            title="每日簽到"
            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-black text-[11px] shadow-md flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">簽到</span>
          </button>

          {/* Bird's-Eye View (Top-Down Orthographic Toggle) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleBirdsEyeView();
            }}
            title="切換俯視規劃視角（Bird's-Eye View）"
            className={`px-2.5 py-2 rounded-xl border font-black text-[11px] shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              isBirdsEyeView
                ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 ring-2 ring-sky-300'
                : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBirdsEyeView ? '退出俯視' : '俯視圖'}</span>
          </button>

          {/* Camera Reset */}
          <button
            onClick={onResetCamera}
            title="視角重置"
            className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-sm transition-transform active:scale-90 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {/* Day / Sunset / Night / Auto Cycle Switcher */}
          <button
            onClick={onCycleTimeMode}
            title="切換日夜時光"
            className={`px-2 py-2 rounded-xl border shadow-sm font-extrabold text-[11px] transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
              timeMode === 'day'
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
                : timeMode === 'sunset'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white border-rose-400'
                : timeMode === 'night'
                ? 'bg-slate-900 text-sky-200 border-sky-600'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400'
            }`}
          >
            {timeMode === 'day' && <Sun className="w-3.5 h-3.5 text-amber-600" />}
            {timeMode === 'sunset' && <Sun className="w-3.5 h-3.5 text-amber-200" />}
            {timeMode === 'night' && <Moon className="w-3.5 h-3.5 text-sky-300" />}
            {timeMode === 'auto' && <Clock className="w-3.5 h-3.5 text-emerald-300" />}
          </button>

          {/* Game Mode & Settings Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSettings();
            }}
            title="設定（切換學生 / 教師模式）"
            className={`p-2 rounded-xl border shadow-sm font-black text-[11px] transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
              isTeacherMode
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400'
                : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Floating Active Placement Banner */}
      {selectedBlueprint && (
        <div className="pointer-events-auto mx-auto mb-1.5 bg-slate-900/95 text-white rounded-2xl px-3.5 py-2 shadow-xl border border-amber-400 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="font-black text-amber-400">佈置：</span>
            <span className="font-extrabold">
              {selectedBlueprint.chinese} ({selectedBlueprint.footprint?.w ?? 1}×{selectedBlueprint.footprint?.d ?? 1}格)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onRotateItem}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-[11px] font-black flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>{Math.round((activeRotation * 180) / Math.PI)}°</span>
            </button>
            <button
              onClick={() => onSelectBlueprint(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-black active:scale-95 cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Compact Floating Move / Relocate Banner */}
      {isMoveMode && (
        <div className="pointer-events-auto mx-auto mb-1.5 bg-emerald-950/95 text-white rounded-2xl px-3.5 py-2 shadow-xl border border-emerald-400 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <Move className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {movingBuildingName
                ? `已提起【${movingBuildingName}】，點擊空地放置`
                : '移動模式：點擊建築提起'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {movingBuildingName && (
              <button
                onClick={onRotateItem}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-black flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>{Math.round((activeRotation * 180) / Math.PI)}°</span>
              </button>
            )}
            <button
              onClick={onCancelMove}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-black active:scale-95 cursor-pointer"
            >
              結束
            </button>
          </div>
        </div>
      )}

      {isDemolishMode && (
        <div className="pointer-events-auto mx-auto mb-1.5 bg-rose-950/95 text-white rounded-2xl px-3.5 py-2 shadow-xl border border-rose-500 flex items-center gap-2.5">
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] font-bold">拆除模式：點擊島上建築即可回收</span>
          <button
            onClick={onClearTileMode}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-[11px] font-black active:scale-95 cursor-pointer"
          >
            結束
          </button>
        </div>
      )}

      {/* Compact Floating Tile Paving Banner & Material Selector */}
      {isPavingMode && (
        <div className="pointer-events-auto mx-auto mb-1.5 bg-slate-900/95 text-white rounded-2xl px-3 py-2 shadow-xl border border-sky-400 flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
          <Grid className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          {[
            { type: 'cobblestone' as TilePavingType, label: '石磚', color: 'bg-slate-600 text-white' },
            { type: 'red_brick' as TilePavingType, label: '紅磚', color: 'bg-red-700 text-white' },
            { type: 'stone_plaza' as TilePavingType, label: '大理石', color: 'bg-slate-200 text-slate-800' },
            { type: 'terracotta' as TilePavingType, label: '陶磚', color: 'bg-orange-600 text-white' },
            { type: 'wood_deck' as TilePavingType, label: '木道', color: 'bg-amber-800 text-white' },
            { type: 'grass' as TilePavingType, label: '草地', color: 'bg-emerald-600 text-white' },
          ].map(item => (
            <button
              key={item.type}
              onClick={() => {
                soundEngine.playClick();
                onSelectPavingType(item.type);
              }}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-black transition-all active:scale-95 cursor-pointer ${
                activePavingType === item.type
                  ? 'ring-2 ring-sky-300 ' + item.color
                  : 'opacity-75 hover:opacity-100 ' + item.color
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={onTogglePavingMode}
            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-[10.5px] font-black active:scale-95 text-white cursor-pointer"
          >
            完成
          </button>
        </div>
      )}

      {/* Slim Bottom Control Dock (Compact so island remains center-stage!) */}
      <div className="pointer-events-auto mx-auto w-full max-w-xl flex flex-col items-center">
        {/* Collapse toggle */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="mb-1 px-3 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10.5px] shadow-sm hover:bg-slate-100 flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>展開任務與工坊</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>收合控制台（賞景）</span>
            </>
          )}
        </button>

        {/* Compact Dock Body */}
        <div
          className={`w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xl transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[215px] opacity-100'
          }`}
        >
          {/* Compact Dock Header Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-1 gap-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('incidents');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'incidents'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>街頭情境任務</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenShop();
              }}
              className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>島嶼建設工坊</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('music');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'music'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>輕爵士音樂</span>
            </button>
          </div>

          {/* Tab 1: Compact Situation Incidents List */}
          {activeTab === 'incidents' && (
            <div className="p-2.5 space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[145px] overflow-y-auto pr-0.5">
                {ISLAND_INCIDENTS.map(inc => {
                  const isLocked = !isTeacherMode && prosperity < inc.requiredProsperity;
                  const unlockPercent = Math.min(
                    100,
                    Math.round((prosperity / (inc.requiredProsperity || 1)) * 100)
                  );

                  return (
                    <button
                      key={inc.id}
                      onClick={() => {
                        if (isLocked) {
                          soundEngine.playError();
                          return;
                        }
                        soundEngine.playClick();
                        onOpenIncident(inc);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 shadow-2xs relative overflow-hidden ${
                        isLocked
                          ? 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 opacity-70 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      <div className="relative text-xl p-1 rounded-lg bg-amber-100/50 dark:bg-slate-700 shrink-0">
                        {inc.npcAvatar}
                        {isLocked && (
                          <div className="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center">
                            <Lock className="w-3 h-3 text-amber-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-[11px] text-slate-900 dark:text-white truncate">
                            {inc.titleChinese}
                          </span>
                          {isLocked ? (
                            <span className="text-[9.5px] font-extrabold text-rose-500 shrink-0">
                              🔒 {inc.requiredProsperity}
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-black px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-slate-700 dark:text-amber-300 shrink-0">
                              +{inc.rewardCoins}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="truncate">
                            {isLocked ? `需繁榮度 ${inc.requiredProsperity} (${unlockPercent}%)` : inc.levelTitle}
                          </span>
                          {!isLocked && (
                            <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              可挑戰
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Compact Background Music Player */}
          {activeTab === 'music' && (
            <div className="p-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  <span>城市漫步輕爵士（BGM）</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  悠閒爵士循環播放，伴隨英語探索與島嶼建設
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleToggleBgm}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer ${
                    isBgmPlaying
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{isBgmPlaying ? '暫停' : '播放'}</span>
                </button>

                <button
                  onClick={handleToggleMute}
                  title="全域靜音"
                  className={`p-1.5 rounded-xl border transition-all active:scale-90 cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
