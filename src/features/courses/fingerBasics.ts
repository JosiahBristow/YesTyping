import type { Course } from './courseData'

export const fingerBasics: Course = {
  id: 'finger-basics',
  type: 'finger',
  icon: '⌨️',
  title: { en: 'Finger basics', zh: '指法基础' },
  desc: {
    en: 'Progressive touch-typing drills: home row first, then top and bottom rows.',
    zh: '循序渐进的盲打练习：从基准键位开始，逐步加入上排与下排。',
  },
  lessons: [
    {
      id: 'home-row',
      title: { en: 'Home row', zh: '基准键位' },
      text: 'asdf jkl; asdf jkl; asdf jkl; a;sldkfj a;sldkfj a;sldkfj asdf jkl;',
    },
    {
      id: 'top-row',
      title: { en: 'Top row', zh: '上排键位' },
      text: 'qwer uiop qwer uiop asdf jkl; asdf jkl; we are to use the word for your idea qwer uiop',
    },
    {
      id: 'bottom-row',
      title: { en: 'Bottom row', zh: '下排键位' },
      text: 'zxcvbnm zxcvbnm zxcvbnm the quick brown fox jumps over a lazy dog van man zebra box',
    },
    {
      id: 'alphabet',
      title: { en: 'Full alphabet', zh: '全字母表' },
      text: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz pack my box with five dozen liquor jugs',
    },
    {
      id: 'pangrams',
      title: { en: 'Pangrams', zh: '字母全句' },
      text: 'The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.',
    },
  ],
}