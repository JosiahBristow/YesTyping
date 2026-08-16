import { fingerBasics } from './fingerBasics'
import { englishCourse } from './english'
import { numbersCourse } from './numbers'
import { vimCourse } from './vim'
import { pinyinCourse } from './pinyin'
import { chineseCourse } from './chinese'
import { codeCourse } from './code'
import { numpadCourse } from './numpad'
import { vocabCourse } from './vocab'
import { symbolsCourse } from './symbols'
import type { Course } from './courseData'

export const COURSES: Course[] = [
  fingerBasics,
  englishCourse,
  numbersCourse,
  symbolsCourse,
  codeCourse,
  numpadCourse,
  vimCourse,
  pinyinCourse,
  chineseCourse,
  vocabCourse,
]

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function courseLabel(course: Course, lessonIndex: number): string {
  const lesson = course.lessons[lessonIndex]
  return `${course.title.en} / ${lesson.title.en}`
}