import type { Course } from './courseData'

export const englishCourse: Course = {
  id: 'english',
  type: 'english',
  icon: '🔤',
  title: { en: 'English', zh: '英文练习' },
  desc: {
    en: 'Common words, everyday sentences and short paragraphs to build rhythm.',
    zh: '常用单词、日常句子与短文练习，培养输入节奏感。',
  },
  lessons: [
    {
      id: 'common-words',
      title: { en: 'Common words', zh: '常用单词' },
      text: 'the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take',
    },
    {
      id: 'capital-letters',
      title: { en: 'Capital letters', zh: '大写练习' },
      text: 'The Sun Rises In The East Every Morning. I Read A Book On Sunday. She Lives In A Small Town Near The River.',
    },
    {
      id: 'punctuation',
      title: { en: 'Punctuation', zh: '标点练习' },
      text: "How are you today? I am fine, thank you. Please, take your time. Don't rush; accuracy first! Slow is smooth, and smooth is fast.",
    },
    {
      id: 'simple-sentences',
      title: { en: 'Simple sentences', zh: '日常句子' },
      text: 'How are you today? I am fine, thank you. Nice to meet you. Where do you live? I live in a small town. What do you like to do? I like reading and writing. Please take your time, focus on the words, and let your fingers find the keys.',
    },
    {
      id: 'paragraph',
      title: { en: 'A short paragraph', zh: '短文练习' },
      text: 'Typing is a valuable skill in the modern world. With practice, your fingers will learn the keyboard by heart. Start slow, focus on accuracy, and speed will follow. Before long, the keys become an extension of your own hands.',
    },
    {
      id: 'quote',
      title: { en: 'An inspiring quote', zh: '励志名言' },
      text: 'Practice makes perfect, but patience makes progress. Every expert was once a beginner who refused to give up. Start slow, stay steady, and enjoy the journey.',
    },
  ],
}