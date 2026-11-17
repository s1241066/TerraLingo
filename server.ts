import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Runtime Environment requires dev server to run on port 3000
const port = 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Lazily create GoogleGenAI client so runtime env vars are always respected
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Bounded in-memory cache for generated TTS WAV clips
const ttsCache = new Map<string, string>();
const MAX_TTS_CACHE = 150;

// Natural American English TTS Endpoint (Gemini 3.8 Flash Lite TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, gender, slow } = req.body as {
      text?: string;
      gender?: 'female' | 'male';
      slow?: boolean;
    };
    const cleanText = (text || '').trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const aiClient = getAiClient();
    if (!aiClient) {
      return res.json({ fallback: true });
    }

    const voiceName = gender === 'male' ? 'Puck' : 'Kore';
    const paceKey = slow ? 'slow' : 'normal';
    const cacheKey = `${voiceName}:${paceKey}:${cleanText}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      return res.json({ audioBase64: cached, mimeType: 'audio/wav' });
    }

    const style = slow
      ? 'Warm, friendly General American English speaker. Speak at a noticeably slow, clear, relaxed pace for junior high school learners, pausing naturally between phrases while sounding completely human and fluent.'
      : 'Warm, natural, fluent General American English speaker. Speak at an unhurried, conversational, easy-to-follow pace for junior high students, with lifelike intonation.';

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.json({ fallback: true });
    }

    if (ttsCache.size >= MAX_TTS_CACHE) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, base64Audio);

    return res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch (error) {
    console.warn('TTS generation fallback:', error);
    return res.json({ fallback: true });
  }
});

// Topic-aware Unit 5 Counselor Responder (used only when GEMINI_API_KEY is absent or unavailable)
function buildSmartCounselorResponse(rawQuestion: string) {
  const q = rawQuestion.toLowerCase();

  if (q.includes('foot') || q.includes('步行') || q.includes('走路') || q.includes('walk')) {
    return {
      reply:
        '問得太好了！中文說「用走（步）的」，英文一定要說 on foot 或是用動詞 walk，不能說 by foot 喔！你可以把這句記起來：「I go to school on foot.」就是「我走路去上學」。',
      sentenceStems: [
        'I go to the park on foot.',
        'We can walk there in five minutes.',
        'Did you come here on foot or by bus?',
      ],
      grammarTip:
        '「by + 交通工具」（如 by bus, by bike）中間不加冠詞；唯獨「步行」固定使用介系詞片語 on foot，或直接用動詞 walk！',
      culturalNote:
        '在美國城市像紐約、波士頓街區很適合步行，常會聽到當地人說「It’s just a five-minute walk!」。',
      comfortQuote: '分清楚 on foot 跟 by bus，你就已經贏過一半的同學囉！',
    };
  }

  if (q.includes('tube') || q.includes('metro') || q.includes('subway') || q.includes('地鐵') || q.includes('捷運')) {
    return {
      reply:
        '這三個字都在指「地鐵 / 捷運」喔！在美國最常用 subway（例如 New York Subway），台灣課本常教 metro（如 Taipei Metro），而在英國倫敦大家習慣叫它 the Tube 或 the Underground。',
      sentenceStems: [
        'Excuse me, how do I get to the subway station?',
        'We can take the metro to Green Park.',
        'Get off the train at Central Station.',
      ],
      grammarTip:
        '注意差別：「take the metro / subway」（動詞 + the + 交通工具） vs. 「by metro / subway」（by 後面不加 the）！',
      culturalNote:
        '美式英文說 subway，英式英文說 the Tube（因為倫敦地下鐵隧道像圓管子一樣！）。',
      comfortQuote: '認識不同國家的說法，讓你出國旅遊完全不怕迷路！',
    };
  }

  if (q.includes('floor') || q.includes('樓') || q.includes('ground')) {
    return {
      reply:
        '這是 Unit 5 超重要的英美文化差異！在美國（還有台灣），一樓叫做 the first floor、二樓是 the second floor；但在英國，地面那一層叫做 the ground floor，樓上那層才叫 the first floor！',
      sentenceStems: [
        'The restroom is on the first floor.',
        'Our room is on the second floor, next to the elevator.',
        'In London, the lobby is on the ground floor.',
      ],
      grammarTip:
        '表示「在幾樓」介系詞固定用 on：on the first floor / on the second floor。',
      culturalNote:
        '美式英文說 elevator（電梯）與 first floor；英式英文則常說 lift 與 ground floor！',
      comfortQuote: '搞懂樓層說法，以後在國外搭電梯就不會按錯樓層了！',
    };
  }

  if (
    q.includes('left') ||
    q.includes('right') ||
    q.includes('straight') ||
    q.includes('block') ||
    q.includes('轉') ||
    q.includes('直走') ||
    q.includes('街') ||
    q.includes('位置') ||
    q.includes('對面') ||
    q.includes('旁邊') ||
    q.includes('between') ||
    q.includes('across')
  ) {
    return {
      reply:
        '指路跟說明位置只要記住「動詞 + 路名 + 位置片語」三步驟！例如先說 Go straight（直走），再說 Turn left on Stratton Street（在街道左轉），最後用 across from（在對面）或 next to（在旁邊）說明地標位置。',
      sentenceStems: [
        'Go straight for two blocks, and turn left on Main Street.',
        'The bank is on the corner of First Street and Park Road.',
        'The hotel is across from the supermarket.',
      ],
      grammarTip:
        '轉彎後接路名常用 on（Turn left on Stratton Street），「在轉角」用 on the corner of A and B，「在對面」用 across from！',
      culturalNote:
        '美國街道常用 block（街區）來估算距離，說「Walk two blocks」對方馬上就聽得懂！',
      comfortQuote: '一次只記一個轉彎步驟，指路其實就像玩地圖遊戲一樣簡單！',
    };
  }

  if (
    q.includes('take') ||
    q.includes('ride') ||
    q.includes('drive') ||
    q.includes('by ') ||
    q.includes('交通') ||
    q.includes('動詞') ||
    q.includes('介系詞') ||
    q.includes('公車') ||
    q.includes('腳踏車') ||
    q.includes('計程車')
  ) {
    return {
      reply:
        '交通工具動詞其實很好分類喔！搭大眾運輸或計程車（不用自己開）用 take（take a bus / take a taxi / take the train）；跨坐騎乘用 ride（ride a bike / ride a scooter）；自己開車用 drive（drive a car）！',
      sentenceStems: [
        'I usually take a bus to school.',
        'She rides a bike to the park every morning.',
        'They went to the museum by taxi.',
      ],
      grammarTip:
        '句子只能有一個主要動詞！「I take a bus to school.」=「I go to school by bus.」千萬不要寫成 I by bus to school 喔！',
      culturalNote:
        '在美式日常對話中，問別人怎麼去某地最常問：「How do you get there?」或「How did you go to the hotel?」。',
      comfortQuote: '掌握「跨坐 ride、駕駛 drive、搭乘 take」，交通英文題型通通難不倒你！',
    };
  }

  if (q.includes('nervous') || q.includes('shy') || q.includes('afraid') || q.includes('緊張') || q.includes('不敢') || q.includes('害怕')) {
    return {
      reply:
        '感到緊張是非常正常的！其實外國人聽到學生主動開口問路都會覺得很親切。你不需要一次講很長的句子，只要先微笑說聲「Excuse me!」，後面就算只接「Where is the hotel?」大家也能輕鬆幫你喔！',
      sentenceStems: [
        'Excuse me. Could you help me?',
        'Excuse me, how do I get to the train station?',
        'Thank you so much for your help!',
      ],
      grammarTip:
        '禮貌開場黃金萬用句：「Excuse me, how do I get to + [地點]?」簡短又有禮貌！',
      culturalNote:
        '在美國街頭向路人問路時，先說「Excuse me」並加上微笑，最後記得說「Thank you! Have a nice day!」，對方一定會非常樂意協助你！',
      comfortQuote: '勇敢開口的第一句話，就是你英文進步最大的起點！',
    };
  }

  // General tailored response referencing the user's question
  return {
    reply: `謝謝你的提問：「${rawQuestion.trim()}」！針對這個問題，建議你可以從 Unit 5 最實用的禮貌問路與交通核心句型開始練習，搭配音訊慢速跟讀，很快就能流利說出口喔！`,
    sentenceStems: [
      'Excuse me. How do I get to the hotel?',
      'Go straight along this street for two blocks and turn right.',
      'You can take the metro or go on foot.',
    ],
    grammarTip:
      '記得確認句型結構：詢問路線用「How do I get to + 地點?」，交通方式可用「take + a/the + 交通工具」或「by + 交通工具」。',
    culturalNote:
      '在美式英文問路時，常會說「How do I get to...?」或「Could you tell me the way to...?」，既自然又充滿禮貌！',
    comfortQuote: '每問一個問題，你就更靠近流利英文一步，繼續加油！',
  };
}

// Module 5 AI Counselor API Endpoint (Community Language Learning / CLL)
app.post('/api/gemini/counselor', async (req, res) => {
  const { question, situation, learningHistory } = req.body as {
    question?: string;
    situation?: string;
    currentLevel?: string;
    learningHistory?: string;
  };
  const cleanQuestion = (question || 'I am nervous about asking directions').trim();

  try {
    const aiClient = getAiClient();
    if (!aiClient) {
      return res.json(buildSmartCounselorResponse(cleanQuestion));
    }

    const systemInstruction = `You are a warm, supportive, empathetic English Language Counselor (Community Language Learning / CLL method) tutoring a Taiwanese 8th-grade junior high student (13-14 years old).
Curriculum focus (Junior High English Unit 5):
- Transportation verbs & prepositions: "take a bus / train / taxi / plane / the metro", "ride a bike / motorcycle / scooter", "drive a car", "go on foot / walk", "by bus / by taxi / by train / by metro / by bike".
- Asking and giving directions: "Excuse me. How do I get to [Place]?", "Walk along / go down this road for [X] blocks", "Turn left/right on [Street]", "It is on your left/right", "across from", "next to", "between A and B", "on the corner of A and B".
- US vs UK vocabulary: subway/metro vs the Tube; first floor vs ground floor; cookies vs biscuits; fries vs chips; eraser vs rubber.

Rules:
1. Directly and thoughtfully answer the student's EXACT question!
2. Write "reply", "grammarTip", "culturalNote", and "comfortQuote" in warm, clear Traditional Chinese (繁體中文) mixed with easy English keywords/examples so 8th graders understand effortlessly.
3. Write "sentenceStems" in natural General American English so the student can listen and practice speaking them aloud.`;

    const prompt = `Student Question/Worry: "${cleanQuestion}"
Situation context: "${situation || 'Unit 5 asking for directions and transportation'}"
Student history: "${learningHistory || 'Practicing Unit 5'}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Warm 2-4 sentence encouraging answer directly addressing the student question in Traditional Chinese with clear English examples.',
            },
            sentenceStems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 natural General American English example sentences the student can practice.',
            },
            grammarTip: {
              type: Type.STRING,
              description: '1 concise, helpful Unit 5 grammar tip in Traditional Chinese.',
            },
            culturalNote: {
              type: Type.STRING,
              description: '1 interesting US/UK cultural or etiquette insight in Traditional Chinese.',
            },
            comfortQuote: {
              type: Type.STRING,
              description: '1 short encouraging quote for an 8th grade learner in Traditional Chinese.',
            },
          },
          required: ['reply', 'sentenceStems', 'grammarTip', 'culturalNote', 'comfortQuote'],
        },
      },
    });

    const text = (response.text || '').trim();
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      return res.json(buildSmartCounselorResponse(cleanQuestion));
    }
  } catch (error) {
    console.error('Error generating counselor guidance:', error);
    return res.json(buildSmartCounselorResponse(cleanQuestion));
  }
});

// Smart fallback for interactive 3D animal NPC dialogue when API key is unavailable
function buildSmartNpcChatFallback(npcName: string, animalSpecies: string, userMessage: string) {
  const lower = userMessage.toLowerCase();
  const speciesGreetings: Record<string, { role: string; en: string; zh: string; tip: string; replies: string[] }> = {
    rabbit: {
      role: 'street navigator',
      en: "Hi! I'm Yuki the Bunny! Go straight along Berkeley Street for two blocks, and you'll see Green Park Station right on your left.",
      zh: '嗨！我是小兔導航員 Yuki！沿著 Berkeley Street 直走兩個街區，左手邊就會看到地鐵站囉。',
      tip: '重點句型：Go straight for two blocks, and it is on your left.（直走兩個街區，就在你的左手邊。）',
      replies: ['Where is The May Fair Hotel?', 'How do I get to City Bank?', 'Should I turn left or right?'],
    },
    dog: {
      role: 'polite neighborhood guide',
      en: "Woof! Hello there! Always start with 'Excuse me' when asking for directions—it makes everyone happy to help!",
      zh: '汪！你好呀！在街上問路時先說一聲「Excuse me」，大家都會很開心幫你指路喔！',
      tip: '禮貌問路開頭：Excuse me, could you tell me how to get to the train station?',
      replies: ['Excuse me, where is the police station?', 'Thank you for your help!', 'How can I ask politely?'],
    },
    cat: {
      role: 'express courier',
      en: "Meow! I'm Leo the Courier Cat! I usually ride my scooter to deliver parcels, or take the metro when it rains.",
      zh: '喵！我是貓咪快遞員 Leo！我通常騎機車送包裹，下雨天就會改搭地鐵喔。',
      tip: '交通動詞搭配：ride a scooter / bike（騎車），take the metro / bus（搭乘大眾運輸）。',
      replies: ['Do you go to work by bus?', 'Can I walk there on foot?', 'How do you go to Big Ben?'],
    },
    bear: {
      role: 'London travel guide',
      en: "Hello friend! I'm Emma the Bear! Fun fact: in London people say 'the Tube' and 'chips', while in the US we say 'subway' and 'fries'!",
      zh: '哈囉朋友！我是小熊導遊 Emma！在倫敦大家說 the Tube（地鐵）和 chips（薯條），美式英文則說 subway 和 fries 喔！',
      tip: '英美用語差異：ground floor（英式一樓）= first floor（美式一樓）。',
      replies: ['What is "the Tube" in US English?', 'What does "biscuit" mean?', 'Tell me another London tip!'],
    },
    mouse: {
      role: 'warm English buddy',
      en: "Squeak! Hi, I'm Pip! Don't be shy about speaking English—take a deep breath and try saying 'Excuse me, how do I get to the hotel?'",
      zh: '吱！嗨，我是暖心學伴小老鼠 Pip！開口說英文不用緊張，深呼吸試著說說看：「Excuse me, how do I get to the hotel?」',
      tip: '自信口說：放慢語速、一句一句清楚講出來，外國朋友都能聽懂！',
      replies: ['How do I ask for the restroom?', 'Can we practice greeting together?', 'Thank you, Pip!'],
    },
  };

  if (lower.includes('hotel') || lower.includes('may fair') || lower.includes('飯店')) {
    return {
      replyEn: `Great question! Walk straight down Station Road, turn right on Berkeley Street, and The May Fair Hotel is across from City Bank!`,
      replyZh: `問得好！沿著 Station Road 直走，在 Berkeley Street 右轉，梅菲爾飯店就在城市銀行的對面喔！`,
      learningTip: '「across from」表示「在……的對面」，「turn right on + 路名」表示「在某條路右轉」。',
      quickReplies: ['Is it far on foot?', 'How many blocks away is it?', 'Thank you so much!'],
    };
  }
  if (lower.includes('bus') || lower.includes('metro') || lower.includes('train') || lower.includes('bike') || lower.includes('搭') || lower.includes('公車')) {
    return {
      replyEn: `You can take the metro or take a red double-decker bus! You can also go on foot if it's only two blocks away.`,
      replyZh: `你可以搭地鐵或搭紅色雙層巴士！如果只有兩個街區遠，用走路（go on foot）也很棒喔。`,
      learningTip: '注意動詞差異：take a bus/metro（搭公車/地鐵）、ride a bike（騎腳踏車）、go on foot（走路）。',
      quickReplies: ['How long does it take by bus?', 'Where is the bus stop?', 'Can I ride a bike there?'],
    };
  }
  if (lower.includes('uk') || lower.includes('us') || lower.includes('london') || lower.includes('英式') || lower.includes('美式')) {
    return {
      replyEn: `In London, people call French fries "chips" and cookies "biscuits"! Also, the first floor is called the "ground floor" in the UK.`,
      replyZh: `在倫敦，大家把薯條叫做 chips、餅乾叫做 biscuits！而且英國的一樓叫做 ground floor 喔。`,
      learningTip: '英美對照必考：subway(美) = the Tube(英)；fries(美) = chips(英)；eraser(美) = rubber(英)。',
      quickReplies: ['What about cookies in the UK?', 'How do people say elevator?', 'Give me a quiz!'],
    };
  }

  const profile = speciesGreetings[animalSpecies] || speciesGreetings.rabbit;
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('你好') || lower.includes('哈囉')) {
    return {
      replyEn: profile.en,
      replyZh: profile.zh,
      learningTip: profile.tip,
      quickReplies: profile.replies,
    };
  }

  return {
    replyEn: `That sounds awesome! As ${npcName}, I love chatting with you here on TerraLingo Island. ${profile.en}`,
    replyZh: `聽起來真棒！我是 ${npcName}，很開心在 TerraLingo 島上和你聊天。${profile.zh}`,
    learningTip: profile.tip,
    quickReplies: profile.replies,
  };
}

// Interactive 3D Animal NPC Chat Endpoint
app.post('/api/gemini/npc-chat', async (req, res) => {
  const { npcName, animalSpecies, assignedGameTitle, userMessage, history } = req.body as {
    npcName?: string;
    animalSpecies?: string;
    assignedGameTitle?: string;
    userMessage?: string;
    history?: Array<{ role: 'user' | 'npc'; text: string }>;
  };

  const cleanName = (npcName || 'Island Friend').trim();
  const cleanSpecies = (animalSpecies || 'rabbit').trim();
  const cleanMsg = (userMessage || 'Hello!').trim();

  try {
    const aiClient = getAiClient();
    if (!aiClient) {
      return res.json(buildSmartNpcChatFallback(cleanName, cleanSpecies, cleanMsg));
    }

    const recentHistory = (history || [])
      .slice(-6)
      .map(h => `${h.role === 'user' ? 'Student' : cleanName}: ${h.text}`)
      .join('\n');

    const systemInstruction = `You are "${cleanName}", an adorable ${cleanSpecies} villager living on TerraLingo Island (a London-inspired 3D English learning island for Taiwanese 8th-grade students, Unit 5: Transportation, Asking & Giving Directions, and US vs. UK English).
Your associated island mini-game is: "${assignedGameTitle || 'London City Exploration'}".

Guidelines:
1. Stay warmly in character as a cute ${cleanSpecies} (${cleanName})! Keep your tone cheerful, encouraging, and natural.
2. Reply to whatever the student says (in English or Chinese) directly and naturally in 1-3 short, crystal-clear General American English sentences ("replyEn").
3. Provide a clear, concise Traditional Chinese translation/summary of your reply in "replyZh".
4. Provide 1 bite-sized Unit 5 English grammar/vocabulary tip in Traditional Chinese in "learningTip" (related to the conversation if possible).
5. Provide 3 short, natural follow-up English sentences the student can click to keep chatting with you in "quickReplies".`;

    const prompt = `${recentHistory ? `Recent dialogue:\n${recentHistory}\n\n` : ''}Student just said: "${cleanMsg}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyEn: {
              type: Type.STRING,
              description: 'Friendly 1-3 sentence in-character General American English response.',
            },
            replyZh: {
              type: Type.STRING,
              description: 'Natural Traditional Chinese translation of replyEn.',
            },
            learningTip: {
              type: Type.STRING,
              description: '1 concise Unit 5 English tip in Traditional Chinese.',
            },
            quickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 short English follow-up lines the student can click next.',
            },
          },
          required: ['replyEn', 'replyZh', 'learningTip', 'quickReplies'],
        },
      },
    });

    const text = (response.text || '').trim();
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      return res.json(buildSmartNpcChatFallback(cleanName, cleanSpecies, cleanMsg));
    }
  } catch (error) {
    console.error('Error in /api/gemini/npc-chat:', error);
    return res.json(buildSmartNpcChatFallback(cleanName, cleanSpecies, cleanMsg));
  }
});

// Start server and attach Vite middleware in dev or static serve in prod
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
