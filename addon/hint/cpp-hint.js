// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var WORD = /[\w$]+/, RANGE = 500;

  CodeMirror.registerHelper("hint", "anyword", function(editor, options) {
    var word = options && options.word || WORD;
    var range = options && options.range || RANGE;
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var start = cur.ch, end = start;
    while (end < curLine.length && word.test(curLine.charAt(end))) ++end;
    while (start && word.test(curLine.charAt(start - 1))) --start;
    var curWord = start != end && curLine.slice(start, end);
    //用户输入
    var list = [], seen = {};
    var re = new RegExp(word.source, "g");
    for (var dir = -1; dir <= 1; dir += 2) {
      var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
      for (; line != endLine; line += dir) {
        var text = editor.getLine(line), m;
        while (m = re.exec(text)) {
          if (line == cur.line && m[0] === curWord) continue;
          if ((!curWord || m[0].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
            seen[m[0]] = true;
            list.push(m[0]);
          }
        }
      }
    }

    //keywords
    var cppKeywords = [
      "include","null","auto","if","break","int","case","long","char","register",
      "continue","return","default","short","do","sizeof","double","static",
      "else","struct","entry","switch","extern","typedef","float","union","for",
      "unsigned","goto","while","enum","void","const","signed","volatile",
      "asm","dynamic_cast","namespace","reinterpret_cast","try","bool","explicit",
      "new","static_cast","typeid","catch","operator","template","typename",
      "class","friend","private","this","using","const_cast","inline","public",
      "throw","virtual","delete","mutable","protected","wchar_t","alignas",
      "alignof","constexpr","decltype","nullptr","noexcept","thread_local",
      "final","static_assert","override","true","false","null","include"
      ];
    for (var i = cppKeywords.length - 1; i >= 0; i--) {
      if (cppKeywords[i] === curWord) continue;
          if ((!curWord || cppKeywords[i].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, cppKeywords[i])) {
            seen[cppKeywords[i]] = true;
            list.push(cppKeywords[i]);
      }
    }
    return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
  });
});
