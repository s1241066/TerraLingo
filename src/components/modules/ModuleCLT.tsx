import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CLT_SCENARIOS, CLTNpcScenario, DialogueOption } from '../../data/unit5Data';
import { soundEngine } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Heart,
  Sparkles,
  Mic,
  Square,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

interface ModuleCLTProps {
  onUnlockReward: (blueprintId: string, points: number) => void;
  onClose: () => void;
}

interface CompletedTurnEntry {
  turnIndex: number;
  npcPrompt: string;
  promptChinese: string;
  studentReply: string;
  studentReplyChinese: string;
  npcResponse: string;
  npcResponseChinese: string;
  feedback: string;
}

export const ModuleCLT: React.FC<ModuleCLTProps> = ({ onUnlockReward, onClose }) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [affinity, setAffinity] = useState(50);
  const [selectedOption, setSelectedOption] = useState<DialogueOption | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [dialogueLog, setDialogueLog] = useState<CompletedTurnEntry[]>([]);
  const [completedTurnsByScenario, setCompletedTurnsByScenario] = useState<Record<string, CompletedTurnEntry[]>>({});
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const currentScenario: CLTNpcScenario = CLT_SCENARIOS[scenarioIndex];
  const currentTurn = currentScenario.turns[turnIndex];

  // Shuffle options per scenario + turn so the polite choice isn't always first
  const shuffledOptions = useMemo(() => {
    return [...currentTurn.options].sort(() => Math.random() - 0.5);
  }, [scenarioIndex, turnIndex, currentTurn.options]);

  // 🎙️ 語音錄音與範例回放 State
  const defaultPolite = currentTurn.options.find(o => o.isPolite) || currentTurn.options[0];
  const [targetSentence, setTargetSentence] = useState<string>(defaultPolite.text);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingMyAudio, setIsPlayingMyAudio] = useState(false);
  const [isModelPlaying, setIsModelPlaying] = useState(false);
  const [recordToast, setRecordToast] = useState<{ msg: string; type: 'success' | 'warn' } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const myAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const latestAudioUrlRef = useRef<string | null>(null);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    const polite = currentTurn.options.find(o => o.isPolite) || currentTurn.options[0];
    setTargetSentence(polite.text);
    setSelectedOption(null);
    clearRecording();
    setRecordToast(null);
  }, [scenarioIndex, turnIndex]);

  // 🔊 播放美式範例音檔（預設流暢放慢語速 0.86，慢速 0.62）
  const playModelAudio = (sentenceToPlay = targetSentence, rate = 0.86) => {
    if (myAudioElementRef.current && isPlayingMyAudio) {
      myAudioElementRef.current.pause();
      setIsPlayingMyAudio(false);
    }
    setIsModelPlaying(true);
    soundEngine.speakEnglish(sentenceToPlay, 'US', undefined, rate);
    const wordCount = sentenceToPlay.split(' ').length;
    const duration = Math.max(2200, wordCount * (rate < 0.8 ? 650 : 440));
    setTimeout(() => setIsModelPlaying(false), duration);
  };

  const stopMicTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  };

  // 🎙️ 開始錄音
  const startRecording = async () => {
    soundEngine.stopSpeech();
    setIsModelPlaying(false);
    clearRecording();
    setRecordToast(null);

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setRecordToast({
        msg: '此瀏覽器環境不支援麥克風錄音（請確認使用 HTTPS 與最新版瀏覽器）。',
        type: 'warn',
      });
      soundEngine.playError();
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setRecordToast({
        msg: '目前瀏覽器不支援 MediaRecorder 錄音功能，請改用 Chrome / Edge / Safari 試試。',
        type: 'warn',
      });
      soundEngine.playError();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];
      const supportedType =
        typeof MediaRecorder.isTypeSupported === 'function'
          ? candidateTypes.find(t => MediaRecorder.isTypeSupported(t))
          : undefined;

      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        stopMicTracks();
        setIsRecording(false);
        setRecordToast({
          msg: '錄音過程發生錯誤，請檢查麥克風連線後再試一次。',
          type: 'warn',
        });
      };

      recorder.onstop = () => {
        stopMicTracks();
        if (isUnmountedRef.current) return;

        if (audioChunksRef.current.length === 0) {
          setRecordToast({
            msg: '沒有偵測到聲音，請靠近麥克風再錄一次喔！',
            type: 'warn',
          });
          return;
        }

        const blobType = recorder.mimeType || supportedType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        const url = URL.createObjectURL(audioBlob);
        latestAudioUrlRef.current = url;
        setAudioUrl(url);
        soundEngine.playSuccess();
        setRecordToast({
          msg: '錄音完成！可點「回放」聆聽自己的發音。',
          type: 'success',
        });
      };

      try {
        recorder.start(250);
      } catch {
        recorder.start();
      }
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 20) {
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      stopMicTracks();
      const errName = err instanceof Error ? err.name : '';
      console.warn('Microphone access issue:', err);
      const msg =
        errName === 'NotFoundError' || errName === 'DevicesNotFoundError'
          ? '找不到麥克風設備，請確認裝置已連接麥克風。'
          : errName === 'NotAllowedError' || errName === 'PermissionDeniedError'
          ? '麥克風權限被拒絕，請在瀏覽器網址列允許使用麥克風。'
          : '無法啟動麥克風錄音，請確認麥克風權限與裝置設定。';
      setRecordToast({ msg, type: 'warn' });
      soundEngine.playError();
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        stopMicTracks();
      }
    } else {
      stopMicTracks();
    }
    setIsRecording(false);
  };

  const togglePlayMyRecording = () => {
    if (!audioUrl) return;

    if (isPlayingMyAudio) {
      if (myAudioElementRef.current) {
        myAudioElementRef.current.pause();
        myAudioElementRef.current.currentTime = 0;
      }
      setIsPlayingMyAudio(false);
    } else {
      if (isModelPlaying) {
        setIsModelPlaying(false);
      }
      if (!myAudioElementRef.current) {
        myAudioElementRef.current = new Audio(audioUrl);
        myAudioElementRef.current.onended = () => setIsPlayingMyAudio(false);
      } else {
        myAudioElementRef.current.src = audioUrl;
        myAudioElementRef.current.currentTime = 0;
      }

      setIsPlayingMyAudio(true);
      myAudioElementRef.current.play().catch(err => {
        console.error('Playback error:', err);
        setIsPlayingMyAudio(false);
        setRecordToast({
          msg: '回放音訊失敗，請重新錄製一次試試看。',
          type: 'warn',
        });
      });
    }
  };

  const clearRecording = () => {
    if (myAudioElementRef.current) {
      myAudioElementRef.current.pause();
      myAudioElementRef.current = null;
    }
    if (latestAudioUrlRef.current) {
      URL.revokeObjectURL(latestAudioUrlRef.current);
      latestAudioUrlRef.current = null;
    }
    setAudioUrl(null);
    setIsPlayingMyAudio(false);
    setRecordingSeconds(0);
  };

  // Cleanup strictly on component unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopMicTracks();
      if (myAudioElementRef.current) {
        myAudioElementRef.current.pause();
      }
      if (latestAudioUrlRef.current) {
        URL.revokeObjectURL(latestAudioUrlRef.current);
      }
    };
  }, []);

  const switchScenario = (idx: number) => {
    soundEngine.playClick();
    setIsAllCompleted(false);
    setShowReviewPanel(false);
    setScenarioIndex(idx);
    setTurnIndex(0);
    setDialogueLog([]);
    setSelectedOption(null);
    setAffinity(50);
  };

  const handleSelectOption = (opt: DialogueOption) => {
    setSelectedOption(opt);
    setTargetSentence(opt.text);

    if (opt.isPolite) {
      soundEngine.playSuccess();
      setAffinity(prev => Math.min(100, prev + opt.affinityDelta));
      soundEngine.speakEnglish(opt.npcResponse, 'US', undefined, 0.86);

      const entry: CompletedTurnEntry = {
        turnIndex,
        npcPrompt: currentTurn.promptEn,
        promptChinese: currentTurn.promptChinese,
        studentReply: opt.text,
        studentReplyChinese: opt.chinese,
        npcResponse: opt.npcResponse,
        npcResponseChinese: opt.npcResponseChinese,
        feedback: opt.feedback,
      };

      setCompletedTurnsByScenario(prev => {
        const existing = prev[currentScenario.id] || [];
        const filtered = existing.filter(e => e.turnIndex !== turnIndex);
        return {
          ...prev,
          [currentScenario.id]: [...filtered, entry].sort((a, b) => a.turnIndex - b.turnIndex),
        };
      });

      const isFinalTurn = turnIndex === currentScenario.turns.length - 1;
      if (isFinalTurn && !completedScenarios.includes(currentScenario.id)) {
        setCompletedScenarios(prev => [...prev, currentScenario.id]);
        soundEngine.playLevelUp();
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
        onUnlockReward(currentScenario.rewardBlueprintId, 60);
      }
    } else {
      soundEngine.playError();
      setAffinity(prev => Math.max(10, prev + opt.affinityDelta));
      soundEngine.speakEnglish(opt.npcResponse, 'US', undefined, 0.86);
    }
  };

  const handleNextStep = () => {
    if (!selectedOption || !selectedOption.isPolite) return;
    soundEngine.playClick();

    const entry: CompletedTurnEntry = {
      turnIndex,
      npcPrompt: currentTurn.promptEn,
      promptChinese: currentTurn.promptChinese,
      studentReply: selectedOption.text,
      studentReplyChinese: selectedOption.chinese,
      npcResponse: selectedOption.npcResponse,
      npcResponseChinese: selectedOption.npcResponseChinese,
      feedback: selectedOption.feedback,
    };

    if (turnIndex < currentScenario.turns.length - 1) {
      setDialogueLog(prev => [...prev.filter(e => e.turnIndex !== turnIndex), entry]);
      setTurnIndex(prev => prev + 1);
      setSelectedOption(null);
    } else if (scenarioIndex < CLT_SCENARIOS.length - 1) {
      setScenarioIndex(prev => prev + 1);
      setTurnIndex(0);
      setDialogueLog([]);
      setSelectedOption(null);
      setAffinity(50);
    } else {
      setIsAllCompleted(true);
      setShowReviewPanel(false);
      confetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
    }
  };

  const totalReviewedTurns = Object.values(completedTurnsByScenario).reduce(
    (sum, entries) => sum + entries.length,
    0
  );

  const isLastTurnOfScenario = turnIndex === currentScenario.turns.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/45">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border-2 border-sky-400 overflow-hidden flex flex-col max-h-[82vh]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white flex items-center justify-between shadow-md gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h2 className="text-base sm:text-lg font-black truncate">街頭禮貌問路</h2>
            {!isAllCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] font-extrabold shrink-0">
                情境 {scenarioIndex + 1}/{CLT_SCENARIOS.length} · 第 {turnIndex + 1}/{currentScenario.turns.length} 輪
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalReviewedTurns > 0 && !isAllCompleted && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowReviewPanel(v => !v);
                }}
                className={`px-2 py-1 rounded-full text-[11px] font-black flex items-center gap-1 border transition-colors cursor-pointer ${
                  showReviewPanel
                    ? 'bg-amber-400 text-slate-950 border-white'
                    : 'bg-slate-950/60 hover:bg-slate-900 text-sky-200 border-white/20'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>{showReviewPanel ? '回到作答' : `回顧 (${totalReviewedTurns})`}</span>
              </button>
            )}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/50 border border-white/20 text-[11px] font-black">
              <Heart className={`w-3 h-3 ${affinity >= 60 ? 'text-rose-400 fill-rose-400' : 'text-slate-300'}`} />
              <span>{affinity}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white font-bold text-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Clean Scenario Switcher Tabs */}
        <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
          {CLT_SCENARIOS.map((sc, idx) => {
            const isCurrent = !isAllCompleted && !showReviewPanel && idx === scenarioIndex;
            const isDone = completedScenarios.includes(sc.id);
            return (
              <button
                key={sc.id}
                onClick={() => switchScenario(idx)}
                className={`px-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 shrink-0 transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-sky-500 text-slate-950 border-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/70'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-sky-400'
                }`}
              >
                <span>{sc.npcAvatarEmoji}</span>
                <span>{sc.shortTitle}</span>
                {isDone && <span>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Focused Reading, Dialogue Review & Practice Content */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3">
          {isAllCompleted || showReviewPanel ? (
            <div className="space-y-4">
              {isAllCompleted ? (
                <div className="text-center py-5 px-4 space-y-2.5 bg-slate-800/80 rounded-3xl border-2 border-emerald-500/60">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500 text-slate-950 shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-300">
                    街頭禮貌問路全數通關！🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-md mx-auto">
                    你完成了 {completedScenarios.length} 個不同街頭情境的連續問答對話！請在下方回顧每一句完整對話並點擊聆聽發音，準備好再返回島嶼。
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sky-200 text-sm font-black">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span>已完成對話回顧（Dialogue Review）</span>
                  </div>
                  <button
                    onClick={() => setShowReviewPanel(false)}
                    className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    繼續挑戰
                  </button>
                </div>
              )}

              {/* Full Scenario-by-Scenario Dialogue Transcript Review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-300 px-1">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>完整對話內容回顧（可點擊 🔊 重聽美式發音）</span>
                  </span>
                  <span className="text-slate-400">共 {totalReviewedTurns} 輪對話</span>
                </div>

                {CLT_SCENARIOS.map(sc => {
                  const entries = completedTurnsByScenario[sc.id] || [];
                  if (entries.length === 0) return null;
                  return (
                    <div
                      key={sc.id}
                      className="rounded-2xl bg-slate-950/90 border border-slate-700/80 overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sc.npcAvatarEmoji}</span>
                          <div>
                            <div className="text-xs font-black text-sky-300">
                              {sc.shortTitle} · {sc.npcName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              目的地：{sc.targetPlace}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60">
                          已完成 {entries.length}/{sc.turns.length} 輪
                        </span>
                      </div>

                      <div className="p-3 space-y-3">
                        {entries.map((item, idx) => (
                          <div
                            key={`${sc.id}-turn-${item.turnIndex}`}
                            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                          >
                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                              第 {idx + 1} 輪對話
                            </div>

                            {/* NPC Prompt */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="text-slate-200 font-bold">
                                  <span className="text-indigo-400">{sc.npcName}：</span>"{item.npcPrompt}"
                                </div>
                                <div className="text-[11px] text-slate-400">{item.promptChinese}</div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => playModelAudio(item.npcPrompt, 0.86)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 cursor-pointer"
                                  title="美式發音"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => playModelAudio(item.npcPrompt, 0.62)}
                                  className="px-1.5 py-1 rounded-lg bg-cyan-800 hover:bg-cyan-700 text-white text-[10px] font-bold cursor-pointer"
                                  title="慢速播放"
                                >
                                  🐢
                                </button>
                              </div>
                            </div>

                            {/* Student Polite Reply */}
                            <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-sky-950/40 border border-sky-700/40">
                              <div className="space-y-0.5">
                                <div className="text-sky-200 font-black">
                                  <span className="text-emerald-400">你的禮貌回答：</span>"{item.studentReply}"
                                </div>
                                <div className="text-[11px] text-slate-300">{item.studentReplyChinese}</div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => playModelAudio(item.studentReply, 0.86)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 cursor-pointer"
                                  title="美式發音"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => playModelAudio(item.studentReply, 0.62)}
                                  className="px-1.5 py-1 rounded-lg bg-cyan-800 hover:bg-cyan-700 text-white text-[10px] font-bold cursor-pointer"
                                  title="慢速播放"
                                >
                                  🐢
                                </button>
                              </div>
                            </div>

                            {/* NPC Response */}
                            <div className="flex items-start justify-between gap-2 pl-2.5 border-l-2 border-amber-500/50">
                              <div className="space-y-0.5">
                                <div className="text-amber-200 font-bold">
                                  <span className="text-amber-400">{sc.npcName} 回覆：</span>"{item.npcResponse}"
                                </div>
                                <div className="text-[11px] text-slate-300">{item.npcResponseChinese}</div>
                              </div>
                              <button
                                onClick={() => playModelAudio(item.npcResponse, 0.86)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-slate-700 shrink-0 cursor-pointer"
                                title="聽回覆發音"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Grammar / Polite Tip */}
                            <div className="text-[11px] text-emerald-300/90 bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-700/30">
                              💡 <span className="font-bold">重點解析：</span>{item.feedback}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-2 pb-1">
                <button
                  onClick={() => {
                    setCompletedScenarios([]);
                    setCompletedTurnsByScenario({});
                    switchScenario(0);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> 再挑戰一次
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  返回 TerraLingo 島嶼 🏝️
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Simplified Situation Header */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-sky-500/30 flex items-center gap-2.5">
                <div className="text-xl p-1.5 rounded-lg bg-slate-950 border border-sky-500/30 shrink-0">
                  {currentScenario.npcAvatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-sky-300">{currentScenario.npcName}</h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      目的地：{currentScenario.targetPlace}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                    {currentScenario.situationChinese}
                  </p>
                </div>
              </div>

              {/* Compact Back-and-Forth Dialogue History (when turn > 0) */}
              {dialogueLog.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 max-h-28 overflow-y-auto">
                  {dialogueLog.map((entry, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="text-sky-300 font-bold">
                        你："{entry.studentReply}"
                      </div>
                      <div className="text-amber-200/90 pl-2.5 border-l-2 border-amber-500/40">
                        {currentScenario.npcName}："{entry.npcResponse}"
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Current NPC Prompt Card */}
              <div className="p-3 rounded-xl bg-slate-800/95 border border-indigo-400/40 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-indigo-300">
                    {currentScenario.npcName} 說（第 {turnIndex + 1} / {currentScenario.turns.length} 輪）：
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playModelAudio(currentTurn.promptEn, 0.86)}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-sky-500/20 text-sky-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="聽對方說的話"
                    >
                      <Volume2 className="w-3 h-3" /> 聽發音
                    </button>
                    <button
                      onClick={() => playModelAudio(currentTurn.promptEn, 0.62)}
                      className="px-1.5 py-0.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-[11px] font-bold cursor-pointer"
                      title="慢速聆聽"
                    >
                      🐢
                    </button>
                  </div>
                </div>
                <p className="text-sm sm:text-base font-black text-white leading-snug">
                  "{currentTurn.promptEn}"
                </p>
                <p className="text-[11px] text-slate-300">
                  {currentTurn.promptChinese}
                </p>
              </div>

              {/* Clean Dialogue Options */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-extrabold text-slate-300">
                  請選擇最適合的禮貌回應：
                </div>

                <div className="space-y-2">
                  {shuffledOptions.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <div
                        key={`${scenarioIndex}-${turnIndex}-${idx}`}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? opt.isPolite
                              ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/30'
                              : 'bg-rose-950/60 border-rose-400 ring-2 ring-rose-400/30'
                            : 'bg-slate-800/60 border-slate-700 hover:border-sky-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-black text-slate-100 text-xs sm:text-sm leading-snug">
                            "{opt.text}"
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {opt.chinese}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetSentence(opt.text);
                            playModelAudio(opt.text, 0.86);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-sky-500/20 text-sky-400 border border-slate-700 shrink-0 transition-transform active:scale-90 cursor-pointer"
                          title="聽發音"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NPC Response & Next Turn / Next Scenario */}
              {selectedOption && (
                <div
                  className={`p-3 rounded-xl border-2 space-y-2 shadow-md ${
                    selectedOption.isPolite
                      ? 'bg-emerald-950/50 border-emerald-500'
                      : 'bg-rose-950/50 border-rose-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-200">
                      {currentScenario.npcName} 回應：
                    </span>
                    <button
                      onClick={() => soundEngine.speakEnglish(selectedOption.npcResponse, 'US', undefined, 0.86)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> 聽回覆
                    </button>
                  </div>

                  <div className="text-base font-black text-amber-200">
                    "{selectedOption.npcResponse}"
                  </div>
                  <div className="text-xs text-slate-200">
                    {selectedOption.npcResponseChinese}
                  </div>

                  <div className="pt-2 border-t border-white/10 text-xs text-slate-200">
                    <span className="font-extrabold text-amber-400">解析：</span>
                    {selectedOption.feedback}
                  </div>

                  {selectedOption.isPolite ? (
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      {isLastTurnOfScenario ? (
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                          <Sparkles className="w-4 h-4" />
                          <span>本情境對話完成！已解鎖獎勵！</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-300">
                          回應很有禮貌！繼續下一句對話吧
                        </span>
                      )}

                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                      >
                        {!isLastTurnOfScenario
                          ? '繼續下一輪對話 ➡️'
                          : scenarioIndex < CLT_SCENARIOS.length - 1
                          ? '前往下一個情境 ➡️'
                          : '完成全部情境 🎉'}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1 text-xs font-bold text-rose-200">
                      請再選一次更有禮貌的說法，就能順利繼續對話喔！
                    </div>
                  )}
                </div>
              )}

              {/* Streamlined Voice Practice Bar */}
              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-indigo-500/40 space-y-2">
                <div className="text-[11px] text-slate-300 flex items-center justify-between gap-2">
                  <span className="font-bold text-indigo-300 shrink-0">口語跟讀：</span>
                  <span className="font-black text-amber-200 truncate">"{targetSentence}"</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => playModelAudio(targetSentence, 0.86)}
                    className={`py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 border transition-all active:scale-95 cursor-pointer ${
                      isModelPlaying
                        ? 'bg-sky-400 text-slate-950 border-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400/40'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isModelPlaying ? '播放中...' : '美式範例'}</span>
                  </button>

                  <button
                    onClick={() => playModelAudio(targetSentence, 0.62)}
                    className="py-2 px-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center justify-center gap-1 border border-cyan-400/40 active:scale-95 cursor-pointer"
                  >
                    <span>🐢</span>
                    <span>慢速</span>
                  </button>

                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="py-2 px-2.5 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1 border-2 border-white animate-pulse active:scale-95 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>停止 ({recordingSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1 border border-rose-400/40 active:scale-95 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>錄音</span>
                    </button>
                  )}

                  <button
                    onClick={togglePlayMyRecording}
                    disabled={!audioUrl}
                    className={`py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                      !audioUrl
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                        : isPlayingMyAudio
                        ? 'bg-emerald-400 text-slate-950 border-white cursor-pointer'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 cursor-pointer'
                    }`}
                  >
                    {isPlayingMyAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-slate-950" />
                        <span>暫停</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>回放</span>
                      </>
                    )}
                  </button>
                </div>

                {recordToast && (
                  <div
                    className={`p-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
                      recordToast.type === 'warn'
                        ? 'bg-rose-950/80 text-rose-200 border border-rose-600/60'
                        : 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/60'
                    }`}
                  >
                    {recordToast.type === 'warn' ? (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{recordToast.msg}</span>
                    {audioUrl && (
                      <button
                        onClick={clearRecording}
                        className="ml-2 inline-flex items-center gap-0.5 text-slate-300 hover:text-white underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> 重錄
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

