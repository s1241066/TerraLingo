import React, { useState } from 'react';
import { CO_OP_LANDMARKS } from '../../data/unit5Data';
import { soundEngine } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { PhoneCall, Users, Bot, Volume2, Send, MapPin, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModuleCLLProps {
  onEarnPoints: (points: number) => void;
  onClose: () => void;
}

interface CounselorResponse {
  reply: string;
  sentenceStems: string[];
  grammarTip: string;
  culturalNote: string;
  comfortQuote: string;
}

interface CounselorTurn {
  id: string;
  question: string;
  response: CounselorResponse;
}

export const ModuleCLL: React.FC<ModuleCLLProps> = ({ onEarnPoints, onClose }) => {
  const [activeMode, setActiveMode] = useState<'hotline' | 'coop'>('hotline');

  // Mode 1: AI Counselor State (multi-turn conversation)
  const [studentQuestion, setStudentQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<CounselorTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickWorries = [
    '向陌生人問路好緊張，第一句該怎麼開口？',
    "英式的 'the Tube' 和美式 'subway'、'metro' 有什麼不同？",
    '「步行」怎麼說？可以說 by foot 嗎？',
    '為什麼英國一樓叫 ground floor，美國叫 first floor？',
  ];

  const handleCallCounselor = async (queryText?: string) => {
    const textToSend = (queryText ?? studentQuestion).trim();
    if (!textToSend || isLoading) return;

    soundEngine.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    if (!queryText) {
      setStudentQuestion('');
    }

    try {
      const historySummary = chatHistory
        .slice(-3)
        .map(t => `Q: ${t.question}`)
        .join(' | ');

      const res = await fetch('/api/gemini/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          situation: 'Unit 5 Asking for directions and transportation in city simulation',
          currentLevel: '8th Grade Junior High',
          learningHistory: historySummary || 'Practicing Unit 5 directions and transportation',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as CounselorResponse;
      if (!data || !data.reply) {
        throw new Error('Invalid AI counselor response');
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: `turn_${Date.now()}`,
          question: textToSend,
          response: data,
        },
      ]);
      soundEngine.playSuccess();

      if (data.sentenceStems && data.sentenceStems.length > 0) {
        soundEngine.speakEnglish(data.sentenceStems[0], 'US', undefined, 0.86);
      }
    } catch (err) {
      console.error('Counselor request failed:', err);
      soundEngine.playError();
      setErrorMsg('目前無法連線至 AI 學伴服務，請確認網路狀態後再試一次。');
    } finally {
      setIsLoading(false);
    }
  };

  // Mode 2: Classroom Co-Op Navigation Roleplay (Textbook Page 100)
  const [selectedMission] = useState({
    title: "Mission: Get to Kitty's Restaurant",
    start: 'Park Hotel (Tree Road)',
    target: "Kitty's Restaurant (Station Road)",
  });
  const [playerRole, setPlayerRole] = useState<'A' | 'B'>('A');
  const [coopStep, setCoopStep] = useState(0);
  const [coopCompleted, setCoopCompleted] = useState(false);

  const coopDialogues = [
    {
      speaker: 'Player B (Explorer)',
      role: 'B',
      text: "Excuse me! How do I get to Kitty's Restaurant from Park Hotel?",
      chinese: '不好意思！從公園飯店要如何到凱蒂餐廳？',
    },
    {
      speaker: 'Player A (Map Guide)',
      role: 'A',
      text: 'Walk down Tree Road for one block and turn right on Station Road.',
      chinese: '沿著樹路往下走一個街區，並在車站路右轉。',
    },
    {
      speaker: 'Player B (Explorer)',
      role: 'B',
      text: 'Is it near the park or the flower market?',
      chinese: '它在公園還是花卉市場附近？',
    },
    {
      speaker: 'Player A (Map Guide)',
      role: 'A',
      text: 'It is on the corner of Station Road and Fourth Street, across from the park!',
      chinese: '它在車站路與第四街的轉角處，在公園對面！',
    },
  ];

  const handleNextCoopStep = () => {
    soundEngine.playClick();
    if (coopStep < coopDialogues.length - 1) {
      const nextIdx = coopStep + 1;
      setCoopStep(nextIdx);
      soundEngine.speakEnglish(coopDialogues[nextIdx].text, 'US', undefined, 0.86);
    } else {
      setCoopCompleted(true);
      soundEngine.playLevelUp();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onEarnPoints(60);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/45">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-rose-400 dark:border-rose-500 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-rose-100 flex items-center gap-1.5">
                <span>暖心專屬學伴輔導</span>
                <span className="bg-rose-700/60 text-[10px] px-1.5 py-0.5 rounded-full">零壓力口語引導</span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight truncate">暖心英文輔導熱線與合作導航</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold text-sm flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveMode('hotline')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'hotline'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI 學伴熱線</span>
          </button>
          <button
            onClick={() => setActiveMode('coop')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'coop'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>雙人問路角色扮演</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto space-y-3">
          {activeMode === 'hotline' ? (
            <div className="space-y-3">
              {/* Encouragement Banner */}
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-slate-700 dark:text-rose-200 leading-snug">
                  <span className="font-extrabold text-rose-600 dark:text-rose-300">
                    安心提問空間：
                  </span>{' '}
                  不用怕問錯！無論單字、文法或不敢開口問路，都可以隨時問 AI 學伴喔！
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div>
                <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-2">
                  常見疑問（點一下立刻提問）：
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickWorries.map((worry, idx) => (
                    <button
                      key={idx}
                      disabled={isLoading}
                      onClick={() => handleCallCounselor(worry)}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-slate-700 disabled:opacity-50 text-left text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="line-clamp-2">{worry}</span>
                      <PhoneCall className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCallCounselor();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="輸入任何英文問題（中文或英文都可以）..."
                  value={studentQuestion}
                  onChange={e => setStudentQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !studentQuestion.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? '思考中...' : '詢問 AI'}</span>
                </button>
              </form>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Multi-turn AI Conversation History (newest first) */}
              <div className="space-y-3">
                {[...chatHistory].reverse().map((turn) => (
                  <div
                    key={turn.id}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50/70 to-amber-50/70 dark:from-slate-700 dark:to-slate-700/60 border-2 border-rose-300 dark:border-rose-700 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-rose-200/60 dark:border-slate-600">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          你的提問：{turn.question}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-slate-800 dark:text-rose-100 leading-relaxed">
                      {turn.response.reply}
                    </p>

                    {/* Ready-to-use American English Sentence Stems */}
                    {turn.response.sentenceStems?.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-black tracking-wider text-rose-700 dark:text-rose-300">
                          美式實用開口例句（點擊聽自然發音或慢速）：
                        </div>
                        <div className="space-y-1.5">
                          {turn.response.sentenceStems.map((stem, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-rose-200 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center justify-between gap-2"
                            >
                              <span>• {stem}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => soundEngine.speakEnglish(stem, 'US', undefined, 0.86)}
                                  title="美式正常語速"
                                  className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-slate-700 text-rose-600 dark:text-rose-300 hover:bg-rose-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>朗讀</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => soundEngine.speakEnglish(stem, 'US', undefined, 0.62)}
                                  title="慢速朗讀"
                                  className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>🐢</span>
                                  <span>慢速</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Tip & Cultural Note */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                        <span className="font-extrabold text-amber-800 dark:text-amber-300">💡 文法小提醒：</span>
                        <span className="text-amber-900 dark:text-amber-200">{turn.response.grammarTip}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-sky-100/60 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800">
                        <span className="font-extrabold text-sky-800 dark:text-sky-300">🌎 文化補充：</span>
                        <span className="text-sky-900 dark:text-sky-200">{turn.response.culturalNote}</span>
                      </div>
                    </div>

                    {/* Comfort Quote */}
                    <div className="text-center pt-1 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                      💖 {turn.response.comfortQuote}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Mode 2: Classroom Co-Op Navigation Roleplay */
            <div className="space-y-4">
              {/* Co-Op Brief */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                    課本第 100 頁雙人合作導航演練
                  </div>
                  <div className="text-base font-black text-slate-800 dark:text-white">
                    {selectedMission.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    出發點：<span className="font-bold">{selectedMission.start}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-200">
                  <button
                    onClick={() => setPlayerRole('A')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      playerRole === 'A'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    角色 A：看圖指路
                  </button>
                  <button
                    onClick={() => setPlayerRole('B')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      playerRole === 'B'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    角色 B：探索問路
                  </button>
                </div>
              </div>

              {/* Co-Op Map Nodes Reference */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700/60 space-y-2">
                <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>街區地標參考：</span>
                  <span className="text-[10px] text-slate-500">Tree Rd · Park Rd · Spring St · Flower Rd</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {CO_OP_LANDMARKS.slice(0, 6).map((lm, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-black text-slate-800 dark:text-white truncate">{lm.name}</div>
                        <div className="text-[10px] text-slate-400">{lm.street}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Dialogue Exchanges */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  對話步驟 {coopStep + 1} / {coopDialogues.length}：
                </div>

                {coopDialogues.slice(0, coopStep + 1).map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border-2 transition-all space-y-1 ${
                      item.role === 'B'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                        {item.speaker}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => soundEngine.speakEnglish(item.text, 'US', undefined, 0.86)}
                          title="美式正常語速"
                          className="p-1 hover:bg-black/5 rounded-md cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button
                          onClick={() => soundEngine.speakEnglish(item.text, 'US', undefined, 0.62)}
                          title="慢速朗讀"
                          className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          🐢
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      "{item.text}"
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.chinese}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step control */}
              {!coopCompleted ? (
                <button
                  onClick={handleNextCoopStep}
                  className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>進行下一句對話 🎙️</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-2">
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>雙人導航成功抵達目的地！</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    你們成功引導探險者抵達 Kitty’s Restaurant，獲得 +60 繁榮點數！
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

