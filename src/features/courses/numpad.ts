import type { Course } from './courseData'

export const numpadCourse: Course = {
  id: 'numpad',
  type: 'numpad',
  icon: '🧮',
  title: { en: 'Numpad', zh: '数字小键盘' },
  desc: {
    en: 'Master the numeric keypad: digits, decimals and operators, drilled until your right hand finds them without looking.',
    zh: '练习数字小键盘：数字、小数点与运算符，反复练习直到右手能盲打。',
  },
  lessons: [
    {
      id: 'numpad-hello',
      title: { en: 'Warm up', zh: '热身' },
      text: '777 888 999 444 555 666 111 222 333 000 111 222 333 444 555 666 777 888 999',
    },
    {
      id: 'numpad-rows',
      title: { en: 'Number rows', zh: '数字分区' },
      text: '789 456 123 0 789 456 123 0 741 852 963 0 147 258 369 0',
    },
    {
      id: 'numpad-alternate',
      title: { en: 'Cross patterns', zh: '交叉练习' },
      text: '147 258 369 951 852 963 741 369 258 147 159 357 246 248 159 357',
    },
    {
      id: 'numpad-top',
      title: { en: 'Top keys 7 8 9', zh: '上排 7 8 9' },
      text: '777 888 999 789 987 789 987 77 88 99 79 97 78 87 89 98 789 987',
    },
    {
      id: 'numpad-mid',
      title: { en: 'Middle keys 4 5 6', zh: '中排 4 5 6' },
      text: '444 555 666 456 654 456 654 44 55 66 46 64 45 54 56 65 456 654',
    },
    {
      id: 'numpad-bottom',
      title: { en: 'Bottom keys 1 2 3 0', zh: '下排 1 2 3 0' },
      text: '111 222 333 000 123 321 123 321 012 210 102 201 1230 3210 0123 2103',
    },
    {
      id: 'numpad-decimals',
      title: { en: 'Decimals', zh: '小数点' },
      text: '1.5 2.5 3.14 0.5 10.25 99.99 3.14159 2.71828 6.5 0.75 42.0',
    },
    {
      id: 'numpad-ops',
      title: { en: 'Operators', zh: '运算符' },
      text: '7+8 9-3 4*6 12/4 5+9 100-7 8*8 81/9 6+6 20-9 3*7 72/8',
    },
    {
      id: 'numpad-mixed',
      title: { en: 'Mixed math', zh: '混合运算' },
      text: '123+456 789-123 12*34 56/8 1000-999 7+8+9 50*3 144/12',
    },
    {
      id: 'numpad-phone',
      title: { en: 'Phone numbers', zh: '电话号码' },
      text: '138 0013 8000 010 8888 6666 9527 10086 12306 110 120 119 114',
    },
    {
      id: 'numpad-dates',
      title: { en: 'Dates & years', zh: '日期年份' },
      text: '2026 0824 1989 2001 0910 2400 0606 1998 2024 0101 1225 0714',
    },
    {
      id: 'numpad-review',
      title: { en: 'Numpad review', zh: '综合练习' },
      text: '7*8+6 9/3-1 45+67 89-12 3.14*2 100/4 8888-7777 12.5+7.5',
    },
  ],
}