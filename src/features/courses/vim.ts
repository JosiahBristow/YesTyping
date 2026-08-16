import type { Course } from './courseData'

export const vimCourse: Course = {
  id: 'vim',
  type: 'vim',
  icon: '🖥️',
  title: { en: 'Vim keys', zh: 'Vim 键位' },
  desc: {
    en: 'Drill the keystrokes that power Vim: hjkl movement, word jumps, edits, yanks and command-line commands.',
    zh: '训练 Vim 的核心按键：hjkl 移动、词跳转、编辑、复制粘贴与命令行命令。',
  },
  lessons: [
    {
      id: 'navigation-hjkl',
      title: { en: 'Navigation: hjkl', zh: '移动键：hjkl' },
      text: 'hjkl hjkl h j k l hh jj kk ll hjk lkj hjk lkj hjkl hjkl jkl hjk klh',
    },
    {
      id: 'word-line-motion',
      title: { en: 'Word & line motion', zh: '词与行移动' },
      text: 'w b e wb be ew wbe ebw w b e 0 $ ^ 0$ $0 wbe 0w $e bw ew',
    },
    {
      id: 'file-jumps',
      title: { en: 'File jumps', zh: '文件跳转' },
      text: 'gg G H M L ggG HML hm l gg G gg / n N /name n N gg G',
    },
    {
      id: 'edit-delete',
      title: { en: 'Edit & delete', zh: '编辑与删除' },
      text: 'x r d cw dw dd cc xd dw dd cw cc x dw dd cw cc xr dc',
    },
    {
      id: 'yank-put-undo',
      title: { en: 'Yank, put & undo', zh: '复制粘贴与撤销' },
      text: 'y p P u U yy pp yyp puu yP u U yy p P uu yy pp',
    },
    {
      id: 'insert-modes',
      title: { en: 'Insert modes', zh: '插入模式' },
      text: 'i a o I A O ia oa io i a o I A O ioa ia aoi oai',
    },
    {
      id: 'counts',
      title: { en: 'Count prefixes', zh: '次数前缀' },
      text: '2w 3e 4b 5j 6k 7h 8l 2dd 3yy 2dw 5cc 2w 3e 2dd 4b 5j',
    },
    {
      id: 'command-mode',
      title: { en: 'Command mode', zh: '命令模式' },
      text: ':w :q :wq :x :q! :wq! :w :q :wq :x :wq! :q! :w',
    },
  ],
}