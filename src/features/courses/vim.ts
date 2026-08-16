import type { Course } from './courseData'

export const vimCourse: Course = {
  id: 'vim',
  type: 'vim',
  icon: '🖥️',
  title: { en: 'Vim keys', zh: 'Vim 键位' },
  desc: {
    en: 'A complete Vim keystroke course: movement, editing, operators, text objects, visual mode, registers and command-line commands — drilled until your fingers remember.',
    zh: '完整的 Vim 按键课程：移动、编辑、操作符、文本对象、可视模式、寄存器与命令行命令，练到手指记住为止。',
  },
  lessons: [
    {
      id: 'navigation-hjkl',
      title: { en: 'Navigation: hjkl', zh: '移动键：hjkl' },
      text: 'hjkl hjkl h j k l hh jj kk ll hjk lkj hjk lkj hjkl hjkl jkl hjk klh',
    },
    {
      id: 'word-motion',
      title: { en: 'Word motion: w b e', zh: '词移动：w b e' },
      text: 'w b e ge wb be ew ge wbe ebw ge w b e ge wbe wb e ge wb be',
    },
    {
      id: 'line-motion',
      title: { en: 'Line motion: 0 $ ^', zh: '行移动：0 $ ^' },
      text: '0 $ ^ 0$ $0 ^0 0w $e ^b 0 $ ^ 0$ 0w $e ^b $0 0^',
    },
    {
      id: 'search',
      title: { en: 'Search: / ? n N', zh: '搜索：/ ? n N' },
      text: '/ n N ? n /name ?name N / n / n ? ? n /name ? N',
    },
    {
      id: 'insert-modes',
      title: { en: 'Insert modes: i a o', zh: '插入模式：i a o' },
      text: 'i a o I A O ia oa io i a o I A O ioa ia aoi oai',
    },
    {
      id: 'edit-keys',
      title: { en: 'Edit keys: x r s', zh: '编辑键：x r s' },
      text: 'x X s S xr xs r s xX x S xs s x r s x X s S xr',
    },
    {
      id: 'undo-repeat',
      title: { en: 'Undo & repeat: u U .', zh: '撤销与重复：u U .' },
      text: 'u U . uU Uu u . u . u . uu UU .. u . u UU',
    },
    {
      id: 'operators',
      title: { en: 'Operators: d c y', zh: '操作符：d c y' },
      text: 'd c y dd cc yy dw cw yw d c y dc yd dy dd cc yy',
    },
    {
      id: 'operator-motions',
      title: { en: 'Operator + motion', zh: '操作符 + 移动' },
      text: 'dw d$ d0 cw c$ yw y$ dd yy d^ c^ y^ dw d$ cw dd yy',
    },
    {
      id: 'text-objects',
      title: { en: 'Text objects: iw i" it', zh: '文本对象：iw i" it' },
      text: 'iw aw i" a" i( a( it at ciw diw yit cit di" ci" iw aw it',
    },
    {
      id: 'visual-mode',
      title: { en: 'Visual mode: v V', zh: '可视模式：v V' },
      text: 'v V vw ve v$ vw y ve y v$ d vwy vw d v y d',
    },
    {
      id: 'counts',
      title: { en: 'Count prefixes', zh: '次数前缀' },
      text: '2w 3e 4b 5j 6k 7h 8l 2dd 3yy 2dw 5cc 3d$ 2ciw 4b 5j',
    },
    {
      id: 'registers',
      title: { en: 'Registers: "a', zh: '寄存器："a' },
      text: '"a yy "b p "ay "a p "b p "0 yy "a p "b p "ay',
    },
    {
      id: 'command-mode',
      title: { en: 'Command mode', zh: '命令模式' },
      text: ':w :q :wq :x :q! :wq! :w :split :vsplit :bn :bd :wq :x',
    },
    {
      id: 'vim-review',
      title: { en: 'Vim review', zh: '综合练习' },
      text: 'gg G 0 $ w b e /word n dd yy p u gg G :wq dd 3j 2dw ciw',
    },
    {
      id: 'motions-mixed',
      title: { en: 'Motions: mixed', zh: '移动键：混合' },
      text: 'w b e ge 0 $ ^ gg G 2w 3b 4e gg G 0 $ w b e ge 3j 2k G gg 5w 3e',
    },
    {
      id: 'yank-paste',
      title: { en: 'Yank & paste', zh: '复制与粘贴' },
      text: 'yy p yw p yy p yw p dd p ddp yyp yiw p viw y y$ p y0 p',
    },
    {
      id: 'insert-combos',
      title: { en: 'Insert combos', zh: '插入组合' },
      text: 'i a I A o O iw aw ia io a I O A i o a i a I cw cc ciw c$ c0',
    },
  ],
}