import type { Bi } from '../../lib/lang'

export type CourseType = 'finger' | 'english' | 'numbers' | 'vim' | 'pinyin' | 'chinese' | 'code' | 'numpad' | 'vocab' | 'symbols'

export interface Lesson {
  id: string
  title: Bi
  text: string
  hints?: Bi[]
}

export interface Course {
  id: string
  type: CourseType
  icon: string
  title: Bi
  desc: Bi
  lessons: Lesson[]
}