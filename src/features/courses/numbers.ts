import type { Course } from './courseData'

export const numbersCourse: Course = {
  id: 'numbers',
  type: 'numbers',
  icon: '🔢',
  title: { en: 'Numbers row', zh: '数字键位' },
  desc: {
    en: 'Learn the number row without looking: one or two keys per lesson, repeated until your fingers remember.',
    zh: '练习盲打数字键：每节只练一两个数字，反复练习直到手指记住。',
  },
  lessons: [
    {
      id: 'num-1',
      title: { en: 'Key 1', zh: '数字 1' },
      text: '1111 1111 1 11 111 1111 1111 11 1 111 11 1 1111',
    },
    {
      id: 'num-2',
      title: { en: 'Key 2', zh: '数字 2' },
      text: '2222 2222 2 22 222 2222 2222 22 2 222 22 2 2222',
    },
    {
      id: 'num-3',
      title: { en: 'Key 3', zh: '数字 3' },
      text: '3333 3333 3 33 333 3333 3333 33 3 333 33 3 3333',
    },
    {
      id: 'num-45',
      title: { en: 'Keys 4-5', zh: '数字 4-5' },
      text: '4 5 45 45 4554 5445 45 45 4 5 45 45 4554 5445 45',
    },
    {
      id: 'num-67',
      title: { en: 'Keys 6-7', zh: '数字 6-7' },
      text: '6 7 67 67 6776 7667 67 67 6 7 67 67 6776 7667 67',
    },
    {
      id: 'num-8',
      title: { en: 'Key 8', zh: '数字 8' },
      text: '8888 8888 8 88 888 8888 8888 88 8 888 88 8 8888',
    },
    {
      id: 'num-9',
      title: { en: 'Key 9', zh: '数字 9' },
      text: '9999 9999 9 99 999 9999 9999 99 9 999 99 9 9999',
    },
    {
      id: 'num-0',
      title: { en: 'Key 0', zh: '数字 0' },
      text: '0000 0000 0 00 000 0000 0000 00 0 000 00 0 0000',
    },
    {
      id: 'num-left',
      title: { en: 'Left hand 1-5', zh: '左手 1-5' },
      text: '12345 12345 12345 54321 54321 54321 123 345 543 321',
    },
    {
      id: 'num-right',
      title: { en: 'Right hand 6-0', zh: '右手 6-0' },
      text: '67890 67890 67890 09876 09876 09876 678 890 098 876',
    },
    {
      id: 'num-mixed',
      title: { en: 'Full number row', zh: '数字行综合' },
      text: '1234567890 1234567890 1020 3040 5060 7080 90100 555123 888999 1234 5678 90',
    },
    {
      id: 'num-words',
      title: { en: 'Numbers in words', zh: '数字与单词' },
      text: 'the year is 2026 call at 10 30 number 555 1234 code 7890',
    },
  ],
}