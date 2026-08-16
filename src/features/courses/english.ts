import type { Course } from './courseData'

export const englishCourse: Course = {
  id: 'english',
  type: 'english',
  icon: '🔤',
  title: { en: 'English', zh: '英文练习' },
  desc: {
    en: 'Common words, everyday vocabulary, questions, tongue twisters and short paragraphs to build rhythm and accuracy.',
    zh: '常用单词、生活词汇、疑问句、绕口令与短文练习，培养输入节奏与准确率。',
  },
  lessons: [
    {
      id: 'common-words',
      title: { en: 'Common words', zh: '常用单词' },
      text: 'the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take',
    },
    {
      id: 'home-words',
      title: { en: 'Home & city', zh: '居家与城市' },
      text: 'home house family room kitchen bedroom window door table chair sofa lamp garden street city village street road bridge park',
    },
    {
      id: 'food-words',
      title: { en: 'Food & drinks', zh: '饮食词汇' },
      text: 'breakfast lunch dinner bread rice noodles milk water tea coffee juice apple banana orange egg fish meat soup cake',
    },
    {
      id: 'time-words',
      title: { en: 'Time & seasons', zh: '时间词汇' },
      text: 'morning afternoon evening night today tomorrow yesterday week month year spring summer autumn winter Monday Sunday weekend hour minute',
    },
    {
      id: 'numbers-words',
      title: { en: 'Number words', zh: '数字单词' },
      text: 'one two three four five six seven eight nine ten eleven twelve twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million',
    },
    {
      id: 'capital-letters',
      title: { en: 'Capital letters', zh: '大写练习' },
      text: 'The Sun Rises In The East Every Morning. I Read A Book On Sunday. She Lives In A Small Town Near The River. My Brother Studies At A University In Beijing.',
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
      id: 'question-sentences',
      title: { en: 'Question sentences', zh: '疑问句' },
      text: 'What is your name? Where are you from? How old are you? When do you get up? Why do you study English? What do you do on the weekend? Do you like coffee or tea?',
    },
    {
      id: 'work-school',
      title: { en: 'Work & school', zh: '工作与学习' },
      text: 'teacher student school book pen pencil paper desk computer keyboard screen mouse office meeting project report homework test exam',
    },
    {
      id: 'travel',
      title: { en: 'Travel', zh: '旅行' },
      text: 'travel trip airport station hotel map train bus taxi ticket luggage passport camera seaside mountain city tour guide',
    },
    {
      id: 'paragraph',
      title: { en: 'A short paragraph', zh: '短文练习' },
      text: 'Typing is a valuable skill in the modern world. With practice, your fingers will learn the keyboard by heart. Start slow, focus on accuracy, and speed will follow. Before long, the keys become an extension of your own hands.',
    },
    {
      id: 'tongue-twisters',
      title: { en: 'Tongue twisters', zh: '绕口令' },
      text: 'She sells seashells by the seashore. The quick brown fox jumps over the lazy dog. Peter Piper picked a peck of pickled peppers.',
    },
    {
      id: 'quote',
      title: { en: 'An inspiring quote', zh: '励志名言' },
      text: 'Practice makes perfect, but patience makes progress. Every expert was once a beginner who refused to give up. Start slow, stay steady, and enjoy the journey.',
    },
    {
      id: 'english-review',
      title: { en: 'Mixed review', zh: '综合练习' },
      text: 'Every expert was once a beginner. Start slow and stay steady. Practice every day, and your speed will grow. What is your name? Where are you from? Nice to meet you. Home sweet home. Time is money. Practice makes perfect.',
    },
  ],
}