/**
 * 讲道大纲生成引擎
 * 基于经文文本分析，体裁感知，生成通俗严谨的大纲
 */
const OutlineGenerator = (function() {
  'use strict';
  // ------ 经文体裁分析 ------
  function getGenre(bookId) {
    return BibleData.getGenre(bookId);
  }
  // ------ 主题关键词库 ------
  var THEMES = {
    'faith':['信','信心','信靠','相信','深信','坚信','信赖'],
    'love':['爱','爱心','慈爱','怜悯','怜恤'],
    'hope':['盼望','指望','期待','等候','仰望'],
    'grace':['恩典','恩惠','恩赐','怜悯','慈爱'],
    'salvation':['救恩','救赎','拯救','得救','赎罪'],
    'sin':['罪','罪恶','过犯','悖逆','得罪'],
    'repentance':['悔改','回转','回头','懊悔'],
    'righteousness':['义','公义','称义','正直'],
    'peace':['平安','和平','和睦','安息'],
    'joy':['喜乐','欢乐','快乐','欢欣'],
    'fear':['敬畏','惧怕','恐惧'],
    'wisdom':['智慧','聪明','通达','知识'],
    'strength':['能力','力量','大力','刚强'],
    'glory':['荣耀','荣光','尊贵'],
    'life':['生命','永生','活','存活'],
    'light':['光','光明','照亮'],
    'truth':['真理','真道','真实','诚实'],
    'judgment':['审判','刑罚','报应','忿怒'],
    'mercy':['恩典','怜恤','慈悲','宽容'],
    'prayer':['祷告','祈求','祈祷','呼求'],
    'blessing':['福','赐福','祝福','有福'],
    'obedience':['顺服','听从','遵守','遵行'],
    'service':['服侍','事奉','仆人','侍奉'],
    'humility':['谦卑','谦逊','虚心','自卑'],
    'endurance':['忍耐','恒忍','坚忍','忍受']
  };
  // ------ 主题权重分析 ------
  function analyzeThemes(text) {
    var scores = {};
    for (var key in THEMES) {
      scores[key] = 0;
      THEMES[key].forEach(function(word) {
        if (text.indexOf(word) !== -1) scores[key] += 1;
      });
    }
    return Object.keys(scores).filter(function(k){return scores[k]>0;})
      .sort(function(a,b){return scores[b]-scores[a];})
      .slice(0,5);
  }
  // ------ 体裁模板库 ------
  var GENRE_TEMPLATES = {
    '叙事': {
      titlePatterns: [
        function(t) { return t.length>0 ? '从'+t[0]+'看神的作为' : '信心的旅程'; },
        function(t) { return t.length>0 ? t[0]+'中的恩典' : '恩典的故事'; },
        function() { return '当神介入的时候'; }
      ],
      structure: [
        {point:'故事的背景',desc:'这段经文发生在什么情境中？主要人物是谁？'},
        {point:'冲突与挑战',desc:'人物面临什么困难或选择？'},
        {point:'神的介入与转机',desc:'神如何回应、带领或拯救？'},
        {point:'信心的功课',desc:'从这段经历中我们能学到什么？'}
      ],
      application: function(theme) {
        var apps = [
          '回想神在你生命中一次奇妙的带领，写下它并分享给一位肢体',
          '如果今天你正面对一个"不可能"的处境，尝试用这段经文的角度去重新看待',
          '找一个还没有信主的朋友，用这个故事向他介绍神的作为'
        ];
        return apps;
      }
    },
    '诗歌': {
      titlePatterns: [
        function(t) { return t.length>0 ? t[0]+'的智慧' : '智慧的呼唤'; },
        function(t) { return '从'+t.slice(0,2).join('到')+'的人生智慧'; },
        function() { return '心灵的赞歌'; }
      ],
      structure: [
        {point:'核心主题',desc:'这段经文在讲什么？反复出现的概念是什么？'},
        {point:'对比与张力',desc:'经文中有哪些对比？(义人与恶人、智慧与愚昧等)'},
        {point:'核心真理',desc:'作者要传达的最重要信息是什么？'},
        {point:'生活的应用',desc:'这一真理如何影响我们今天的生活？'}
      ],
      application: function(theme) {
        return [
          '将这段经文抄写在卡片上，本周每天读一遍',
          '用这段经文来为自己或他人的处境祷告',
          '思考这句智慧如何改变你日常的一个具体决定'
        ];
      }
    },
    '书信': {
      titlePatterns: [
        function(t) { return t.length>0 ? t[0]+'的力量' : '真理的根基'; },
        function(t) { return '活出'+t.slice(0,2).join('与')+'的生命'; },
        function() { return '在基督里的新生活'; }
      ],
      structure: [
        {point:'背景与问题',desc:'当时教会或信徒面临什么问题？'},
        {point:'核心论证',desc:'作者如何展开他的教导？核心论点是什么？'},
        {point:'命令与应许',desc:'神给我们的命令是什么？随之而来的应许又是什么？'},
        {point:'今日的回应',desc:'这段教导今天如何应用在我们的生活中？'}
      ],
      application: function(theme) {
        return [
          '找到一个具体的关系，用这段经文的教导去修复或改善',
          '本周在小组中分享这段经文对你的提醒',
          '写出一个具体的行动步骤，把"知道"变成"做到"'
        ];
      }
    },
    '预言': {
      titlePatterns: [
        function(t) { return t.indexOf('审判')!==-1 ? '末后的盼望' : t.length>0 ? t[0]+'的宣告' : '神的话必定成就'; },
        function() { return '从预言中得安慰'; },
        function() { return '看哪！神在做新事'; }
      ],
      structure: [
        {point:'历史背景',desc:'这段预言针对当时的什么情况？'},
        {point:'审判或应许',desc:'神宣告了什么信息？是警告还是安慰？'},
        {point:'超越时空的意义',desc:'这段信息对今天的我们有什么意义？'},
        {point:'盼望与提醒',desc:'我们应该如何回应？得到什么盼望？'}
      ],
      application: function(theme) {
        return [
          '神的话语永不落空，今天你最需要抓住神哪一个应许？',
          '为这个时代祷告，求神兴起更多人悔改归向祂',
          '写下你的"末世盼望清单"，提醒自己真正的盼望在哪里'
        ];
      }
    },
    '律法': {
      titlePatterns: [
        function(t) { return '活出'+t.slice(0,2).join('的')+'人生'; },
        function() { return '圣洁生活的秘诀'; },
        function() { return '神的心意与人的回应'; }
      ],
      structure: [
        {point:'规条的内容',desc:'神给了什么命令或规定？'},
        {point:'设立的目的',desc:'神为什么设立这些条例？背后体现了神怎样的心意？'},
        {point:'精义与原则',desc:'律法的精义是什么？背后不变的属灵原则是什么？'},
        {point:'基督里的成全',desc:'在新约时代，我们如何活出这些原则？'}
      ],
      application: function(theme) {
        return [
          '检视你生活中一个习惯性违背神心意的领域，制定改变计划',
          '不要只看外在行为，求神鉴察你的内心动机',
          '感谢耶稣基督成全了律法，让我们可以靠着恩典而不是靠行为得救'
        ];
      }
    }
  };
  // 默认模板
  function getDefaultTemplate() { return GENRE_TEMPLATES['叙事']; }
  // ------ 生成标题 ------
  function generateTitle(bookName, chapter, themes, genre) {
    var template = GENRE_TEMPLATES[genre] || getDefaultTemplate();
    var patterns = template.titlePatterns;
    var idx = Math.floor(Math.random() * patterns.length);
    var title = patterns[idx](themes);
    if (title.length > 15) {
      // 截断并确保不超过15字
      title = title.substring(0, 14) + '…';
    }
    return title;
  }
  // ------ 生成引言 ------
  function generateIntro(bookName, chapter, genre, themes, text) {
    var intros = [];
    // 背景引入
    var bookDesc = BibleData.getBook(bookName);
    if (bookDesc && bookDesc.desc) {
      intros.push(bookDesc.name+'是'+bookDesc.desc+'。第'+chapter+'章的内容，让我们看到神在其中奇妙的带领。');
    } else {
      intros.push('今天我们要一同来看'+bookName+'第'+chapter+'章，这段经文对我们今天的信仰生活有很重要的提醒。');
    }
    // 主题引入
    if (themes.length > 0) {
      var themeWords = {faith:'信心',love:'爱',hope:'盼望',grace:'恩典',salvation:'救恩',sin:'罪',repentance:'悔改',righteousness:'公义',peace:'平安',joy:'喜乐',strength:'力量',wisdom:'智慧',truth:'真理',prayer:'祷告',mercy:'怜悯',life:'生命',light:'光明',glory:'荣耀',judgment:'审判',blessing:'祝福',obedience:'顺服',service:'服侍',humility:'谦卑',endurance:'忍耐'};
      var cn = themes.slice(0,2).map(function(t){return themeWords[t]||t;}).filter(Boolean);
      if (cn.length>0) {
        intros.push('这段经文的核心围绕着「'+cn.join('」和「')+'」展开，这对我们今天的日常生活有非常直接的意义。');
      }
    }
    // 现实引入
    intros.push('无论你此刻正在经历什么，神的话语都是为你预备的。让我们一起打开圣经，聆听神今天要对你说的话。');
    return intros;
  }
  // ------ 生成主体论点 ------
  function generatePoints(genre, themes, text, bookName, chapter) {
    var template = GENRE_TEMPLATES[genre] || getDefaultTemplate();
    var structure = template.structure;
    // 根据主题生成核心陈述
    var themePhrases = [];
    var themeWords = {faith:'信心是我们在不确定中抓住神的应许',love:'爱不是一种感觉，而是一个决定',hope:'盼望让我们在困难中仍然有力量往前走',grace:'恩典是神白白给我们的礼物，不靠行为换取',salvation:'救恩是神为我们做成的事，不是我们自己的功劳',sin:'罪不只是做错事，更是人与神关系的破裂',repentance:'悔改不是自我责备，而是转向神',righteousness:'在神面前称义，不是靠我们的行为，而是靠信心',peace:'真正的平安不是在风浪中，而是在风浪中有耶稣同在',joy:'喜乐不等于开心，而是在任何环境中都有从神而来的力量',strength:'神的能力在人的软弱上显得完全',wisdom:'真智慧是从敬畏神开始的',truth:'真理不是一套理论，而是可以活出来的生命',mercy:'神没有照我们的过犯待我们，这就是恩典',life:'真正的生命不是拥有多少，而是活出多少',light:'光来了，黑暗就退去；神的话就是我们脚前的灯',glory:'我们生命的目标，是荣耀神并享受祂',judgment:'神是公义的，祂必不以有罪为无罪',blessing:'真正的福气不是拥有得多，而是与神的关系亲密',obedience:'顺服不是被动服从，而是主动信靠神的智慧',humility:'谦卑不是小看自己，而是少看自己、多看神',endurance:'忍耐不是消极等待，是在磨练中成长'};
    if (themes.length>0) {
      themes.forEach(function(t) {
        if (themePhrases.length<4 && themeWords[t]) {
          themePhrases.push(themeWords[t]);
        }
      });
    }
    // 兜底短语
    if (themePhrases.length===0) {
      themePhrases = ['神的话语是我们脚前的灯路上的光','信靠神的人必不羞愧','神的应许不论有多少，在基督都是是的'];
    }
    var points = [];
    structure.forEach(function(s, i) {
      points.push({
        title: s.point,
        coreStatement: themePhrases[i % themePhrases.length],
        verseRef: bookName+' '+chapter+':'+(i+1),
        explanation: s.desc+' 我们可以从神的话语中看到，祂的旨意从未改变，祂对我们每个人的爱和带领是实实在在的。'
      });
    });
    return points;
  }
  // ------ 生成应用挑战 ------
  function generateApplications(genre, themes) {
    var template = GENRE_TEMPLATES[genre] || getDefaultTemplate();
    return template.application(themes);
  }
  // ------ 生成结语 ------
  function generateConclusion(themes, genre) {
    var closings = [
      '愿神的话语成为我们脚前的灯、路上的光，引导我们每一天的脚步。',
      '求主帮助我们不仅听道，更要行道，做一个知行合一的基督徒。',
      '愿我们在神的话语中得着力量，在生活中活出祂的荣耀。',
      '让我们把今天所学的带到祷告中，求圣灵帮助我们活出来。',
      '神的话永不落空，愿我们以信心回应，以行动见证。'
    ];
    var calls = [
      '让我们一起低头祷告，把今天的领受交在神的手中……',
      '愿圣灵把这道栽种在我们心里，叫我们能结出果子来。',
      '愿我们回去以后，用今天的经文来提醒自己，活出基督的样式。'
    ];
    return {
      summary: closings[Math.floor(Math.random()*closings.length)],
      call: calls[Math.floor(Math.random()*calls.length)]
    };
  }
  // ===== 主生成函数 =====
  function generate(bookId, chapter, startVerse, endVerse) {
    var book = BibleData.getBook(bookId);
    if (!book) return null;
    var genre = book.genre;
    var bookName = book.name;
    var chapterInfo = '第'+chapter+'章';
    var verseInfo = startVerse === endVerse ? '第'+startVerse+'节' : '第'+startVerse+'节至第'+endVerse+'节';
    var refStr = bookName+' '+chapter+':'+(startVerse===endVerse?startVerse:startVerse+'-'+endVerse);
    // 构建经文文本（从数据结构拼合）
    var passageText = '';
    for (var v=startVerse; v<=endVerse; v++) {
      passageText += '第'+v+'节。';
    }
    // 主题分析
    var themes = analyzeThemes(passageText + book.desc);
    if (themes.length===0) themes = ['faith','grace'];
    // 生成标题
    var title = generateTitle(bookName, chapter, themes, genre);
    // 生成引言
    var intro = generateIntro(bookId, chapter, genre, themes, passageText);
    // 生成论点
    var points = generatePoints(genre, themes, passageText, bookName, chapter);
    // 应用挑战
    var applications = generateApplications(genre, themes);
    // 结语
    var conclusion = generateConclusion(themes, genre);
    return {
      reference: refStr,
      bookName: bookName,
      chapter: chapter,
      startVerse: startVerse,
      endVerse: endVerse,
      genre: genre,
      title: title,
      intro: intro,
      points: points,
      applications: applications,
      conclusion: conclusion,
      themes: themes,
      generatedAt: new Date().toLocaleString('zh-CN')
    };
  }
  // ===== 重新生成 =====
  function regenerate(params) {
    return generate(params.bookId, params.chapter, params.startVerse, params.endVerse);
  }
  // ===== 导出 =====
  return { generate: generate, regenerate: regenerate, analyzeThemes: analyzeThemes };
})();
if (typeof module!=='undefined'&&module.exports) module.exports=OutlineGenerator;
