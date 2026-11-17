import React, { useState, useEffect, useRef } from 'react';
import { generateRandomTransitDrill, TransitDrill } from '../../data/unit5Data';
import { soundEngine } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Volume2, Zap, Coins, CheckCircle2, XCircle, RotateCcw, Award, Lightbulb, Truck, ArrowRight } from 'lucide-react';

interface ModuleALMProps {
  onCompleteShift: (coins: number, prosperity: number) => void;
  onClose: () => void;
  adaptiveLevel?: 'easy' | 'normal' | 'hard';
}

const getDestinationMeta = (question: string): { name: string; icon: string } => {
  const q = question.toLowerCase();
  if (q.includes('hotel')) return { name: 'The May Fair Hotel', icon: '🏨' };
  if (q.includes('museum')) return { name: 'The British Museum', icon: '🏛️' };
  if (q.includes('park')) return { name: 'Green Park', icon: '🌳' };
  if (q.includes('bank')) return { name: 'City Bank', icon: '🏦' };
  if (q.includes('station')) return { name: 'Green Park Station', icon: '🚇' };
  return { name: 'Destination', icon: '📍' };
};

export const ModuleALM: React.FC<ModuleALMProps> = ({ onCompleteShift, onClose, adaptiveLevel = 'normal' }) => {
  const [drills] = useState<TransitDrill[]>(() => Array.from({ length: 5 }, (_, i) => generateRandomTransitDrill(i + 1)));
  const [drillIndex, setDrillIndex] = useState(0);
  const currentDrill: TransitDrill = drills[drillIndex];

  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [correctSteps, setCorrectSteps] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isShiftOver, setIsShiftOver] = useState(false);

  const autoAdvanceTimerRef = useRef<number | null>(null);

  const clearPendingTimer = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPendingTimer();
  }, []);

  useEffect(() => {
    if (!currentDrill) return;

    // Adaptive options count: 2 options for easy, 4 for normal/hard
    if (adaptiveLevel === 'easy') {
      const distract = currentDrill.options.find(o => o !== currentDrill.correctAnswer) || 'by foot';
      setOptions([currentDrill.correctAnswer, distract].sort(() => Math.random() - 0.5));
    } else {
      setOptions([...currentDrill.options].sort(() => Math.random() - 0.5));
    }
    setFeedback(null);
    setSelectedOption(null);
  }, [drillIndex, adaptiveLevel, currentDrill]);

  const speakSentence = (text: string, rate = 0.86) => {
    soundEngine.speakEnglish(text, 'US', undefined, rate);
  };

  const finishShift = (finalCoins: number) => {
    clearPendingTimer();
    setIsShiftOver(true);
    soundEngine.playLevelUp();
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    onCompleteShift(finalCoins, 35);
  };

  const handleProceedNextDrill = (overrideCoins?: number) => {
    clearPendingTimer();
    soundEngine.playClick();
    if (drillIndex < drills.length - 1) {
      setDrillIndex(prev => prev + 1);
    } else {
      finishShift(overrideCoins ?? earnedCoins);
    }
  };

  const handleSelectOption = (chosen: string) => {
    if (feedback !== null || isShiftOver) return;

    setSelectedOption(chosen);
    const isCorrect = chosen === currentDrill.correctAnswer;

    if (isCorrect) {
      soundEngine.playSuccess();
      soundEngine.playCoin();
      const newCombo = combo + 1;
      const coinGain = 15 + newCombo * 5;
      const updatedCoins = earnedCoins + coinGain;
      setCombo(newCombo);
      setEarnedCoins(updatedCoins);
      setCorrectSteps(prev => Math.min(drills.length, prev + 1));
      setFeedback({
        isCorrect: true,
        text: `答對了！小快遞往前邁進一步！${currentDrill.explanation}`,
      });

      clearPendingTimer();
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        if (drillIndex < drills.length - 1) {
          setDrillIndex(prev => prev + 1);
        } else {
          finishShift(updatedCoins);
        }
      }, 1450);
    } else {
      soundEngine.playError();
      setCombo(0);
      setFeedback({
        isCorrect: false,
        text: `這題答錯了，正確答案是「${currentDrill.correctAnswer}」。${currentDrill.explanation}`,
      });
    }
  };

  const resetShift = () => {
    clearPendingTimer();
    setDrillIndex(0);
    setCombo(0);
    setCorrectSteps(0);
    setEarnedCoins(0);
    setIsShiftOver(false);
    setFeedback(null);
    setSelectedOption(null);
  };

  const destinationMeta = getDestinationMeta(currentDrill.question);
  const progressPercent = Math.min(100, Math.round((correctSteps / drills.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/45">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-amber-100 flex items-center gap-1.5 flex-wrap">
                <span>市中心快遞員日常</span>
                <span className="bg-amber-700/60 text-[10px] px-1.5 py-0.5 rounded-full">
                  難度：{adaptiveLevel === 'easy' ? '雙選引導' : '多重挑戰'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight">快捷快遞換乘任務</h2>
            </div>
          </div>
          <button
            onClick={() => {
              clearPendingTimer();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold text-sm flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto space-y-2.5">
          {/* Status HUD */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">任務進度</span>
              <span className="text-sm font-black text-amber-900 dark:text-white">
                #{drillIndex + 1}/{drills.length}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-orange-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-orange-500 text-orange-500" /> 連擊
              </span>
              <span className="text-sm font-black text-orange-600 dark:text-orange-300">
                {combo > 1 ? `${combo}🔥` : `${combo}`}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-0.5">
                <Coins className="w-3 h-3 fill-amber-400 text-amber-500" /> 金幣
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                +{earnedCoins}
              </span>
            </div>
          </div>

          {!isShiftOver ? (
            <>
              {/* Cute Step-by-Step Character Journey to Destination */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-amber-200 dark:border-amber-800/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <span>🐾</span>
                    <span>答對向前走！小快遞一步步前往目的地</span>
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-300">
                    已前進 {correctSteps} / {drills.length} 步
                  </span>
                </div>

                {/* Animated Track */}
                <div className="relative pt-7 pb-2 px-4">
                  {/* Track Line */}
                  <div className="relative h-2.5 rounded-full bg-amber-200/80 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Step Dots */}
                  <div className="relative -mt-3 flex items-center justify-between">
                    {Array.from({ length: drills.length + 1 }).map((_, stepIdx) => {
                      const reached = stepIdx <= correctSteps;
                      const isDest = stepIdx === drills.length;
                      return (
                        <div key={stepIdx} className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
                              isDest
                                ? reached
                                  ? 'bg-emerald-500 border-white scale-125 shadow-md'
                                  : 'bg-emerald-100 border-emerald-400'
                                : reached
                                ? 'bg-amber-500 border-white shadow-xs'
                                : 'bg-white dark:bg-slate-600 border-amber-300 dark:border-slate-500'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Cute Moving Character Mascot */}
                  <div
                    className="absolute top-0 -translate-x-1/2 transition-all duration-700 ease-out pointer-events-none flex flex-col items-center"
                    style={{ left: `calc(16px + ${(correctSteps / drills.length)} * (100% - 32px))` }}
                  >
                    <div className="text-2xl sm:text-3xl drop-shadow-md animate-bounce leading-none">
                      🐶🛵
                    </div>
                  </div>
                </div>

                {/* Start & Destination Badges */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-amber-200 dark:border-slate-700">
                    <span className="text-sm">🚩</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">出發點</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700">
                    <span className="text-lg leading-none">{destinationMeta.icon}</span>
                    <span className="font-black text-emerald-900 dark:text-emerald-200">
                      {destinationMeta.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Ticket & Question */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50/60 dark:from-slate-800 dark:to-slate-850 border border-amber-300 dark:border-amber-700 space-y-2 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200">
                    🎫 派遣任務句型轉換
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakSentence(currentDrill.question, 0.86)}
                      title="美式正常語速朗讀"
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-[11px] shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>朗讀</span>
                    </button>
                    <button
                      onClick={() => speakSentence(currentDrill.question, 0.62)}
                      title="慢速朗讀"
                      className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🐢</span>
                      <span>慢速</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    "{currentDrill.question}"
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {currentDrill.questionChinese}
                  </div>
                </div>

                {/* Match clue */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-700/60 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">已知搭乘方式：</span>
                  <span className="px-3 py-1 rounded-lg bg-amber-500 text-white font-black text-xs sm:text-sm shadow-xs">
                    {currentDrill.givenPhrase}
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    ➔ 請將介系詞片語換成對應的【動詞片語】：
                  </span>
                </div>
              </div>

              {/* Feedback Prompt & Review-Continue Button */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-extrabold space-y-2 ${
                    feedback.isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-center gap-1.5 text-center">
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>{feedback.text}</span>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => handleProceedNextDrill()}
                      className={`px-4 py-1.5 rounded-lg font-black text-xs text-white shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer ${
                        feedback.isCorrect
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-rose-600 hover:bg-rose-500'
                      }`}
                    >
                      <span>
                        {drillIndex < drills.length - 1
                          ? feedback.isCorrect
                            ? '立即前往下一題'
                            : '檢討完畢，繼續下一題'
                          : '檢討完畢，查看結算'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {options.map((opt, idx) => {
                  const isAnswered = feedback !== null;
                  const isChosen = selectedOption === opt;
                  const isRightAnswer = opt === currentDrill.correctAnswer;

                  let cardStyle =
                    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 active:scale-95 cursor-pointer';
                  let badgeText = '配對';
                  let badgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300';

                  if (isAnswered) {
                    if (isRightAnswer) {
                      cardStyle =
                        'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/40 cursor-default';
                      badgeText = '✓ 正確答案';
                      badgeStyle = 'bg-emerald-500 text-white';
                    } else if (isChosen) {
                      cardStyle =
                        'bg-rose-50 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-400/40 cursor-default';
                      badgeText = '✕ 你選的';
                      badgeStyle = 'bg-rose-500 text-white';
                    } else {
                      cardStyle = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-55 cursor-default';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3 rounded-xl border-2 text-left font-black text-sm text-slate-800 dark:text-white shadow-xs transition-all flex items-center justify-between ${cardStyle}`}
                    >
                      <span>{opt}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Helper tip */}
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  口訣：by + 交通工具（如 by bus, by taxi）↔ 動詞片語（如 took a bus, took a taxi）！
                </span>
              </div>
            </>
          ) : (
            /* Shift Cleared */
            <div className="text-center py-6 space-y-4 bg-amber-50 dark:bg-slate-800 rounded-3xl p-6 border-2 border-amber-300 dark:border-amber-700">
              <div className="inline-flex p-3 rounded-full bg-amber-500 text-white mb-1 shadow-md">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-amber-800 dark:text-amber-200">
                快遞任務全數完成！📦✨
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                你帶著小快遞前進了 {correctSteps} / {drills.length} 步，精熟交通工具問答轉換並為島嶼賺取金幣！
              </p>

              <div className="flex justify-center items-center gap-6 py-2">
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-500">+{earnedCoins}</div>
                  <div className="text-xs font-bold text-slate-500">金幣獎勵</div>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-500">+35</div>
                  <div className="text-xs font-bold text-slate-500">島嶼繁榮度</div>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={resetShift}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> 再練習一次
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  返回建設島嶼 🏝️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

