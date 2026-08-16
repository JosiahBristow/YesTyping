import type { Course } from './courseData'

export const pinyinCourse: Course = {
  id: 'pinyin',
  type: 'pinyin',
  icon: '🗣️',
  title: { en: 'Pinyin', zh: '拼音练习' },
  desc: {
    en: 'Drill the pinyin syllables behind every Chinese word: initials, finals and whole words.',
    zh: '练习每个汉字背后的拼音音节：声母、韵母和常用词语的完整拼音。',
  },
  lessons: [
    {
      id: 'initials',
      title: { en: 'Initials', zh: '声母' },
      text: 'b p m f d t n l g k h j q x zh ch sh r z c s y w b p m f d t n l g k h',
    },
    {
      id: 'finals',
      title: { en: 'Finals', zh: '韵母' },
      text: 'a o e i u ai ei ui ao ou iu ie er an en in un ang eng ing ong a o e i u',
    },
    {
      id: 'common-syllables',
      title: { en: 'Common syllables', zh: '常用音节' },
      text: 'ni wo ta shi de he bu wo ni ta shi de he bu wo ni ta shi de he bu',
    },
    {
      id: 'greetings',
      title: { en: 'Greetings', zh: '问候用语' },
      text: 'ni hao xie xie zai jian wan an bu ke qi qing wen zaoshang hao wanshang hao',
    },
    {
      id: 'everyday-words',
      title: { en: 'Everyday words', zh: '日常词汇' },
      text: 'zhong wen han yu pin yin xue xi da zi jian pan dian nao shou ji wang luo',
    },
    {
      id: 'numbers-pinyin',
      title: { en: 'Numbers', zh: '数字拼音' },
      text: 'yi er san si wu liu qi ba jiu shi bai qian wan yi er san si wu',
    },
    {
      id: 'sentences',
      title: { en: 'Pinyin sentences', zh: '拼音句子' },
      text: 'ni hao ma wo hen hao wo ai ni xue xi zhong wen tian tian xiang shang',
    },
    {
      id: 'proverb',
      title: { en: 'A pinyin proverb', zh: '谚语拼音' },
      text: 'zhi yao gong fu shen tie chu mo cheng zhen du shu po wan juan xia bi ru you shen',
    },
  ],
}