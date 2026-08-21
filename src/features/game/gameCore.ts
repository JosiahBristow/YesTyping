import type { Bi } from '../../lib/lang'

export type GameId = 'word-rain' | 'shooter' | 'zombies' | 'memory' | 'snake' | 'rhythm'

export interface GameMeta {
  id: GameId
  icon: string
  title: Bi
  desc: Bi
  howto: Bi
  storageKey: string
}

const bestKey = (id: GameId) => `yestyping.game.best.${id}`

export const GAMES: GameMeta[] = [
  {
    id: 'word-rain',
    icon: '🌧️',
    title: { en: 'Word Rain', zh: '单词雨' },
    desc: {
      en: 'Type falling words before they hit the ground.',
      zh: '输入下落的单词将其消灭，别被淋湿。',
    },
    howto: {
      en: 'Words are falling — type each one to zap it. Missing a word costs a life.',
      zh: '单词正在下落——输入每个单词将其消灭。漏掉一个单词会损失一条生命。',
    },
    storageKey: 'yestyping.gameBest',
  },
  {
    id: 'shooter',
    icon: '🎯',
    title: { en: 'Word Shooter', zh: '单词射击' },
    desc: {
      en: 'Take aim and type to shoot moving targets.',
      zh: '瞄准目标，输入单词将其击毁。',
    },
    howto: {
      en: 'Targets appear on the field — type each word to fire a shot. Combo keeps growing on hit streaks.',
      zh: '靶子出现在场上——输入单词即可开枪射击。连续命中会积累连击。',
    },
    storageKey: bestKey('shooter'),
  },
  {
    id: 'zombies',
    icon: '🧟',
    title: { en: 'Zombie Siege', zh: '僵尸围城' },
    desc: {
      en: 'Type to blast zombies before they reach you.',
      zh: '输入单词消灭僵尸，别让它们靠近。',
    },
    howto: {
      en: 'Zombies march in from the left. Type each one\'s word to kill it before it reaches the wall.',
      zh: '僵尸从左侧涌来。输入它头顶的单词将其消灭，别让它走到右侧城墙。',
    },
    storageKey: bestKey('zombies'),
  },
  {
    id: 'memory',
    icon: '🧠',
    title: { en: 'Flash Words', zh: '闪词记忆' },
    desc: {
      en: 'Memorize flashing words and retype them from scratch.',
      zh: '记住一闪而过的单词，凭记忆重新打出。',
    },
    howto: {
      en: 'Words flash briefly, then vanish. Retype them in order before your memory fades.',
      zh: '单词会短暂闪现后消失。趁记忆还在，按顺序把它们打出来。',
    },
    storageKey: bestKey('memory'),
  },
  {
    id: 'snake',
    icon: '🐍',
    title: { en: 'Typing Snake', zh: '贪吃蛇打字' },
    desc: {
      en: 'Type food words to feed a growing snake.',
      zh: '输入食物单词喂养不断变长的蛇。',
    },
    howto: {
      en: 'Steer the snake with the arrow keys and type the food\'s word to eat it. Each meal grows the snake.',
      zh: '用方向键操控蛇，输入食物的单词吃掉它。每吃一个食物蛇都会变长。',
    },
    storageKey: bestKey('snake'),
  },
  {
    id: 'rhythm',
    icon: '🎵',
    title: { en: 'Rhythm Tiles', zh: '音乐节奏' },
    desc: {
      en: 'Hit the falling tiles to the beat.',
      zh: '跟随节奏敲击下落的方法块。',
    },
    howto: {
      en: 'Tiles fall down the lanes. When a tile crosses the line, type its letter to hit it. Keep the combo alive!',
      zh: '方块沿轨道下落。当方块到达判定线时，输入它的字母完成敲击。保持连击！',
    },
    storageKey: bestKey('rhythm'),
  },
]

export function loadBest(id: GameId): number {
  try {
    const key = GAMES.find((g) => g.id === id)?.storageKey
    if (!key) return 0
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

export function saveBest(id: GameId, score: number): number {
  try {
    const key = GAMES.find((g) => g.id === id)?.storageKey
    if (!key) return 0
    const prev = Number(localStorage.getItem(key)) || 0
    if (score > prev) localStorage.setItem(key, String(score))
    return Math.max(prev, score)
  } catch {
    return 0
  }
}