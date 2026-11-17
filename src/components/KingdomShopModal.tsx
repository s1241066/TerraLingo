import React, { useState } from 'react';
import { BLUEPRINT_CATALOGUE, ItemBlueprint } from '../data/unit5Data';
import { soundEngine } from '../audio/soundEngine';
import {
  Store,
  Coins,
  Sparkles,
  Lock,
  X,
  Train,
  Building,
  Utensils,
  Trees,
} from 'lucide-react';

interface KingdomShopModalProps {
  currentCoins: number;
  currentChapter: number;
  currentProsperity: number;
  isTeacherMode?: boolean;
  onSelectToBuild: (bp: ItemBlueprint) => void;
  onClose: () => void;
}

export const KingdomShopModal: React.FC<KingdomShopModalProps> = ({
  currentCoins,
  currentChapter,
  currentProsperity: _currentProsperity,
  isTeacherMode = false,
  onSelectToBuild,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'transit' | 'landmark' | 'lifestyle' | 'nature'>('transit');

  const filteredItems = BLUEPRINT_CATALOGUE.filter(b => b.category === activeTab);

  const handleBuy = (bp: ItemBlueprint) => {
    if (!isTeacherMode && bp.requiredChapter > currentChapter) return;
    if (!isTeacherMode && currentCoins < bp.costCoins) {
      soundEngine.playError();
      return;
    }
    soundEngine.playCoin();
    onSelectToBuild(bp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/45">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col max-h-[78vh]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-amber-100 flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="truncate">{isTeacherMode ? '教師模式 · 全裝飾無限暢買' : '都會生活規劃 · 繁榮度升級'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight">島嶼建設工坊</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-0.5 rounded-lg bg-black/20 flex items-center gap-1 text-[11px] font-black text-amber-200">
              <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="font-mono text-xs">{isTeacherMode ? '∞ 無限' : currentCoins}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab category pills */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('transit')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'transit'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>交通設施</span>
          </button>

          <button
            onClick={() => setActiveTab('landmark')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'landmark'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>城市地標</span>
          </button>

          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'lifestyle'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>休閒生活</span>
          </button>

          <button
            onClick={() => setActiveTab('nature')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'nature'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>自然造景</span>
          </button>
        </div>

        {/* Catalog Items */}
        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isTeacherMode
              ? '👩‍🏫 教師模式啟用中：金幣無限且已解鎖全部章節，可直接點選任意建築與島嶼裝飾進行佈置！'
              : '💡 建造建築物可大幅增加「島嶼繁榮度」，解鎖全新篇章與街頭事件！金幣需透過回答問題賺取。'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            {filteredItems.map(bp => {
              const isLocked = !isTeacherMode && bp.requiredChapter > currentChapter;
              const canAfford = isTeacherMode || currentCoins >= bp.costCoins;

              return (
                <div
                  key={bp.id}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isLocked
                      ? 'bg-slate-100 dark:bg-slate-800/60 border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                        {bp.chinese}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                        +{bp.prosperity} 繁榮度
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="italic truncate">{bp.name}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 shrink-0">
                        佔地 {bp.footprint?.w ?? 1}×{bp.footprint?.d ?? 1} 格
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5 line-clamp-2">
                      {bp.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 font-black text-sm text-amber-600 dark:text-amber-400">
                      <Coins className="w-4 h-4 fill-amber-400 text-amber-500" />
                      {isTeacherMode ? (
                        <span className="text-xs">無限暢買</span>
                      ) : (
                        <span>{bp.costCoins === 0 ? '免費' : bp.costCoins}</span>
                      )}
                    </div>

                    {isLocked ? (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>第 {bp.requiredChapter} 章解鎖</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy(bp)}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-95 ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isTeacherMode ? '直接佈置 🔨' : canAfford ? '購買並佈置 🔨' : '金幣不足'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
