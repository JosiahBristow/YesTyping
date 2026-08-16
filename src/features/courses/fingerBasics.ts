import type { Course } from './courseData'

export const fingerBasics: Course = {
  id: 'finger-basics',
  type: 'finger',
  icon: '⌨️',
  title: { en: 'Finger basics', zh: '指法基础' },
  desc: {
    en: 'A step-by-step path for beginners: one or two new keys per lesson, repeated until your fingers remember.',
    zh: '为新手设计的循序渐进课程：每节只学一两个新键，反复练习直到手指记住。',
  },
  lessons: [
    {
      id: 'fj',
      title: { en: 'F and J', zh: 'F 与 J' },
      text: 'ffff jjjj ffff jjjj fj fj fj fj fjfj fjfj jffj fjjf fjfj f j f j f j f j',
    },
    {
      id: 'dk',
      title: { en: 'D and K', zh: 'D 与 K' },
      text: 'dddd kkkk dddd kkkk dk dk dk dk dkdk dkdk kddk dkkd dkdk d k d k d k d k',
    },
    {
      id: 'sl',
      title: { en: 'S and L', zh: 'S 与 L' },
      text: 'ssss llll ssss llll sl sl sl sl slsl slsl lssl slls slsl s l s l s l s l',
    },
    {
      id: 'a-semicolon',
      title: { en: 'A and ;', zh: 'A 与分号' },
      text: 'aaaa ;;;; aaaa ;;;; a; a; a; a; a;a; a;a; ;aa; a;;a a; a ; a ; a ; a ;',
    },
    {
      id: 'gh',
      title: { en: 'G and H', zh: 'G 与 H' },
      text: 'gggg hhhh gggg hhhh gh gh gh gh ghgh ghgh hggh ghhg ghgh g h g h g h g h',
    },
    {
      id: 'home-left',
      title: { en: 'Left home row', zh: '左手基准键' },
      text: 'asdf asdf asdf asdf fdsa fdsa fdsa fdsa add add add sad sad sad fall fall fall',
    },
    {
      id: 'home-right',
      title: { en: 'Right home row', zh: '右手基准键' },
      text: 'jkl; jkl; jkl; jkl; ;lkj ;lkj ;lkj ;lkj all all all lads lads flask flask flask',
    },
    {
      id: 'home-row',
      title: { en: 'Home row', zh: '基准键位' },
      text: 'asdf jkl; asdf jkl; asdf jkl; a;sldkfj a;sldkfj asdf jkl; ask dad add sad all glass flask salad fall lads had gas dash',
    },
    {
      id: 'ei',
      title: { en: 'E and I', zh: 'E 与 I' },
      text: 'eeee iiii eeee iiii ei ei ei ei eiei eiei ieei eiie eiei e i e i e i e i',
    },
    {
      id: 'ru',
      title: { en: 'R and U', zh: 'R 与 U' },
      text: 'rrrr uuuu rrrr uuuu ru ru ru ru ruru ruru urru ruur ruru r u r u r u r u',
    },
    {
      id: 'ty',
      title: { en: 'T and Y', zh: 'T 与 Y' },
      text: 'tttt yyyy tttt yyyy ty ty ty ty tyty tyty ytty tyyt tyty t y t y t y t y',
    },
    {
      id: 'wo',
      title: { en: 'W and O', zh: 'W 与 O' },
      text: 'wwww oooo wwww oooo wo wo wo wo wowo wowo owwo woow wowo w o w o w o w o',
    },
    {
      id: 'qp',
      title: { en: 'Q and P', zh: 'Q 与 P' },
      text: 'qqqq pppp qqqq pppp qp qp qp qp qpqp qpqp pqqp qppq qpqp q p q p q p q p',
    },
    {
      id: 'top-row',
      title: { en: 'Top row', zh: '上排键位' },
      text: 'qwertyuiop qwertyuiop qwertyuiop qwerty qwerty uiop uiop poiuytrewq poiuytrewq',
    },
    {
      id: 'top-home',
      title: { en: 'Top + home row', zh: '上排与基准键' },
      text: 'qwertyuiop asdf jkl; qwertyuiop asdf jkl; the type your word read ready tree trip power water year you',
    },
    {
      id: 'vm',
      title: { en: 'V and M', zh: 'V 与 M' },
      text: 'vvvv mmmm vvvv mmmm vm vm vm vm vmvm vmvm mvvm vmmv vmvm v m v m v m v m',
    },
    {
      id: 'c-comma',
      title: { en: 'C and comma', zh: 'C 与逗号' },
      text: 'cccc ,,,, cccc ,,,, c, c, c, c, c,c, c,c, ,cc, c,,c c, c , c , c , c ,',
    },
    {
      id: 'x-period',
      title: { en: 'X and period', zh: 'X 与句点' },
      text: 'xxxx .... xxxx .... x. x. x. x. x.x. x.x. .xx. x..x x. x . x . x . x .',
    },
    {
      id: 'z-slash',
      title: { en: 'Z and slash', zh: 'Z 与斜杠' },
      text: 'zzzz //// zzzz //// z/ z/ z/ z/ z/z/ z/z/ /zz/ z//z z/ z / z / z / z /',
    },
    {
      id: 'bn',
      title: { en: 'B and N', zh: 'B 与 N' },
      text: 'bbbb nnnn bbbb nnnn bn bn bn bn bnbn bnbn nb bn nbbn bnnb bnbn b n b n b n b n',
    },
    {
      id: 'bottom-row',
      title: { en: 'Bottom row', zh: '下排键位' },
      text: 'zxcvbnm zxcvbnm zxcvbnm zxcvbnm nmvcbxz nmvcbxz zinc calm number never move jump box mix cake back',
    },
    {
      id: 'all-rows',
      title: { en: 'All rows', zh: '全键位' },
      text: 'qwertyuiop asdfghjkl zxcvbnm qwertyuiop asdfghjkl zxcvbnm the quick brown fox jumps over lazy dog five boxing wizards',
    },
    {
      id: 'alphabet',
      title: { en: 'Full alphabet', zh: '全字母表' },
      text: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz pack my box with five dozen liquor jugs',
    },
    {
      id: 'capital-letters',
      title: { en: 'Capital letters', zh: '大写字母' },
      text: 'The Quick Brown Fox Jumps Over The Lazy Dog. I Love To Type On My New Keyboard. Yes, Typing Is Fun!',
    },
    {
      id: 'pangrams',
      title: { en: 'Pangrams', zh: '字母全句' },
      text: 'The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.',
    },
    {
      id: 'digraph-th',
      title: { en: 'Digraph: th', zh: '组合键：th' },
      text: 'th th th th th the that this them then with think thing three though through thank both month earth',
    },
    {
      id: 'digraph-he',
      title: { en: 'Digraph: he', zh: '组合键：he' },
      text: 'he he he he he he here her have head help when where which what whom whose health heavy heart',
    },
    {
      id: 'common-words',
      title: { en: 'Common words', zh: '高频单词' },
      text: 'and for are but not you all can had her was one our out day get from time like just know take',
    },
    {
      id: 'shift-words',
      title: { en: 'Shift practice', zh: '大写单词' },
      text: 'The This That These Those There Then Than Which What When Where Who How Every Great Day Today',
    },
    {
      id: 'number-shift',
      title: { en: 'Numbers & symbols', zh: '数字与符号' },
      text: '1! 2@ 3# 4$ 5% 6^ 7& 8* 9( 0) 1! 2@ 3# 4$ 5% 6^ 7& 8* 9( 0) !@ #$ %^ &* () !@#$',
    },
  ],
}