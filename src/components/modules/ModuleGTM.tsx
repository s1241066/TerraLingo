import React, { useState } from 'react';
import { UK_US_PAIRS, GRAMMAR_RULES, getRandomQuizSet, QuizQuestion } from '../../data/unit5Data';
import { soundEngine } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { BookOpen, Volume2, Search, CheckCircle2, XCircle, Award, Sparkles, Smartphone, RotateCcw } from 'lucide-react';

interface ModuleGTMProps {
  onEarnPoints: (points: number) => void;
  onClose: () => void;
}

const QUIZ_LENGTH_OPTIONS = [
  { count: 5, label: '5 題快測' },
  { count: 8, label: '8 題標準' },
  { count: 12, label: '12 題挑戰' },
];

export const ModuleGTM: React.FC<ModuleGTMProps> = ({ onEarnPoints, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lexicon' | 'grammar' | 'quiz'>('lexicon');
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Dynamic Quiz state
  const [quizSize, setQuizSize] = useState<number>(8);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => getRandomQuizSet(8));
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const restartWithNewQuestions = (nextSize = quizSize) => {
    soundEngine.playClick();
    setQuizSize(nextSize);
    setQuizQuestions(getRandomQuizSet(nextSize));
    setCurrentQuizIndex(0);
    setSelectedAnswers({});
    setQuizScore(null);
  };

  const filteredLexicon = UK_US_PAIRS.filter(
    item =>
      item.us.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning.includes(searchTerm) ||
      item.exampleUs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.exampleUk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const passScore = Math.ceil(quizQuestions.length * 0.75);
  const passRewardCoins = quizQuestions.length >= 12 ? 90 : quizQuestions.length >= 8 ? 65 : 50;

  const handleSelectQuizAnswer = (ansIdx: number) => {
    if (selectedAnswers[currentQuizIndex] !== undefined) return;
    const isCorrect = ansIdx === quizQuestions[currentQuizIndex].correct;
    if (isCorrect) soundEngine.playSuccess();
    else soundEngine.playError();

    const newAnswers = { ...selectedAnswers, [currentQuizIndex]: ansIdx };
    setSelectedAnswers(newAnswers);

    if (Object.keys(newAnswers).length === quizQuestions.length) {
      const totalScore = Object.entries(newAnswers).reduce((acc, [qIdx, aIdx]) => {
        return acc + (aIdx === quizQuestions[parseInt(qIdx, 10)].correct ? 1 : 0);
      }, 0);
      setQuizScore(totalScore);
      if (totalScore >= passScore) {
        soundEngine.playLevelUp();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onEarnPoints(passRewardCoins);
      }
    }
  };

  const currentQuiz = quizQuestions[currentQuizIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/45">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-indigo-400 dark:border-indigo-500 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-indigo-100 flex items-center gap-1.5">
                <span>隨身英文知識筆記</span>
                <span className="bg-indigo-700/60 text-[10px] px-1.5 py-0.5 rounded-full">Unit 5</span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight truncate">倫敦旅行筆記與隨堂測驗</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold text-sm flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('lexicon')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'lexicon'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🇬🇧 vs 🇺🇸 單字 ({UK_US_PAIRS.length})
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'grammar'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📐 文法 ({GRAMMAR_RULES.length})
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🎯 測驗 ({Object.keys(selectedAnswers).length}/{quizQuestions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto space-y-3">
          {activeTab === 'lexicon' && (
            <div className="space-y-4">
              {/* Search input & count badge */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search word (e.g., tube, lift, pavement, subway)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-2 rounded-xl shrink-0 text-center">
                  顯示 {filteredLexicon.length} / {UK_US_PAIRS.length} 組對照
                </span>
              </div>

              {/* Lexicon cards grid */}
              {filteredLexicon.length === 0 ? (
                <div className="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  找不到符合「{searchTerm}」的單字對照，試著輸入其他關鍵字吧！
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredLexicon.map((item, idx) => (
                    <div
                      key={item.us}
                      className="p-3 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-600">
                        <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {item.meaning}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {/* US Word */}
                        <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-300">
                            <span>🇺🇸 American</span>
                            <button
                              onClick={() => soundEngine.speakEnglish(item.us, 'US', undefined, 0.86)}
                              className="p-1 hover:bg-sky-200/50 rounded-md cursor-pointer"
                              title="聽美式發音"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {item.us}
                          </div>
                          <button
                            onClick={() => soundEngine.speakEnglish(item.exampleUs, 'US', undefined, 0.86)}
                            className="w-full text-left text-xs text-slate-600 dark:text-slate-300 italic hover:text-sky-700 dark:hover:text-sky-300 flex items-start gap-1.5 pt-0.5 cursor-pointer"
                            title="播放美式例句"
                          >
                            <Volume2 className="w-3 h-3 mt-0.5 shrink-0 text-sky-500" />
                            <span>"{item.exampleUs}"</span>
                          </button>
                        </div>

                        {/* UK Word */}
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                            <span>🇬🇧 British</span>
                            <button
                              onClick={() => soundEngine.speakEnglish(item.uk, 'UK', undefined, 0.86)}
                              className="p-1 hover:bg-rose-200/50 rounded-md cursor-pointer"
                              title="聽英式發音"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {item.uk}
                          </div>
                          <button
                            onClick={() => soundEngine.speakEnglish(item.exampleUk, 'UK', undefined, 0.86)}
                            className="w-full text-left text-xs text-slate-600 dark:text-slate-300 italic hover:text-rose-700 dark:hover:text-rose-300 flex items-start gap-1.5 pt-0.5 cursor-pointer"
                            title="播放英式例句"
                          >
                            <Volume2 className="w-3 h-3 mt-0.5 shrink-0 text-rose-500" />
                            <span>"{item.exampleUk}"</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  點擊例句旁的喇叭即可聆聽美式發音
                </span>
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  共 {GRAMMAR_RULES.length} 大重點
                </span>
              </div>

              {GRAMMAR_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 shadow-xs space-y-2"
                >
                  <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{rule.title}</span>
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {rule.formula1}
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {rule.formula2}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-800 dark:text-amber-200">
                    {rule.special}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                    <button
                      onClick={() => soundEngine.speakEnglish(rule.example1, 'US', undefined, 0.86)}
                      className="w-full text-left flex items-center gap-2 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{rule.example1}</span>
                    </button>
                    <button
                      onClick={() => soundEngine.speakEnglish(rule.example2, 'US', undefined, 0.86)}
                      className="w-full text-left flex items-center gap-2 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{rule.example2}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quiz' && currentQuiz && (
            <div className="space-y-4">
              {/* Round Size Selector & Reset */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">測驗題數：</span>
                  {QUIZ_LENGTH_OPTIONS.map(opt => (
                    <button
                      key={opt.count}
                      onClick={() => restartWithNewQuestions(opt.count)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        quizSize === opt.count
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => restartWithNewQuestions(quizSize)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>換題重測</span>
                </button>
              </div>

              {/* Question progress */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  Question {currentQuizIndex + 1} of {quizQuestions.length}（答對 {passScore} 題過關獎勵 {passRewardCoins} 金幣）
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quizQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuizIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentQuizIndex === i
                          ? 'bg-indigo-600 text-white'
                          : selectedAnswers[i] !== undefined
                          ? selectedAnswers[i] === q.correct
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Card */}
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-slate-700/60 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                {/* Scenario Street Context Badge */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/85 dark:bg-slate-800/85 border border-indigo-200 dark:border-indigo-700/60 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">{currentQuiz.sceneEmoji || '🇬🇧'}</span>
                    <div className="truncate">
                      <span className="font-black text-indigo-700 dark:text-indigo-300">
                        【實境考查看板】
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 ml-1">
                        {currentQuiz.sceneLabel || 'London Avenue Street Scene'}
                      </span>
                    </div>
                  </div>
                  {currentQuiz.englishAudio && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => soundEngine.speakEnglish(currentQuiz.englishAudio!, 'US', undefined, 0.86)}
                        className="px-2 py-0.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-bold inline-flex items-center gap-1 cursor-pointer"
                        title="聆聽關鍵英文句"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>聽例句</span>
                      </button>
                      <button
                        onClick={() => soundEngine.speakEnglish(currentQuiz.englishAudio!, 'US', undefined, 0.62)}
                        className="px-1.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                        title="慢速播放"
                      >
                        🐢
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                  {currentQuiz.q}
                </div>

                {/* Options */}
                <div className="space-y-1.5">
                  {currentQuiz.options.map((option, optIdx) => {
                    const isAnswered = selectedAnswers[currentQuizIndex] !== undefined;
                    const isSelected = selectedAnswers[currentQuizIndex] === optIdx;
                    const isCorrect = optIdx === currentQuiz.correct;

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectQuizAnswer(optIdx)}
                        className={`w-full p-2.5 rounded-xl border-2 text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                              : isSelected
                              ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 text-slate-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800 dark:text-white cursor-pointer'
                        }`}
                      >
                        <span>{option}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation once answered */}
                {selectedAnswers[currentQuizIndex] !== undefined && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">💡 解析：</span>
                    <span>{currentQuiz.explanation}</span>
                  </div>
                )}
              </div>

              {/* Navigation button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={currentQuizIndex === 0}
                  onClick={() => setCurrentQuizIndex(currentQuizIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  ⬅️ 上一題
                </button>
                <button
                  disabled={currentQuizIndex === quizQuestions.length - 1}
                  onClick={() => setCurrentQuizIndex(currentQuizIndex + 1)}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-xs font-bold text-white shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  下一題 ➡️
                </button>
              </div>

              {/* Final Score Report if all answered */}
              {quizScore !== null && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xl font-black text-emerald-700 dark:text-emerald-300">
                    <Award className="w-6 h-6" />
                    <span>測驗完成：{quizScore} / {quizQuestions.length} 題答對！</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {quizScore >= passScore
                      ? `恭喜通過測驗（獲得 ${passRewardCoins} 金幣）！掌握了 Unit 5 核心交通動詞與英美字彙文化！`
                      : `差一點就達標囉（需答對 ${passScore} 題）！複習筆記後再挑戰一組新題目吧！`}
                  </p>
                  <button
                    onClick={() => restartWithNewQuestions(quizSize)}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>換一組全新題目挑戰！</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
