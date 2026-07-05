var OutlineGenerator = (function() {
'use strict';
var TK={faith:['信','信心','信靠'],love:['爱','慈爱','怜悯'],hope:['盼望','指望'],grace:['恩典','恩惠','恩赐'],salvation:['救恩','救赎','拯救'],sin:['罪','罪恶'],repentance:['悔改','回转'],righteousness:['义','公义','称义'],peace:['平安','和睦'],joy:['喜乐'],wisdom:['智慧','聪明'],strength:['能力','力量','刚强'],truth:['真理','真道'],mercy:['怜恤','慈悲'],life:['生命','永生'],glory:['荣耀'],blessing:['福','赐福','祝福','有福'],obedience:['顺服','听从','遵守'],humility:['谦卑','虚心'],endurance:['忍耐','恒忍'],light:['光','光明'],prayer:['祷告','祈求'],judgment:['审判','刑罚'],covenant:['约','应许','立约'],kingdom:['天国','国度','掌权'],fear:['敬畏','惧怕'],command:['命令','诫命','吩咐'],promise:['应许','必'],warning:['谨慎','防备','小心'],grace:['恩典','恩惠'],wisdom:['智慧','聪明']};
var CN={faith:'信心',love:'爱心',hope:'盼望',grace:'恩典',salvation:'救恩',sin:'罪恶',repentance:'悔改',righteousness:'公义',peace:'平安',joy:'喜乐',wisdom:'智慧',strength:'力量',truth:'真理',mercy:'怜悯',life:'生命',glory:'荣耀',blessing:'祝福',obedience:'顺服',humility:'谦卑',endurance:'忍耐',light:'光明',prayer:'祷告',judgment:'审判',covenant:'应许',kingdom:'天国',fear:'敬畏',command:'命令',promise:'应许',warning:'警告'};
// 文本概念提取：分析经文找出核心主题词
function extract(s){
  var segs=s.split(/[；。！？]/);
  // 统计2-4字词汇频率
  var freq={};
  segs.forEach(function(seg,j){
    if(seg.length<2)return;
    var wt=1+1/(j+1);
    for(var k in TK){
      TK[k].forEach(function(w){
        var p=0;
        while((p=seg.indexOf(w,p))!==-1){
          freq[k]=(freq[k]||0)+wt;
          p+=w.length;
        }
      });
    }
    // n-gram: 提取2-4字重复短语
    for(var n=2;n<=4;n++){
      for(var i=0;i<=seg.length-n;i++){
        var phrase=seg.substring(i,i+n);
        // 跳过标点和空格
        if(/^[，。！？、；：""「」『』（）\s]+$/.test(phrase))continue;
        if(STOPWORDS.indexOf(phrase)>=0)continue;
        freq[phrase]=(freq[phrase]||0)+wt*0.3;
      }
    }
  });
  // 排序取Top
  return Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];}).slice(0,8);
}
// 从概念中挑出最佳标题词
function pickTitleWord(concepts){
  for(var i=0;i<concepts.length;i++){
    var c=concepts[i];
    if(CN[c])return CN[c];
  }
  for(var i=0;i<concepts.length;i++){
    var c=concepts[i];
    if(STOPWORDS.indexOf(c)>=0)continue;
    if(c.length>=2&&c.length<=4)return c;
  }
  return null;
}
// 判断经文是否有明显的故事元素
function isNarrativeText(text){
  if(/说|去|来|就|于是|到了|看见|听见/.test(text))return true;return false;
}
// 判断经文是否有教导/命令
function isDidacticText(text){
  if(/你们要|不可|应当|所以|因为|我告诉/.test(text))return true;return false;
}
// 提取文中出现3次以上的关键短语
function getRepPhrases(text){
  var segs=text.split(/[；。！？，]/);
  var freq={};
  segs.forEach(function(s){
    if(s.length<4)return;
    for(var n=2;n<=4;n++){
      for(var i=0;i<=s.length-n;i++){
        var p=s.substring(i,i+n);
        if(/^[，。！？、；：""「」『』（）\s\w\d]+$/.test(p))continue;
        freq[p]=(freq[p]||0)+1;
      }
    }
  });
  return Object.keys(freq).filter(function(k){return freq[k]>=3&&k.length>=2;}).sort(function(a,b){return freq[b]-freq[a];}).slice(0,3);
}
// 生成标题（从经文内容提取）
function genTitle(bk,ch,concepts,text){
  var tw=pickTitleWord(concepts);
  var rep=getRepPhrases(text);
  var patterns=[
    function(){return tw?tw+'——'+bk+'第'+ch+'章':bk+'第'+ch+'章的启示';},
    function(){return rep[0]?rep[0]+'的智慧':bk+'中的亮光';},
    function(){return tw?'从'+bk+'看'+tw:bk+'给我们的提醒';},
    function(){return tw+'的人生功课';},
    function(){return rep[0]?rep[0]+'——活出真道':'活出'+((tw||'信心'))+'的生命';},
    function(){return bk+'第'+ch+'章：'+((tw||'真理'))+'的力量';},
    function(){return'当'+((tw||'神'))+'对我们说话';},
    function(){return'从这段经文学'+((tw||'信心'))+'的功课';},
    function(){return bk+'中关于'+((tw||'信心'))+'的教导';},
    function(){return rep[0]?rep[0]+'的奥秘':bk+'的智慧';},
    function(){return'在'+bk+'第'+ch+'章遇见'+((tw||'神'));},
    function(){return tw?'不只是'+tw+'——'+bk+'的深度':'深层阅读'+bk+'第'+ch+'章';}
  ];
  var t=patterns[Math.floor(Math.random()*patterns.length)]();
  return t.length>15?t.substring(0,14)+'…':t;
}
// 生出论点（基于文本内容分析）
var CORE_PATTERNS=[function(w){return w+'——这是经文的核心信息';},function(w){return '经文强调「'+w+'」';},function(w){return w+'，这是神今天要对我们说的话';},function(w){return '「'+w+'」——这段教导直指生命需要';},function(w){return w+'——神的话打开眼睛看清祂心意';}];
function genPoints(text,genre,bk,ch,concepts){
  var pts=[];
  var segs=text.split(/[；。！？]/).filter(function(s){return s.length>3;});
  // 根据体裁和文本特征选择要点结构
  var isNarr=isNarrativeText(text);
  var isDidac=isDidacticText(text);
  var n=Math.min(4,Math.max(3,Math.ceil(segs.length/3)));
  var grpSize=Math.ceil(segs.length/n);
  // 获取关键短语
  var rep=getRepPhrases(text);
  var tw=pickTitleWord(concepts);

  var pointTitles=[];
  if(isNarr&&genre!=='书信'){
    pointTitles=['场景与背景','冲突与挑战','神的作为','我们的回应'];
  }else if(isDidac||genre==='书信'||genre==='律法'){
    pointTitles=['真理的教导','生活的命令','应许与警告','今天的应用'];
  }else if(genre==='诗歌'){
    pointTitles=['智慧的开端','对比与反思','核心真理','生命的方向'];
  }else if(genre==='预言'){
    pointTitles=['历史背景','信息的内容','永恒的意义','今天的预备'];
  }else{
    pointTitles=['经文的启示','真理的亮光','生活的应用','信心的回应'];
  }

  for(var i=0;i<n;i++){
    var start=i*grpSize;
    var end=Math.min(start+grpSize,segs.length);
    var group=segs.slice(start,end);
    var groupText=group.join('。');
    // 从该组提取核心短语
    var core=rep[i]||(tw?tw:'');
    var gConcepts=extract(groupText);
    var gWord=pickTitleWord(gConcepts)||tw||'真理';
    var vNum=(i*grpSize+1);
    var cp=CORE_PATTERNS[Math.floor(Math.random()*CORE_PATTERNS.length)];
    pts.push({
      title:pointTitles[i]||'要点'+(i+1),
      coreStatement:gWord?cp(gWord):('经文第'+(start+1)+'节告诉我们宝贵的真理'),
     verseRef:bk+' '+ch+':'+vNum,
      explanation:groupText.length>20?groupText.substring(0,40)+'……这段教导提醒我们要在生活中活出神的道。':(groupText+'这段教导直指我们生命的需要。')
    });
  }
  return pts;
}
// 生成引言
function genIntro(bk,desc,ch,concepts,genre){
  var r=[];
  if(genre==='书信')r.push(bk+'是一封重要的书信，'+desc+'。');
  else r.push('今天我们要一同来看'+bk+'第'+ch+'章。'+desc);
  var tw=pickTitleWord(concepts);
  if(tw)r.push('这段经文的核心围绕「'+tw+'」展开，对我们今天的信仰生活有非常直接的提醒。');
  r.push('让我们带着敞开的心，聆听神借着这段经文要对我们说的话。');
  return r;
}
// 应用
var APPS=['用这段经文来祷告，求神把真理刻在你心里','找一个具体的处境，把今天学到的真理活出来','把经文中的一句关键的话背下来，这周反复默想','和一位肢体分享你今天从这段经文学到什么','写下神借着这段经文给你个人的提醒','为一位正在困难中的朋友祷告，用这段经文鼓励他','今天就做一件听了就去行的事','想一想这段经文改变了你对神的什么认识'];
function genApps(){var a=[],idx=[];while(a.length<3){var r=Math.floor(Math.random()*APPS.length);if(idx.indexOf(r)===-1){idx.push(r);a.push(APPS[r]);}}return a;}
// 结语
var ENDS=[{s:'愿神的话语成为我们脚前的灯、路上的光。',c:'让我们一起低头祷告……'},{s:'求主帮助我们不仅听道，更要行道。',c:'愿圣灵把这道栽种在我们心里。'},{s:'愿我们在神话语中得力量，在生活中荣耀祂。',c:'求主帮助我们做一个听道又行道的人。'},{s:'神的话永不落空，愿以信心回应、以行动见证。',c:'让我们一起祷告。'},{s:'把今天所学的带到祷告中，求圣灵帮助我们活出来。',c:'愿圣灵帮助我们活出今天所学习的。'}];
function genEnd(){var e=ENDS[Math.floor(Math.random()*ENDS.length)];return{summary:e.s,call:e.c};}
// 分析主题（保留，用于辅助）
function ana(text){
  var s={};for(var k in TK){s[k]=0;TK[k].forEach(function(w){var p=0;while((p=text.indexOf(w,p))!==-1){s[k]++;p+=w.length;}});}
  return Object.keys(s).filter(function(k){return s[k]>0;}).sort(function(a,b){return s[b]-s[a];});
}
// ===== 主生成函数 =====
function generate(bookId,ch,sv,ev){
  var bk=BibleData.getBook(bookId);if(!bk)return null;
  var gt=bk.genre,bn=bk.name;
  var vStr=sv===ev?sv:sv+'-'+ev;
  // 获取经文文本
  var txt='',bt=BibleText.getText(bookId,ch);
  if(bt){for(var v=sv-1;v<Math.min(ev,bt.length);v++)txt+=bt[v];}
  else{for(var v=sv;v<=ev;v++)txt+='节。';txt+=' '+bk.desc;}
  // 分析
  var concepts=extract(txt);
  var th=ana(txt);if(th.length===0)th=['faith','grace'];
  // 生成
  var title=genTitle(bn,ch,concepts,txt);
  var intro=genIntro(bn,bk.desc,ch,concepts,gt);
  var points=genPoints(txt,gt,bn,ch,concepts);
  var apps=genApps();
  var end=genEnd();
  return{
    reference:bn+' '+ch+':'+vStr,bookName:bn,chapter:ch,
    startVerse:sv,endVerse:ev,genre:gt,title:title,
    intro:intro,points:points,applications:apps,
    conclusion:end,generatedAt:new Date().toLocaleString('zh-CN')
  };
}
return{generate:generate};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=OutlineGenerator;
var STOPWORDS='我的|你的|他的|她的|它的|我们|你们|他们|这些|那些|这个|那个|什么|怎么|因为|所以|但是|然而|如果|虽然|可以|没有|不是|就是|只是|而且|或者|还是|于是|并且|自己|这样|那样|这里|那里|一个|时候|其中|已经|经过|通过'.split('|');
// 文本概念提取
