import { fingerBasics } from './fingerBasics'
import { englishCourse } from './english'
import { numbersCourse } from './numbers'
import type { Course } from './courseData'

export const COURSES: Course[] = [fingerBasics, englishCourse, numbersCourse]

export function getCourse(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function courseLabel(course: Course, lessonIndex: number): string {
  const lesson = course.lessons[lessonIndex]
  return `${course.title.en} / ${lesson.title.en}`
}