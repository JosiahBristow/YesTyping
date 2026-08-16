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
import type { Course, Lesson } from './courseData'

const RAW_COURSES: Course[] = [
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

const EXPAND = 5

/** Repeat a lesson's drill text 5x (and its vocab hints alongside) so there is
 *  more material to build muscle memory on. Lesson ids/lengths are unchanged. */
function expandLesson(lesson: Lesson): Lesson {
  const text = Array.from({ length: EXPAND }, () => lesson.text).join(' ')
  const hints = lesson.hints
  if (hints) {
    const expanded = Array.from({ length: EXPAND }, () => hints).flat()
    return { ...lesson, text, hints: expanded }
  }
  return { ...lesson, text }
}

function expandCourse(course: Course): Course {
  return { ...course, lessons: course.lessons.map(expandLesson) }
}

export const COURSES: Course[] = RAW_COURSES.map(expandCourse)

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function courseLabel(course: Course, lessonIndex: number): string {
  const lesson = course.lessons[lessonIndex]
  return `${course.title.en} / ${lesson.title.en}`
}