import type { Course } from './courseData'

export const numbersCourse: Course = {
  id: 'numbers',
  type: 'numbers',
  icon: '🔢',
  title: { en: 'Numbers row', zh: '数字键位' },
  desc: {
    en: 'Learn the number row without looking: left hand covers 1-5, right hand covers 6-0.',
    zh: '练习盲打数字键：左手负责 1-5，右手负责 6-0。',
  },
  lessons: [
    {
      id: 'numbers-left',
      title: { en: 'Left hand 1-5', zh: '左手 1-5' },
      text: '1 2 3 4 5 1 2 3 4 5 12345 12345 54321 54321',
    },
    {
      id: 'numbers-right',
      title: { en: 'Right hand 6-0', zh: '右手 6-0' },
      text: '6 7 8 9 0 6 7 8 9 0 67890 67890 09876 09876',
    },
    {
      id: 'numbers-words',
      title: { en: 'Numbers in words', zh: '数字与单词' },
      text: 'the year is 2026 call at 10 30 number 555 1234 code 7890',
    },
    {
      id: 'numbers-mixed',
      title: { en: 'Full number row', zh: '数字行综合' },
      text: '1234567890 1234567890 1020 3040 5060 7080 90100 555123 888999 1234 5678 90',
    },
  ],
}