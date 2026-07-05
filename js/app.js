/**
 * 讲道大纲生成器 - 主应用逻辑
 */
(function() {
'use strict';
var $ = function(id) { return document.getElementById(id); };
var testamentEl = $('testament');
var bookEl = $('book');
var chapterEl = $('chapter');
var startVEl = $('startVerse');
var endVEl = $('endVerse');
var quickRefEl = $('quickRef');
var generateBtn = $('generateBtn');
var passageSection = $('passageSection');
var passageTitle = $('passageTitle');
var passageMeta = $('passageMeta');
var passageText = $('passageText');
var outlineSection = $('outlineSection');
var loadingEl = $('loading');
var current = { bookId: null, chapter: null, startVerse: null, endVerse: null };
// ===== 填充下拉菜单 =====
function populateBooks() {
  var filter = testamentEl.value;
  var books = BibleData.books.filter(function(b) {
    return filter === 'all' || b.testament === filter;
  });
  bookEl.innerHTML = '<option value="">请选择卷</option>';
  books.forEach(function(b) {
    var opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.name;
    bookEl.appendChild(opt);
  });
}
function populateChapters() {
  var bookId = parseInt(bookEl.value);
  chapterEl.innerHTML = '<option value="">请选章</option>';
  if (!bookId) return;
  var book = BibleData.getBook(bookId);
  if (!book) return;
  book.chapters.forEach(function(ch) {
    var opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = '\u7B2C' + ch + '\u7AE0';
    chapterEl.appendChild(opt);
  });
}
function populateVerses() {
  var bookId = parseInt(bookEl.value);
  var chapter = parseInt(chapterEl.value);
  var vc = BibleData.getVerseCount(bookId, chapter);
  startVEl.innerHTML = '<option value="">\u8D77</option>';
  endVEl.innerHTML = '<option value="">\u6B62</option>';
  if (!vc) return;
  for (var i = 1; i <= vc; i++) {
    var o1 = document.createElement('option');
    o1.value = i; o1.textContent = i;
    startVEl.appendChild(o1);
    var o2 = document.createElement('option');
    o2.value = i; o2.textContent = i;
    endVEl.appendChild(o2);
  }
  if (vc > 0) { startVEl.value = 1; endVEl.value = vc; }
}
// ===== 显示经文 =====
function displayPassage() {
  var bookId = parseInt(bookEl.value);
  var chapter = parseInt(chapterEl.value);
  if (!bookId || !chapter) return;
  var book = BibleData.getBook(bookId);
  var startV = parseInt(startVEl.value) || 1;
  var endV = parseInt(endVEl.value) || BibleData.getVerseCount(bookId, chapter);
  current.bookId = bookId;
  current.chapter = chapter;
  current.startVerse = startV;
  current.endVerse = endV;
  var vStr = startV === endV ? startV : startV + '-' + endV;
  passageTitle.textContent = book.name + ' ' + chapter + ':' + vStr;
  passageMeta.textContent = book.testament + ' \u00B7 ' + book.genre;
  var vs = BibleText.getText(bookId, chapter);
  var html = '';
  if (vs) {
    for (var i = startV - 1; i < Math.min(endV, vs.length); i++) {
      html += '<div class="verse"><span class="verse-num">' + (i+1) + '</span>' + vs[i] + '</div>';
    }
  } else {
    var vc = BibleData.getVerseCount(bookId, chapter);
    for (var i = startV; i <= Math.min(endV, vc); i++) {
      html += '<div class="verse"><span class="verse-num">' + i + '</span>(\u7B2C' + i + '\u8282\u7ECF\u6587\u5F85\u8865\u5145)</div>';
    }
  }
  passageText.innerHTML = html;
  passageSection.classList.add('visible');
  generateBtn.disabled = false;
}
// ===== 生成大纲 =====
function generateOutline() {
  if (!current.bookId) return;
  generateBtn.disabled = true;
  loadingEl.style.display = 'block';
  outlineSection.classList.remove('visible');
  outlineSection.innerHTML = '';
  setTimeout(function() {
    try {
      var result = OutlineGenerator.generate(
        current.bookId, current.chapter,
        current.startVerse, current.endVerse
      );
      renderOutline(result);
    } catch(e) {
      loadingEl.style.display = 'none';
      generateBtn.disabled = false;
      outlineSection.innerHTML = '<div class="outline-card"><div class="outline-body"><p>\u751F\u6210\u51FA\u9519\uFF0C\u8BF7\u91CD\u8BD5\u3002</p></div></div>';
      outlineSection.classList.add('visible');
    }
  }, 600);
}
// ===== 渲染大纲 =====
function renderOutline(result) {
  loadingEl.style.display = 'none';
  generateBtn.disabled = false;
  if (!result) {
    outlineSection.innerHTML = '<div class="outline-card"><div class="outline-body"><p>\u65E0\u6CD5\u751F\u6210\uFF0C\u8BF7\u68C0\u67E5\u9009\u62E9\u3002</p></div></div>';
    outlineSection.classList.add('visible');
    return;
  }
  var html = '<div class="outline-card">';
  html += '<div class="outline-header">';
  html += '<span class="ref-badge">' + result.reference + ' &middot; ' + result.genre + '</span>';
  html += '<h2>' + result.title + '</h2>';
  html += '<div class="meta-line">' + result.generatedAt + '</div>';
  html += '</div>';
  html += '<div class="outline-body">';
  // 引言
  html += '<div class="outline-section-block">';
  html += '<div class="section-label">\u5F15\u8A00\u8981\u70B9</div>';
  html += '<ul class="intro-list">';
  result.intro.forEach(function(i) { html += '<li>' + i + '</li>'; });
  html += '</ul></div>';
  // 主体
  html += '<div class="outline-section-block">';
  html += '<div class="section-label">\u5927\u7EB2\u4E3B\u4F53</div>';
  result.points.forEach(function(p, idx) {
    html += '<div class="point-item">';
    html += '<h4>' + (idx + 1) + '. ' + p.title + '</h4>';
    html += '<div class="core-stmt">' + p.coreStatement + '</div>';
    html += '<span class="verse-ref">' + p.verseRef + '</span>';
    html += '<div class="explanation">' + p.explanation + '</div>';
    html += '</div>';
  });
  html += '</div>';
  // 应用
  html += '<div class="outline-section-block">';
  html += '<div class="section-label">\u5E94\u7528\u6311\u6218</div>';
  html += '<ul class="app-list">';
  result.applications.forEach(function(a) { html += '<li>' + a + '</li>'; });
  html += '</ul></div>';
  // 结语
  html += '<div class="outline-section-block">';
  html += '<div class="section-label">\u7ED3\u8BED</div>';
  html += '<div class="conclusion-summary">' + result.conclusion.summary + '</div>';
  html += '<div class="conclusion-call">' + result.conclusion.call + '</div>';
  html += '</div></div>';
  // 底部按钮
  html += '<div class="outline-footer">';
  html += '<button class="btn btn-sm btn-outline" onclick="window.copyOutline()">\u590D\u5236\u5927\u7EB2</button>';
  html += '<button class="btn btn-sm btn-outline" onclick="window.generateOutline()">\u91CD\u65B0\u751F\u6210</button>';
  html += '</div></div>';
  outlineSection.innerHTML = html;
  outlineSection.classList.add('visible');
  outlineSection.scrollIntoView({behavior:'smooth',block:'start'});
}
// ===== 复制大纲 =====
window.copyOutline = function() {
  var el = document.querySelector('.outline-card');
  if (!el) return;
  var text = el.innerText;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      var btn = document.querySelector('.outline-footer .btn-outline');
      if (btn) { btn.textContent = '已复制!'; setTimeout(function(){btn.textContent='复制大纲';},2000); }
    });
  }
};
// ===== 快速输入 =====
window.parseQuickRef = function() {
  var val = quickRefEl.value.trim();
  if (!val) return;
  var ref = BibleData.parseReference(val);
  if (!ref) {
    alert('\u8BF7\u8F93\u5165\u6B63\u786E\u683C\u5F0F\uFF0C\u4F8B\u5982\uFF1A\u521B1:1-5 \u6216 \u592A5:3-10');
    return;
  }
  bookEl.value = ref.bookId;
  populateChapters();
  chapterEl.value = ref.chapter;
  populateVerses();
  startVEl.value = ref.startVerse;
  endVEl.value = ref.endVerse;
  displayPassage();
};
// ===== 事件绑定 =====
function bindEvents() {
  testamentEl.addEventListener('change', function() {
    populateBooks();
    chapterEl.innerHTML = '<option value="">\u8BF7\u9009\u7AE0</option>';
    startVEl.innerHTML = '<option value="">\u8D77</option>';
    endVEl.innerHTML = '<option value="">\u6B62</option>';
    passageSection.classList.remove('visible');
    generateBtn.disabled = true;
  });
  bookEl.addEventListener('change', function() {
    populateChapters();
    startVEl.innerHTML = '<option value="">\u8D77</option>';
    endVEl.innerHTML = '<option value="">\u6B62</option>';
    passageSection.classList.remove('visible');
    generateBtn.disabled = true;
  });
  chapterEl.addEventListener('change', function() {
    populateVerses();
    if (bookEl.value && chapterEl.value) displayPassage();
  });
  startVEl.addEventListener('change', function() {
    if (bookEl.value && chapterEl.value) displayPassage();
  });
  endVEl.addEventListener('change', function() {
    if (bookEl.value && chapterEl.value) displayPassage();
  });
  quickRefEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') window.parseQuickRef();
  });
}
// ===== 暴露全局 =====
window.generateOutline = generateOutline;
// ===== 启动 =====
document.addEventListener('DOMContentLoaded', function() {
  populateBooks();
  bindEvents();
});
})();
