import type { Bi } from '../../lib/lang'

export type CourseType = 'finger' | 'english' | 'numbers' | 'vim'

export interface Lesson {
  id: string
  title: Bi
  text: string
}

export interface Course {
  id: string
  type: CourseType
  icon: string
  title: Bi
  desc: Bi
  lessons: Lesson[]
}