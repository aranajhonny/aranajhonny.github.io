/* Syntax highlighting for <pre><code> blocks — vanilla, no deps.
   Detects language by heuristic (rust / ts-js / python) and wraps tokens
   in spans: .tok-c (comment), .tok-s (string), .tok-k (keyword),
   .tok-n (number), .tok-f (function call). */
(function () {
  "use strict";

  if (!("classList" in document.documentElement)) return;

  var KEYWORDS_TS = new Set(
    ("var let const function return if else for while do switch case break " +
      "continue import export from default new delete typeof instanceof in of " +
      "class extends super this async await try catch finally throw " +
      "interface type enum implements public private protected " +
      "true false null undefined void static get set yield").split(" ")
  );
  var KEYWORDS_RUST = new Set(
    ("fn let mut const static return if else for while loop match break " +
      "continue use mod pub struct enum trait impl where as ref move " +
      "async await dyn self Self true false").split(" ")
  );
  var KEYWORDS_PY = new Set(
    ("def return if elif else for while in not and or import from as " +
      "class with try except finally raise lambda yield pass break continue " +
      "global nonlocal True False None async await").split(" ")
  );

  function detectLang(code) {
    if (/\b(fn|impl|struct|enum|trait|let mut|use\s+[\w:]+)\b/.test(code)) return "rust";
    if (/\b(def|class|elif|import\s+[\w.]+|from\s+[\w.]+\s+import)\b/.test(code)) return "python";
    return "ts";
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // One pass: alternation picks comments > strings > keywords > numbers >
  // function calls. Everything else passes through escaped.
  function highlight(lang, code) {
    var keywords =
      lang === "rust" ? KEYWORDS_RUST : lang === "python" ? KEYWORDS_PY : KEYWORDS_TS;

    var re = new RegExp(
      [
        "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // 1 comment (ts/python)
        "(#[^\\n]*)",                              // 2 comment (rust/py)
        "('(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\"|`(?:[^`\\\\]|\\\\.)*`)", // 3 string
        "([A-Za-z_$][\\w$]*)",                     // 4 word
        "(\\b\\d+(?:\\.\\d+)?\\b)"                 // 5 number (after word so words win)
      ].join("|"),
      "g"
    );

    var out = "";
    var last = 0;
    var m;
    while ((m = re.exec(code)) !== null) {
      out += escapeHtml(code.slice(last, m.index));
      if (m[1]) {
        out += '<span class="tok-c">' + escapeHtml(m[1]) + "</span>";
      } else if (m[2]) {
        out += '<span class="tok-c">' + escapeHtml(m[2]) + "</span>";
      } else if (m[3]) {
        out += '<span class="tok-s">' + escapeHtml(m[3]) + "</span>";
      } else if (m[4]) {
        var w = m[4];
        if (keywords.has(w)) {
          out += '<span class="tok-k">' + w + "</span>";
        } else if (lang !== "rust" && w[0] === w[0].toUpperCase() && /^[A-Z]/.test(w)) {
          out += '<span class="tok-t">' + w + "</span>";
        } else {
          // lookahead for function call (word followed by optional ws + paren)
          var rest = code.slice(m.index + w.length);
          if (/^\s*\(/.test(rest)) {
            out += '<span class="tok-f">' + w + "</span>";
          } else {
            out += w;
          }
        }
      } else if (m[5]) {
        out += '<span class="tok-n">' + m[5] + "</span>";
      }
      last = re.lastIndex;
    }
    out += escapeHtml(code.slice(last));
    return out;
  }

  var blocks = document.querySelectorAll("pre code");
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    // Skip if already processed (SPA re-render / repeated script load)
    if (block.getAttribute("data-highlighted")) continue;
    var code = block.textContent;
    var lang = block.className && /language-([\w-]+)/.exec(block.className)
      ? RegExp.$1
      : detectLang(code);
    block.innerHTML = highlight(lang, code);
    block.setAttribute("data-highlighted", "1");
  }
})();
