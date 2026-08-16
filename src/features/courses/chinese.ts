import type { Course } from './courseData'

export const chineseCourse: Course = {
  id: 'chinese',
  type: 'chinese',
  icon: '🀄',
  title: { en: 'Chinese', zh: '中文输入' },
  desc: {
    en: 'Type real Chinese characters through your IME: numbers, greetings, pronouns, family, food, time, weather, self-introduction, daily phrases, proverbs, idioms and classic poems.',
    zh: '通过输入法直接打出汉字：数字、问候、代词、家人、饮食、时间、天气、自我介绍、日常用语、谚语、成语与经典诗句，循序渐进地练习中文输入。',
  },
  lessons: [
    {
      id: 'numbers',
      title: { en: 'Numbers', zh: '数字' },
      text: '一二三四五六七八九十 百 千 万 亿 一二三四五 六七八九十 二十 三十 四十 五十 六十 七十 八十 九十 一百 一千 一万 一亿',
    },
    {
      id: 'greetings',
      title: { en: 'Greetings', zh: '问候' },
      text: '你好 大家好 早上好 下午好 晚上好 晚安 谢谢 不客气 再见 欢迎 对不起 没关系 请问 请坐 辛苦了',
    },
    {
      id: 'pronouns',
      title: { en: 'Pronouns', zh: '代词' },
      text: '我 你 他 她 它 我们 你们 他们 她们 大家 自己 谁 什么 这个 那个 这里 那里',
    },
    {
      id: 'common-words',
      title: { en: 'Common words', zh: '常用词' },
      text: '中国 中文 汉字 学习 打字 键盘 电脑 手机 网络 软件 老师 学生 学校 工作 生活 朋友 时间 事情',
    },
    {
      id: 'family',
      title: { en: 'Family', zh: '家人' },
      text: '爸爸 妈妈 哥哥 姐姐 弟弟 妹妹 爷爷 奶奶 外公 外婆 叔叔 阿姨 孩子 家庭 父母',
    },
    {
      id: 'food',
      title: { en: 'Food & drinks', zh: '饮食' },
      text: '米饭 面条 包子 饺子 馒头 鸡蛋 牛肉 猪肉 鱼肉 茶 咖啡 牛奶 水 苹果 香蕉 西瓜 好吃 喝水',
    },
    {
      id: 'time',
      title: { en: 'Time & seasons', zh: '时间与季节' },
      text: '今天 明天 昨天 现在 上午 下午 晚上 星期 周末 一月 二月 三月 一年 春天 夏天 秋天 冬天',
    },
    {
      id: 'weather',
      title: { en: 'Weather', zh: '天气' },
      text: '天气 晴天 下雨 下雪 刮风 多云 阴天 很热 很冷 暖和 凉快 空气 温度',
    },
    {
      id: 'self-intro',
      title: { en: 'Self introduction', zh: '自我介绍' },
      text: '我叫小明 我是一名学生 我今年二十岁 我喜欢读书和写字 我来自中国 我住在北京 我家有四口人',
    },
    {
      id: 'daily-phrases',
      title: { en: 'Daily phrases', zh: '日常用语' },
      text: '今天天气很好 我想喝一杯茶 你在做什么 明天见 祝你成功 谢谢你的帮助 你吃饭了吗 好久不见 一路平安',
    },
    {
      id: 'proverbs',
      title: { en: 'Proverbs', zh: '谚语' },
      text: '好好学习 天天向上 熟能生巧 坚持不懈 一分耕耘 一分收获 学无止境 百炼成钢',
    },
    {
      id: 'idioms',
      title: { en: 'Idioms', zh: '成语' },
      text: '一心一意 十全十美 马到成功 大功告成 画龙点睛 名不虚传 学而不厌 温故知新 事半功倍 三心二意',
    },
    {
      id: 'poems',
      title: { en: 'Classic poems', zh: '经典诗句' },
      text: '床前明月光 疑是地上霜 举头望明月 低头思故乡 白日依山尽 黄河入海流 欲穷千里目 更上一层楼 春眠不觉晓 处处闻啼鸟',
    },
    {
      id: 'famous-quotes',
      title: { en: 'Famous quotes', zh: '名句' },
      text: '学而时习之 不亦说乎 温故而知新 可以为师矣 三人行 必有我师焉 己所不欲 勿施于人 书山有路勤为径 学海无涯苦作舟',
    },
    {
      id: 'chinese-review',
      title: { en: 'Mixed review', zh: '综合练习' },
      text: '今天天气很好 我和朋友一起学习中文 熟能生巧 学无止境 床前明月光 疑是地上霜 大家好 明天见 祝你成功',
    },
    {
      id: 'places',
      title: { en: 'Places', zh: '地点' },
      text: '学校 医院 图书馆 公园 车站 机场 商场 饭店 电影院 银行 邮局 药店',
    },
    {
      id: 'shopping',
      title: { en: 'Shopping', zh: '购物' },
      text: '多少钱 太贵了 便宜一点 买单 收据 打折 购物 商店 付款 发票 售货员',
    },
    {
      id: 'occupations',
      title: { en: 'Occupations', zh: '职业' },
      text: '医生 老师 学生 警察 厨师 司机 工程师 画家 歌手 作家 记者 农民',
    },
  ],
}