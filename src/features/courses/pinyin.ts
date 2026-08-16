import type { Course } from './courseData'

export const pinyinCourse: Course = {
  id: 'pinyin',
  type: 'pinyin',
  icon: '🗣️',
  title: { en: 'Pinyin', zh: '拼音练习' },
  desc: {
    en: 'Drill the pinyin behind every Chinese character: initials, finals, tricky syllables, then whole words and sentences from everyday life.',
    zh: '练习每个汉字背后的拼音：声母、韵母、特殊音节，再到生活中的常用词语与完整句子。',
  },
  lessons: [
    {
      id: 'initials',
      title: { en: 'Initials', zh: '声母' },
      text: 'b p m f d t n l g k h j q x zh ch sh r z c s y w b p m f d t n l g k h',
    },
    {
      id: 'simple-finals',
      title: { en: 'Simple finals', zh: '单韵母' },
      text: 'a o e i u a o e i u a o e i u a o e i u',
    },
    {
      id: 'finals',
      title: { en: 'Finals', zh: '韵母' },
      text: 'ai ei ui ao ou iu ie er an en in un ang eng ing ong ai ei ui ao ou iu',
    },
    {
      id: 'special-syllables',
      title: { en: 'Tricky syllables', zh: '特殊音节' },
      text: 'zhi chi shi ri zi ci si zhi chi shi ri zi ci si ju qu xu yu ju qu xu yu',
    },
    {
      id: 'common-syllables',
      title: { en: 'Common syllables', zh: '常用音节' },
      text: 'ni wo ta shi de he bu le zai shang xia zi wo ni ta shi de he bu le',
    },
    {
      id: 'greetings',
      title: { en: 'Greetings', zh: '问候用语' },
      text: 'ni hao xie xie zai jian wan an bu ke qi qing wen zao shang hao wan shang hao ni hao ma',
    },
    {
      id: 'everyday-words',
      title: { en: 'Everyday words', zh: '日常词汇' },
      text: 'zhong wen han yu pin yin xue xi da zi jian pan dian nao shou ji wang luo',
    },
    {
      id: 'family',
      title: { en: 'Family', zh: '家人' },
      text: 'ba ba ma ma ge ge jie jie di di mei mei ye ye nai nai jia ting fu mu',
    },
    {
      id: 'food',
      title: { en: 'Food & drinks', zh: '饮食' },
      text: 'mi fan mian tiao bao zi jiao zi man tou ji dan niu rou cha ka fei niu nai shui guo',
    },
    {
      id: 'colors',
      title: { en: 'Colors', zh: '颜色' },
      text: 'hong se lan se lv se bai se hei se huang se fen se zi se hong se lan se lv se',
    },
    {
      id: 'time-date',
      title: { en: 'Time & dates', zh: '时间日期' },
      text: 'jin tian ming tian zuo tian xian zai xing qi yi yue san nian shang wu xia wu wan shang',
    },
    {
      id: 'numbers-pinyin',
      title: { en: 'Numbers', zh: '数字拼音' },
      text: 'yi er san si wu liu qi ba jiu shi bai qian wan yi er san si wu',
    },
    {
      id: 'sentences',
      title: { en: 'Pinyin sentences', zh: '拼音句子' },
      text: 'ni hao ma wo hen hao wo ai ni xue xi zhong wen tian tian xiang shang wo xiang he cha ming tian jian',
    },
    {
      id: 'poem',
      title: { en: 'A pinyin poem', zh: '古诗拼音' },
      text: 'chuang qian ming yue guang yi shi di shang shuang ju tou wang ming yue di tou si gu xiang',
    },
    {
      id: 'proverb',
      title: { en: 'A pinyin proverb', zh: '谚语拼音' },
      text: 'zhi yao gong fu shen tie chu mo cheng zhen du shu po wan juan xia bi ru you shen',
    },
    {
      id: 'time-pinyin',
      title: { en: 'Time pinyin', zh: '时间拼音' },
      text: 'ji dian le xian zai ji dian zhou yi xing qi yi shi er dian ban shang wu jiu dian',
    },
    {
      id: 'weather-pinyin',
      title: { en: 'Weather pinyin', zh: '天气拼音' },
      text: 'jin tian tian qi zen me yang wai mian xia yu le tian qi hen hao ming tian you yu',
    },
    {
      id: 'shopping-pinyin',
      title: { en: 'Shopping pinyin', zh: '购物拼音' },
      text: 'duo shao qian tai gui le pian yi dian mai dan xian sheng yuan qing gei wo jian pan',
    },
  ],
}