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

const EXPAND = 3

/** Repeat a lesson's drill text (and its vocab hints alongside) so there is
 *  more material to build muscle memory on. Lesson ids/lengths are unchanged. */
function expandLesson(lesson: Lesson): Lesson {
  const text = Array.from({ length: EXPAND }, () => lesson.text).join(' ')
  const hints = lesson.hints
  const hanzi = lesson.hanzi ? Array.from({ length: EXPAND }, () => lesson.hanzi).join(' ') : lesson.hanzi
  if (hints) {
    const expanded = Array.from({ length: EXPAND }, () => hints).flat()
    return { ...lesson, text, hints: expanded, hanzi }
  }
  return { ...lesson, text, hanzi }
}

function expandCourse(course: Course): Course {
  return { ...course, lessons: course.lessons.map(expandLesson) }
}

/** The final lesson of every course: one long drill that mixes the raw text
 *  of all the course's lessons (full character set, higher difficulty). */
function reviewLesson(course: Course): Lesson {
  const all = course.lessons
  const hanzi = all.every((l) => l.hanzi) ? all.map((l) => l.hanzi).join(' ') : undefined
  const hints = all.every((l) => l.hints) ? all.flatMap((l) => l.hints!) : undefined
  return {
    id: 'comprehensive',
    title: { en: 'Comprehensive practice', zh: '综合大练习' },
    text: all.map((l) => l.text).join(' '),
    hanzi,
    hints,
  }
}

export const COURSES: Course[] = RAW_COURSES.map((course) => {
  const expanded = expandCourse(course)
  return { ...expanded, lessons: [...expanded.lessons, reviewLesson(course)] }
})

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function courseLabel(course: Course, lessonIndex: number): string {
  const lesson = course.lessons[lessonIndex]
  return `${course.title.en} / ${lesson.title.en}`
}