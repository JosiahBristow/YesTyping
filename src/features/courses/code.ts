import type { Course } from './courseData'

export const codeCourse: Course = {
  id: 'code',
  type: 'code',
  icon: '💻',
  title: { en: 'Code typing', zh: '代码练习' },
  desc: {
    en: 'Type real snippets from bash, Python, JavaScript, HTML and CSS — the fastest way to master the symbol keys.',
    zh: '输入真实的 bash、Python、JavaScript、HTML 与 CSS 片段，快速掌握各类符号键位。',
  },
  lessons: [
    {
      id: 'code-symbols',
      title: { en: 'Symbol keys', zh: '符号键位' },
      text: '{ } ( ) [ ] < > ; : \' " / \\ . , ! ? _ - = + * & % $ # @ ~ ^ |',
    },
    {
      id: 'bash-hello',
      title: { en: 'Bash: hello', zh: 'Bash：输出' },
      text: 'echo "hello world" && echo "welcome to bash"',
    },
    {
      id: 'bash-files',
      title: { en: 'Bash: files', zh: 'Bash：文件' },
      text: 'cd ~/projects && mkdir app && ls -la && pwd && touch readme.md',
    },
    {
      id: 'bash-pipes',
      title: { en: 'Bash: pipes', zh: 'Bash：管道' },
      text: 'cat log.txt | grep "error" | sort | uniq -c | head -20',
    },
    {
      id: 'bash-vars',
      title: { en: 'Bash: variables', zh: 'Bash：变量' },
      text: 'name="alice" && export PATH=$PATH:/usr/bin && echo "name=$name"',
    },
    {
      id: 'python-hello',
      title: { en: 'Python: hello', zh: 'Python：输出' },
      text: 'print("hello, world") print(2 + 3 * 4) print("python is fun")',
    },
    {
      id: 'python-vars',
      title: { en: 'Python: variables', zh: 'Python：变量' },
      text: 'name = "alice" age = 30 total = 50 + 7 print(name, age, total)',
    },
    {
      id: 'python-functions',
      title: { en: 'Python: functions', zh: 'Python：函数' },
      text: 'def add(a, b): return a + b result = add(3, 4) print(result)',
    },
    {
      id: 'python-loops',
      title: { en: 'Python: loops', zh: 'Python：循环' },
      text: 'for i in range(10): print(i) for word in words: print(word.upper())',
    },
    {
      id: 'python-strings',
      title: { en: 'Python: strings', zh: 'Python：字符串' },
      text: 'text = "Hello Python" print(text[0]) print(text.lower()) print(len(text))',
    },
    {
      id: 'js-hello',
      title: { en: 'JavaScript: hello', zh: 'JavaScript：输出' },
      text: 'console.log("Hello, world!"); console.log(1 + 2); console.log("done");',
    },
    {
      id: 'js-functions',
      title: { en: 'JavaScript: functions', zh: 'JavaScript：函数' },
      text: 'const double = (n) => n * 2; function greet(name) { return "hi " + name; }',
    },
    {
      id: 'js-dom',
      title: { en: 'JavaScript: DOM', zh: 'JavaScript：DOM' },
      text: 'document.querySelector("#app").textContent = "hi"; const btn = document.getElementById("btn");',
    },
    {
      id: 'html-css',
      title: { en: 'HTML & CSS', zh: 'HTML 与 CSS' },
      text: '<a href="https://example.com">click</a> body { background: #fff; color: #333; }',
    },
    {
      id: 'code-review',
      title: { en: 'Code review', zh: '综合练习' },
      text: 'print("hello") console.log("ok") cd /home/user && ls -la body { color: #333; }',
    },
    {
      id: 'js-arrays',
      title: { en: 'JavaScript: arrays', zh: 'JavaScript：数组' },
      text: 'const list = [1, 2, 3]; list.push(4); console.log(list.length); list.pop();',
    },
    {
      id: 'python-dicts',
      title: { en: 'Python: dicts', zh: 'Python：字典' },
      text: 'user = {"name": "alice", "age": 30} print(user["name"]) user["city"] = "beijing"',
    },
    {
      id: 'css-layout',
      title: { en: 'CSS: layout', zh: 'CSS：布局' },
      text: '.row { display: flex; gap: 16px; } @media (max-width: 600px) { .row { flex-direction: column; } }',
    },
  ],
}