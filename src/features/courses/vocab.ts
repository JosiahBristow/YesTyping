import type { Bi } from '../../lib/lang'
import type { Course } from './courseData'

function h(zh: string, en: string): Bi {
  return { en, zh }
}

export const vocabCourse: Course = {
  id: 'vocab',
  type: 'vocab',
  icon: '📚',
  title: { en: 'Vocabulary recall', zh: '单词记忆' },
  desc: {
    en: 'See the meaning, then type the English word from memory — practice and memorise at the same time.',
    zh: '看词义、凭记忆打出英文单词——一边练习打字一边背单词。',
  },
  lessons: [
    {
      id: 'vocab-fruits',
      title: { en: 'Fruit', zh: '水果' },
      text: 'apple banana orange grape mango peach lemon melon berry',
      hints: [h('苹果', 'a round red fruit'), h('香蕉', 'a long yellow fruit'), h('橙子', 'a citrus fruit'), h('葡萄', 'small fruit in bunches'), h('芒果', 'a sweet tropical fruit'), h('桃子', 'a fuzzy stone fruit'), h('柠檬', 'a sour yellow citrus'), h('甜瓜', 'a juicy round melon'), h('浆果', 'a small soft fruit')],
    },
    {
      id: 'vocab-food',
      title: { en: 'Food', zh: '食物' },
      text: 'bread rice noodles egg cheese butter sugar salt soup',
      hints: [h('面包', 'baked dough'), h('米饭', 'cooked grains'), h('面条', 'long thin pasta'), h('鸡蛋', 'breakfast staple'), h('奶酪', 'aged dairy block'), h('黄油', 'spread made from cream'), h('糖', 'sweet crystals'), h('盐', 'seasoning'), h('汤', 'a liquid dish')],
    },
    {
      id: 'vocab-drinks',
      title: { en: 'Drinks', zh: '饮品' },
      text: 'water milk tea coffee juice beer wine honey lemonade',
      hints: [h('水', 'life-giving liquid'), h('牛奶', 'white drink'), h('茶', 'brewed leaves'), h('咖啡', 'morning brew'), h('果汁', 'pressed fruit drink'), h('啤酒', 'bubbly alcohol'), h('葡萄酒', 'fermented grapes'), h('蜂蜜', 'sweet from bees'), h('柠檬水', 'sweet sour drink')],
    },
    {
      id: 'vocab-animals',
      title: { en: 'Animals', zh: '动物' },
      text: 'cat dog bird fish horse sheep tiger panda rabbit',
      hints: [h('猫', 'a furry pet'), h('狗', 'man’s best friend'), h('鸟', 'flies in the sky'), h('鱼', 'swims in water'), h('马', 'you can ride it'), h('羊', 'gives wool'), h('老虎', 'striped big cat'), h('熊猫', 'black and white bear'), h('兔子', 'has long ears')],
    },
    {
      id: 'vocab-body',
      title: { en: 'Body', zh: '身体' },
      text: 'head hand foot eye ear nose mouth arm leg',
      hints: [h('头', 'top of the body'), h('手', 'five fingers'), h('脚', 'stands on it'), h('眼睛', 'you see with them'), h('耳朵', 'you hear with them'), h('鼻子', 'you smell with it'), h('嘴', 'you speak with it'), h('手臂', 'between shoulder and hand'), h('腿', 'supports the body')],
    },
    {
      id: 'vocab-colors',
      title: { en: 'Colors', zh: '颜色' },
      text: 'red blue green yellow black white orange purple pink',
      hints: [h('红色', 'color of blood'), h('蓝色', 'color of the sky'), h('绿色', 'color of grass'), h('黄色', 'color of lemons'), h('黑色', 'color of night'), h('白色', 'color of snow'), h('橙色', 'color of oranges'), h('紫色', 'mix of red and blue'), h('粉色', 'light red')],
    },
    {
      id: 'vocab-numbers',
      title: { en: 'Numbers', zh: '数字' },
      text: 'one two three four five six seven eight nine ten',
      hints: [h('一', 'single'), h('二', 'a pair'), h('三', 'triangle has three'), h('四', 'four-leaf clover'), h('五', 'fingers on a hand'), h('六', 'half a dozen'), h('七', 'seven days a week'), h('八', 'octopus legs'), h('九', 'before ten'), h('十', 'two hands')],
    },
    {
      id: 'vocab-time',
      title: { en: 'Time', zh: '时间' },
      text: 'morning night today tomorrow week month year time minute',
      hints: [h('早上', 'start of the day'), h('晚上', 'end of the day'), h('今天', 'this day'), h('明天', 'the next day'), h('周', 'seven days'), h('月', 'about 30 days'), h('年', '12 months'), h('时间', 'measured by clocks'), h('分钟', '60 seconds')],
    },
    {
      id: 'vocab-verbs',
      title: { en: 'Verbs', zh: '动词' },
      text: 'go come see hear eat drink run walk read write',
      hints: [h('去', 'move away'), h('来', 'move toward'), h('看', 'use your eyes'), h('听', 'use your ears'), h('吃', 'put food in mouth'), h('喝', 'take a drink'), h('跑', 'move fast'), h('走', 'move slowly'), h('读', 'look at words'), h('写', 'put words on paper')],
    },
    {
      id: 'vocab-feelings',
      title: { en: 'Feelings', zh: '情绪' },
      text: 'happy sad angry tired hungry sleepy excited calm nervous',
      hints: [h('开心', 'feeling good'), h('难过', 'feeling down'), h('生气', 'strong displeasure'), h('累', 'need rest'), h('饿', 'need food'), h('困', 'need sleep'), h('兴奋', 'very happy about something'), h('平静', 'relaxed and quiet'), h('紧张', 'worried before something')],
    },
    {
      id: 'vocab-school',
      title: { en: 'School', zh: '学校' },
      text: 'book pen desk teacher student lesson test homework question',
      hints: [h('书', 'you read it'), h('钢笔', 'you write with it'), h('课桌', 'you study at it'), h('老师', 'teaches you'), h('学生', 'learns at school'), h('课', 'a class period'), h('测试', 'checks your knowledge'), h('作业', 'done after class'), h('问题', 'you ask it')],
    },
    {
      id: 'vocab-review',
      title: { en: 'Mixed review', zh: '综合练习' },
      text: 'apple water happy read book teacher cat ten time go',
      hints: [h('苹果', 'a round red fruit'), h('水', 'life-giving liquid'), h('开心', 'feeling good'), h('读', 'look at words'), h('书', 'you read it'), h('老师', 'teaches you'), h('猫', 'a furry pet'), h('十', 'two hands'), h('时间', 'measured by clocks'), h('去', 'move away')],
    },
  ],
}