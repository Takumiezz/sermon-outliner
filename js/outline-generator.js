var OutlineGenerator = (function() {
var THEMES={faith:['信','信心','信靠','相信'],love:['爱','爱心','慈爱','怜悯'],hope:['盼望','指望','期待'],grace:['恩典','恩惠','恩赐'],salvation:['救恩','救赎','拯救','得救'],sin:['罪','罪恶','过犯','悖逆'],repentance:['悔改','回转','回头'],righteousness:['义','公义','称义','正直'],peace:['平安','和平','和睦'],joy:['喜乐','欢乐','快乐'],wisdom:['智慧','聪明','通达'],strength:['能力','力量','刚强'],glory:['荣耀','荣光'],life:['生命','永生','活'],truth:['真理','真道','真实'],judgment:['审判','刑罚','报应'],mercy:['怜恤','慈悲','宽容'],blessing:['福','赐福','祝福'],obedience:['顺服','听从','遵守'],humility:['谦卑','谦逊','虚心'],endurance:['忍耐','恒忍','坚忍']};
var CN={faith:'信心',love:'爱心',hope:'盼望',grace:'恩典',salvation:'救恩',sin:'罪恶',repentance:'悔改',righteousness:'公义',peace:'平安',joy:'喜乐',wisdom:'智慧',strength:'力量',truth:'真理',mercy:'怜悯',life:'生命',glory:'荣耀',judgment:'审判',blessing:'祝福',obedience:'顺服',humility:'谦卑',endurance:'忍耐'};
var PHR={faith:['信心是在不确定中抓住神的手','相信不是看见才信，而是未看见就已信靠'],love:['爱不是一种感觉，而是一个决定','真爱从愿意放下自己开始'],hope:['盼望让我们在黑夜中仍能歌唱'],grace:['恩典是神白白给的礼物'],salvation:['救恩完全是神的工作'],sin:['罪不只是做错事，更是关系出了问题'],repentance:['悔改是180度转身，不是原地懊悔'],righteousness:['在神面前称义是礼物，不是工资'],peace:['真平安不是风平浪静，而是风暴中有主同在'],joy:['喜乐是在任何处境中都有从神而来的力量'],wisdom:['真智慧从敬畏神开始'],strength:['神的能力在人的软弱上显得完全'],truth:['真理不只是知识，更是可以活出来的生命'],mercy:['神没有按我们的过犯待我们'],life:['真正的生命不是拥有多少，而是活出多少'],blessing:['真正的福气是认识神、被神认识'],obedience:['顺服不是被动服从，而是主动相信神的智慧'],humility:['谦卑不是小看自己，而是少看自己、多看神'],endurance:['忍耐不是消极等待，而是在磨练中成长']};
var FALL=['神的话语是我们脚前的灯路上的光','信靠神的人必不至于羞愧','神的恩典够我们用的'];
function ana(text){var s={};for(var k in THEMES){s[k]=0;THEMES[k].forEach(function(w){var p=0;while((p=text.indexOf(w,p))!==-1){s[k]++;p+=w.length;}});}return Object.keys(s).filter(function(k){return s[k]>0;}).sort(function(a,b){return s[b]-s[a];});}
var TITLES=[function(b,c,t){return(t[0]?CN[t[0]]:'信心')+'——'+b+'第'+c+'章';},function(b,c,t){return'从'+b+'看'+((t[0]&&CN[t[0]])||'神的带领');},function(b,c,t){return(t[0]&&CN[t[0]])||'恩典'+'的人生智慧';},function(b,c,t){if(t.length>1)return CN[t[0]]+'与'+CN[t[1]];return b+'的启示';},function(b,c,t){return'活出'+((t.slice(0,2).map(function(x){return CN[x];}).filter(Boolean).join('和'))||'信心')+'的生命';},function(){return['从绝望到盼望','困境中的出路','平凡中的不平凡','重新出发的力量'][Math.floor(Math.random()*4)];},function(b,c,t){return b+'第'+c+'章给我们的'+((t[0]&&CN[t[0]])||'启示');},function(b,c,t){return(t[0]&&CN[t[0]])+'的功课';},function(b,c,t){return'当'+((t[0]&&CN[t[0]])||'神')+'介入的时候';}];
var APPS=['本周找一个具体的关系，用这段经文的教导去修复或改善','把今天的关键经文抄在卡片上，随身携带，每天读一遍','用一个具体行动来回应今天听到的真理','和一位弟兄姊妹分享你今天学到的东西','为一位正在困难中的朋友祷告，并把这个经文分享给他','写下神在这段经文里给你的一个具体提醒','今天就做一件听了就去行的事','想一想这段经文改变了你对神的什么认识','让神借着这段经文对你的心说话','为你的教会祷告，求神借着祂的话复兴教会','找一个还没信主的朋友，用这段经文的真理为他祷告','这周刻意练习这段经文教导的一个品格'];
var ENDS=[{s:'愿神的话语成为我们脚前的灯、路上的光。',c:'让我们一起低头祷告……'},{s:'求主帮助我们不仅听道，更要行道。',c:'愿圣灵把这道栽种在我们心里。'},{s:'愿我们在神话语中得力量，在生活中荣耀祂。',c:'求主帮助我们做一个听道又行道的人。'},{s:'神的话永不落空，愿以信心回应、以行动见证。',c:'让我们一起祷告。'},{s:'神的应许在基督里都是是的。',c:'愿圣灵帮助我们活出今天所学习的。'}];
var POINTS={'叙事':[['故事的背景与人物','冲突与挑战','转折与拯救','信心的功课'],['事件发生的场景','人如何回应','神如何介入','我们可以学到什么'],['当时的处境','人的软弱','神的信实','今天的应用']],'诗歌':[['经文的主题','对比与张力','核心真理','生活应用'],['反复出现的意象','作者的心声','神的属性','我们的回应'],['智慧的宣告','愚昧的对比','正确的选择','蒙福的道路']],'书信':[['当时的背景','作者的论证','命令与应许','今日的应用'],['核心的教义','生活的实践','最终的劝勉'],['当时的挑战','真理的根基','生活的命令','最后的鼓励']],'预言':[['历史背景','神的话语','当时的意义','今日的提醒'],['先知的看见','审判的信息','恩典的应许','我们的预备'],['当时的处境','神的警告','复兴的盼望','今天的回应']],'律法':[['条例的内容','设立的目的','精义与原则','今日的实践'],['神的要求','背后的心意','不变的真理','基督里的成全']]};
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function clamp(s){return s.length<=15?s:s.slice(0,14)+'…';}
return{
generate:function(bookId,ch,sv,ev){
var bk=BibleData.getBook(bookId);if(!bk)return null;
var gt=bk.genre,bn=bk.name;
var vStr=sv===ev?sv:sv+'-'+ev;
var txt='';
var bt=BibleText.getText(bookId,ch);
if(bt){for(var v=sv-1;v<Math.min(ev,bt.length);v++)txt+=bt[v];}
else{for(var v=sv;v<=ev;v++)txt+='节。';}
txt+=' '+bk.desc;
var th=ana(txt);if(th.length===0)th=['faith','grace'];
var ti=clamp(pick(TITLES)(bn,ch,th));
var pts=(POINTS[gt]||POINTS['叙事']);var pt=pick(pts);
var points=[];
for(var i=0;i<pt.length;i++){
var ph=th.length>0?(PHR[th[i%th.length]]||PHR[th[0]]):null;if(!ph)ph=FALL;
points.push({title:pt[i],coreStatement:pick(ph),verseRef:bn+' '+ch+':'+(i+1),explanation:pt[i]+'——这是理解这段经文的重要角度，让我们从神的话语中得到智慧和力量。'});
}
var intro=[];
if(gt==='书信')intro.push(bn+'是一封重要的书信，'+bk.desc+'。');
else intro.push('今天来看'+bn+'第'+ch+'章。');
if(th.length>0){var cn=th.slice(0,2).map(function(t){return CN[t];}).filter(Boolean);if(cn.length)intro.push('重点围绕「'+cn.join('」和「')+'」展开。');}
intro.push('让我们带着敞开的心来聆听。');
var apps=[];var idxs=[];while(apps.length<3){var r=Math.floor(Math.random()*APPS.length);if(idxs.indexOf(r)===-1){idxs.push(r);apps.push(APPS[r]);}}
var end=pick(ENDS);
return{reference:bn+' '+ch+':'+vStr,bookName:bn,chapter:ch,startVerse:sv,endVerse:ev,genre:gt,title:ti,intro:intro,points:points,applications:apps,conclusion:end,generatedAt:new Date().toLocaleString('zh-CN')};
}};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=OutlineGenerator;
