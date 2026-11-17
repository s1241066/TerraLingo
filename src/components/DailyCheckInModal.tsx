import React from 'react';
import { DAILY_REWARDS, DailyCheckInReward } from '../data/unit5Data';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Calendar, Coins, CheckCircle, Gift, Sparkles, X } from 'lucide-react';

interface DailyCheckInModalProps {
  currentDay: number;
  hasClaimedToday: boolean;
  onClaimReward: (reward: DailyCheckInReward) => void;
  onClose: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  currentDay,
  hasClaimedToday,
  onClaimReward,
  onClose,
}) => {
  const handleClaim = () => {
    if (hasClaimedToday) return;
    const reward = DAILY_REWARDS[Math.min(currentDay - 1, DAILY_REWARDS.length - 1)];
    soundEngine.playLevelUp();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
    });
    onClaimReward(reward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/45">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-amber-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>7日登入福利專區</span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight truncate">每日簽到領取特殊外觀</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            天天登入回答問題、建設你的 TerraLingo 探索島！連續簽到可解鎖特殊建築造型與大量金幣！
          </p>

          {/* 7-Day Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAILY_REWARDS.map(r => {
              const isPast = r.day < currentDay || (r.day === currentDay && hasClaimedToday);
              const isToday = r.day === currentDay && !hasClaimedToday;
              const isGrand = r.day === 7;

              return (
                <div
                  key={r.day}
                  className={`p-2 rounded-xl border-2 flex flex-col items-center justify-between text-center relative transition-all ${
                    isGrand ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-800 dark:to-amber-950/40 border-amber-400 ring-2 ring-amber-400/50' : ''
                  } ${
                    isToday
                      ? 'bg-amber-50 dark:bg-slate-800 border-amber-500 ring-2 ring-amber-400 shadow-sm'
                      : isPast
                      ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 opacity-70'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">
                    第 {r.day} 天
                  </div>

                  <div className="my-1 p-1.5 rounded-lg bg-amber-100/60 dark:bg-slate-700">
                    <Gift className={`w-5 h-5 ${r.isSpecial ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`} />
                  </div>

                  <div className="text-[11px] font-black text-slate-800 dark:text-white truncate max-w-[110px]">
                    {r.itemChinese}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                    <Coins className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>+{r.coins}</span>
                  </div>

                  {isPast && (
                    <div className="absolute top-1.5 right-1.5 text-emerald-500">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-100" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-1">
            <button
              disabled={hasClaimedToday}
              onClick={handleClaim}
              className={`w-full py-2.5 rounded-xl font-black text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                hasClaimedToday
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{hasClaimedToday ? '今日已領取！明天再來領取好禮' : `立即領取第 ${currentDay} 天簽到獎勵`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
