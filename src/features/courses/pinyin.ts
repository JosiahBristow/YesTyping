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
      hanzi: '玻 坡 摸 佛 得 特 讷 勒 哥 科 喝 基 欺 希 知 蚩 诗 日 资 雌 思 衣 乌 玻 坡 摸 佛 得 特 讷 勒 哥 科 喝',
    },
    {
      id: 'simple-finals',
      title: { en: 'Simple finals', zh: '单韵母' },
      text: 'a o e i u a o e i u a o e i u a o e i u',
      hanzi: '啊 喔 鹅 衣 乌 啊 喔 鹅 衣 乌 啊 喔 鹅 衣 乌 啊 喔 鹅 衣 乌',
    },
    {
      id: 'finals',
      title: { en: 'Finals', zh: '韵母' },
      text: 'ai ei ui ao ou iu ie er an en in un ang eng ing ong ai ei ui ao ou iu',
      hanzi: '哀 欸 威 熬 欧 优 耶 儿 安 恩 因 温 昂 鞥 英 嗡 哀 欸 威 熬 欧 优',
    },
    {
      id: 'special-syllables',
      title: { en: 'Tricky syllables', zh: '特殊音节' },
      text: 'zhi chi shi ri zi ci si zhi chi shi ri zi ci si ju qu xu yu ju qu xu yu',
      hanzi: '知 吃 诗 日 资 此 思 知 吃 诗 日 资 此 思 居 去 需 鱼 居 去 需 鱼',
    },
    {
      id: 'common-syllables',
      title: { en: 'Common syllables', zh: '常用音节' },
      text: 'ni wo ta shi de he bu le zai shang xia zi wo ni ta shi de he bu le',
      hanzi: '你 我 他 是 的 和 不 了 在 上 下 自 我 你 他 是 的 和 不 了',
    },
    {
      id: 'greetings',
      title: { en: 'Greetings', zh: '问候用语' },
      text: 'ni hao xie xie zai jian wan an bu ke qi qing wen zao shang hao wan shang hao ni hao ma',
      hanzi: '你好 谢谢 再见 晚安 不客气 请问 早上好 晚上好 你好吗',
    },
    {
      id: 'everyday-words',
      title: { en: 'Everyday words', zh: '日常词汇' },
      text: 'zhong wen han yu pin yin xue xi da zi jian pan dian nao shou ji wang luo',
      hanzi: '中文 汉语 拼音 学习 打字 键盘 电脑 手机 网络',
    },
    {
      id: 'family',
      title: { en: 'Family', zh: '家人' },
      text: 'ba ba ma ma ge ge jie jie di di mei mei ye ye nai nai jia ting fu mu',
      hanzi: '爸爸 妈妈 哥哥 姐姐 弟弟 妹妹 爷爷 奶奶 家庭 父母',
    },
    {
      id: 'food',
      title: { en: 'Food & drinks', zh: '饮食' },
      text: 'mi fan mian tiao bao zi jiao zi man tou ji dan niu rou cha ka fei niu nai shui guo',
      hanzi: '米饭 面条 包子 饺子 馒头 鸡蛋 牛肉 茶 咖啡 牛奶 水果',
    },
    {
      id: 'colors',
      title: { en: 'Colors', zh: '颜色' },
      text: 'hong se lan se lv se bai se hei se huang se fen se zi se hong se lan se lv se',
      hanzi: '红色 蓝色 绿色 白色 黑色 黄色 粉色 紫色 红色 蓝色 绿色',
    },
    {
      id: 'time-date',
      title: { en: 'Time & dates', zh: '时间日期' },
      text: 'jin tian ming tian zuo tian xian zai xing qi yi yue san nian shang wu xia wu wan shang',
      hanzi: '今天 明天 昨天 现在 星期 一月 三年 上午 下午 晚上',
    },
    {
      id: 'numbers-pinyin',
      title: { en: 'Numbers', zh: '数字拼音' },
      text: 'yi er san si wu liu qi ba jiu shi bai qian wan yi er san si wu',
      hanzi: '一 二 三 四 五 六 七 八 九 十 百 千 万 一 二 三 四 五',
    },
    {
      id: 'sentences',
      title: { en: 'Pinyin sentences', zh: '拼音句子' },
      text: 'ni hao ma wo hen hao wo ai ni xue xi zhong wen tian tian xiang shang wo xiang he cha ming tian jian',
      hanzi: '你好吗 我很好 我爱你 学习中文 天天向上 我想喝茶 明天见',
    },
    {
      id: 'poem',
      title: { en: 'A pinyin poem', zh: '古诗拼音' },
      text: 'chuang qian ming yue guang yi shi di shang shuang ju tou wang ming yue di tou si gu xiang',
      hanzi: '床前 明月 光 疑是 地上 霜 举头 望明月 低头 思故乡',
    },
    {
      id: 'proverb',
      title: { en: 'A pinyin proverb', zh: '谚语拼音' },
      text: 'zhi yao gong fu shen tie chu mo cheng zhen du shu po wan juan xia bi ru you shen',
      hanzi: '只要功夫深 铁杵磨成针 读书破万卷 下笔如有神',
    },
    {
      id: 'time-pinyin',
      title: { en: 'Time pinyin', zh: '时间拼音' },
      text: 'ji dian le xian zai ji dian zhou yi xing qi yi shi er dian ban shang wu jiu dian',
      hanzi: '几点了 现在几点 周一 星期一 十二点半 上午九点',
    },
    {
      id: 'weather-pinyin',
      title: { en: 'Weather pinyin', zh: '天气拼音' },
      text: 'jin tian tian qi zen me yang wai mian xia yu le tian qi hen hao ming tian you yu',
      hanzi: '今天天气 怎么样 外面 下雨了 天气很好 明天有雨',
    },
    {
      id: 'shopping-pinyin',
      title: { en: 'Shopping pinyin', zh: '购物拼音' },
      text: 'duo shao qian tai gui le pian yi dian mai dan xian sheng yuan qing gei wo jian pan',
      hanzi: '多少钱 太贵了 便宜点 买单 先生 元 请给我 键盘',
    },
  ],
}