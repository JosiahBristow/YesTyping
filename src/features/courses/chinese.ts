import type { Course } from './courseData'

export const chineseCourse: Course = {
  id: 'chinese',
  type: 'chinese',
  icon: '🀄',
  title: { en: 'Chinese', zh: '中文输入' },
  desc: {
    en: 'Type real Chinese characters through your IME: numbers, greetings, common words and classic poems.',
    zh: '通过输入法直接打出汉字：数字、问候、常用词与经典诗句。',
  },
  lessons: [
    {
      id: 'numbers',
      title: { en: 'Numbers', zh: '数字' },
      text: '一二三四五六七八九十 百 千 万 亿 一二三四五 六七八九十',
    },
    {
      id: 'greetings',
      title: { en: 'Greetings', zh: '问候' },
      text: '你好 大家好 早上好 晚上好 谢谢 不客气 再见 欢迎',
    },
    {
      id: 'common-words',
      title: { en: 'Common words', zh: '常用词' },
      text: '中国 中文 汉字 学习 打字 键盘 电脑 手机 网络 软件 老师 学生',
    },
    {
      id: 'self-intro',
      title: { en: 'Self introduction', zh: '自我介绍' },
      text: '我叫小明 我是一名学生 我今年二十岁 我喜欢读书和写字 我来自中国',
    },
    {
      id: 'daily-phrases',
      title: { en: 'Daily phrases', zh: '日常用语' },
      text: '今天天气很好 我想喝一杯茶 你在做什么 明天见 祝你成功 谢谢你的帮助',
    },
    {
      id: 'proverbs',
      title: { en: 'Proverbs', zh: '谚语' },
      text: '好好学习 天天向上 熟能生巧 坚持不懈 一分耕耘 一分收获',
    },
    {
      id: 'idioms',
      title: { en: 'Idioms', zh: '成语' },
      text: '一心一意 十全十美 马到成功 大功告成 画龙点睛 名不虚传 学而不厌',
    },
    {
      id: 'poems',
      title: { en: 'Classic poems', zh: '经典诗句' },
      text: '床前明月光 疑是地上霜 举头望明月 低头思故乡 白日依山尽 黄河入海流',
    },
  ],
}