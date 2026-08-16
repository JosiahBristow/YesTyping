import type { Course } from './courseData'

export const symbolsCourse: Course = {
  id: 'symbols',
  type: 'symbols',
  icon: '🔣',
  title: { en: 'Symbol keys', zh: '符号键位' },
  desc: {
    en: 'Every punctuation and symbol key, drilled one or two at a time until your fingers find them without looking.',
    zh: '逐个攻破所有标点与符号键，一次一两个反复练习，直到手指不用看就能按到。',
  },
  lessons: [
    {
      id: 'hyphen',
      title: { en: 'Hyphen: -', zh: '减号：-' },
      text: '---- ---- - - - - ---- -- -- --- --- - - -- - - -- --',
    },
    {
      id: 'equals',
      title: { en: 'Equals: =', zh: '等号：=' },
      text: '==== ==== = = = = ==== == == === === = = == = = == ==',
    },
    {
      id: 'minus-plus',
      title: { en: 'Minus & plus: - +', zh: '加减号：- +' },
      text: '- + - + -+ +- -+ - + - + -+ +- -+ -+ -+ -+ +- +- -+',
    },
    {
      id: 'underscore',
      title: { en: 'Underscore: _', zh: '下划线：_' },
      text: '____ ____ _ _ _ _ ____ __ __ ___ ___ _ _ __ _ _ __ __',
    },
    {
      id: 'left-bracket',
      title: { en: 'Left bracket: [', zh: '左方括号：[' },
      text: '[[[[ [[[[ [ [ [ [ [[[[ [[ [[ [[[ [[[ [ [ [[ [ [ [[ [[',
    },
    {
      id: 'right-bracket',
      title: { en: 'Right bracket: ]', zh: '右方括号：]' },
      text: ']]]] ]]]] ] ] ] ] ]]]] ]] ]] ]]] ]]] ] ] ]] ] ] ]] ]]',
    },
    {
      id: 'brackets',
      title: { en: 'Brackets: [ ]', zh: '方括号：[]' },
      text: '[] [] [] [] [ ] [ ] [[]] [][] [][] [ ] [] [] [] [] [ ]',
    },
    {
      id: 'braces',
      title: { en: 'Braces: { }', zh: '花括号：{}' },
      text: '{ } { } {} {} { } { } {{}} {}{} { } { } { } { } {} {}',
    },
    {
      id: 'backslash',
      title: { en: 'Backslash: \\', zh: '反斜杠：\\' },
      text: '\\\\ \\\\ \\\\ \\\\ \\ \\ \\ \\ \\\\\\\\ \\\\\\\\ \\ \\ \\\\ \\ \\ \\\\ \\\\',
    },
    {
      id: 'pipe',
      title: { en: 'Pipe: |', zh: '竖线：|' },
      text: '| | | | || || | | | | |||| || || | | || || | | || ||',
    },
    {
      id: 'backtick',
      title: { en: 'Backtick: `', zh: '反引号：`' },
      text: '` ` ` ` `` `` ` ` ` ` ```` `` `` ` ` `` `` ` ` `` ``',
    },
    {
      id: 'semicolon',
      title: { en: 'Semicolon: ;', zh: '分号：;' },
      text: ';;;; ;;;; ; ; ; ; ;;;; ;; ;; ;;; ;;; ; ; ;; ; ; ;; ;;',
    },
    {
      id: 'apostrophe',
      title: { en: 'Apostrophe: \'', zh: '撇号：\'' },
      text: "'''' '''' ' ' ' ' '''' '' '' ''' ''' ' ' '' ' ' '' ''",
    },
    {
      id: 'colon',
      title: { en: 'Colon: :', zh: '冒号：:' },
      text: ': : : : :: :: : : : : :::: :: :: : : :: :: : : :: ::',
    },
    {
      id: 'quote',
      title: { en: 'Quotes: "', zh: '引号："' },
      text: '" " " " "" "" " " " " """" "" "" " " "" "" " " "" ""',
    },
    {
      id: 'comma',
      title: { en: 'Comma: ,', zh: '逗号：,' },
      text: ',,,, ,,,, , , , , ,,,, ,, ,, ,,, ,,, , , ,, , , ,, ,,',
    },
    {
      id: 'period',
      title: { en: 'Period: .', zh: '句点：.' },
      text: '.... .... . . . . .... .. .. ... ... . . .. . . .. ..',
    },
    {
      id: 'comma-period',
      title: { en: 'Comma & period: , .', zh: '逗号与句点：, .' },
      text: ', . , . ,. ,. ., ., ,.,. ,. , . , . , . ,.,. ,. ,. ,.',
    },
    {
      id: 'slash',
      title: { en: 'Slash: /', zh: '斜杠：/' },
      text: '//// //// / / / / //// // // /// /// / / // / / // //',
    },
    {
      id: 'question',
      title: { en: 'Question: ?', zh: '问号：?' },
      text: '? ? ? ? ?? ?? ? ? ? ? ???? ?? ?? ? ? ?? ?? ? ? ?? ??',
    },
    {
      id: 'exclamation',
      title: { en: 'Exclaim: !', zh: '感叹号：!' },
      text: '! ! ! ! !! !! ! ! ! ! !!!! !! !! ! ! !! !! ! ! !! !!',
    },
    {
      id: 'at',
      title: { en: 'At: @', zh: '@ 符号' },
      text: '@ @ @ @ @@ @@ @ @ @ @ @@@@ @@ @@ @ @ @@ @@ @ @ @@ @@',
    },
    {
      id: 'hash',
      title: { en: 'Hash: #', zh: '井号：#' },
      text: '# # # # ## ## # # # # #### ## ## # # ## ## # # ## ##',
    },
    {
      id: 'dollar',
      title: { en: 'Dollar: $', zh: '美元符：$' },
      text: '$ $ $ $ $$ $$ $ $ $ $ $$$$ $$ $$ $ $ $$ $$ $ $ $$ $$',
    },
    {
      id: 'percent',
      title: { en: 'Percent: %', zh: '百分号：%' },
      text: '% % % % %% %% % % % % %%%% %% %% % % %% %% % % %% %%',
    },
    {
      id: 'caret',
      title: { en: 'Caret: ^', zh: '脱字符：^' },
      text: '^ ^ ^ ^ ^^ ^^ ^ ^ ^ ^ ^^^^ ^^ ^^ ^ ^ ^^ ^^ ^ ^ ^^ ^^',
    },
    {
      id: 'ampersand',
      title: { en: 'Ampersand: &', zh: '和号：&' },
      text: '& & & & && && & & & & &&&& && && & & && && & & && &&',
    },
    {
      id: 'star',
      title: { en: 'Asterisk: *', zh: '星号：*' },
      text: '* * * * ** ** * * * * **** ** ** * * ** ** * * ** **',
    },
    {
      id: 'parens',
      title: { en: 'Parentheses: ( )', zh: '圆括号：()' },
      text: '( ) ( ) () () )( )( ( ) ( ) ( ) ( ) ()( ) () () ( )',
    },
    {
      id: 'angle-brackets',
      title: { en: 'Angles: < >', zh: '尖括号：<>' },
      text: '< > < > <> <> >< >< < > < > < > < > <> <> <> <> < >',
    },
    {
      id: 'number-row-symbols',
      title: { en: 'Number row symbols', zh: '数字行符号' },
      text: '!@#$ %^&* ()_+ !@#$ %^&* ()_+ !@#$ %^&* ()_+ {}[] |<>? :"\'',
    },
    {
      id: 'punctuation-mix',
      title: { en: 'Punctuation mix', zh: '标点混合' },
      text: ', . ; : \' " / ? ! @ # $ % ^ & * ( ) _ + { } [ ] | \\',
    },
    {
      id: 'symbol-sentences',
      title: { en: 'Symbols in sentences', zh: '符号句子' },
      text: 'Hello, world! How are you? It\'s 5:30 now. "Quit!" she said. Open file.txt at /tmp.',
    },
    {
      id: 'symbol-review',
      title: { en: 'Symbol review', zh: '符号综合' },
      text: '- = [ ] \\ ; \' , . / ` ~ ! @ # $ % ^ & * ( ) _ + { } | : " < > ?',
    },
  ],
}