import type { Course } from './courseData'

export const fingerBasics: Course = {
  id: 'finger-basics',
  type: 'finger',
  icon: '⌨️',
  title: { en: 'Finger basics', zh: '指法基础' },
  desc: {
    en: 'A step-by-step path for beginners: home row first, then one new row at a time, ending with capitals and full sentences.',
    zh: '为新手设计的循序渐进课程：先基准键位，再逐行加入新键，最后掌握大写与完整句子。',
  },
  lessons: [
    {
      id: 'home-row',
      title: { en: 'Home row', zh: '基准键位' },
      text: 'asdf jkl; asdf jkl; a;sldkfj asdf jkl; a;sldkfj asdf jkl;',
    },
    {
      id: 'home-row-gh',
      title: { en: 'Add G and H', zh: '加入 G 和 H' },
      text: 'gfhj gfhj asdf ghjk asdf jkl; ghdkslfa ghdkslfa ghfkdsla',
    },
    {
      id: 'home-row-words',
      title: { en: 'Home row words', zh: '基准键位单词' },
      text: 'ask dad all add lad sad glad glass flask shall half flag salad fall lads has had gas dash',
    },
    {
      id: 'home-row-sentences',
      title: { en: 'Home row sentences', zh: '基准键位句子' },
      text: 'a lad had a flask; a sad lad shall ask; all glass fell; dad had a salad; flash a gas lad; ask a lad; all lads dash',
    },
    {
      id: 'top-row',
      title: { en: 'Top row', zh: '上排键位' },
      text: 'qwer uiop qwer uiop qwertyuiop asdf jkl; qwertyuiop asdf jkl;',
    },
    {
      id: 'top-row-words',
      title: { en: 'Top row words', zh: '上排键位单词' },
      text: 'we are for you your our out use type write quote power read dead fear lead seal year ready tree trip',
    },
    {
      id: 'top-row-sentences',
      title: { en: 'Top row sentences', zh: '上排键位句子' },
      text: 'you write your word; we quote the power of water; type ready or quit; the tree is up your way; we read your year;',
    },
    {
      id: 'bottom-row',
      title: { en: 'Bottom row', zh: '下排键位' },
      text: 'zxcvbnm zxcvbnm zxcvbnm zxcvbnm asdf jkl; qwertyuiop',
    },
    {
      id: 'bottom-row-words',
      title: { en: 'Bottom row words', zh: '下排键位单词' },
      text: 'can van ban man come next move jump box mix zinc calm number never very cake back name make milk jam moon noon',
    },
    {
      id: 'alphabet',
      title: { en: 'Full alphabet', zh: '全字母表' },
      text: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz pack my box with five dozen liquor jugs',
    },
    {
      id: 'capital-letters',
      title: { en: 'Capital letters', zh: '大写字母' },
      text: 'The Quick Brown Fox Jumps Over The Lazy Dog. I Love To Type On My New Keyboard. Yes, Typing Is Fun!',
    },
    {
      id: 'pangrams',
      title: { en: 'Pangrams', zh: '字母全句' },
      text: 'The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.',
    },
  ],
}