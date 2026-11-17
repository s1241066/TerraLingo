export interface ItemBlueprint {
  id: string;
  name: string;
  chinese: string;
  category: 'transit' | 'landmark' | 'lifestyle' | 'nature';
  categoryChinese: string;
  costCoins: number;
  prosperity: number;
  requiredChapter: number;
  icon: string;
  description: string;
  modelType:
    | 'metro_kiosk'
    | 'mayfair_hotel'
    | 'big_ben'
    | 'red_bus'
    | 'taxi'
    | 'bike_station'
    | 'kittys_restaurant'
    | 'uk_phone_booth'
    | 'police_station'
    | 'bank'
    | 'hospital'
    | 'fountain'
    | 'streetlamp'
    | 'tree_oak'
    | 'tree_pine'
    | 'bench'
    | 'post_box'
    | 'flower_planter'
    | 'cherry_tree'
    | 'corgi'
    | 'street_sign';
  footprint?: { w: number; d: number };
  isSpecialSkin?: boolean;
}

export interface DailyCheckInReward {
  day: number;
  coins: number;
  itemBlueprintId: string;
  itemName: string;
  itemChinese: string;
  icon: string;
  isSpecial: boolean;
}

export const DAILY_REWARDS: DailyCheckInReward[] = [
  { day: 1, coins: 150, itemBlueprintId: 'bp_bike', itemName: 'Santander Bike Dock', itemChinese: '英倫單車租借站', icon: 'Bike', isSpecial: false },
  { day: 2, coins: 200, itemBlueprintId: 'bp_streetlamp', itemName: 'Piccadilly Gaslamp', itemChinese: '皮卡迪利復古路燈', icon: 'Sun', isSpecial: false },
  { day: 3, coins: 250, itemBlueprintId: 'bp_corgi', itemName: 'Royal Park Corgi', itemChinese: '特殊活景【皇家散步柯基犬】', icon: 'Heart', isSpecial: true },
  { day: 4, coins: 300, itemBlueprintId: 'bp_red_bus', itemName: 'London Double-Decker Bus', itemChinese: '經典雙層紅巴士', icon: 'Bus', isSpecial: false },
  { day: 5, coins: 400, itemBlueprintId: 'bp_phone_booth', itemName: 'Royal Gold Telephone Box', itemChinese: '特殊外觀【皇家金頂電話亭】', icon: 'PhoneCall', isSpecial: true },
  { day: 6, coins: 500, itemBlueprintId: 'bp_cherry', itemName: 'Blooming Cherry Tree', itemChinese: '特殊造景【粉櫻春日步道樹】', icon: 'Trees', isSpecial: true },
  { day: 7, coins: 800, itemBlueprintId: 'bp_big_ben', itemName: 'Crystal Big Ben', itemChinese: '傳奇外觀【皇家水晶大笨鐘】', icon: 'Clock', isSpecial: true },
];

export interface ChapterInfo {
  chapter: number;
  title: string;
  requiredProsperity: number;
  theme: string;
  description: string;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    chapter: 1,
    title: '第 1 島：翠綠倫敦探索島',
    requiredProsperity: 0,
    theme: '初抵倫敦，地鐵與問路啟程',
    description: '認識倫敦地鐵（the Tube），學習詢問方向與常用交通動詞。',
  },
  {
    chapter: 2,
    title: '第 2 島：櫻花春漾公園島',
    requiredProsperity: 100,
    theme: '花季大道與飯店街區轉角',
    description: '掌握「直走兩街區、在轉角左轉」等路線指引，認識英式一樓（ground floor）。',
  },
  {
    chapter: 3,
    title: '第 3 島：黃金海岸陽光島',
    requiredProsperity: 250,
    theme: '海岸巡禮與雙層巴士暢行',
    description: '解鎖大笨鐘與市區公車，精熟 by + 交通工具與搭乘動詞的精準替換。',
  },
  {
    chapter: 4,
    title: '第 4 島：冰晶雪境奇蹟島',
    requiredProsperity: 500,
    theme: '冬日雪景與英美日常用語大賞',
    description: '挑戰英美用字大對決與情境問答，打造雪國水晶英語小鎮！',
  },
  {
    chapter: 5,
    title: '第 5 島：星耀皇家大都會',
    requiredProsperity: 850,
    theme: '璀璨星夜與泰晤士終極王國',
    description: '解鎖終極星耀皇家島嶼，匯集所有城市地標與進階英語挑戰！',
  },
];

export interface IslandThemeInfo {
  tier: number;
  name: string;
  englishName: string;
  emoji: string;
  requiredProsperity: number;
  accentColor: string;
  description: string;
}

export const ISLAND_THEMES: IslandThemeInfo[] = [
  {
    tier: 1,
    name: '翠綠倫敦探索島',
    englishName: 'Emerald London Isle',
    emoji: '🌿',
    requiredProsperity: 0,
    accentColor: 'emerald',
    description: '經典英倫翠綠草地與十字街道，所有探險的起點。',
  },
  {
    tier: 2,
    name: '櫻花春漾公園島',
    englishName: 'Sakura Blossom Isle',
    emoji: '🌸',
    requiredProsperity: 100,
    accentColor: 'pink',
    description: '島嶼邊緣盛開粉紅櫻花林與春日花瓣廣場，浪漫升級！',
  },
  {
    tier: 3,
    name: '黃金海岸陽光島',
    englishName: 'Golden Suncoast Isle',
    emoji: '🏖️',
    requiredProsperity: 250,
    accentColor: 'amber',
    description: '環繞碧藍淺海礁湖與金色沙灘，充滿度假陽光氣息。',
  },
  {
    tier: 4,
    name: '冰晶雪境奇蹟島',
    englishName: 'Frost Crystal Isle',
    emoji: '❄️',
    requiredProsperity: 500,
    accentColor: 'sky',
    description: '覆蓋銀白初雪邊界與發光冰晶尖塔的冬日奇幻島嶼。',
  },
  {
    tier: 5,
    name: '星耀皇家大都會',
    englishName: 'Royal Starlight Metropolis',
    emoji: '✨',
    requiredProsperity: 850,
    accentColor: 'indigo',
    description: '鑲金石砌邊界與漂浮星光水晶環繞的最高榮譽都會島！',
  },
];

export interface DailyEnglishChallenge {
  id: string;
  kind: 'word' | 'pattern';
  english: string;
  phonetic?: string;
  chinese: string;
  exampleEn: string;
  exampleZh: string;
  tip: string;
}

export const DAILY_ENGLISH_CHALLENGES: DailyEnglishChallenge[] = [
  {
    id: 'dec_w_underground',
    kind: 'word',
    english: 'the Underground',
    phonetic: '/ði ˌʌndərˈɡraʊnd/',
    chinese: '（英式）倫敦地鐵（= the Tube）',
    exampleEn: 'Let us take the Underground to Green Park Station.',
    exampleZh: '我們搭地鐵去綠色公園站吧。',
    tip: '美式英文常用 subway，倫敦當地則稱為 the Underground 或 the Tube。',
  },
  {
    id: 'dec_p_how_do_i',
    kind: 'pattern',
    english: 'Excuse me. How do I get to The May Fair Hotel?',
    chinese: '不好意思，請問我要怎麼去梅菲爾飯店？',
    exampleEn: 'Go straight for two blocks and turn left on Stratton Street.',
    exampleZh: '直走兩個街區，然後在斯特拉頓街左轉。',
    tip: '向陌生人問路一定要先說 Excuse me，再接 How do I get to...?。',
  },
  {
    id: 'dec_w_corner',
    kind: 'word',
    english: 'on the corner of',
    phonetic: '/ɑːn ðə ˈkɔːrnər əv/',
    chinese: '在……的轉角處',
    exampleEn: "Kitty's Restaurant is on the corner of Second Street and Station Road.",
    exampleZh: '凱蒂餐廳在第二街與車站路的轉角處。',
    tip: '描述兩條馬路的交叉轉角固定使用介系詞 on（on the corner of A and B）。',
  },
  {
    id: 'dec_p_go_straight',
    kind: 'pattern',
    english: 'Go straight along Berkeley Street for two blocks.',
    chinese: '沿著伯克利街直走兩個街區。',
    exampleEn: 'Then turn right on Piccadilly Road, and you will see the bank.',
    exampleZh: '接著在皮卡迪利路右轉，你就會看到銀行。',
    tip: '表示「直走一段距離或幾個街區」要搭配介系詞 for（for two blocks）。',
  },
  {
    id: 'dec_w_across_from',
    kind: 'word',
    english: 'across from',
    phonetic: '/əˈkrɔːs frʌm/',
    chinese: '在……的對面',
    exampleEn: 'The May Fair Hotel is across from the Supermarket.',
    exampleZh: '梅菲爾飯店在超市的對面。',
    tip: 'across from 強調隔著馬路在正對面，不要漏掉 from 喔！',
  },
  {
    id: 'dec_p_between',
    kind: 'pattern',
    english: 'City Bank is between the hotel and the fire station.',
    chinese: '城市銀行在飯店和消防局之間。',
    exampleEn: 'Walk past the bank, and the post office is next to it.',
    exampleZh: '走過銀行，郵局就在它旁邊。',
    tip: '表示「在 A 與 B 兩者之間」固定使用 between A and B。',
  },
  {
    id: 'dec_w_ground_floor',
    kind: 'word',
    english: 'ground floor',
    phonetic: '/ɡraʊnd flɔːr/',
    chinese: '（英式）地面層／台灣一樓',
    exampleEn: 'The hotel lobby is on the ground floor, and Room 101 is on the first floor.',
    exampleZh: '飯店大廳在一樓（地面層），101 號房在英國的二樓（first floor）。',
    tip: '英國建築地面層叫 ground floor，往上一層才叫做 first floor！',
  },
  {
    id: 'dec_p_on_foot',
    kind: 'pattern',
    english: 'Did you come to Green Park by metro or on foot?',
    chinese: '你是搭地鐵還是走路來綠色公園的？',
    exampleEn: 'It is close, so we went there on foot.',
    exampleZh: '那裡很近，所以我們走路去的。',
    tip: '搭交通工具用 by + 單數名詞（by metro / by bus），步行則是 on foot！',
  },
  {
    id: 'dec_w_get_off',
    kind: 'word',
    english: 'get off',
    phonetic: '/ɡet ɔːf/',
    chinese: '下車',
    exampleEn: 'Take Bus 711 and get off at April High School.',
    exampleZh: '搭乘 711 號公車並在四月高中站下車。',
    tip: '上車是 get on，在某一站下車則是 get off at [站名]。',
  },
  {
    id: 'dec_p_take_bus',
    kind: 'pattern',
    english: 'I usually ride a bike to school, or take a bus on rainy days.',
    chinese: '我通常騎腳踏車上學，下雨天則搭公車。',
    exampleEn: 'She takes the metro to work every morning.',
    exampleZh: '她每天早上搭地鐵去上班。',
    tip: '兩輪跨坐（bike/scooter）動詞用 ride；大眾運輸（bus/train/metro）用 take。',
  },
];

export const BLUEPRINT_CATALOGUE: ItemBlueprint[] = [
  // 交通設施
  {
    id: 'bp_metro',
    name: 'Green Park Metro Kiosk',
    chinese: '綠色公園地鐵站',
    category: 'transit',
    categoryChinese: '交通設施',
    costCoins: 0,
    prosperity: 30,
    requiredChapter: 1,
    icon: 'Train',
    description: '倫敦經典地鐵出入口，帶有拱形雨棚與標誌。',
    modelType: 'metro_kiosk',
    footprint: { w: 2, d: 1 },
  },
  {
    id: 'bp_bike',
    name: 'Santander Bike Dock',
    chinese: '英倫單車租借站',
    category: 'transit',
    categoryChinese: '交通設施',
    costCoins: 80,
    prosperity: 25,
    requiredChapter: 1,
    icon: 'Bike',
    description: '精緻的倫敦風公共自行車站，配有電子租借機與紅色自行車。',
    modelType: 'bike_station',
    footprint: { w: 2, d: 1 },
  },
  {
    id: 'bp_taxi',
    name: 'City Taxi Station',
    chinese: '都會計程車站',
    category: 'transit',
    categoryChinese: '交通設施',
    costCoins: 120,
    prosperity: 35,
    requiredChapter: 1,
    icon: 'Car',
    description: '經典黃色計程車招呼站，趕時間時的最佳選擇！',
    modelType: 'taxi',
    footprint: { w: 1, d: 1 },
  },
  {
    id: 'bp_red_bus',
    name: 'London Double-Decker Bus',
    chinese: '倫敦雙層紅巴士',
    category: 'transit',
    categoryChinese: '交通設施',
    costCoins: 200,
    prosperity: 60,
    requiredChapter: 2,
    icon: 'Bus',
    description: '雙層鮮紅巴士，巡航於皮卡迪利大道上。',
    modelType: 'red_bus',
    footprint: { w: 1, d: 2 },
  },

  // 城市地標
  {
    id: 'bp_police',
    name: 'District Police Station',
    chinese: '第二街警察局',
    category: 'landmark',
    categoryChinese: '城市地標',
    costCoins: 160,
    prosperity: 45,
    requiredChapter: 1,
    icon: 'Shield',
    description: '在第二街轉角提供守護的警察局。',
    modelType: 'police_station',
    footprint: { w: 2, d: 2 },
  },
  {
    id: 'bp_mayfair',
    name: 'The May Fair Hotel',
    chinese: '梅菲爾飯店',
    category: 'landmark',
    categoryChinese: '城市地標',
    costCoins: 260,
    prosperity: 80,
    requiredChapter: 2,
    icon: 'Building',
    description: '課本對話核心地點！體驗英式 ground floor 與 1st floor 的差異。',
    modelType: 'mayfair_hotel',
    footprint: { w: 2, d: 2 },
  },
  {
    id: 'bp_bank',
    name: 'City Bank',
    chinese: '城市銀行',
    category: 'landmark',
    categoryChinese: '城市地標',
    costCoins: 220,
    prosperity: 70,
    requiredChapter: 2,
    icon: 'Landmark',
    description: '位於飯店與消防局之間的古典石柱建築。',
    modelType: 'bank',
    footprint: { w: 2, d: 2 },
  },
  {
    id: 'bp_hospital',
    name: 'Central Hospital',
    chinese: '中央醫院',
    category: 'landmark',
    categoryChinese: '城市地標',
    costCoins: 300,
    prosperity: 85,
    requiredChapter: 3,
    icon: 'Cross',
    description: '春日路與晴朗街轉角的現代化醫療機構。',
    modelType: 'hospital',
    footprint: { w: 2, d: 2 },
  },
  {
    id: 'bp_big_ben',
    name: 'Big Ben Clock Tower',
    chinese: '大笨鐘鐘樓',
    category: 'landmark',
    categoryChinese: '城市地標',
    costCoins: 450,
    prosperity: 150,
    requiredChapter: 3,
    icon: 'Clock',
    description: '泰晤士河畔的傳奇哥德式鐘樓，中午十二點響起清脆鐘聲！',
    modelType: 'big_ben',
    footprint: { w: 2, d: 2 },
    isSpecialSkin: true,
  },

  // 休閒生活
  {
    id: 'bp_restaurant',
    name: "Kitty's Restaurant",
    chinese: '凱蒂花園餐廳',
    category: 'lifestyle',
    categoryChinese: '休閒生活',
    costCoins: 170,
    prosperity: 55,
    requiredChapter: 1,
    icon: 'Utensils',
    description: '車站路旁備受喜愛的露天餐館，黃白遮陽棚格外溫馨。',
    modelType: 'kittys_restaurant',
    footprint: { w: 2, d: 1 },
  },
  {
    id: 'bp_phone_booth',
    name: 'UK Red Phone Booth',
    chinese: '英國經典紅色電話亭',
    category: 'lifestyle',
    categoryChinese: '休閒生活',
    costCoins: 130,
    prosperity: 40,
    requiredChapter: 2,
    icon: 'PhoneCall',
    description: '圓頂鑄鐵公用電話亭，充滿英倫街頭氛圍。',
    modelType: 'uk_phone_booth',
    footprint: { w: 1, d: 1 },
  },
  {
    id: 'bp_bench',
    name: 'Park Wooden Bench',
    chinese: '公園休憩長椅',
    category: 'lifestyle',
    categoryChinese: '休閒生活',
    costCoins: 40,
    prosperity: 15,
    requiredChapter: 1,
    icon: 'Armchair',
    description: '供島嶼居民散步疲累時坐下吹吹微風的木質長椅。',
    modelType: 'bench',
  },
  {
    id: 'bp_post_box',
    name: 'Royal Pillar Post Box',
    chinese: '英倫紅色圓柱郵筒',
    category: 'lifestyle',
    categoryChinese: '休閒生活',
    costCoins: 45,
    prosperity: 15,
    requiredChapter: 1,
    icon: 'Mail',
    description: '經典的英國郵政圓柱型紅色郵筒，寄出問候明信片。',
    modelType: 'post_box',
  },
  {
    id: 'bp_corgi',
    name: 'Park Walk Corgi',
    chinese: '散步柯基小狗',
    category: 'lifestyle',
    categoryChinese: '休閒生活',
    costCoins: 150,
    prosperity: 45,
    requiredChapter: 1,
    icon: 'Heart',
    description: '在草地與街道旁快樂搖尾巴散步的可愛小柯基。',
    modelType: 'corgi',
  },
  {
    id: 'bp_street_sign',
    name: 'London Corner Street Sign',
    chinese: '英倫路名指示牌',
    category: 'lifestyle',
    categoryChinese: '休閒生活',
    costCoins: 30,
    prosperity: 15,
    requiredChapter: 1,
    icon: 'Compass',
    description: '經典雙向英倫街角路牌（Station Rd. & Berkeley St.），指引街道方向。',
    modelType: 'street_sign',
  },

  // 自然造景
  {
    id: 'bp_streetlamp',
    name: 'Piccadilly Gaslamp',
    chinese: '皮卡迪利復古路燈',
    category: 'nature',
    categoryChinese: '自然造景',
    costCoins: 45,
    prosperity: 15,
    requiredChapter: 1,
    icon: 'Sun',
    description: '入夜後散發溫暖琥珀光芒的復古路燈。',
    modelType: 'streetlamp',
  },
  {
    id: 'bp_flower',
    name: 'Spring Flower Planter',
    chinese: '春季街角花圃',
    category: 'nature',
    categoryChinese: '自然造景',
    costCoins: 35,
    prosperity: 15,
    requiredChapter: 1,
    icon: 'Flower',
    description: '盛開鬱金香與小黃花的石砌街角花箱，點綴整條街道。',
    modelType: 'flower_planter',
  },
  {
    id: 'bp_oak',
    name: 'English Oak Tree',
    chinese: '百年綠蔭橡樹',
    category: 'nature',
    categoryChinese: '自然造景',
    costCoins: 50,
    prosperity: 20,
    requiredChapter: 1,
    icon: 'Trees',
    description: '綠意盎然的大橡樹，為散步者帶來舒服的遮陽。',
    modelType: 'tree_oak',
  },
  {
    id: 'bp_pine',
    name: 'Mountain Pine Tree',
    chinese: '高山翠松',
    category: 'nature',
    categoryChinese: '自然造景',
    costCoins: 50,
    prosperity: 20,
    requiredChapter: 1,
    icon: 'TreePine',
    description: '四季常青的高雅松樹，提升島嶼自然生態度。',
    modelType: 'tree_pine',
  },
  {
    id: 'bp_cherry',
    name: 'Cherry Blossom Tree',
    chinese: '盛開粉紅櫻花樹',
    category: 'nature',
    categoryChinese: '自然造景',
    costCoins: 90,
    prosperity: 35,
    requiredChapter: 2,
    icon: 'Trees',
    description: '微風吹過時飄落粉櫻花瓣的浪漫櫻花樹。',
    modelType: 'cherry_tree',
  },
  {
    id: 'bp_fountain',
    name: 'Royal Fountain',
    chinese: '皇家水景噴泉',
    category: 'nature',
    categoryChinese: '自然造景',
    costCoins: 190,
    prosperity: 65,
    requiredChapter: 2,
    icon: 'Waves',
    description: '石砌噴泉池，潺潺水聲讓人放鬆沉靜。',
    modelType: 'fountain',
    footprint: { w: 2, d: 2 },
  },
];

export type IncidentType = 'navigation' | 'courier' | 'npc_lost' | 'handbook_quiz' | 'counselor_call';

export interface IslandIncident {
  id: string;
  type: IncidentType;
  title: string;
  titleChinese: string;
  npcName: string;
  npcAvatar: string;
  summary: string;
  rewardCoins: number;
  rewardProsperity: number;
  chapter: number;
  level: number;
  requiredProsperity: number;
  levelTitle: string;
}

export const ISLAND_INCIDENTS: IslandIncident[] = [
  {
    id: 'inc_nav_hotel',
    type: 'navigation',
    level: 1,
    levelTitle: '第一等級：街頭導航',
    requiredProsperity: 0,
    title: 'Emergency Navigation Rescue',
    titleChinese: '【街頭導航救援】帶路前往目的地！',
    npcName: '迷路的市民 Yuki',
    npcAvatar: '👧',
    summary: '加藤一家在街道上迷路了，急需你用方向指引帶領他們安全抵達目的地！',
    rewardCoins: 85,
    rewardProsperity: 35,
    chapter: 1,
  },
  {
    id: 'inc_npc_police',
    type: 'npc_lost',
    level: 2,
    levelTitle: '第二等級：街頭禮貌問路',
    requiredProsperity: 200,
    title: 'Street Polite Inquiry',
    titleChinese: '【街頭禮貌問路】向巡邏警官與市民問路！',
    npcName: '巡邏警官 Higgins',
    npcAvatar: '👮‍♂️',
    summary: '走出地鐵站需要問路，請使用有禮貌的英文開場白贏得好感與清晰路線！',
    rewardCoins: 95,
    rewardProsperity: 40,
    chapter: 1,
  },
  {
    id: 'inc_courier_dispatch',
    type: 'courier',
    level: 3,
    levelTitle: '第三等級：快遞換乘',
    requiredProsperity: 450,
    title: 'Downtown Courier Shift',
    titleChinese: '【快遞換乘任務】交通動詞迅速切換！',
    npcName: '外送快遞員 Brad',
    npcAvatar: '🛵',
    summary: '快遞派工板傳來新詢問：迅速配對搭乘交通工具的動詞與介系詞！',
    rewardCoins: 100,
    rewardProsperity: 45,
    chapter: 2,
  },
  {
    id: 'inc_handbook_check',
    type: 'handbook_quiz',
    level: 4,
    levelTitle: '第四等級：旅行隨堂',
    requiredProsperity: 750,
    title: 'London Travel Notes Quiz',
    titleChinese: '【旅行隨堂小考】英美日常字彙大挑戰！',
    npcName: '導遊 Emma',
    npcAvatar: '👩‍🏫',
    summary: '薯條是 chips 還是 fries？地鐵是 Tube 還是 Subway？英美差異立即測！',
    rewardCoins: 110,
    rewardProsperity: 50,
    chapter: 2,
  },
  {
    id: 'inc_counselor_hotline',
    type: 'counselor_call',
    level: 5,
    levelTitle: '第五等級：英文熱線',
    requiredProsperity: 1100,
    title: 'Warm English Hotline',
    titleChinese: '【暖心英文熱線】感到緊張嗎？英文學伴隨時輔導！',
    npcName: '專屬英文學伴',
    npcAvatar: '🎙️',
    summary: '不敢開口問路？專屬學伴提供超好記的英文例句句型，讓你無壓力學習！',
    rewardCoins: 90,
    rewardProsperity: 40,
    chapter: 3,
  },
];

// ==========================================
// 🎲 隨機動態題目生成系統 (不再重複同一題！)
// ==========================================

export interface MapLandmark {
  id: string;
  name: string;
  nameChinese: string;
  icon: string;
  x: number;
  y: number;
  type: 'hotel' | 'station' | 'police' | 'restaurant' | 'bank' | 'supermarket' | 'hospital' | 'park' | 'post' | 'fire' | 'market' | 'school' | 'bus';
  desc: string;
  isDestination?: boolean;
}

export interface MapStreetSign {
  id: string;
  name: string;
  nameChinese: string;
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
}

export interface NavigationStage {
  id: string;
  presetId?: string;
  title: string;
  target: string;
  targetChinese: string;
  targetIcon: string;
  targetDesc: string;
  audioPrompt: string;
  chinesePrompt: string;
  correctPath: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[];
  hint: string;
  timeLimit: number;
  startPos: { x: number; y: number; name: string };
  targetPos: { x: number; y: number };
  streetSigns: MapStreetSign[];
  landmarks: MapLandmark[];
  sourcePage?: string;
  scenarioName?: string;
}

export const MAP_STREET_SIGNS: MapStreetSign[] = [
  { id: 'sign_stratton', name: 'Stratton Street / John St', nameChinese: '斯特拉頓街 / 約翰街', x: 2, y: 1, orientation: 'horizontal' },
  { id: 'sign_piccadilly', name: 'Piccadilly Road / Red Sun St', nameChinese: '皮卡迪利路 / 紅日街', x: 2, y: 2, orientation: 'horizontal' },
  { id: 'sign_station', name: 'Station Road / Forest St', nameChinese: '車站路 / 森林街', x: 2, y: 3, orientation: 'horizontal' },
  { id: 'sign_second', name: 'Second Street', nameChinese: '第二街', x: 0, y: 2, orientation: 'vertical' },
  { id: 'sign_berkeley', name: 'Berkeley Street / Fourth St', nameChinese: '伯克利街 / 第四街', x: 2, y: 2, orientation: 'vertical' },
  { id: 'sign_spring', name: 'Spring Road / Yellow Tree Rd', nameChinese: '春天路 / 黃樹路', x: 4, y: 2, orientation: 'vertical' },
];

export const MAP_BASE_LANDMARKS: MapLandmark[] = [
  {
    id: 'lm_mayfair',
    name: 'The May Fair Hotel',
    nameChinese: 'The May Fair Hotel',
    icon: '🏨',
    x: 1,
    y: 1,
    type: 'hotel',
    desc: 'Berkeley St & Stratton St corner, across from the supermarket (p.93-94).',
  },
  {
    id: 'lm_supermarket',
    name: 'Supermarket',
    nameChinese: 'Supermarket',
    icon: '🏪',
    x: 3,
    y: 1,
    type: 'supermarket',
    desc: 'Located on Stratton Street, across from the hotel (p.94).',
  },
  {
    id: 'lm_station',
    name: 'Green Park Station',
    nameChinese: 'Green Park Station',
    icon: '🚇',
    x: 2,
    y: 3,
    type: 'station',
    desc: 'The Tube Exit on Piccadilly Road & Berkeley Street (p.93).',
  },
  {
    id: 'lm_police',
    name: 'Police Station',
    nameChinese: 'Police Station',
    icon: '👮',
    x: 0,
    y: 1,
    type: 'police',
    desc: 'Corner of Second Street and Stratton Street (p.100).',
  },
  {
    id: 'lm_fire',
    name: 'Fire Station',
    nameChinese: 'Fire Station',
    icon: '🚒',
    x: 0,
    y: 2,
    type: 'fire',
    desc: 'Located on Second Street, between the hotel and bank (p.98).',
  },
  {
    id: 'lm_restaurant',
    name: "Kitty's Restaurant",
    nameChinese: "Kitty's Restaurant",
    icon: '🍜',
    x: 0,
    y: 3,
    type: 'restaurant',
    desc: 'Corner of Station Road and Second Street (p.100).',
  },
  {
    id: 'lm_river_water',
    name: 'River Water Restaurant',
    nameChinese: 'River Water Restaurant',
    icon: '🎂',
    x: 1,
    y: 3,
    type: 'restaurant',
    desc: 'Corner of Forest Street and Red Sun Street (p.110-111).',
  },
  {
    id: 'lm_flower_market',
    name: 'Flower Market',
    nameChinese: 'Flower Market',
    icon: '💐',
    x: 2,
    y: 2,
    type: 'market',
    desc: 'Corner of Berkeley Street and Piccadilly Road (p.100).',
  },
  {
    id: 'lm_bank',
    name: 'City Bank',
    nameChinese: 'City Bank',
    icon: '🏦',
    x: 4,
    y: 1,
    type: 'bank',
    desc: 'Corner of Spring Road, next to the supermarket (p.98, p.99).',
  },
  {
    id: 'lm_post',
    name: 'Post Office',
    nameChinese: 'Post Office',
    icon: '📮',
    x: 4,
    y: 2,
    type: 'post',
    desc: 'On Spring Road, across from the hospital (p.98).',
  },
  {
    id: 'lm_hospital',
    name: 'Central Hospital',
    nameChinese: 'Central Hospital',
    icon: '🏥',
    x: 4,
    y: 3,
    type: 'hospital',
    desc: 'Corner of Spring Road and Station Road, next to the school (p.98).',
  },
  {
    id: 'lm_bus_school',
    name: 'April High School / Bus Stop',
    nameChinese: 'April High School / Bus Stop',
    icon: '🚏',
    x: 3,
    y: 3,
    type: 'bus',
    desc: 'Bus 711 stop near River Water Restaurant (p.110).',
  },
  {
    id: 'lm_park',
    name: 'Green Park Fountain',
    nameChinese: 'Green Park Fountain',
    icon: '⛲',
    x: 2,
    y: 0,
    type: 'park',
    desc: 'Picnic plaza on Berkeley Street (p.94).',
  },
];

export interface NavigationPreset {
  id: string;
  sourcePage: string;
  scenarioName: string;
  target: string;
  targetChinese: string;
  targetIcon: string;
  targetDesc: string;
  startPos: { x: number; y: number; name: string };
  targetPos: { x: number; y: number };
  correctPath: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[];
  audioPrompt: string;
  chinesePrompt: string;
  hint: string;
}

export const NAVIGATION_PRESETS: NavigationPreset[] = [
  // 1. 課本 p.93-94 加藤一家前往梅菲爾飯店 (3 steps)
  {
    id: 'preset_mayfair_yuki',
    sourcePage: '課本 p.93-94【對話與地圖】',
    scenarioName: '街頭實境導航任務',
    target: 'The May Fair Hotel',
    targetChinese: 'The May Fair Hotel',
    targetIcon: '🏨',
    targetDesc: 'Located at the corner of Berkeley Street and Stratton Street, across from the Supermarket.',
    startPos: { x: 2, y: 3, name: 'Green Park Station' },
    targetPos: { x: 1, y: 1 },
    correctPath: ['UP', 'UP', 'LEFT'],
    audioPrompt: 'Go straight along Berkeley Street for two blocks. Turn left on Stratton Street. Walk one block, and the May Fair Hotel is on your right.',
    chinesePrompt: '沿著 Berkeley Street 直走兩個街區，在 Stratton Street 左轉走一個街區，The May Fair Hotel 就在你的右邊！',
    hint: '從地鐵站出發，先向上直走兩個街區，到 Stratton St 再左轉！',
  },
  // 2. 課本 p.99 句型2 肯恩問路前往銀行 (4 steps)
  {
    id: 'preset_bank_ken',
    sourcePage: '課本 p.99【Grammar Focus 2 看圖說寫】',
    scenarioName: '街頭實境導航任務',
    target: 'City Bank',
    targetChinese: 'City Bank',
    targetIcon: '🏦',
    targetDesc: 'Located on the corner of Spring Road and Stratton Street, next to the Supermarket.',
    startPos: { x: 1, y: 3, name: 'River Water Restaurant' },
    targetPos: { x: 4, y: 1 },
    correctPath: ['RIGHT', 'UP', 'UP', 'RIGHT', 'RIGHT'],
    audioPrompt: 'Walk right to Berkeley Street, then go straight north for two blocks to Stratton Street. Turn right and walk two blocks to Spring Road. The City Bank is on the corner.',
    chinesePrompt: '向右走到 Berkeley Street，接著向上直走兩個街區到 Stratton Street，右轉再走兩個街區到 Spring Road，City Bank 就在轉角！',
    hint: '先向右走到中央大道（Berkeley St），向上直走兩個路口後再右轉兩步！',
  },
  // 3. 課本 p.100 句型2 米雅問路前往警察局 (4 steps)
  {
    id: 'preset_police_mia',
    sourcePage: '課本 p.100【Grammar Focus 2 街區指路】',
    scenarioName: '街頭實境導航任務',
    target: 'Police Station',
    targetChinese: 'Police Station',
    targetIcon: '👮',
    targetDesc: 'Located on the corner of Second Street and Stratton Street.',
    startPos: { x: 2, y: 3, name: 'Green Park Station' },
    targetPos: { x: 0, y: 1 },
    correctPath: ['UP', 'UP', 'LEFT', 'LEFT'],
    audioPrompt: 'Go straight along Berkeley Street for two blocks and turn left on Stratton Street. Walk along Stratton Street for two blocks to Second Street, and you can see the Police Station.',
    chinesePrompt: '沿著 Berkeley Street 直走兩個街區，在 Stratton Street 左轉走兩個街區到 Second Street，就能看到 Police Station！',
    hint: '筆直向上走兩個街口到 Stratton St，再向左走兩個街區抵達 Second St！',
  },
  // 4. 課本 p.100 句型2 奧利佛前往凱蒂餐廳 (4 steps)
  {
    id: 'preset_kittys_oliver',
    sourcePage: '課本 p.100【Grammar Focus 2 餐廳指路】',
    scenarioName: '街頭實境導航任務',
    target: "Kitty's Restaurant",
    targetChinese: "Kitty's Restaurant",
    targetIcon: '🍜',
    targetDesc: 'Located on the corner of Station Road and Second Street.',
    startPos: { x: 3, y: 1, name: 'Supermarket' },
    targetPos: { x: 0, y: 3 },
    correctPath: ['LEFT', 'DOWN', 'DOWN', 'LEFT', 'LEFT'],
    audioPrompt: "Walk left one block to Berkeley Street, then go down for two blocks to Station Road. Turn right and walk two blocks west to Second Street. Kitty's Restaurant is on the corner.",
    chinesePrompt: "向左走一個街區到 Berkeley Street，向下直走兩個街區到 Station Road，再向西走兩個街區到 Second Street，Kitty's Restaurant 就在轉角！",
    hint: '先向左一步到中央大道，向下走兩步到 Station Rd，再向左走兩步！',
  },
  // 5. 課本 p.100 麗塔問路前往花卉市場 (3 steps)
  {
    id: 'preset_flower_rita',
    sourcePage: '課本 p.100【Grammar Focus 2 花市問路】',
    scenarioName: '街頭實境導航任務',
    target: 'Flower Market',
    targetChinese: 'Flower Market',
    targetIcon: '💐',
    targetDesc: 'Located at the intersection of Berkeley Street and Piccadilly Road.',
    startPos: { x: 4, y: 1, name: 'City Bank' },
    targetPos: { x: 2, y: 2 },
    correctPath: ['LEFT', 'LEFT', 'DOWN'],
    audioPrompt: 'Walk west along Stratton Street for two blocks until you reach Berkeley Street. Then turn left and go down one block. The Flower Market is on the corner of Piccadilly Road.',
    chinesePrompt: '沿著 Stratton Street 向西走兩個街區到 Berkeley Street，接著左轉向下走一個街區，Flower Market 就在路口轉角！',
    hint: '沿 Stratton St 向左走兩個街區，到中央路口後向下走一步！',
  },
  // 6. 課本 p.110-111 慶生會閱讀題：珊卓迷路救援 (3 steps)
  {
    id: 'preset_sandra_riverwater',
    sourcePage: '課本 p.110-111【Reading 慶生會迷路救援】',
    scenarioName: '街頭實境導航任務',
    target: 'River Water Restaurant',
    targetChinese: 'River Water Restaurant',
    targetIcon: '🎂',
    targetDesc: 'Located on Station Road, next to Green Park Station.',
    startPos: { x: 0, y: 1, name: 'Police Station' },
    targetPos: { x: 1, y: 3 },
    correctPath: ['DOWN', 'DOWN', 'RIGHT'],
    audioPrompt: 'Walk south along Second Street for two blocks to Station Road. Then turn left and go east for one block. River Water Restaurant is right there.',
    chinesePrompt: '沿著 Second Street 向南走兩個街區到 Station Road，接著向東走一個街區，就能看到 River Water Restaurant！',
    hint: '向下走兩個街口抵達 Station Rd，再向右走一個街區！',
  },
  // 7. 課本 p.110-111 凱爾前往水河餐廳 (4 steps)
  {
    id: 'preset_kyle_bus',
    sourcePage: '課本 p.110-111【Reading 慶生會路線】',
    scenarioName: '街頭實境導航任務',
    target: 'River Water Restaurant',
    targetChinese: 'River Water Restaurant',
    targetIcon: '🎂',
    targetDesc: 'Located on Station Road, one block west of Green Park Station.',
    startPos: { x: 3, y: 1, name: 'Supermarket' },
    targetPos: { x: 1, y: 3 },
    correctPath: ['DOWN', 'DOWN', 'LEFT', 'LEFT'],
    audioPrompt: 'Go straight south for two blocks to Station Road. Then turn right and walk west for two blocks. River Water Restaurant is across from the block.',
    chinesePrompt: '先向南直走兩個街區到 Station Road，接著轉往西方走兩個街區，即可抵達 River Water Restaurant！',
    hint: '先向下走兩個街口，到 Station Rd 後再連續向左走兩個街區！',
  },
  // 8. 課本 p.108 聽力言談理解：夜晚公園迷路救援 (3 steps)
  {
    id: 'preset_jogger_rescue',
    sourcePage: '課本 p.108【Listening 言談理解】',
    scenarioName: '街頭實境導航任務',
    target: 'Green Park Station',
    targetChinese: 'Green Park Station',
    targetIcon: '🚇',
    targetDesc: 'Located at the junction of Berkeley Street and Station Road.',
    startPos: { x: 2, y: 0, name: 'Green Park Fountain' },
    targetPos: { x: 2, y: 3 },
    correctPath: ['DOWN', 'DOWN', 'DOWN'],
    audioPrompt: 'Follow Berkeley Street straight south for three blocks. Cross Stratton Street and Piccadilly Road to reach Green Park Station at Station Road.',
    chinesePrompt: '沿著 Berkeley Street 筆直向南走三個街區，穿過 Stratton Street 與 Piccadilly Road，就能在 Station Road 看到 Green Park Station！',
    hint: '沿著中央大道（Berkeley St）筆直向下穿過三個街口！',
  },
  // 9. 課本 p.98 城市地圖：前往郵局 (4 steps)
  {
    id: 'preset_post_hospital',
    sourcePage: '課本 p.98【Theme Words 2 城市場所】',
    scenarioName: '街頭實境導航任務',
    target: 'Post Office',
    targetChinese: 'Post Office',
    targetIcon: '📮',
    targetDesc: 'Located on Spring Road and Piccadilly Road.',
    startPos: { x: 1, y: 3, name: 'River Water Restaurant' },
    targetPos: { x: 4, y: 2 },
    correctPath: ['RIGHT', 'RIGHT', 'RIGHT', 'UP'],
    audioPrompt: 'Walk east along Station Road for three blocks until you reach Spring Road. Then turn left and go north for one block. The Post Office is on Spring Road.',
    chinesePrompt: '沿著 Station Road 向東走三個街區到 Spring Road，再左轉向上走一個街區，Post Office 就在 Spring Road 上！',
    hint: '沿 Station Rd 連續向右走三個街口到 Spring Rd，再向上走一步！',
  },
  // 10. 課本 p.98 城市地圖：緊急救護前往中央醫院 (5 steps)
  {
    id: 'preset_hospital_urgent',
    sourcePage: '課本 p.98【Theme Words 2 醫院方位】',
    scenarioName: '街頭實境導航任務',
    target: 'Central Hospital',
    targetChinese: 'Central Hospital',
    targetIcon: '🏥',
    targetDesc: 'Located at the corner of Spring Road and Station Road.',
    startPos: { x: 1, y: 1, name: 'The May Fair Hotel' },
    targetPos: { x: 4, y: 3 },
    correctPath: ['DOWN', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT'],
    audioPrompt: 'Go straight south for two blocks to Station Road. Then turn left and walk east along Station Road for three blocks. Central Hospital is on the corner of Spring Road.',
    chinesePrompt: '先向南直走兩個街區到 Station Road，接著沿著 Station Road 向東走三個街區，Central Hospital 就在 Spring Road 轉角！',
    hint: '先向下走兩個街口到最南側道路，再一路向右走三個街區！',
  },
  // 11. 課本 p.94 & p.108 前往生鮮超市 (3 steps)
  {
    id: 'preset_supermarket_picnic',
    sourcePage: '課本 p.94 & p.108【聽力與課文】',
    scenarioName: '街頭實境導航任務',
    target: 'Supermarket',
    targetChinese: 'Supermarket',
    targetIcon: '🏪',
    targetDesc: 'Located on Stratton Street, across from The May Fair Hotel.',
    startPos: { x: 2, y: 3, name: 'Green Park Station' },
    targetPos: { x: 3, y: 1 },
    correctPath: ['UP', 'UP', 'RIGHT'],
    audioPrompt: 'Walk north along Berkeley Street for two blocks to Stratton Street. Then turn right and go east for one block. The Supermarket is on your left.',
    chinesePrompt: '沿著 Berkeley Street 向北走兩個街區到 Stratton Street，然後右轉走一個街區，Supermarket 就在你的左手邊！',
    hint: '向上直走兩個街區到 Stratton St，再向右轉走一個街區！',
  },
  // 12. 課本 p.94 綠色公園噴泉野餐 (4 steps)
  {
    id: 'preset_park_picnic',
    sourcePage: '課本 p.94【對話：徒步前往公園】',
    scenarioName: '街頭實境導航任務',
    target: 'Green Park Fountain',
    targetChinese: 'Green Park Fountain',
    targetIcon: '⛲',
    targetDesc: 'Located at the northern end of Berkeley Street.',
    startPos: { x: 0, y: 2, name: 'Fire Station' },
    targetPos: { x: 2, y: 0 },
    correctPath: ['RIGHT', 'RIGHT', 'UP', 'UP'],
    audioPrompt: 'Walk east along Piccadilly Road for two blocks to Berkeley Street. Then turn left and walk straight north for two blocks to Green Park Fountain.',
    chinesePrompt: '沿著 Piccadilly Road 向東走兩個街區到 Berkeley Street，再左轉向北直走兩個街區就能抵達 Green Park Fountain！',
    hint: '向右走兩個街區到中央大道（Berkeley St），再向上直走兩個街區！',
  },
  // 13. 課本 p.98 前往消防局 (4 steps)
  {
    id: 'preset_fire_station',
    sourcePage: '課本 p.98【Theme Words 2 消防局方位】',
    scenarioName: '街頭實境導航任務',
    target: 'Fire Station',
    targetChinese: 'Fire Station',
    targetIcon: '🚒',
    targetDesc: 'Located on Second Street and Piccadilly Road.',
    startPos: { x: 3, y: 3, name: 'April High School / Bus Stop' },
    targetPos: { x: 0, y: 2 },
    correctPath: ['LEFT', 'LEFT', 'LEFT', 'UP'],
    audioPrompt: 'Go west along Station Road for three blocks to Second Street. Then turn right and go north for one block. The Fire Station is right there.',
    chinesePrompt: '沿著 Station Road 向西走三個街區到 Second Street，再右轉向上走一個街區，就能抵達 Fire Station！',
    hint: '向左穿過三個街區到 Second St，再向上走一步！',
  },
  // 14. 課本 p.108 聽力簡短對話：前往城市銀行 (3 steps)
  {
    id: 'preset_bank_across_hospital',
    sourcePage: '課本 p.108【Listening 簡短對話】',
    scenarioName: '街頭實境導航任務',
    target: 'City Bank',
    targetChinese: 'City Bank',
    targetIcon: '🏦',
    targetDesc: 'Located on the corner of Stratton Street and Spring Road.',
    startPos: { x: 2, y: 2, name: 'Flower Market' },
    targetPos: { x: 4, y: 1 },
    correctPath: ['RIGHT', 'RIGHT', 'UP'],
    audioPrompt: 'Go east along Piccadilly Road for two blocks to Spring Road. Turn left and walk north for one block. City Bank is on the corner of Stratton Street.',
    chinesePrompt: '沿著 Piccadilly Road 向東走兩個街區到 Spring Road，左轉向北走一個街區，City Bank 就在 Stratton Street 轉角！',
    hint: '向右走兩個街區到 Spring Rd，然後向上走一個街區！',
  },
  // 15. 課本 p.100 前往凱蒂餐廳 (3 steps)
  {
    id: 'preset_police_to_kittys',
    sourcePage: '課本 p.100【Grammar Focus 2 街區對照】',
    scenarioName: '街頭實境導航任務',
    target: "Kitty's Restaurant",
    targetChinese: "Kitty's Restaurant",
    targetIcon: '🍜',
    targetDesc: 'Located at the corner of Second Street and Station Road.',
    startPos: { x: 1, y: 1, name: 'The May Fair Hotel' },
    targetPos: { x: 0, y: 3 },
    correctPath: ['LEFT', 'DOWN', 'DOWN'],
    audioPrompt: "Walk west along Stratton Street for one block to Second Street. Then turn left and go south for two blocks. Kitty's Restaurant is on the corner of Station Road.",
    chinesePrompt: "沿著 Stratton Street 向西走一個街區到 Second Street，接著左轉向南走兩個街區，Kitty's Restaurant 就在 Station Road 轉角！",
    hint: '先向左走一步到 Second St，再連續向下走兩個街區！',
  },
];

// ==========================================
// 🎲 隨機動態題目生成系統 (每次都保證隨機出題！)
// ==========================================

export function generateRandomNavigationStage(roundNumber = 1, excludeId?: string): NavigationStage {
  const filtered = excludeId ? NAVIGATION_PRESETS.filter(p => p.id !== excludeId) : NAVIGATION_PRESETS;
  const pool = filtered.length > 0 ? filtered : NAVIGATION_PRESETS;
  const preset = pool[Math.floor(Math.random() * pool.length)];

  // Clone landmarks and mark the destination
  const landmarks = MAP_BASE_LANDMARKS.map(lm => ({
    ...lm,
    isDestination: lm.name === preset.target,
  }));

  return {
    id: `nav_dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    presetId: preset.id,
    title: `任務 ${roundNumber}：英語聽力街頭導航`,
    target: preset.target,
    targetChinese: preset.target,
    targetIcon: preset.targetIcon,
    targetDesc: preset.targetDesc,
    audioPrompt: preset.audioPrompt,
    chinesePrompt: preset.chinesePrompt,
    correctPath: preset.correctPath,
    hint: preset.hint,
    timeLimit: 24 + preset.correctPath.length * 4,
    startPos: preset.startPos,
    targetPos: preset.targetPos,
    streetSigns: MAP_STREET_SIGNS,
    landmarks,
    sourcePage: preset.sourcePage,
    scenarioName: preset.scenarioName,
  };
}

// ==========================================
// 📖 課本 Unit 5 實境情境救援題庫 (全面融入本份文件)
// ==========================================

export interface TextbookRescueQuestion {
  id: string;
  badge: string;
  sourcePage: string;
  category: 'sammy_party' | 'street_direction' | 'london_dialogue' | 'listening_rescue' | 'location_prep' | 'transit_verbs';
  character: string;
  characterAvatar: string;
  situation: string;
  situationChinese: string;
  audioPrompt?: string;
  question: string;
  questionChinese: string;
  options: {
    text: string;
    chinese?: string;
  }[];
  correctIndex: number;
  explanation: string;
  keyRule: string;
}

export const TEXTBOOK_RESCUE_QUESTIONS: TextbookRescueQuestion[] = [
  // 1. 課本 p.111 第 3 題 珊卓迷路救援
  {
    id: 'trq_sandra_lost',
    badge: '🎂 慶生會迷路救援',
    sourcePage: '課本 p.110-111【Reading 第 3 題】',
    category: 'sammy_party',
    character: '迷路的同學 Sandra',
    characterAvatar: '👧',
    situation: "Sandra didn't read the e-mail, so she's now at the wrong restaurant (Oliver's Restaurant). Jonathan is giving her the directions on the phone to River Water.",
    situationChinese: '珊卓沒有看慶生會通知信，跑到了舊餐廳（奧利佛餐廳）。強納森正在電話中為她指路前往新地點水河餐廳（River Water）。',
    audioPrompt: 'Walk along John St. Turn left on Red Sun St. and keep going. It is on the corner of Forest St. and Red Sun St.',
    question: 'What might Jonathan be saying to Sandra on the phone?',
    questionChinese: '強納森在電話中應該對珊卓說哪一段正確的指路方向？',
    options: [
      { text: 'Go down John St. and turn right on Red Sun St. Then walk straight for one block.', chinese: '沿著約翰街走，在紅日街右轉，直走一個街區。' },
      { text: 'Walk along Yellow Tree Rd. for one block and turn right. You can see it when you walk past Brown Box St.', chinese: '沿黃樹路走一個街區右轉，經過棕箱街就會看到。' },
      { text: 'Go down Forest St. Turn left on Yellow Tree Rd. and walk for five minutes. It is on your right.', chinese: '沿森林街走，在黃樹路左轉走五分鐘。' },
      { text: 'Walk along John St. Turn left on Red Sun St. and keep going. It is on the corner of Forest St. and Red Sun St.', chinese: '沿約翰街走，在紅日街左轉並繼續前進。餐廳就在森林街與紅日街轉角！' },
    ],
    correctIndex: 3,
    explanation: '課本第 111 頁第 3 題解答為 (D)。從奧利佛餐廳（John St）出發，沿約翰街走，在紅日街左轉並直走，水河餐廳就在森林街與紅日街轉角。',
    keyRule: '指路關鍵句型：Walk along... / Turn left on... / It is on the corner of A and B.',
  },
  // 2. 課本 p.111 第 2 題 凱爾不願走太多路
  {
    id: 'trq_kyle_transport',
    badge: '🚌 最佳交通工具選擇',
    sourcePage: '課本 p.110-111【Reading 第 2 題】',
    category: 'sammy_party',
    character: '同學 Kyle',
    characterAvatar: '👦',
    situation: "Kyle doesn't want to walk too much to Sammy's birthday party at River Water Restaurant.",
    situationChinese: '凱爾腳很酸不想走太多路，他正在尋找前往水河餐廳最少步行的交通方式。',
    audioPrompt: 'Take Bus 711 or Red 1 and get off at April High School. Walk across the street, and it is on the corner.',
    question: 'Kyle does not want to walk too much. Which is the best way for him to get to the restaurant?',
    questionChinese: '凱爾不想走太多路。前往水河餐廳對他而言最佳的交通方式是？',
    options: [
      { text: 'Drive a car.', chinese: '開車前往（但文中註記：附近沒有停車場，請勿開車！）' },
      { text: 'Take Bus 711.', chinese: '搭乘 711 號公車（在四月高中下車，過馬路就到轉角餐廳！）' },
      { text: 'Take the train.', chinese: '搭火車（天空公園站下車需走一段路）' },
      { text: 'Take the metro.', chinese: '搭捷運紫線（在天空公園站下車後需步行 15 分鐘！）' },
    ],
    correctIndex: 1,
    explanation: '課本第 111 頁第 2 題解答為 (B)。搭公車 711 在四月高中下車「只需走過馬路（Walk across the street）」，而捷運需步行 15 分鐘，開車則沒有停車場！',
    keyRule: '閱讀理解技巧：注意文中「* There is no parking lot...」與「fifteen-minute walk」的細節對照。',
  },
  // 3. 課本 p.111 第 1 題 慶生會事實判斷
  {
    id: 'trq_party_fact',
    badge: '📋 閱讀事實推論',
    sourcePage: '課本 p.110-111【Reading 第 1 題】',
    category: 'sammy_party',
    character: '強納森的邀請信',
    characterAvatar: '✉️',
    situation: "Jonathan wrote an email about Sammy's birthday party details.",
    situationChinese: '強納森寄發電子郵件通知大家慶生會從奧利佛餐廳改到水河餐廳。',
    audioPrompt: 'Train: Get off at Sky Park Station. Metro: Take the purple line and get off at Sky Park Station.',
    question: 'Which is true about the party?',
    questionChinese: '關於這場生日派對，下列敘述何者正確？',
    options: [
      { text: "It's on a Sunday evening.", chinese: '派對在星期日晚上（錯誤：信中寫 this Saturday night）。' },
      { text: "It's for Jonathan's birthday.", chinese: '是為了慶祝強納森的生日（錯誤：是 Sammy 的生日）。' },
      { text: 'People can take a train there.', chinese: '大家可以搭火車去那裡（正確：Train: Get off at Sky Park Station）。' },
      { text: 'Only ten people are going to the party.', chinese: '只有十個人要去（錯誤：信中提到訂了十二人桌 table for twelve）。' },
    ],
    correctIndex: 2,
    explanation: '課本第 111 頁第 1 題解答為 (C)。交通指南第一項明確標示「Train: Get off at Sky Park Station」，代表可以搭火車抵達！',
    keyRule: '事實細節題：核對時間（Saturday）、主角（Sammy）、人數（twelve）與交通方式。',
  },
  // 4. 課本 p.108 聽力言談理解 第 2 題 夜晚公園迷路
  {
    id: 'trq_listening_park_lost',
    badge: '🎧 聽力言談救援',
    sourcePage: '課本 p.108【Listening 言談理解 第 2 題】',
    category: 'listening_rescue',
    character: '夜跑市民',
    characterAvatar: '🏃‍♂️',
    situation: "A man usually goes jogging along the river bank, but yesterday he jogged in a big park. When he finished, it was dark. He kept coming back to the same corner until a guy showed him the way.",
    situationChinese: '一名男子昨天傍晚在公園慢跑，跑完天色已黑，一直在同一個轉角打轉找不到出口，直到路過的好心人為他指路。',
    audioPrompt: 'I tried to find the way out, but I kept coming back to the same corner. Luckily, a guy walked past, and he showed me the way.',
    question: 'What do we know about the man?',
    questionChinese: '根據聽力對話內容，我們可以知道這位男士的什麼狀況？',
    options: [
      { text: 'He was lost.', chinese: '他在天黑的公園裡迷路了。' },
      { text: 'He did not ask for help.', chinese: '他沒有向別人求助。' },
      { text: 'He went jogging by the river last night.', chinese: '他昨晚沿著河岸慢跑。' },
      { text: 'He lived inside the park.', chinese: '他住在公園裡面。' },
    ],
    correctIndex: 0,
    explanation: '課本第 108 頁聽力第 2 題解答為 (A)。男士提到「tried to find the way out, but I kept coming back to the same corner（試圖找路出去但一直回到同一個轉角）」，代表他迷路了（He was lost）。',
    keyRule: '核心字彙：be lost（迷路）= lose one’s way。',
  },
  // 5. 課本 p.108 聽力基本問答 第 1 題 火車站問路
  {
    id: 'trq_listening_train_station',
    badge: '🎧 聽力基本問答',
    sourcePage: '課本 p.108【Listening 基本問答 第 1 題】',
    category: 'listening_rescue',
    character: '問路的旅客',
    characterAvatar: '🧳',
    situation: 'A tourist asks for the location of the train station on the street.',
    situationChinese: '路上的觀光客禮貌詢問火車站的位置。',
    audioPrompt: 'Excuse me. Where is the train station?',
    question: 'Question: "Excuse me. Where is the train station?" What is the most appropriate response?',
    questionChinese: '當對方問「請問火車站在哪裡？」時，下列何者是最適合的回應？',
    options: [
      { text: 'You can go there by train.', chinese: '你可以搭火車去那裡。（文不對題）' },
      { text: 'We are on the ground floor.', chinese: '我們在地面層。（文不對題）' },
      { text: "Turn right at the temple there. It's on your left.", chinese: '在前面的寺廟那裡向右轉，它就在你的左邊。（正確指引方向！）' },
      { text: 'The train is very fast.', chinese: '火車非常快。（答非所問）' },
    ],
    correctIndex: 2,
    explanation: '課本第 108 頁基本問答第 1 題解答為 (C)。問句為「Where is the train station?」，回答應給予方位路線指引「Turn right at... It is on your left.」。',
    keyRule: '問路問答回應：Where is... 詢問地點，回答以方向指令動詞（Turn right/left, Go straight）為標準回應。',
  },
  // 6. 課本 p.108 聽力簡短對話 第 2 題 銀行問路
  {
    id: 'trq_listening_bank_location',
    badge: '🎧 聽力簡短對話',
    sourcePage: '課本 p.108【Listening 簡短對話 第 2 題】',
    category: 'listening_rescue',
    character: '男子與女子',
    characterAvatar: '👫',
    situation: "M: Excuse me. How do I get to the bank? W: Go straight. It's across from a hospital.",
    situationChinese: '男士在街頭詢問女子銀行該怎麼走，女子回答「直走，就在醫院對面」。',
    audioPrompt: "Excuse me. How do I get to the bank? Go straight. It's across from a hospital.",
    question: 'Where is the bank according to the woman?',
    questionChinese: '根據女子的指引，銀行位於何處？',
    options: [
      { text: "It's next to the metro station.", chinese: '在捷運站旁邊。' },
      { text: "It's across from a hospital.", chinese: '在醫院的對面（across from a hospital）。' },
      { text: "It's on the second floor.", chinese: '在二樓。' },
      { text: "It's behind the park.", chinese: '在公園後面。' },
    ],
    correctIndex: 1,
    explanation: '課本第 108 頁簡短對話第 2 題解答為 (B)。女子明確指示「It’s across from a hospital.」。',
    keyRule: '方位介系詞：across from = 在…的對面；opposite to。',
  },
  // 7. 課本 p.108 聽力簡短對話 第 1 題 機場交通趕時間
  {
    id: 'trq_listening_airport_taxi',
    badge: '🎧 聽力簡短對話',
    sourcePage: '課本 p.108【Listening 簡短對話 第 1 題】',
    category: 'listening_rescue',
    character: '女子與朋友',
    characterAvatar: '🚕',
    situation: "M: Did you go to the airport by metro? W: No. I took a taxi because I was in a hurry.",
    situationChinese: '男士問女子是否搭捷運去機場，女子回答「不，因為我趕時間，所以我搭了計程車」。',
    audioPrompt: 'Did you go to the airport by metro? No. I took a taxi because I was in a hurry.',
    question: 'How did the woman go to the airport?',
    questionChinese: '女子最後是如何前往機場的？',
    options: [
      { text: 'By metro.', chinese: '搭捷運。' },
      { text: 'She took a taxi.', chinese: '她搭乘計程車（took a taxi）。' },
      { text: 'She drove her car.', chinese: '她自己開車。' },
      { text: 'On foot.', chinese: '步行前往。' },
    ],
    correctIndex: 1,
    explanation: '課本第 108 頁聽力第 1 題：女子回答「No. I took a taxi because I was in a hurry.」，故選 took a taxi。',
    keyRule: '交通動詞片語：took a taxi = went there by taxi。',
  },
  // 8. 課本 p.108 聽力言談理解 第 1 題 超市買點心看戲
  {
    id: 'trq_listening_supermarket_scene',
    badge: '🍎 情境地點推論',
    sourcePage: '課本 p.108【Listening 言談理解 第 1 題】',
    category: 'listening_rescue',
    character: '夫妻採買對話',
    characterAvatar: '🛒',
    situation: "W: Dear, how many apples do we need? M: It's sixty dollars for three. Let's get six. We can buy some cookies, too. We can have them when we see a play later.",
    situationChinese: '夫妻在挑選蘋果（三顆六十元，買六顆）和餅乾，準備待會看戲時吃。',
    audioPrompt: 'Where might the woman and the man be? In a supermarket.',
    question: 'Where might the woman and the man be?',
    questionChinese: '男女雙方最可能在哪個場所對話？',
    options: [
      { text: 'In a restaurant.', chinese: '在餐廳裡。' },
      { text: 'In a post office.', chinese: '在郵局裡。' },
      { text: 'In a supermarket.', chinese: '在生鮮超市裡（In a supermarket）。' },
      { text: 'In a hospital.', chinese: '在醫院裡。' },
    ],
    correctIndex: 2,
    explanation: '課本第 108 頁言談理解第 1 題解答為 (C)。正在挑選蘋果顆數並稱重標價買餅乾，最可能在超市（supermarket）。',
    keyRule: '情境推論詞：apples, sixty dollars for three, buy cookies -> supermarket。',
  },
  // 9. 課本 p.93-94 倫敦地鐵 the Tube
  {
    id: 'trq_london_tube_meaning',
    badge: '🚇 倫敦文化常識',
    sourcePage: '課本 p.93-94【Dialogue 對話】',
    category: 'london_dialogue',
    character: 'Yuki 與爸爸',
    characterAvatar: '👧',
    situation: "At London airport, Dad says: 'We can take the train or the Tube.' Yuki asks: 'What is the Tube?'",
    situationChinese: '在倫敦機場，爸爸建議搭火車或 the Tube，Yuki 好奇詢問什麼是 the Tube。',
    audioPrompt: "What's the Tube? It is the metro in London.",
    question: 'In London, what does "the Tube" refer to?',
    questionChinese: '在英國倫敦，「the Tube」是指什麼交通工具？',
    options: [
      { text: 'The London metro / underground system.', chinese: '倫敦的地下鐵 / 捷運系統（the Tube = the underground / the metro）。' },
      { text: 'A long water pipe along the river.', chinese: '沿著河岸的長水管。' },
      { text: 'A London red double-decker bus.', chinese: '倫敦雙層紅公車。' },
      { text: 'A high-speed bullet train.', chinese: '高鐵高速列車。' },
    ],
    correctIndex: 0,
    explanation: '課本第 93 頁對話：Dad: "It\'s the metro in London."。倫敦地鐵因圓形隧道外觀而俗稱為 the Tube。',
    keyRule: '英式英文：the Tube / the underground = 美式 the subway。',
  },
  // 10. 課本 p.94 飯店 101 號房樓層迷思
  {
    id: 'trq_hotel_room_101',
    badge: '🏨 英倫樓層文化救援',
    sourcePage: '課本 p.94【Dialogue 飯店對話】',
    category: 'london_dialogue',
    character: 'Yuki 爸爸與飯店接待員',
    characterAvatar: '🛎️',
    situation: "Dad: Excuse me. Where is Room 101? Clerk: It's on the first floor. Go up the stairs, and it's the first one on the right. Dad: Up? Aren't we on the first floor? Clerk: This is the ground floor, sir.",
    situationChinese: '爸爸在飯店問 101 號房在哪，接待員說在「一樓，請上樓梯」。爸爸納悶不是就在一樓嗎？接待員解釋入街層在英國叫「地面層 ground floor」。',
    audioPrompt: 'This is the ground floor, sir. It is different in the UK.',
    question: 'Why does Dad have to go UP the stairs to get to Room 101 on the "first floor" in London?',
    questionChinese: '在倫敦飯店，為什麼爸爸必須「走樓梯上樓」才能到達位於「first floor」的 101 號房？',
    options: [
      { text: 'Because in the UK, the street entry level is the ground floor, and the floor above is the first floor.', chinese: '因為在英國，入街一樓叫 ground floor，樓上一層才是一樓（first floor）！' },
      { text: 'Because Room 101 is located on the roof.', chinese: '因為 101 號房在屋頂。' },
      { text: 'Because the clerk gave Dad the wrong directions.', chinese: '因為接待員給錯了方向。' },
      { text: 'Because in the UK, they only have basement rooms.', chinese: '因為英國只有地下室客房。' },
    ],
    correctIndex: 0,
    explanation: '課本第 94 頁重點文化：英國的地面層（街道層）稱為 ground floor，往上一層才是 first floor（相當於亞洲或美式的二樓）！',
    keyRule: '英美樓層差異：UK ground floor = US first floor; UK first floor = US second floor。',
  },
  // 11. 課本 p.98 城市地圖：銀行位置介系詞
  {
    id: 'trq_bank_between',
    badge: '📍 方位介系詞救援',
    sourcePage: '課本 p.98【Theme Words 2 城市場所】',
    category: 'location_prep',
    character: '街區地圖指示牌',
    characterAvatar: '🏦',
    situation: 'Look at the city map on page 98. Find the position of the bank between the hotel and the fire station.',
    situationChinese: '根據課本 98 頁地圖，銀行位於飯店與消防局之間。',
    audioPrompt: 'The bank is between the hotel and the fire station.',
    question: 'According to the city map on page 98, which sentence correctly describes the location of the bank?',
    questionChinese: '根據課本第 98 頁城市地圖，哪一句正確描述了銀行的位置？',
    options: [
      { text: 'The bank is between the hotel and the fire station.', chinese: '銀行位於飯店與消防局之間（between A and B）。' },
      { text: 'The bank is on the roof of the hospital.', chinese: '銀行在醫院屋頂上。' },
      { text: 'The bank is inside the green park fountain.', chinese: '銀行在公園噴泉裡面。' },
      { text: 'The bank is under the street.', chinese: '銀行在街道下方。' },
    ],
    correctIndex: 0,
    explanation: '課本第 98 頁範例原句：The bank is between the hotel and the fire station.（銀行在飯店與消防局之間）。',
    keyRule: '介系詞片語：between A and B = 在 A 與 B 之間。',
  },
  // 12. 課本 p.98 城市地圖：郵局位置介系詞
  {
    id: 'trq_post_office_spring',
    badge: '📮 郵局位置介系詞',
    sourcePage: '課本 p.98【Theme Words 2 城市場所】',
    category: 'location_prep',
    character: '路人問路',
    characterAvatar: '✉️',
    situation: 'Someone asks where the post office is on Spring Road.',
    situationChinese: '有人詢問春天路上的郵局位置。',
    audioPrompt: 'The post office is on Spring Road. It is across from the hospital.',
    question: 'Where is the post office according to the textbook description?',
    questionChinese: '根據課本第 98 頁描述，郵局在哪裡？',
    options: [
      { text: 'It is on Spring Road, and it is across from the hospital.', chinese: '它在春天路上，且在綜合醫院的正對面。' },
      { text: 'It is next to the swimming pool in Taitung.', chinese: '在台東游泳池隔壁。' },
      { text: 'It is inside the airport airplane.', chinese: '在機場飛機裡面。' },
      { text: 'It is at the corner of John St and Forest St.', chinese: '在約翰街與森林街轉角。' },
    ],
    correctIndex: 0,
    explanation: '課本第 98 頁原句：The post office is on Spring Road. It is across from the hospital.',
    keyRule: '道路與對面：on + [路名] / across from + [地標]。',
  },
  // 13. 課本 p.98 城市地圖：醫院轉角位置
  {
    id: 'trq_hospital_corner',
    badge: '🏥 醫院轉角方位',
    sourcePage: '課本 p.98【Theme Words 2 城市場所】',
    category: 'location_prep',
    character: '救護車導航員',
    characterAvatar: '🚑',
    situation: 'Navigating to the central hospital on the corner of two streets.',
    situationChinese: '救護車需準確辨識醫院所在的兩條街轉角與鄰近建築。',
    audioPrompt: 'The hospital is on the corner of Spring Road and Sunny Street. It is next to the school.',
    question: 'Where is the hospital located?',
    questionChinese: '綜合醫院位於何處？',
    options: [
      { text: 'On the corner of Spring Road and Sunny Street, next to the school.', chinese: '在春天路與陽光街轉角，學校旁邊。' },
      { text: 'In the middle of the river Thames.', chinese: '在泰晤士河中間。' },
      { text: 'Behind the movie theater across from the airport.', chinese: '在電影院後面，機場對面。' },
      { text: 'On the second floor of the hotel.', chinese: '在飯店二樓。' },
    ],
    correctIndex: 0,
    explanation: '課本第 98 頁原句：The hospital is on the corner of Spring Road and Sunny Street. It is next to the school.',
    keyRule: '轉角與相鄰：on the corner of Road A and Road B / next to + [場所]。',
  },
  // 14. 課本 p.99 句型 2 肯恩去銀行填空
  {
    id: 'trq_ken_bank_grammar',
    badge: '🗣️ 問路句型填空',
    sourcePage: '課本 p.99【Grammar Focus 2 看圖指路】',
    category: 'street_direction',
    character: 'Ken 與 Lily',
    characterAvatar: '🧑',
    situation: 'Ken is asking Lily for directions to the bank on Third Street.',
    situationChinese: '肯恩向莉莉詢問如何前往第三街旁邊的銀行。',
    audioPrompt: 'Ken: How do I get to the bank? Lily: Turn left and walk down Third Street.',
    question: 'Ken: "___ do I get to the bank?" Lily: "Turn ___ and walk down Third Street. It is next to the supermarket."',
    questionChinese: '請選出最符合對話情境的填空字詞：',
    options: [
      { text: 'How / left', chinese: 'How（如何）/ left（左轉）' },
      { text: 'Where / straight', chinese: 'Where / straight' },
      { text: 'What / right', chinese: 'What / right' },
      { text: 'Why / down', chinese: 'Why / down' },
    ],
    correctIndex: 0,
    explanation: '課本第 99 頁第 1 題填空：Ken: "How do I get to the bank?" Lily: "Turn left and walk down Third Street."',
    keyRule: '問路指引動詞：How do I get to... / Turn left/right and walk down/along...',
  },
  // 15. 課本 p.100 句型 2 米雅去警察局填空
  {
    id: 'trq_mia_police_grammar',
    badge: '👮 警察局指路填空',
    sourcePage: '課本 p.100【Grammar Focus 2 看圖指路】',
    category: 'street_direction',
    character: 'Mia 與 Nick',
    characterAvatar: '👧',
    situation: 'Mia is asking Nick how to get to the police station on Second Street.',
    situationChinese: '米雅向尼克問路前往第二街的警察局。',
    audioPrompt: 'Go straight for two blocks and turn left on Second Street.',
    question: 'Mia: "How do I get to the police station?" Nick: "Go straight for ___ blocks and turn ___ on Second Street. Walk along the street, and you can see it on your left."',
    questionChinese: '請選出 Nick 指示方向的正確單字填空：',
    options: [
      { text: 'two / left', chinese: 'two（兩個街區）/ left（左轉）' },
      { text: 'one / right', chinese: 'one / right' },
      { text: 'three / around', chinese: 'three / around' },
      { text: 'four / back', chinese: 'four / back' },
    ],
    correctIndex: 0,
    explanation: '課本第 100 頁第 2 題：Go straight for two blocks and turn left on Second Street.',
    keyRule: '街區量詞：for two blocks = 走兩個街區。',
  },
  // 16. 課本 p.100 句型 2 奧利佛去凱蒂餐廳填空
  {
    id: 'trq_oliver_restaurant_grammar',
    badge: '🍜 餐廳指路填空',
    sourcePage: '課本 p.100【Grammar Focus 2 看圖指路】',
    category: 'street_direction',
    character: 'Oliver 與 Patty',
    characterAvatar: '🧑',
    situation: 'Oliver asks Patty how to get to Kitty’s Restaurant.',
    situationChinese: '奧利佛向佩蒂問路前往凱蒂餐廳。',
    audioPrompt: 'Walk along Fourth Street for one block and turn left at the flower market.',
    question: 'Patty: "Walk along Fourth Street for one block and turn left at the ___. Go down Station Road, and you can see it on your left. It is across from the park."',
    questionChinese: '佩蒂指示奧利佛在何處左轉？',
    options: [
      { text: 'flower market', chinese: 'flower market（花卉市場）' },
      { text: 'train station', chinese: '火車站' },
      { text: 'movie theater', chinese: '電影院' },
      { text: 'airport', chinese: '機場' },
    ],
    correctIndex: 0,
    explanation: '課本第 100 頁第 3 題：turn left at the flower market. Go down Station Road...',
    keyRule: '地標轉彎：turn left/right at + [特定地標]。',
  },
  // 17. 課本 p.105 閱讀測驗主旨題
  {
    id: 'trq_london_reading_main_idea',
    badge: '📖 課文主旨推論',
    sourcePage: '課本 p.105【After You Read 第 A 題】',
    category: 'london_dialogue',
    character: 'Yuki Kato 倫敦日記',
    characterAvatar: '🇬🇧',
    situation: "Yuki wrote about their second day in London: Hyde Park, Big Ben, Shakespeare's Globe, and boat ride on River Thames.",
    situationChinese: 'Yuki 在文章中記錄了加藤一家倫敦第二天的豐富行程。',
    audioPrompt: 'What is the main idea? The Katos visited many places and saw a play in London.',
    question: 'What is the main idea of the reading "A Fun Day in London"?',
    questionChinese: '課文閱讀「A Fun Day in London（倫敦充實的一天）」的主旨是什麼？',
    options: [
      { text: 'The Katos had a long walk to Shakespeare’s Globe.', chinese: '加藤一家走了很長的路去環球劇場。' },
      { text: 'The Katos visited many places and saw a play in London.', chinese: '加藤一家在倫敦參觀了許多景點並觀賞了一齣戲劇。（正確主旨！）' },
      { text: 'The Katos were happy to see William Shakespeare’s work only.', chinese: '加藤一家僅僅開心看莎翁作品。' },
      { text: 'The Katos stayed in their hotel all day.', chinese: '加藤一家整天待在飯店。' },
    ],
    correctIndex: 1,
    explanation: '課本第 105 頁 After You Read 題目第 A 題解答為 (B)。文章描繪他們參觀海德公園、大笨鐘、環球劇場看戲與泰晤士河遊船。',
    keyRule: '主旨推論：全文概括（visited many places and saw a play in London）。',
  },
  // 18. 課本 p.105 閱讀地點配對：泰晤士河遊船
  {
    id: 'trq_thames_tea_boat',
    badge: '🚢 景點活動配對',
    sourcePage: '課本 p.105【After You Read 第 B 題】',
    category: 'london_dialogue',
    character: 'Yuki Kato',
    characterAvatar: '☕',
    situation: "Finally, we went on a boat ride on the River Thames and enjoyed afternoon tea on the boat. What a wonderful day!",
    situationChinese: '最後我們在泰晤士河搭船遊河，並在船上享用下午茶，真是美好的一天！',
    audioPrompt: 'The Katos had afternoon tea on a boat on the River Thames.',
    question: 'Where did the Katos have afternoon tea on a boat?',
    questionChinese: '加藤一家在哪裡搭船並享用下午茶？',
    options: [
      { text: 'On the River Thames', chinese: '在泰晤士河上（River Thames）' },
      { text: 'In Hyde Park', chinese: '在海德公園' },
      { text: 'At Big Ben', chinese: '在大笨鐘' },
      { text: 'At The May Fair Hotel', chinese: '在梅菲爾飯店' },
    ],
    correctIndex: 0,
    explanation: '課本第 105 頁第 B 題配對：(D) River Thames 相符敘述為「The Katos had afternoon tea on a boat.」。',
    keyRule: '專有名詞記憶：River Thames（泰晤士河）、boat ride（遊船）。',
  },
  // 19. 課本 p.95 Brad 的台東之旅交通工具順序
  {
    id: 'trq_brad_taitung_sequence',
    badge: '🛵 交通工具使用順序',
    sourcePage: '課本 p.95【Theme Words 1 聽寫練習】',
    category: 'transit_verbs',
    character: 'Brad 的台東行',
    characterAvatar: '🍕',
    situation: "Brad visited Thomas in Taitung. Brad didn't take a train; he drove his car to Thomas's house. Then Thomas took him to a nice pizza shop by scooter. After lunch, they went to a beach by bike.",
    situationChinese: 'Brad 開車去台東找 Thomas，Thomas 騎機車載他去比薩店，吃完午餐後兩人騎單車去海灘。',
    audioPrompt: 'Brad drove his car, then went by scooter, and finally went to the beach by bike.',
    question: 'In what order did Brad use the vehicles in Taitung according to the story?',
    questionChinese: '根據課本故事，Brad 在台東依序使用了哪三種交通工具？',
    options: [
      { text: 'car -> scooter -> bike', chinese: '開車（car）-> 機車（scooter）-> 單車（bike）' },
      { text: 'train -> bus -> taxi', chinese: '火車 -> 公車 -> 計程車' },
      { text: 'bike -> car -> ship', chinese: '單車 -> 開車 -> 輪船' },
      { text: 'plane -> metro -> walk', chinese: '飛機 -> 捷運 -> 步行' },
    ],
    correctIndex: 0,
    explanation: '課本第 95 頁聽力與故事原文依序為：drove his car (1) -> by scooter (2) -> by bike (3)。答案為 car, scooter, bike。',
    keyRule: '交通動詞搭配：drove his car / by scooter / by bike。',
  },
  // 20. 課本 p.96-97 搭乘動詞與介系詞替換
  {
    id: 'trq_transport_verb_convert',
    badge: '🔄 動詞片語替換救援',
    sourcePage: '課本 p.97【Grammar Focus 1 說寫練習】',
    category: 'transit_verbs',
    character: '宋先生上班',
    characterAvatar: '👔',
    situation: "Mr. Song took a bus to work.",
    situationChinese: '「宋先生搭公車去上班。」請將此句轉換為介系詞 by 的句型。',
    audioPrompt: 'Mr. Song took a bus to work. He went to work by bus.',
    question: '"Mr. Song took a bus to work." Which sentence has the same meaning?',
    questionChinese: '下列哪一句與原句意思完全相同且文法正確？',
    options: [
      { text: 'Mr. Song went to work by bus.', chinese: '宋先生搭公車去上班（by bus 介系詞後面不加冠詞 a/the）。' },
      { text: 'Mr. Song went to work by a bus.', chinese: '（錯誤：by + 交通工具不能加 a）' },
      { text: 'Mr. Song rode a bus to work by foot.', chinese: '（錯誤句型）' },
      { text: 'Mr. Song drove bus to work.', chinese: '（錯誤句型）' },
    ],
    correctIndex: 0,
    explanation: '課本第 97 頁文法焦點：took a bus = went by bus。注意：by 後方直接接交通工具單數名詞，不加 a、an 或 the！',
    keyRule: '重要大考規則：take a bus = go by bus；ride a bike = go by bike。',
  },
  // 21. 課本 p.94 & p.96 徒步前往的正確英文
  {
    id: 'trq_on_foot_rule',
    badge: '🚶 步行重要常考陷阱',
    sourcePage: '課本 p.94 & p.96【文法焦點】',
    category: 'transit_verbs',
    character: 'Yuki 爸爸提議去野餐',
    characterAvatar: '🧺',
    situation: "Dad: 'Let's go picnicking at Green Park. We can go there ___.'",
    situationChinese: '爸爸提議：「我們去綠色公園野餐吧。我們可以走路去那裡。」',
    audioPrompt: 'We can go there on foot.',
    question: 'How should Dad correctly say "going to the park walking"?',
    questionChinese: '表示「徒步前往」在英文中正確的介系詞片語是？',
    options: [
      { text: 'on foot', chinese: 'on foot（正確！步行專用固定介系詞片語）' },
      { text: 'by foot', chinese: 'by foot（嚴重錯誤！英文沒有 by foot 的說法！）' },
      { text: 'with foot', chinese: 'with foot（錯誤）' },
      { text: 'in foot', chinese: 'in foot（錯誤）' },
    ],
    correctIndex: 0,
    explanation: '課本第 94 頁與第 96 頁重點：「步行」只能用 on foot 或動詞 walk，絕對不能說 by foot！這是全台灣國中段考必考經典陷阱！',
    keyRule: '黃金規則：步行 = on foot 或 walk，絕無 by foot！',
  },
  // 22. 課本 p.22 英美用字大對決：炸薯條
  {
    id: 'trq_us_uk_fries_chips',
    badge: '🍟 英美文化詞彙對決',
    sourcePage: '課本 p.112【Extension 觀察英美用字不同】',
    category: 'london_dialogue',
    character: '英國導遊 Emma',
    characterAvatar: '🇬🇧',
    situation: "You want to order french fries in a London pub or restaurant.",
    situationChinese: '你在倫敦餐廳想點美式英文所說的「fries（炸薯條）」。',
    audioPrompt: 'In the U.S., people say fries. In the U.K., people say chips.',
    question: 'In the UK, what is the word for American "fries"?',
    questionChinese: '在英國，美式英文的「fries（炸薯條）」通常稱作什麼？',
    options: [
      { text: 'chips', chinese: 'chips（英式炸薯條，如 fish and chips）' },
      { text: 'biscuits', chinese: 'biscuits（英式指餅乾 cookies）' },
      { text: 'sweets', chinese: 'sweets（英式指糖果 candy）' },
      { text: 'rubbers', chinese: 'rubbers（英式指橡皮擦 erasers）' },
    ],
    correctIndex: 0,
    explanation: '課本第 112 頁 Word Power 對照表：美式 fries = 英式 chips；美式 cookies = 英式 biscuits；美式 eraser = 英式 rubber。',
    keyRule: '英美字彙對照：US fries = UK chips；US cookies = UK biscuits；US subway = UK underground / the Tube。',
  },
];

export function getRandomTextbookRescueQuestion(excludeId?: string): TextbookRescueQuestion {
  const filtered = excludeId ? TEXTBOOK_RESCUE_QUESTIONS.filter(q => q.id !== excludeId) : TEXTBOOK_RESCUE_QUESTIONS;
  const pool = filtered.length > 0 ? filtered : TEXTBOOK_RESCUE_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomRescueQuizSet(count = 5): TextbookRescueQuestion[] {
  const shuffled = [...TEXTBOOK_RESCUE_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}


// 交通替換動詞動態生成器
export interface TransitDrill {
  id: string;
  question: string;
  questionChinese: string;
  givenPhrase: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  difficulty: 'easy' | 'normal' | 'hard';
}

const SUBJECT_POOL = [
  { en: 'they', cn: '他們', verbTook: 'took', verbRode: 'rode', verbDrove: 'drove', verbWalked: 'walked', verbWalk: 'walk' },
  { en: 'she', cn: '她', verbTook: 'took', verbRode: 'rode', verbDrove: 'drove', verbWalked: 'walked', verbWalk: 'walks' },
  { en: 'Mr. Song', cn: '宋先生', verbTook: 'took', verbRode: 'rode', verbDrove: 'drove', verbWalked: 'walked', verbWalk: 'walks' },
  { en: 'Johnny', cn: '強尼', verbTook: 'took', verbRode: 'rode', verbDrove: 'drove', verbWalked: 'walked', verbWalk: 'walks' },
  { en: 'the students', cn: '學生們', verbTook: 'took', verbRode: 'rode', verbDrove: 'drove', verbWalked: 'walked', verbWalk: 'walk' },
  { en: 'my brother', cn: '我哥哥', verbTook: 'took', verbRode: 'rode', verbDrove: 'drove', verbWalked: 'walked', verbWalk: 'walks' },
];

const PLACE_POOL = [
  { en: 'the museum', cn: '博物館' },
  { en: 'the library', cn: '圖書館' },
  { en: 'the May Fair Hotel', cn: '梅菲爾飯店' },
  { en: 'the bank', cn: '銀行' },
  { en: 'the park', cn: '公園' },
  { en: 'work', cn: '上班地點' },
  { en: 'school', cn: '學校' },
];

const TRANSPORT_RULES = [
  {
    given: 'by taxi',
    correct: 'took a taxi',
    distractors: ['drove a taxi', 'by foot', 'walked a taxi', 'rode taxi'],
    tip: '搭計程車使用 took a taxi，不能說 drove a taxi（除非是司機）！',
  },
  {
    given: 'on foot',
    correct: 'walked',
    distractors: ['by foot', 'rode a foot', 'took foot', 'on the foot'],
    tip: '【大考重點】走路只能說 on foot 或 walked，絕不能說 by foot！',
  },
  {
    given: 'by metro',
    correct: 'took the metro',
    distractors: ['rode the metro', 'by the metro', 'flew the metro', 'drove the metro'],
    tip: '搭捷運說 took the metro，介系詞用 by metro（by後面不加the）。',
  },
  {
    given: 'by bike',
    correct: 'rode a bike',
    distractors: ['drove a bike', 'took bike', 'by foot', 'walked a bike'],
    tip: '騎自行車或機車要使用動詞 rode a bike / ride a bike！',
  },
  {
    given: 'by bus',
    correct: 'took a bus',
    distractors: ['drove a bus', 'by foot', 'rode bus', 'walked a bus'],
    tip: '搭乘公車為 took a bus 或 ride a bus，對應 by bus。',
  },
  {
    given: 'by train',
    correct: 'took a train',
    distractors: ['drove a train', 'flew a train', 'by the train', 'walked a train'],
    tip: '搭火車使用 took a train，介系詞用 by train。',
  },
  {
    given: 'by car',
    correct: 'drove a car',
    distractors: ['rode a car', 'took a car', 'by the car', 'walked a car'],
    tip: '開車前往使用 drove a car，介系詞用 by car。',
  },
];

export function generateRandomTransitDrill(index = 1): TransitDrill {
  const subj = SUBJECT_POOL[Math.floor(Math.random() * SUBJECT_POOL.length)];
  const place = PLACE_POOL[Math.floor(Math.random() * PLACE_POOL.length)];
  const rule = TRANSPORT_RULES[Math.floor(Math.random() * TRANSPORT_RULES.length)];

  const question = `How did ${subj.en} go to ${place.en}?`;
  const questionChinese = `${subj.cn}如何前往${place.cn}？`;

  return {
    id: `td_dyn_${Date.now()}_${index}`,
    question,
    questionChinese,
    givenPhrase: rule.given,
    correctAnswer: rule.correct,
    options: [rule.correct, ...rule.distractors.slice(0, 3)].sort(() => Math.random() - 0.5),
    explanation: rule.tip,
    difficulty: 'normal',
  };
}

// 隨機測驗題目池
export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  sceneLabel?: string;
  sceneEmoji?: string;
  englishAudio?: string;
}

const QUIZ_BANK: QuizQuestion[] = [
  {
    q: '在英國倫敦，人們常將地下鐵稱為什麼？',
    options: ['The Subway', 'The Tube / The Underground', 'The Train', 'The Tram'],
    correct: 1,
    explanation: '英國倫敦的地下鐵俗稱為「the Tube」或「the Underground」，而美國則稱 subway。',
    sceneLabel: 'Green Park Station (Piccadilly Road) Entrance',
    sceneEmoji: '🚇',
    englishAudio: 'Let us take the Tube to Green Park Station.',
  },
  {
    q: '下列哪一句表達「步行去學校」的英文完全正確？',
    options: [
      'She went to school by foot.',
      'She went to school on foot.',
      'She went to school by a foot.',
      'She took a foot to school.',
    ],
    correct: 1,
    explanation: '步行在英文中是 on foot 或直接使用 walk，絕不可說 by foot！',
    sceneLabel: 'Second Street Pedestrian Walkway',
    sceneEmoji: '🚶‍♂️',
    englishAudio: 'She went to school on foot.',
  },
  {
    q: '在倫敦飯店中，地面入口街道層通常標示為什麼？',
    options: ['The 1st floor', 'The Ground floor', 'The 2nd floor', 'The Basement floor'],
    correct: 1,
    explanation: '在英國，與街道齊平的地面樓層為 Ground floor，往上一層才是 First floor！',
    sceneLabel: 'The May Fair Hotel Front Desk',
    sceneEmoji: '🏨',
    englishAudio: 'The reception desk is on the ground floor.',
  },
  {
    q: '美式英文中的「fries（炸薯條）」，在英式英文中稱為什麼？',
    options: ['chips', 'biscuits', 'rubber', 'sweets'],
    correct: 0,
    explanation: '英國將炸薯條稱為 chips（如知名的炸魚薯條 fish and chips）。',
    sceneLabel: 'Station Road Bistro Counter',
    sceneEmoji: '🍟',
    englishAudio: 'I ordered a burger with fries.',
  },
  {
    q: '美式英文中的「cookies（餅乾）」，在英式英文日常中常稱作？',
    options: ['biscuits', 'candies', 'telly', 'chips'],
    correct: 0,
    explanation: '英式英文稱餅乾為 biscuits，下午茶時常說 tea and biscuits。',
    sceneLabel: 'London Afternoon Tea Cafe',
    sceneEmoji: '🍪',
    englishAudio: 'We bought some chocolate cookies.',
  },
  {
    q: '若想將 "They went to the museum by taxi." 改寫為動詞片語：',
    options: [
      'They took a taxi to the museum.',
      'They rode a taxi to the museum.',
      'They drove a taxi to the museum.',
      'They walked a taxi to the museum.',
    ],
    correct: 0,
    explanation: '乘客搭乘計程車使用 took a taxi，drive a taxi 是計程車司機才會用的說法喔！',
    sceneLabel: 'Berkeley Street Taxi Stand',
    sceneEmoji: '🚕',
    englishAudio: 'They took a taxi to the museum.',
  },
  {
    q: '在路上向陌生人問路，最具禮貌的英文開場白是？',
    options: [
      'Hey you! Where is the park?',
      'Excuse me. How do I get to the park?',
      'Tell me the way to the park now.',
      'I want the park.',
    ],
    correct: 1,
    explanation: '在英語文化中，開頭使用「Excuse me」並搭配「How do I get to...?」是禮貌問路的基本常識。',
    sceneLabel: 'Piccadilly Road Crosswalk',
    sceneEmoji: '🙋‍♂️',
    englishAudio: 'Excuse me. How do I get to the park?',
  },
  {
    q: '英式英文中的「rubber」，在美式英文學校文具中指的是？',
    options: ['eraser（橡皮擦）', 'pencil（鉛筆）', 'ruler（尺）', 'glue（膠水）'],
    correct: 0,
    explanation: '英國稱橡皮擦為 rubber，在美國則使用 eraser。',
    sceneLabel: 'April High School Classroom',
    sceneEmoji: '✏️',
    englishAudio: 'Can I borrow your eraser?',
  },
  {
    q: '在英國搭乘飯店電梯時，按鈕與標示常看到的字是？',
    options: ['lift', 'escalator', 'tube', 'pavement'],
    correct: 0,
    explanation: '美式英文稱電梯為 elevator，英式英文則稱作 lift！',
    sceneLabel: 'The May Fair Hotel Elevator',
    sceneEmoji: '🛗',
    englishAudio: 'Take the elevator to the second floor.',
  },
  {
    q: '「City Bank 在 The May Fair Hotel 和 Fire Station 之間。」下列何者正確？',
    options: [
      'City Bank is across from The May Fair Hotel and Fire Station.',
      'City Bank is between The May Fair Hotel and Fire Station.',
      'City Bank is next to The May Fair Hotel and Fire Station.',
      'City Bank is on the corner of The May Fair Hotel.',
    ],
    correct: 1,
    explanation: '表示「在 A 與 B 兩者之間」固定使用「between A and B」。',
    sceneLabel: 'Stratton Street City Block',
    sceneEmoji: '🏦',
    englishAudio: 'City Bank is between The May Fair Hotel and Fire Station.',
  },
  {
    q: '若餐廳剛好位在 Second Street 與 Station Road 兩條馬路的交叉路口轉角，英文該怎麼說？',
    options: [
      'on the corner of Second Street and Station Road',
      'between Second Street and Station Road',
      'across from Second Street',
      'in the corner at Station Road',
    ],
    correct: 0,
    explanation: '表示「在兩條路的轉角處」，介系詞固定用「on the corner of A and B」。',
    sceneLabel: 'Second Street & Station Road Junction',
    sceneEmoji: '🍜',
    englishAudio: "Kitty's Restaurant is on the corner of Second Street and Station Road.",
  },
  {
    q: '「我每天騎腳踏車去公園，偶爾也搭公車。」空格應填入：I ___ a bike to the park, and sometimes I ___ a bus.',
    options: ['drive / ride', 'ride / take', 'take / drive', 'ride / drive'],
    correct: 1,
    explanation: '跨坐騎乘（腳踏車／機車）用 ride；搭乘大眾運輸（公車／火車／捷運）用 take。',
    sceneLabel: 'Green Park Bike Dock',
    sceneEmoji: '🚲',
    englishAudio: 'I ride a bike to the park, and sometimes I take a bus.',
  },
  {
    q: '下列哪個句子完全符合「by + 交通工具」的正確文法規則？',
    options: [
      'Leo went to the museum by a metro.',
      'Leo went to the museum by the bus.',
      'Leo went to the museum by train.',
      'Leo went to the museum by trains.',
    ],
    correct: 2,
    explanation: '「by + 交通工具」中間不可加冠詞 (a/an/the)，且名詞必須用單數（如 by train, by bus, by bike）。',
    sceneLabel: 'Metro Transit Plaza',
    sceneEmoji: '🚆',
    englishAudio: 'Leo went to the museum by train.',
  },
  {
    q: '指路時想表達「沿著這條路直走兩個街區」，最自然的英文是？',
    options: [
      'Go straight down this road for two blocks.',
      'Turn straight at two blocks.',
      'Walk between two blocks.',
      'Cross two blocks on the corner.',
    ],
    correct: 0,
    explanation: '「直走一段距離／幾個街區」常搭配介系詞 for：Go straight for two blocks。',
    sceneLabel: 'Berkeley Street Avenue',
    sceneEmoji: '🧭',
    englishAudio: 'Go straight down this road for two blocks.',
  },
  {
    q: '在美式英文裡稱作「sidewalk（人行道）」，在英國倫敦通常叫什麼？',
    options: ['pavement', 'highway', 'crosswalk', 'block'],
    correct: 0,
    explanation: '美式說 sidewalk，英式說 pavement；行人過馬路要走在斑馬線上最安全！',
    sceneLabel: 'Berkeley Street Sidewalk',
    sceneEmoji: '🛣️',
    englishAudio: 'Please stay on the sidewalk when walking.',
  },
  {
    q: '在「Birthday Party 閱讀文章」中，為什麼邀請信特別提醒大家不要開車前往 River Water Restaurant？',
    options: [
      'Because there is no parking lot near the restaurant.',
      'Because cars cannot turn left on Red Sun Street.',
      'Because the restaurant is inside a park.',
      'Because Bus 711 blocks the road.',
    ],
    correct: 0,
    explanation: '課本第 110 頁附註寫著：*There is no parking lot near the restaurant, so please do not drive there.（附近沒有停車場，請勿開車前往。）',
    sceneLabel: 'River Water Restaurant Notice',
    sceneEmoji: '🎂',
    englishAudio: 'There is no parking lot near the restaurant.',
  },
  {
    q: '在英國倫敦街頭聽到別人說 "Let\'s wait in the queue!"，這裡的 queue 在美式英文是指？',
    options: ['line（排隊隊伍）', 'bus（公車）', 'park（公園）', 'hotel（飯店）'],
    correct: 0,
    explanation: '英國人習慣用 queue 表示排隊（wait in a queue），美式英文則是 wait in line。',
    sceneLabel: 'Bus 711 Stop Queue',
    sceneEmoji: '🚏',
    englishAudio: 'Please wait in line at the bus stop.',
  },
  {
    q: '若想表達「在四月高中站下車並走到對面」，英文應使用哪個片語？',
    options: [
      'get on at April High School',
      'get off at April High School',
      'turn off at April High School',
      'drive off at April High School',
    ],
    correct: 1,
    explanation: '「在某站下車」使用 get off at [站名]；「上車」則是 get on。',
    sceneLabel: 'April High School Bus Stop',
    sceneEmoji: '🚌',
    englishAudio: 'Get off at April High School and walk across the street.',
  },
  {
    q: '美式英文的「candy（糖果）」與「TV（電視）」，在英國日常口語中分別常稱為？',
    options: [
      'chips / rubber',
      'sweets / telly',
      'biscuits / tube',
      'football / lift',
    ],
    correct: 1,
    explanation: '英式英文稱糖果為 sweets、電視為 telly（源自 television 的口語縮寫）。',
    sceneLabel: 'London Corner Shop',
    sceneEmoji: '🍬',
    englishAudio: 'Kids love eating candy after school.',
  },
  {
    q: '當朋友幫你仔細指完路並確認你在 Supermarket 對面就能看到銀行時，最有禮貌的回覆是？',
    options: [
      'Wait, why is it across from the Supermarket?',
      'Got it! Thank you so much for your help!',
      'Okay, go away now.',
      'Tell me again faster!',
    ],
    correct: 1,
    explanation: '收到指路後用 "Got it! Thank you so much for your help!" 回覆，既禮貌又能讓對方感到開心！',
    sceneLabel: 'Supermarket Street Corner',
    sceneEmoji: '🏪',
    englishAudio: 'Got it! Thank you so much for your help!',
  },
];

export function getRandomQuizSet(count = 8): QuizQuestion[] {
  const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 社交問路情境（多情境＋多輪來回問答）
export interface DialogueOption {
  text: string;
  chinese: string;
  isPolite: boolean;
  affinityDelta: number;
  npcResponse: string;
  npcResponseChinese: string;
  feedback: string;
}

export interface DialogueTurn {
  id: string;
  promptEn: string;
  promptChinese: string;
  options: DialogueOption[];
}

export interface CLTNpcScenario {
  id: string;
  shortTitle: string;
  npcName: string;
  npcAvatarEmoji: string;
  situation: string;
  situationChinese: string;
  targetPlace: string;
  rewardBlueprintId: string;
  turns: DialogueTurn[];
}

export const CLT_SCENARIOS: CLTNpcScenario[] = [
  {
    id: 'clt_police_hotel',
    shortTitle: '警官問路',
    npcName: 'Officer Higgins',
    npcAvatarEmoji: '👮‍♂️',
    situation: 'You just got off at Green Park Station and need to reach The May Fair Hotel.',
    situationChinese: '你剛在 Green Park Station 下車，需要向巡邏警官問路前往 The May Fair Hotel。',
    targetPlace: 'The May Fair Hotel',
    rewardBlueprintId: 'bp_phone_booth',
    turns: [
      {
        id: 't1',
        promptEn: 'Good afternoon! You look like you are looking for somewhere. May I help you?',
        promptChinese: '午安！你看起來在找地方，需要幫忙嗎？',
        options: [
          {
            text: 'Excuse me, officer. Could you tell us how to get to The May Fair Hotel?',
            chinese: '不好意思，警官。請問您可以告訴我們怎麼去 The May Fair Hotel 嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Of course! Go straight along Berkeley Street for two blocks, and turn left on Stratton Street.',
            npcResponseChinese: '當然！沿著 Berkeley Street 直走兩個街區，然後在 Stratton Street 左轉。',
            feedback: '用 "Excuse me, officer." 開頭既親切又有禮貌！',
          },
          {
            text: 'Hey! Tell me where the hotel is right now.',
            chinese: '喂！現在立刻告訴我飯店在哪裡。',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Whoa, slow down a bit. Asking politely makes everyone happy to help.',
            npcResponseChinese: '哇，語氣慢一點喔。有禮貌地開口詢問，大家都會很樂意幫忙。',
            feedback: '對陌生人直接用 "Hey! Tell me..." 會顯得太命令、不夠禮貌喔！',
          },
          {
            text: 'Hotel. I want hotel now.',
            chinese: '飯店，我現在要飯店。',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'You can start with "Excuse me, how do I get to The May Fair Hotel?"',
            npcResponseChinese: '試著加上完整禮貌問句：「Excuse me, how do I get to...」會更清楚喔！',
            feedback: '試著使用完整的問路句型，對方才能立刻幫上忙。',
          },
        ],
      },
      {
        id: 't2',
        promptEn: 'Walk two blocks along Berkeley Street, then turn left on Stratton Street.',
        promptChinese: '沿著 Berkeley Street 走兩個街區，然後在 Stratton Street 左轉。',
        options: [
          {
            text: 'Got it! Walk two blocks north and turn left on Stratton Street, right?',
            chinese: '瞭解！向北走兩個街區後在 Stratton Street 左轉，對嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Yes, that's right! You're a quick learner.",
            npcResponseChinese: '沒錯，完全正確！你記路線真快。',
            feedback: '重複確認轉彎街名與方向，能避免走錯路！',
          },
          {
            text: 'Too many street names! Just point with your finger.',
            chinese: '路名太多了！用手指一指就好。',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: "It's always good to remember the street names so you don't get lost again.",
            npcResponseChinese: '記住路名才不會等一下又迷路喔。',
            feedback: '回應指引時可以先說 "Got it!" 或複誦確認路名。',
          },
        ],
      },
      {
        id: 't3',
        promptEn: 'Once you turn onto Stratton Street, keep walking for one block.',
        promptChinese: '轉進 Stratton Street 後，再繼續往前走一個街區。',
        options: [
          {
            text: 'Thank you! Is The May Fair Hotel across from the Supermarket?',
            chinese: '謝謝您！請問 The May Fair Hotel 是在 Supermarket 對面嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Yes! It's on your right, right across from the Supermarket. You can't miss it.",
            npcResponseChinese: '是的！就在你的右邊、Supermarket 的正對面，非常明顯。',
            feedback: '善用 "across from" 詢問對面地標是非常道地的問法！',
          },
          {
            text: 'Is it near food? I am hungry.',
            chinese: '附近有吃的嗎？我餓了。',
            isPolite: false,
            affinityDelta: -5,
            npcResponse: "There's a Supermarket right across from the hotel! Let's double check the hotel landmark first.",
            npcResponseChinese: '飯店對面就有 Supermarket 喔！我們先確認飯店的位置吧。',
            feedback: '先用方位詞（across from / next to）確認目的地地標會更精準。',
          },
        ],
      },
      {
        id: 't4',
        promptEn: "You'll see The May Fair Hotel right across from the Supermarket.",
        promptChinese: '你會在 Supermarket 對面看到 The May Fair Hotel。',
        options: [
          {
            text: 'Thank you so much for your help! Have a great day!',
            chinese: '非常感謝您的幫忙！祝您有美好的一天！',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "You're very welcome! Enjoy your stay in the city!",
            npcResponseChinese: '不客氣！祝你在城市裡玩得愉快！',
            feedback: '完美道謝與道別，贏得滿分好感！',
          },
          {
            text: 'Okay, I am leaving now.',
            chinese: '好，我現在要走了。',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'Oh, remember to say "Thank you" before you go!',
            npcResponseChinese: '記得跟幫忙你的人說聲「Thank you」喔！',
            feedback: '問完路記得向熱心指路的人表達感謝！',
          },
        ],
      },
    ],
  },
  {
    id: 'clt_hotel_floor',
    shortTitle: '飯店樓層',
    npcName: 'Receptionist Arthur',
    npcAvatarEmoji: '🛎️',
    situation: 'You arrive at The May Fair Hotel and want to find Room 101, but the elevator buttons say G and 1.',
    situationChinese: '你們抵達 The May Fair Hotel 想找 101 號房，但電梯按鈕標示著 G 與 1。',
    targetPlace: 'Room 101',
    rewardBlueprintId: 'bp_mayfair',
    turns: [
      {
        id: 't1',
        promptEn: 'Welcome to The May Fair Hotel! How may I help you today?',
        promptChinese: '歡迎來到 The May Fair Hotel！請問今天有什麼可以為您服務？',
        options: [
          {
            text: 'Excuse me. Could you tell me where Room 101 is, please?',
            chinese: '不好意思，請問 101 號房在哪裡呢？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Certainly! Room 101 is on the first floor, just one floor up from here.',
            npcResponseChinese: '沒問題！101 號房在英國的一樓（first floor），從這裡往上一層就是。',
            feedback: '加上 "please" 與 "Could you..." 顯得非常優雅有禮！',
          },
          {
            text: 'Give me the key to Room 101 right now!',
            chinese: '現在把 101 號房的鑰匙給我！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'I am happy to help, sir, if you could ask politely.',
            npcResponseChinese: '只要您有禮貌地詢問，我很樂意協助您。',
            feedback: '在櫃檯服務人員面前保持禮貌語氣能讓互動更順利！',
          },
        ],
      },
      {
        id: 't2',
        promptEn: 'Room 101 is on the first floor—one level above us.',
        promptChinese: '101 號房在「英國的一樓」，也就是我們樓上一層。',
        options: [
          {
            text: 'Oh! So this lobby level is the ground floor, and Room 101 is upstairs?',
            chinese: '喔！所以這個大廳是 ground floor（地面層），101 號房在樓上嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Exactly! In the UK, the street level is called the ground floor.',
            npcResponseChinese: '完全正確！在英國，與街道同高的樓層稱為 ground floor。',
            feedback: '你成功搞懂了課本重點「ground floor vs. first floor」的差異！',
          },
          {
            text: "No! We're already on the first floor! Your sign is wrong!",
            chinese: '不對！我們不就已經在一樓了嗎？你們標示錯了！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Actually, British buildings start counting floors above the ground floor.',
            npcResponseChinese: '其實英國建築是從地面層以上才開始算 first floor 的喔。',
            feedback: '記得以開放好奇的態度確認文化差異，而非指責對方錯了喔！',
          },
        ],
      },
      {
        id: 't3',
        promptEn: 'You can take the stairs or the lift up to the first floor.',
        promptChinese: '您可以走樓梯或搭電梯（lift）上去一樓。',
        options: [
          {
            text: 'We have heavy bags. Could you show us where the elevator is?',
            chinese: '我們行李比較重，請問可以告訴我們電梯在哪裡嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Right this way! The lift is next to the lounge, on your right.',
            npcResponseChinese: '請往這邊走！電梯（lift）就在休息廳旁邊、您的右手邊。',
            feedback: '禮貌說明原因再請對方指引，非常自然！',
          },
          {
            text: 'Where is the machine? Hurry up!',
            chinese: '那個機器在哪裡？快一點！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Do you mean the elevator? Please ask nicely and I will show you.',
            npcResponseChinese: '您是指電梯嗎？請客氣一點詢問，我會立即為您指路。',
            feedback: '用 "Could you show us where... is?" 取代催促會更好！',
          },
        ],
      },
      {
        id: 't4',
        promptEn: 'Go up one floor, and Room 101 is the first room on your right.',
        promptChinese: '上去一層後，101 號房就是右手邊第一間。',
        options: [
          {
            text: 'Thank you very much! We really appreciate your help.',
            chinese: '非常謝謝您！真的很感謝您的協助。',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'My pleasure! Have a wonderful stay at The May Fair Hotel!',
            npcResponseChinese: '我的榮幸！祝您入住 The May Fair Hotel 愉快！',
            feedback: '真誠的道謝讓這段飯店對話畫下完美句點！',
          },
          {
            text: 'Okay, whatever.',
            chinese: '好啦，隨便。',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'Well, let us know if you need anything else.',
            npcResponseChinese: '呃，如果還有需要隨時告訴我們。',
            feedback: '聽到明確指引後，別忘了說聲 "Thank you!"。',
          },
        ],
      },
    ],
  },
  {
    id: 'clt_park_transit',
    shortTitle: '公園步行',
    npcName: 'Clara',
    npcAvatarEmoji: '🎒',
    situation: 'You want to have a picnic at Green Park and meet local student Clara at a bus stop.',
    situationChinese: '你想去 Green Park 野餐，在公車站旁遇見當地大學生 Clara。',
    targetPlace: 'Green Park',
    rewardBlueprintId: 'bp_fountain',
    turns: [
      {
        id: 't1',
        promptEn: 'Hi there! Waiting for the bus?',
        promptChinese: '嗨！你在等公車嗎？',
        options: [
          {
            text: 'Excuse me. Do you know if we can go to Green Park on foot?',
            chinese: '不好意思，請問我們可以步行去 Green Park 嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Yes, for sure! It is only about a ten-minute walk down Piccadilly Road.',
            npcResponseChinese: '當然可以！沿著 Piccadilly Road 走過去大概只要十分鐘。',
            feedback: '「步行」用對了 "on foot"，問句也非常親切有禮！',
          },
          {
            text: 'Hey you, can we go to Green Park by foot?',
            chinese: '喂，我們可以 by foot 去 Green Park 嗎？',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Um, a small tip: we say "on foot", never "by foot"! Also, "Excuse me" is nicer.',
            npcResponseChinese: '呃，小提醒：英文說「on foot」，不能說 by foot 喔！而且先說 Excuse me 會更友善。',
            feedback: '注意兩大陷阱：不能說 "Hey you"，也不能說 "by foot"（必須用 on foot）！',
          },
        ],
      },
      {
        id: 't2',
        promptEn: 'Just walk west along Piccadilly Road for ten minutes.',
        promptChinese: '只要沿著 Piccadilly Road 往西步行十分鐘就會到了。',
        options: [
          {
            text: 'Thank you! Is the park entrance on the left or on the right?',
            chinese: '謝謝妳！請問公園入口是在左邊還是右邊呢？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "It's on your right, right next to the Flower Market!",
            npcResponseChinese: '在你的右手邊，就在 Flower Market 旁邊！',
            feedback: '問清楚左右邊（on the left / on the right）超實用！',
          },
          {
            text: 'Speak faster! Which side?',
            chinese: '講快一點！哪一邊？',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: "Wait, there's no rush! Ask nicely and I'll tell you.",
            npcResponseChinese: '等一下，不用這麼急嘛！客氣一點問我就告訴你。',
            feedback: '對熱心幫忙的同學催促會降低對方好感喔！',
          },
        ],
      },
      {
        id: 't3',
        promptEn: 'You can also take a bus for two stops if your picnic basket is heavy.',
        promptChinese: '如果你們的野餐籃很重，也可以搭兩站公車過去。',
        options: [
          {
            text: 'Walking sounds lovely! Can we stop by the Flower Market on the way?',
            chinese: '走路聽起來好棒！我們順路可以去逛逛 Flower Market 嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Yes! The Flower Market is on the corner of Berkeley Street and Piccadilly Road.',
            npcResponseChinese: '可以呀！Flower Market 就在 Berkeley Street 和 Piccadilly Road 的轉角！',
            feedback: '自然接話並活用街角位置概念，對話超流暢！',
          },
          {
            text: 'I hate walking. Why is there no free taxi?',
            chinese: '我討厭走路。為什麼沒有免費計程車？',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'Haha, well, the park is really close so walking is actually faster!',
            npcResponseChinese: '哈哈，其實公園真的很近，用走的反而比較快呢！',
            feedback: '禮貌回應對方的好意建議，能讓對話更愉快！',
          },
        ],
      },
      {
        id: 't4',
        promptEn: 'Just follow Piccadilly Road and you will enjoy a nice picnic at Green Park Fountain!',
        promptChinese: '只要沿著 Piccadilly Road 走，就能在 Green Park Fountain 享受野餐囉！',
        options: [
          {
            text: 'Thanks a million for your help! Have a wonderful afternoon!',
            chinese: '太感謝妳的幫忙了！祝妳有個美好的下午！',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'You too! Enjoy the sunshine at Green Park!',
            npcResponseChinese: '你也是！好好享受 Green Park 的陽光吧！',
            feedback: '"Thanks a million!" 是超自然的美式熱情道謝喔！',
          },
          {
            text: 'Bye.',
            chinese: '掰。',
            isPolite: false,
            affinityDelta: -5,
            npcResponse: 'Oh, see you! Remember to say thank you next time!',
            npcResponseChinese: '喔，再見！下次別忘了先說聲謝謝喔！',
            feedback: '補上一句 "Thank you!" 會更完美！',
          },
        ],
      },
    ],
  },
  {
    id: 'clt_post_bank',
    shortTitle: '郵局銀行',
    npcName: 'Mrs. Baker',
    npcAvatarEmoji: '🧁',
    situation: 'You need to mail a postcard at Post Office and visit City Bank on Spring Road.',
    situationChinese: '你需要去 Post Office 寄明信片，還要找位於 Spring Road 的 City Bank。',
    targetPlace: 'City Bank',
    rewardBlueprintId: 'bp_post_box',
    turns: [
      {
        id: 't1',
        promptEn: 'Hello, sweetheart! Fresh muffins just came out! Are you looking for something?',
        promptChinese: '哈囉！剛出爐的馬芬很香喔！你在找什麼地方嗎？',
        options: [
          {
            text: "Excuse me, ma'am. How do I get to the Post Office from here?",
            chinese: '女士不好意思，請問從這裡要怎麼去 Post Office 呢？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Go straight along Piccadilly Road and turn left on Spring Road.',
            npcResponseChinese: '沿著 Piccadilly Road 直走，然後在 Spring Road 左轉。',
            feedback: '使用 "ma\'am" 稱呼女性長輩並用 "How do I get to..." 問路超有教養！',
          },
          {
            text: 'Post Office! Show me!',
            chinese: '郵局！帶我去！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Oh dear, please say "Excuse me" and ask nicely.',
            npcResponseChinese: '哎呀孩子，請先說聲「Excuse me」好好問路喔。',
            feedback: '千萬不要用命令口氣向店員或路人問路！',
          },
        ],
      },
      {
        id: 't2',
        promptEn: 'Turn left on Spring Road after walking down Piccadilly Road.',
        promptChinese: '走過 Piccadilly Road 後，在 Spring Road 左轉。',
        options: [
          {
            text: 'Thank you! About how many blocks do I need to walk?',
            chinese: '謝謝您！請問大概要走幾個街區呢？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Walk east for two blocks on Piccadilly Road. The Post Office is across from Central Hospital.',
            npcResponseChinese: '在 Piccadilly Road 往東走兩個街區，Post Office 就在 Central Hospital 對面。',
            feedback: '詢問 "how many blocks"（幾個街區）是非常道地的問法！',
          },
          {
            text: 'Is it far? I will not walk if it is far.',
            chinese: '很遠嗎？很遠我就不走了。',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: "It isn't far at all, just two short blocks!",
            npcResponseChinese: '一點也不遠，只有短短兩個街區而已！',
            feedback: '直接問幾個街區（How many blocks?）能獲得更準確的資訊。',
          },
        ],
      },
      {
        id: 't3',
        promptEn: 'The Post Office is on Spring Road, across from Central Hospital.',
        promptChinese: 'Post Office 在 Spring Road 上，就在 Central Hospital 的對面。',
        options: [
          {
            text: 'Got it! Could you also tell me if City Bank is near the Post Office?',
            chinese: '知道了！請問 City Bank 也在 Post Office 附近嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Yes! Walk north along Spring Road for one more block. City Bank is on the corner.',
            npcResponseChinese: '是的！沿著 Spring Road 再往北走一個街區，City Bank 就在轉角。',
            feedback: '一次禮貌追加第二個問題，"Could you also tell me..." 非常加分！',
          },
          {
            text: 'Where is money place?',
            chinese: '拿錢的地方在哪？',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'Oh, you mean City Bank! Try asking with the full place name politely.',
            npcResponseChinese: '喔，你是指 City Bank 吧！試著用完整地名有禮貌地發問喔。',
            feedback: '講出正確地名 City Bank 並禮貌提問，溝通最有效率！',
          },
        ],
      },
      {
        id: 't4',
        promptEn: 'City Bank is one block north of the Post Office on Spring Road.',
        promptChinese: 'City Bank 就在 Spring Road 上、Post Office 往北一個街區處。',
        options: [
          {
            text: 'So City Bank is on the corner of Spring Road and Stratton Street, right?',
            chinese: '所以 City Bank 是在 Spring Road 和 Stratton Street 的轉角處，對嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Bingo! It's right next to the Supermarket, too!",
            npcResponseChinese: '答對了！而且就在 Supermarket 旁邊喔！',
            feedback: '完美運用 "on the corner of A and B" 確認交叉路口！',
          },
          {
            text: 'Too confusing! I give up!',
            chinese: '太複雜了！我放棄！',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: "Don't worry! Just check the street corner name and you'll find it easily.",
            npcResponseChinese: '別擔心！對照一下轉角街名很快就能找到了。',
            feedback: '試著說出兩條交叉路名來做最後確認吧！',
          },
        ],
      },
      {
        id: 't5',
        promptEn: 'Both places are on Spring Road, just one block apart!',
        promptChinese: '兩個地方都在 Spring Road 上，只隔一個街區喔！',
        options: [
          {
            text: "You've been so helpful, ma'am! Thank you very much!",
            chinese: '女士您幫了大忙！非常感謝您！',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Anytime, dear! Come back for a cookie later!',
            npcResponseChinese: '別客氣！等一下歡迎回來買餅乾喔！',
            feedback: '溫暖有禮的收尾，滿分通過！',
          },
          {
            text: 'Fine, thanks.',
            chinese: '好啦，謝。',
            isPolite: false,
            affinityDelta: -5,
            npcResponse: 'Take care on the street!',
            npcResponseChinese: '路上小心喔！',
            feedback: '再多一點熱情感謝會讓對方更開心！',
          },
        ],
      },
    ],
  },
  {
    id: 'clt_restaurant_corner',
    shortTitle: '尋找餐廳',
    npcName: 'Leo',
    npcAvatarEmoji: '🚲',
    situation: "You are hungry and looking for Kitty's Restaurant near Second Street.",
    situationChinese: '你肚子餓了，想在 Second Street 附近找 Kitty\'s Restaurant，遇見騎腳踏車經過的 Leo。',
    targetPlace: "Kitty's Restaurant",
    rewardBlueprintId: 'bp_restaurant',
    turns: [
      {
        id: 't1',
        promptEn: 'Hey! Taking a break with my bike here. Need any directions?',
        promptChinese: '嗨！我剛好騎車停在這裡休息。需要指路嗎？',
        options: [
          {
            text: "Excuse me. Could you help me find Kitty's Restaurant?",
            chinese: "不好意思，請問可以幫我找一下 Kitty's Restaurant 嗎？",
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Sure! I just rode my bike past there! Walk south along Second Street.",
            npcResponseChinese: '當然！我剛剛才騎車經過那裡！沿著 Second Street 往南走。',
            feedback: '親切求助 "Could you help me find..." 是問路萬用句！',
          },
          {
            text: "Hey! Do you know Kitty's Restaurant or not?",
            chinese: "喂！你到底知不知道 Kitty's Restaurant 在哪？",
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Whoa, take it easy! I know where it is if you ask nicely.',
            npcResponseChinese: '哇，別這麼兇嘛！好好問的話我就告訴你。',
            feedback: '對路人保持友善語氣才容易得到幫助喔！',
          },
        ],
      },
      {
        id: 't2',
        promptEn: 'Go straight down Second Street until you hit Station Road.',
        promptChinese: '沿著 Second Street 一直往下走，直到 Station Road。',
        options: [
          {
            text: 'Thanks! Should I turn left or turn right on Station Road?',
            chinese: '謝謝！請問到了 Station Road 要左轉還是右轉呢？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "You don't even need to turn far—it's right at the corner of Second Street and Station Road!",
            npcResponseChinese: '甚至不用走太遠，它就在 Second Street 和 Station Road 的轉角！',
            feedback: '問清楚轉彎方向是超聰明的問路習慣！',
          },
          {
            text: 'What? Tell me left or right right now!',
            chinese: '什麼？現在馬上說左還是右！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Calm down! Ask politely and I will explain clearly.',
            npcResponseChinese: '冷靜點！有禮貌發問我就會講清楚。',
            feedback: '使用禮貌疑問句 "Should I turn..." 會好很多！',
          },
        ],
      },
      {
        id: 't3',
        promptEn: "It's right at the corner of Second Street and Station Road, next to River Water Restaurant.",
        promptChinese: '就在 Second Street 和 Station Road 的轉角，在 River Water Restaurant 旁邊。',
        options: [
          {
            text: 'Is it close enough to go on foot, or should I take a bus?',
            chinese: '那裡近到可以走路去嗎，還是我應該搭公車？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Going on foot is super fast—it's only a three-minute walk!",
            npcResponseChinese: '走路去超快的，只要走三分鐘就到了！',
            feedback: '漂亮對比 "go on foot" 與 "take a bus"！',
          },
          {
            text: 'Should I go by foot or ride bus?',
            chinese: '我應該 by foot 還是 ride bus？',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'Remember, it is "on foot" and "take a bus"!',
            npcResponseChinese: '記得英文是「on foot（步行）」跟「take a bus（搭公車）」喔！',
            feedback: '小心交通用語：「on foot」與「take a bus」不能搞混！',
          },
        ],
      },
      {
        id: 't4',
        promptEn: 'Just three minutes on foot, and their pasta is amazing!',
        promptChinese: '走路只要三分鐘，而且他們的義大利麵超好吃！',
        options: [
          {
            text: 'Thanks so much for the recommendation! Ride safely!',
            chinese: '太謝謝你的推薦了！騎車小心安全喔！',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Will do! Enjoy your lunch!',
            npcResponseChinese: '會的！祝你午餐愉快！',
            feedback: '貼心提醒對方騎車安全，展現滿分社交英文力！',
          },
          {
            text: 'Yeah, whatever.',
            chinese: '喔，好啦。',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'See you around...',
            npcResponseChinese: '好吧，再見...',
            feedback: '結束對話時加上 "Thanks so much!" 更有禮貌喔。',
          },
        ],
      },
    ],
  },
  {
    id: 'clt_station_night',
    shortTitle: '夜間地鐵',
    npcName: 'Maya',
    npcAvatarEmoji: '🏃‍♀️',
    situation: "It's getting dark after your walk in the park, and you need to find Green Park Station.",
    situationChinese: '在公園散步後天色漸暗，你有點迷路了，需要找尋 Green Park Station。',
    targetPlace: 'Green Park Station',
    rewardBlueprintId: 'bp_metro',
    turns: [
      {
        id: 't1',
        promptEn: 'Hi! Just finishing my evening jog. Is everything okay?',
        promptChinese: '嗨！我剛結束夜間慢跑。還好嗎？需要幫忙嗎？',
        options: [
          {
            text: "Excuse me! I'm a little lost. Could you show me the way to Green Park Station?",
            chinese: '不好意思！我有點迷路了，請問可以告訴我怎麼去 Green Park Station 嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Don't worry! I know this area well. Follow Berkeley Street straight south.",
            npcResponseChinese: '別擔心！我很熟這區。沿著 Berkeley Street 筆直往南走就好。',
            feedback: '清楚說出 "I\'m a little lost." 並禮貌求助，對方馬上就能理解！',
          },
          {
            text: 'I lost! Give me station now!',
            chinese: '我迷路！現在給我車站！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Take a breath! You can say "Excuse me, I\'m lost. How do I get to the station?"',
            npcResponseChinese: '深呼吸一下！試著完整說出「Excuse me, how do I get to...」吧。',
            feedback: '記得用完整句 "I\'m lost" 搭配 "Excuse me" 與 "Could you..."。',
          },
        ],
      },
      {
        id: 't2',
        promptEn: 'Walk straight south along Berkeley Street.',
        promptChinese: '沿著 Berkeley Street 筆直往南走。',
        options: [
          {
            text: 'Thank you! How many blocks do I need to walk along Berkeley Street?',
            chinese: '謝謝妳！請問沿著 Berkeley Street 大約要走幾個街區？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Walk three blocks south, crossing Stratton Street and Piccadilly Road.',
            npcResponseChinese: '往南走三個街區，會穿過 Stratton Street 和 Piccadilly Road。',
            feedback: '主動確認要走幾個街區，晚上找路更安心！',
          },
          {
            text: 'Walk how far? Tell me fast!',
            chinese: '走多遠？快點講！',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'Please slow down and ask politely—it is three blocks south.',
            npcResponseChinese: '語氣放慢一點、有禮貌發問喔——是往南三個街區。',
            feedback: '即使著急問路也要記得使用禮貌的完整問句喔！',
          },
        ],
      },
      {
        id: 't3',
        promptEn: 'You will cross two busy streets on your way to Station Road.',
        promptChinese: '往 Station Road 的路上會經過兩條車多的馬路。',
        options: [
          {
            text: 'Are there crosswalks and traffic lights along the street?',
            chinese: '請問沿路都有斑馬線和紅綠燈嗎？',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: 'Yes! Always stop, look, and listen before crossing at the crosswalk.',
            npcResponseChinese: '有的！在斑馬線過馬路前一定要記得停看聽喔。',
            feedback: '兼具交通安全意識與英文對話能力，超棒！',
          },
          {
            text: 'Cars are annoying. I just run across.',
            chinese: '車子好煩，我直接跑過去就好。',
            isPolite: false,
            affinityDelta: -15,
            npcResponse: 'No! That is very dangerous, especially at night. Always use the crosswalk!',
            npcResponseChinese: '不行！那樣非常危險，尤其在晚上！一定要走斑馬線！',
            feedback: '行人過馬路一定要走斑馬線並注意紅綠燈安全！',
          },
        ],
      },
      {
        id: 't4',
        promptEn: 'When you reach Station Road, Green Park Station is right next to River Water Restaurant.',
        promptChinese: '走到 Station Road 時，Green Park Station 就在 River Water Restaurant 旁邊。',
        options: [
          {
            text: 'Great! So Green Park Station is on Station Road, next to River Water Restaurant.',
            chinese: '太好了！所以 Green Park Station 在 Station Road 上、River Water Restaurant 旁邊。',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "Yes, you've got it 100%! You'll see the bright metro sign right away.",
            npcResponseChinese: '沒錯，100% 正確！你馬上就會看到亮亮的地鐵標誌。',
            feedback: '精確複誦路名與相鄰地標（next to），完全不會迷路！',
          },
          {
            text: 'Whatever, I do not care about any restaurant.',
            chinese: '隨便啦，我才不管什麼餐廳。',
            isPolite: false,
            affinityDelta: -10,
            npcResponse: 'Checking landmarks next to the station helps you spot the exit faster!',
            npcResponseChinese: '記住車站旁邊的地標，能幫你更快找到入口喔！',
            feedback: '記下旁邊的明顯地標是英文指路的核心技巧！',
          },
        ],
      },
      {
        id: 't5',
        promptEn: 'Have a safe trip home on the metro tonight!',
        promptChinese: '祝你今晚搭地鐵平安回家！',
        options: [
          {
            text: 'Thank you for being so kind! Have a wonderful evening!',
            chinese: '謝謝妳這麼親切幫忙！祝妳有個美好的夜晚！',
            isPolite: true,
            affinityDelta: 15,
            npcResponse: "You're so welcome! Good night and stay safe!",
            npcResponseChinese: '非常不客氣！晚安，路上注意安全！',
            feedback: '完成所有夜間迷路問路對話，表達超流利又得體！',
          },
          {
            text: 'Bye.',
            chinese: '掰。',
            isPolite: false,
            affinityDelta: -5,
            npcResponse: 'Good night! Remember to thank people who help you.',
            npcResponseChinese: '晚安！別忘了跟幫助你的人說聲謝謝喔。',
            feedback: '道別時多加一句感謝會讓對話更溫暖！',
          },
        ],
      },
    ],
  },
];

export function getRandomNpcScenario(): CLTNpcScenario {
  return CLT_SCENARIOS[Math.floor(Math.random() * CLT_SCENARIOS.length)];
}

export interface UK_US_Lexicon {
  us: string;
  uk: string;
  meaning: string;
  exampleUs: string;
  exampleUk: string;
}

export const UK_US_PAIRS: UK_US_Lexicon[] = [
  { us: 'the subway', uk: 'the underground / the Tube', meaning: '地下鐵系統', exampleUs: 'I take the subway to Central Park.', exampleUk: 'Let’s take the Tube to Green Park Station.' },
  { us: 'the first floor', uk: 'the ground floor', meaning: '建築物一樓（入街層）', exampleUs: 'The cafe is on the first floor.', exampleUk: 'The reception desk is on the ground floor.' },
  { us: 'elevator', uk: 'lift', meaning: '電梯', exampleUs: 'Take the elevator to the second floor.', exampleUk: 'The lift is next to the hotel lobby.' },
  { us: 'sidewalk', uk: 'pavement', meaning: '人行道', exampleUs: 'Please walk on the sidewalk.', exampleUk: 'Stay on the pavement near the busy road.' },
  { us: 'line', uk: 'queue', meaning: '排隊（隊伍）', exampleUs: 'We waited in line at the bus stop.', exampleUk: 'Let us join the queue for the museum.' },
  { us: 'apartment', uk: 'flat', meaning: '公寓住所', exampleUs: 'My cousin lives in an apartment.', exampleUk: 'Her flat is across from the park.' },
  { us: 'eraser', uk: 'rubber', meaning: '橡皮擦', exampleUs: 'Can I borrow your eraser?', exampleUk: 'Where did I put my rubber?' },
  { us: 'cookies', uk: 'biscuits', meaning: '餅乾', exampleUs: 'We bought some chocolate cookies.', exampleUk: 'Have some tea and biscuits.' },
  { us: 'fries', uk: 'chips', meaning: '炸薯條', exampleUs: 'I ordered a burger with fries.', exampleUk: 'We enjoyed classic fish and chips.' },
  { us: 'soccer', uk: 'football', meaning: '足球', exampleUs: 'He plays soccer after school.', exampleUk: 'He watches Premier League football.' },
  { us: 'candy', uk: 'sweets', meaning: '糖果', exampleUs: 'Kids love eating candy.', exampleUk: 'She bought a bag of sweets.' },
  { us: 'television / TV', uk: 'telly', meaning: '電視', exampleUs: 'Turn off the television, please.', exampleUk: "What's on the telly tonight?" },
];

export const GRAMMAR_RULES = [
  {
    title: 'by + 交通工具 vs. take / ride / drive a + 交通工具',
    formula1: 'by + [交通工具單數無冠詞] (e.g., by bus, by taxi, by train, by metro, by bike)',
    formula2: 'take / ride / drive + [a / the] + [交通工具] (e.g., take a taxi, take the metro, ride a bike, drive a car)',
    special: '【特別注意】步行只能說：on foot 或 walk！千萬不可說 by foot！',
    example1: 'They went to the museum by taxi. = They took a taxi to the museum.',
    example2: 'She went to the library on foot. = She walked to the library.',
  },
  {
    title: '問路核心句型 (Asking for Directions)',
    formula1: 'Excuse me. How do I / we get to [地點]?',
    formula2: 'Could you tell me the way to [地點]? / Where is [地點]?',
    special: '【禮貌叮嚀】問路時先說 "Excuse me."，最後別忘了加上 "Thank you!"！',
    example1: 'Excuse me. How do we get to The May Fair Hotel?',
    example2: 'Excuse me. Could you tell me how to get to Kitty’s Restaurant?',
  },
  {
    title: '指路與方位介系詞 (Giving Directions & Prepositions)',
    formula1: 'Go straight / walk along this road (for X blocks).',
    formula2: 'Turn left / turn right (on / at [路名或地標]).',
    special: '【方位介系詞】across from (在…對面) / next to (在…旁邊) / on the corner of A and B (在A與B轉角處) / between A and B (在A與B之間)',
    example1: 'Go down Berkeley Street for two blocks. It is on the right.',
    example2: 'City Bank is between The May Fair Hotel and Fire Station.',
  },
  {
    title: '上下車與過馬路實用片語 (Transit & Safety Phrases)',
    formula1: 'get on [交通工具] (上車) ↔ get off at [站名] (在某站下車)',
    formula2: 'walk past [地點] (經過) / walk across the street (過馬路)',
    special: '【行人安全】過馬路前先 "Stop, look, and listen!"，並走斑馬線 (crosswalk) 遵守紅綠燈！',
    example1: 'Take Bus 711 and get off at April High School.',
    example2: 'Walk across the street at the crosswalk, and the restaurant is on the corner.',
  },
];

export interface CoOpMapNode {
  id: string;
  name: string;
  chinese: string;
  street: string;
  relativeLocation: string;
}

export const CO_OP_LANDMARKS: CoOpMapNode[] = [
  { id: 'park_hotel', name: 'Park Hotel', chinese: '公園飯店', street: 'Tree Road', relativeLocation: 'Across from Post Office' },
  { id: 'post_office', name: 'Post Office', chinese: '郵局', street: 'Tree Road & Spring Street', relativeLocation: 'Next to City Bank' },
  { id: 'city_bank', name: 'City Bank', chinese: '城市銀行', street: 'Park Road', relativeLocation: 'Across from NY Park' },
  { id: 'ny_park', name: 'NY Park', chinese: '紐約公園', street: 'Park Road', relativeLocation: 'In the center of the block' },
  { id: 'mary_coffee', name: "Mary's Coffee", chinese: '瑪莉咖啡', street: 'Park Road', relativeLocation: 'South of NY Park' },
  { id: 'ny_gift_shop', name: 'NY Gift Shop', chinese: '紐約禮品店', street: 'Flower Road & Spring Street', relativeLocation: 'North-east corner' },
  { id: 'joys_bookstore', name: "Joy's Bookstore", chinese: '喬伊書店', street: 'Flower Road & Summer Street', relativeLocation: 'Across from Theater' },
  { id: 'blueman_theater', name: 'Blueman Theater', chinese: '藍人劇院', street: 'Summer Street', relativeLocation: 'Across from Bookstore' },
  { id: 'kittys_restaurant', name: "Kitty's Restaurant", chinese: '凱蒂餐廳', street: 'Station Road', relativeLocation: 'Across from the flower market' },
];
