import { riddles, craft, rhythm, paperCut, mapPick, battle } from './mini.js';
// 采石长卷：可走、可进店、可上楼、可划船、可游泳的工笔长卷小游戏
// 底图为 AI 生成（工笔风格），人物与交互为程序绘制
const KAI = '"MaSerif","Noto Serif SC","Songti SC",serif';
const POEM = [['牛渚西江夜', '青天无片云'], ['登舟望秋月', '空忆谢将军'], ['余亦能高咏', '斯人不可闻'], ['明朝挂帆席', '枫叶落纷纷']];
const SEALS = [['tea', '茶干'], ['song', '民歌'], ['war', '古战'], ['cave', '三元'], ['moon', '捉月'], ['boat', '泛舟'], ['swim', '游江'], ['tbl', '太白'], ['deng', '灯彩'], ['cut', '剪纸'], ['shi', '诗会'], ['wz', '乌骓'], ['tm', '天门'], ['qs', '青山'], ['ljt', '凌家滩'], ['ape', '猿人']];
const TMS = [['天门中断楚江开', '碧水东流至此回'], ['两岸青山相对出', '孤帆一片日边来']];
const LAMPS = [.05, .15, .28, .42, .53];
const CUTM = ['鱼与“余”同音，“年年有余”，是剪纸里最常见的吉祥纹样。', '月圆人团圆。李白在采石江上望月的传说，也常被剪进窗花。', '云纹回旋连绵，寓意祥云如意。剪云纹最考验月牙刀口。', '帆船纹寓意“一帆风顺”，长江边的人家尤其喜欢。', '梅花五瓣，寓意“梅开五福”，又报春来。'];
const CUTS = [['鱼', .2], ['月', .33], ['云', .47], ['帆', .58], ['梅', .9]];
// 场景：img 键，crop=[y0,y1]（图高比例），walk=脚底 y（图高比例），xr=可走范围（图宽比例）
const SC = {
  town: { img: 'town', crop: [0, .8], walk: .74, xr: [.02, .985], right: ['tower', .03], hs: [
    { x: .165, t: '进茶干铺', go: ['shop', .1] }, { x: .385, t: '进民歌馆', go: ['song', .08] },
    { x: .47, t: '赴诗会（李白诗歌节）', npc: 'shi' }, { x: .62, t: '与酒家交谈', npc: 'jiu' }, { x: .74, t: '赴灯会之夜（副本）', go: ['lantern', .04] }, { x: .83, t: '看牌坊', card: ['渡口牌坊', '穿过牌坊往江边走，便是翠螺山与采石矶。继续向右。'] }] ,
    npcs: [{ k: 'jiu', x: .655, c: '#7a4b2a', n: '酒家' }, { k: 'shi', x: .49, n: '诗会主持' }] },
  tower: { img: 'tower', crop: [.04, .95], walk: .88, xr: [.01, .99], left: ['town', .97], right: ['cliff', .03], hs: [
    { x: .31, t: '登太白楼', go: ['f1', .84] }] },
  cliff: { img: 'cliff', crop: [0, .9], walk: .605, xr: [.01, .285], left: ['tower', .97], hs: [
    { x: .045, t: '登捉月台', mode: 'ledge' }, { x: .245, t: '进三元洞', ev: 'cave' },
    { x: .27, t: '与艄公交谈', npc: 'shao' }, { x: .282, t: '上船', ev: 'board' }, { x: .2, t: '下水游泳', ev: 'swim' }],
    npcs: [{ k: 'shao', x: .262, c: '#4e5d52', n: '艄公', hat: 1 }] },
  shop: { img: 'shop', crop: [.04, .96], walk: .8, xr: [.04, .97], hs: [
    { x: .08, t: '出门', go: ['town', .165] }, { x: .47, t: '与掌柜交谈', npc: 'zhang' }], npcs: [{ k: 'zhang', x: .5, c: '#6b4a32', n: '掌柜' }] },
  song: { img: 'song', crop: [.04, .96], walk: .74, xr: [.03, .97], hs: [
    { x: .05, t: '出门', go: ['town', .385] }, { x: .55, t: '与歌者对歌', npc: 'ge' }], npcs: [{ k: 'ge', x: .58, y: .665, c: '#a3402f', n: '歌者', f: 1 }] },
  f1: { img: 'f1', crop: [.02, .98], walk: .71, xr: [.03, .95], hs: [
    { x: .14, t: '上二楼', go: ['f2', .1] }, { x: .68, t: '进入李白展厅', ev: 'museum' }, { x: .85, t: '出楼', go: ['tower', .31] }] },
  f2: { img: 'f2', crop: [.02, .98], walk: .85, xr: [.03, .97], hs: [
    { x: .07, t: '下一楼', go: ['f1', .16] }, { x: .5, t: '凭窗远眺', card: ['二楼 · 凭窗', '太白楼依翠螺山而建、面临长江，现存楼阁为清光绪三年（1877）重建，三层两进，楼高18米。'] },
    { x: .93, t: '上三楼', go: ['f3', .1] }] },
  f3: { img: 'f3', crop: [.02, .98], walk: .87, xr: [.03, .97], hs: [
    { x: .06, t: '下二楼', go: ['f2', .9] }, { x: .38, t: '与看楼老人交谈', npc: 'lao' },
    { x: .6, t: '入剪纸江景（副本）', go: ['paper', .04] }, { x: .78, t: '凭栏望江', card: ['顶层 · 凭栏', '长江流到马鞍山折身向北。李白《望天门山》“天门中断楚江开，碧水东流至此回”写的就是这一段江景。'] }],
    npcs: [{ k: 'lao', x: .42, c: '#5b5348', n: '看楼老人', old: 1 }] },
  lantern: { img: 'lantern', crop: [0, 1], walk: .86, xr: [.02, .66], style: 'night', hs: [
    { x: .03, t: '回古镇', go: ['town', .74] },
    { x: .09, t: '见灯会主事', npc: 'zs' }, { x: .22, t: '找扎彩艺人', npc: 'zc' }, { x: .37, t: '猜灯谜', ev: 'riddle' }, { x: .5, t: '与马灯艺人交谈', npc: 'md' },
    { x: .63, t: '看灯彩介绍', card: ['副本 · 灯会之夜', '当涂马灯至少有200余年历史，表演者着五彩戏服、举马灯、挥彩旗、敲锣鼓、吹唢呐；含山民间扎彩（省级非遗）有鲤鱼灯、虾灯、蚌灯、兔子灯、走马灯、宝塔灯等二十多种。'] }], npcs: [{ k: 'zs', x: .1, n: '灯会主事' }, { k: 'zc', x: .235, n: '扎彩艺人' }, { k: 'md', x: .515, n: '马灯艺人' }] },
  paper: { img: 'paper', crop: [0, 1], walk: .815, xr: [.02, .98], style: 'cut', hs: [
    { x: .03, t: '回太白楼', go: ['f3', .6] },
    { x: .1, t: '拜见剪纸艺人', npc: 'jz' }, { x: .27, t: '看剪影戏《太白捉月》', ev: 'shadow' },
    { x: .67, t: '吟《望天门山》', ev: 'tianmen' }], npcs: [{ k: 'jz', x: .12, c: '#b3261e', n: '剪纸艺人', f: 1 }] },
};
const LEDGE = { y: .335, xr: [.26, .48] }, WATER = { y: .64, xr: [.3, .975] };

export function createCScroll(root, onExit, IMG) {
  const cv = root.querySelector('canvas'), g = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imgs = {}; for (const k in IMG) { const im = new Image(); im.src = IMG[k]; imgs[k] = im; }
  let W = 0, Hh = 0, dpr = 1, running = false, last = 0, busy = false;
  const P = { sc: 'town', x: .08, mode: 'walk', dir: 0, face: 1, v: 0, t: 0 };
  let F;
  const freshFlags = () => ({ tea: 0, ticket: 0, quest: 0, frag: [0, 0, 0, 0], seals: new Set(), done: 0, lamp: [0, 0, 0, 0, 0], cut: [0, 0, 0, 0, 0], parade: -1, dl: { met: 0, lan: 0, rid: 0, whip: 0, done: 0, grade: '' }, pc: { met: 0, chuang: null, shadow: 0 } });
  F = freshFlags();
  const $ = s => root.querySelector(s);
  const mg = $('.mg'), qlog = $('.qlog'); let chuangImg = null;
  const dlg = $('.dlg'), act = $('.act'), bar = $('.yinpu2'), toast = $('.toast2');
  bar.innerHTML = SEALS.map(([k, n]) => `<span data-k="${k}">${n}</span>`).join('') + '<em class="frag"></em>';
  function seal(k) { if (F.seals.has(k)) return; F.seals.add(k); const e = bar.querySelector(`[data-k="${k}"]`); e.classList.add('on'); if (!RM && e.animate) e.animate([{ transform: 'scale(1.9)' }, { transform: 'scale(1)' }], { duration: 500 }); say('获得朱印「' + e.textContent + '」'); refreshFrag(); }
  function refreshFrag() { bar.querySelector('.frag').textContent = '诗笺 ' + F.frag.filter(Boolean).length + '/4'; }
  function frag(i) { if (F.frag[i]) return; F.frag[i] = 1; say('拾得诗笺：' + POEM[i].join('，')); refreshFrag(); }
  let tt; function say(s) { toast.textContent = s; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 2600); }
  // 对话框：lines=[[名, 文]...], choices=[[文字, fn]]
  function talk(lines, choices, onEnd) {
    busy = true; let i = 0;
    const show = () => {
      const [n, t] = lines[i]; dlg.querySelector('b').textContent = n; dlg.querySelector('p').textContent = t;
      const box = dlg.querySelector('.ch'); box.innerHTML = '';
      const lastLine = i === lines.length - 1;
      const opts = lastLine && choices ? choices : [[lastLine ? '好' : '继续', null]];
      opts.forEach(([txt, fn]) => { const b = document.createElement('button'); b.textContent = txt; b.onclick = () => {
        if (!lastLine) { i++; show(); return; }
        dlg.classList.remove('on'); busy = false; fn ? fn() : onEnd && onEnd(); }; box.appendChild(b); });
      dlg.classList.add('on');
    }; show();
  }
  const card = (t, p) => talk([[t, p]]);
  // ---------- NPC 与事件 ----------
  const NPC = {
    shi() { if (F.seals.has('shi')) { talk([['诗会主持', '2014年，马鞍山获得“中国诗歌之城”称号。诗会年年都办，明年重阳再来。']]); return; }
      talk([['诗会主持', '1989年马鞍山办了首届中国国际吟诗节，2006年起定名“马鞍山李白诗歌节”，每年重阳前后举行，从未中断。'], ['诗会主持', '今天台上对诗：我出上句，你接下句。都是李白写在咱们这一带的诗。']],
        [['登台对诗', () => riddles(mg, [
          { q: '天门中断楚江开', opts: ['孤帆一片日边来', '碧水东流至此回', '青天无片云', '空忆谢将军'], a: 1, hint: '《望天门山》第二句' },
          { q: '牛渚西江夜', opts: ['青天无片云', '登舟望秋月', '两岸青山相对出', '明朝挂帆席'], a: 0, hint: '《夜泊牛渚怀古》开篇写天色' },
          { q: '两岸青山相对出', opts: ['碧水东流至此回', '枫叶落纷纷', '孤帆一片日边来', '余亦能高咏'], a: 2, hint: '帆从日边来' },
          { q: '登舟望秋月', opts: ['斯人不可闻', '空忆谢将军', '青天无片云', '天门中断楚江开'], a: 1, hint: '想起的是东晋一位将军' }],
          miss => talk([['诗会主持', miss ? '接得不错！' : '一句不差，好诗才！'], ['诗会主持', '送你一枚诗会印。']], null, () => seal('shi')), '诗会 · 对诗', '主持出上句，你接下句', '下台领印')], ['先看看', null]]); },
    zs() { const d = F.dl;
      if (d.done) { talk([['灯会主事', `今夜龙灯舞得${d.grade === '下' ? '还算热闹' : '真是红火'}！明年元宵再来。`]]); return; }
      if (!d.met) { d.met = 1; talk([['灯会主事', '客官来得巧，今夜元宵，长街灯会。只是龙灯还不能出巡——'], ['灯会主事', '一要有人亲手扎一盏兔子灯当引火灯；二要把灯谜摊的谜条都猜下来；三要用引火灯把长街上五盏灯都点亮。'], ['灯会主事', '三样齐了，你来擂鼓引龙。扎灯去找扎彩艺人，谜摊就在兔子灯那边。']]); return; }
      const lack = [!d.lan && '扎兔子灯', !d.rid && '猜灯谜', F.lamp.some(x => !x) && `点灯（${F.lamp.filter(Boolean).length}/5）`].filter(Boolean);
      if (lack.length) { talk([['灯会主事', '还差：' + lack.join('、') + '。']]); return; }
      talk([['灯会主事', '三样都齐了！龙灯就在街口候着。'], ['灯会主事', '当涂大陇孙村的龙灯是竹篾编扎、白纸刷糊的板龙，龙身15截、长约35米，画满龙鳞，嘴衔大红龙珠，龙身里蜡烛通明。'], ['灯会主事', '你来擂鼓——鼓点越齐，龙舞得越欢。']], null, () => rhythm(mg, gr => { d.grade = gr; d.done = 1; F.parade = 0; seal('deng'); say(`龙灯出巡！击鼓评「${gr}」`); }));
    },
    zc() { const d = F.dl;
      if (d.lan) { talk([['扎彩艺人', '兔子灯提好，别让风吹灭了。含山的扎彩，鲤鱼灯、虾灯、蚌灯、走马灯、宝塔灯，样样都扎得。']]); return; }
      talk([['扎彩艺人', '要扎兔子灯？我教你，五道工序，一道都不能乱。']], [['学扎灯', () => craft(mg, '扎兔子灯', '按工序点选，顺序错了要重想', [
        ['劈篾', '把毛竹劈成又细又韧的篾条。'], ['扎骨架', '篾条弯出兔身、兔耳，用细丝扎牢。'], ['糊纸', '骨架上裱一层白绵纸，透光才亮。'], ['彩绘', '点上红眼睛，画几笔花纹。'], ['装烛', '底座插上蜡烛，引火灯就成了。']],
        () => { d.lan = 1; say('得到：兔子灯（引火灯）'); talk([['扎彩艺人', '扎得像模像样！提着它去把长街上的五盏灯点亮吧。']]); })], ['等会儿再来', null]]);
    },
    md() { const d = F.dl;
      if (d.whip === 2) { talk([['马灯艺人', '马鞭找回来了，今晚的马灯能跑全场了！当涂马灯至少有两百多年，演的是杨家将、七仙女、三国这些老戏。']]); return; }
      if (d.whip === 1) { talk([['马灯艺人', '马鞭是红缨的，我刚才在马灯那一带跑过场……']]); return; }
      d.whip = 1; talk([['马灯艺人', '唉，糟了，演出用的红缨马鞭丢了。'], ['马灯艺人', '当涂马灯，演员着五彩戏服、举着马灯、挥彩旗、敲锣鼓、吹唢呐。没有马鞭，这“马”就跑不起来。'], ['马灯艺人', '我刚才在马灯那一带跑过场，劳驾帮我找找？']]);
    },
    jz() { const p = F.pc, n = F.cut.filter(Boolean).length;
      if (!p.met) { p.met = 1; talk([['剪纸艺人', '马鞍山剪纸无须画稿，脱手而剪，既有北方的粗犷，又有南方的细腻。花山剪纸、和县剪纸都是安徽省级非遗。'], ['剪纸艺人', '江上漂着五张纹样，你先去收回来，认认它们的寓意。'], ['剪纸艺人', '收齐了回来，我教你折纸剪一张窗花。']]); return; }
      if (n < 5) { talk([['剪纸艺人', `纹样还差 ${5 - n} 张，在江面上方飘着呢。`]]); return; }
      if (!p.chuang) { talk([['剪纸艺人', '五张纹样都认得了。来，选一种折法，在红纸上下剪刀，展开就是一张对称的窗花。']], [['剪窗花', () => paperCut(mg, url => { p.chuang = url; const im = new Image(); im.src = url; chuangImg = im; say('窗花贴上了'); talk([['剪纸艺人', '剪得好！窗花贴上了天幕。最后去江边对着天门山，吟一首李白的《望天门山》。']]); })], ['等会儿', null]]); return; }
      talk([['剪纸艺人', '当涂布贴画则是“以剪代笔、以布作色”，用碎布拼贴，也是咱们这里的老手艺。']]);
    },
    zhang() {
      if (F.tea === 0) talk([['掌柜', '客官来得巧，采石的茶干刚出笼，嚼着有劲道。'], ['掌柜', '劳驾帮个忙：把这包茶干捎给渡口的艄公，他天天念叨。']],
        [['好，我送过去', () => { F.tea = 1; say('获得：一包茶干'); }], ['下次吧', null]]);
      else if (F.tea === 1) talk([['掌柜', '艄公就在出镇往右的江边码头，翠螺山脚下。']]);
      else talk([['掌柜', '多谢多谢！这茶干是我们采石人的家常味，配一壶茶，能坐一下午。']], null, () => seal('tea'));
    },
    shao() {
      if (F.tea === 1) talk([['艄公', '哟，是茶干铺的茶干！正馋这一口。'], ['艄公', '没什么好谢的，这张船票你拿着，想上船就上，江上看月最好。']], null, () => { F.tea = 2; F.ticket = 1; say('获得：船票'); });
      else if (F.ticket) talk([['艄公', '船就系在码头边，靠近点“上船”就行。会水的话，也能下去游一圈，别往江心去。']]);
      else talk([['艄公', '这儿就是牛渚矶，也叫采石矶。想坐船？镇上茶干铺的掌柜托我的事，你帮着问问。']]);
    },
    ge() {
      if (F.frag[0]) { talk([['歌者', '这是当涂民歌，2006年列进了首批国家级非物质文化遗产名录。']]); return; }
      talk([['歌者', '来对个歌吧！这是我们当涂民歌《唱得绿海泛金波》。'], ['歌者', '“郎在下风薅稻棵，妹在上风唱山歌……”下一句是？']],
        [['歌声越唱越响亮，唱得绿海泛金波', () => talk([['歌者', '对上了！送你一张捡到的诗笺。'], ['歌者', '当涂民歌2006年列入首批国家级非物质文化遗产名录，代表作就有这首《唱得绿海泛金波》。']], null, () => { frag(0); seal('song'); })],
         ['大江东去浪淘尽，千古风流人物', () => talk([['歌者', '这是苏轼的词，可不是我们的民歌，再想想？']])],
         ['春眠不觉晓，处处闻啼鸟', () => talk([['歌者', '这是孟浩然的诗，再想想？']])]]);
    },
    jiu() {
      if (F.seals.has('war')) { talk([['酒家', '采石矶扼守长江天险，历代在这儿打过二十多次仗。']]); return; }
      talk([['酒家', '客官可知道，南宋时这江面上打过一场大仗？'], ['酒家', '1161年宋金采石之战，带兵的文臣是谁？']],
        [['虞允文', () => talk([['酒家', '正是！虞允文率一万八千宋军以少胜多，击退十七万金军。']], null, () => seal('war'))],
         ['岳飞', () => talk([['酒家', '岳飞那时已经不在了。再猜猜？']])], ['辛弃疾', () => talk([['酒家', '辛弃疾是这之后才南归的。再猜猜？']])]]);
    },
    lao() {
      const n = F.frag.filter(Boolean).length;
      if (F.done) { talk([['看楼老人', '诗回来了，楼也就完整了。欢迎常来。']]); return; }
      if (F.quest === 0) talk([['看楼老人', '这座楼原名“谪仙楼”，始建于唐元和年间，现在的楼是清光绪三年重建的。'], ['看楼老人', '李白泊舟牛渚，写下《夜泊牛渚怀古》。可惜楼里的诗笺被江风吹散了四张。'], ['看楼老人', '民歌馆、三元洞、江上、水里……都去找找吧。']], null, () => { F.quest = 1; say('主线：寻回四张诗笺'); });
      else if (n < 4) talk([['看楼老人', `已经找回 ${n} 张了。没找到的，不妨去江边坐船、下水，或钻钻山洞。`]]);
      else order();
    },
  };
  function order(PM = POEM, title = '《夜泊牛渚怀古》', done) { // 排诗句
    busy = true; const box = $('.order'), list = box.querySelector('.ol'), got = box.querySelector('.got'); let k = 0; box.querySelector('h3').textContent = title;
    const idx = PM.map((_, i) => i).sort(() => Math.random() - .5); list.innerHTML = ''; got.innerHTML = '';
    idx.forEach(i => { const b = document.createElement('button'); b.textContent = PM[i].join('，'); b.onclick = () => {
      if (i === k) { b.disabled = true; got.innerHTML += `<div>${PM[i].join('，')}。</div>`; k++; if (k === PM.length) setTimeout(() => { box.classList.remove('on'); busy = false; if (done) return done(); F.done = 1;
        talk([['看楼老人', '《夜泊牛渚怀古》，齐了！牛渚，就是咱们脚下的采石矶。'], ['看楼老人', '一楼的月洞门后连着李白展厅，想多了解诗仙，可以从那儿进去。']], null, () => seal('tbl')); }, 500); }
      else { say('顺序不对，从第一句重新排'); k = 0; got.innerHTML = ''; list.querySelectorAll('button').forEach(x => x.disabled = false); } }; list.appendChild(b); });
    box.classList.add('on');
  }
  const EV = {
    wuzhui() { if (F.seals.has('wz')) { talk([['艄公', '马鞍落地化作山峦，咱们城就叫“马鞍山”了。']]); return; }
      talk([['艄公', '客官可知“马鞍山”这名字怎么来的？我们这儿有个老传说。'], ['艄公', '当年项羽兵败乌江，乌骓马不舍主人，跃江而去，马鞍落在江东，化作了山峦。'], ['艄公', '传说归传说。考考你：传说里那匹马叫什么？']],
        [['乌骓', () => talk([['艄公', '对喽，乌骓！']], null, () => seal('wz'))], ['赤兔', () => talk([['艄公', '赤兔是关公的马。项羽骑的是乌骓。']], null, () => seal('wz'))], ['的卢', () => talk([['艄公', '的卢是刘备的马。项羽骑的是乌骓。']], null, () => seal('wz'))]]); },
    battle() { talk([['艄公', '这片江面，就是采石古战场。1161年金兵要从江北渡江，宋军在这儿拦住了他们。'], ['艄公', '敌船来了！点它们，把船拦在江心。']], null, () => { battle(mg, win => { if (win) seal('war'); }); }); },
    tianmen2() { talk([['江上', '江面在这里收窄，东梁山、西梁山隔江对峙，这就是天门山。'], ['江上', '长江流到马鞍山折身向北。“天门中断楚江开，碧水东流至此回”，写的就是眼前。']], null, () => seal('tm')); },
    map() { mapPick(mg, [
        { k: 'here', n: '采石矶（此处）', x: .59, y: .3, here: 1 },
        { k: 'ape', n: '和县猿人遗址', x: .28, y: .17, done: F.seals.has('ape') },
        { k: 'ljt', n: '含山 · 凌家滩', x: .17, y: .5, done: F.seals.has('ljt') },
        { k: 'qs', n: '当涂 · 大青山', x: .84, y: .58, done: F.seals.has('qs') }], k => k && EV['go_' + k]()); },
    go_qs() { talk([['大青山', '李白终老当涂，魂归青山。大青山李白墓由谷氏家族世代守护。'], ['守墓人', '我家守这座墓已经好多代了。第49代守墓人谷常新，一守就是四十多年。'], ['守墓人', '来都来了，帮着祭扫一回吧，规矩不多，心到就好。']],
        [['祭扫', () => craft(mg, '青山 · 祭扫诗仙', '按顺序点选', [['清扫墓道', '扫净落叶，擦拭墓碑。'], ['献上菊花', '一束黄菊放在碑前。'], ['斟一杯酒', '诗仙好酒，敬他一杯。'], ['吟一首诗', '“天门中断楚江开”——江风把诗句带上了山。']], () => { seal('qs'); say('祭扫完毕'); })], ['下次再来', null]]); },
    go_ljt() { talk([['凌家滩', '含山县凌家滩遗址，距今约5800至5300年，出土玉人、玉龟、刻纹玉版等。'], ['凌家滩', '考古队员递给你一张考卷：答对了，送你一枚凌家滩印。']],
        [['答题', () => riddles(mg, [
          { q: '凌家滩遗址距今大约多少年？', opts: ['约1000年', '约2500年', '约5800至5300年', '约三四十万年'], a: 2, hint: '新石器时代晚期' },
          { q: '凌家滩与哪两处并称“史前三大玉文化中心”？', opts: ['红山、良渚', '殷墟、三星堆', '半坡、河姆渡', '周口店、蓝田'], a: 0, hint: '一处在辽西，一处在杭州' },
          { q: '下面哪件不是凌家滩出土的代表玉器？', opts: ['玉人', '玉龟', '刻纹玉版', '金缕玉衣'], a: 3, hint: '金缕玉衣是汉代的' }],
          () => seal('ljt'), '凌家滩 · 考古问答', '答对即得印', '领印')], ['先看看', null]]); },
    go_ape() { talk([['和县', '江北和县发现的“和县猿人”，距今约三四十万年。'], ['和县', '它是继北京周口店、陕西蓝田之后，我国发现的第三件直立人头骨化石。']],
        [['考考我', () => riddles(mg, [
          { q: '和县猿人距今大约多少年？', opts: ['约三四十万年', '约五千年', '约三千年', '约一亿年'], a: 0, hint: '远在新石器时代以前' },
          { q: '和县猿人头骨化石是我国发现的第几件直立人头骨化石？', opts: ['第一件', '第二件', '第三件', '第十件'], a: 2, hint: '排在周口店、蓝田之后' }],
          () => seal('ape'), '和县猿人 · 问答', '答对即得印', '领印')], ['回船', null]]); },
    riddle() { const d = F.dl; if (d.rid) { talk([['灯谜摊', '谜条都被你撕光了。']]); return; }
      riddles(mg, [
        { q: '两岸青山相对出（打马鞍山一景）', opts: ['翠螺山', '天门山', '雨山', '濮塘'], a: 1, hint: '李白《望天门山》', note: '天门山在城南长江两岸，东梁山、西梁山隔江对峙。' },
        { q: '牛渚西江夜（打采石一处古称所指）', opts: ['采石矶', '太白楼', '三元洞', '雨山湖'], a: 0, hint: '“牛渚”是它的古称', note: '牛渚矶，就是采石矶。' },
        { q: '诗仙醉后江中捞（打采石一处胜迹）', opts: ['谪仙楼', '三台阁', '捉月台', '燃犀亭'], a: 2, hint: '相传李白醉酒跳江捞的是月亮', note: '捉月台原名舍身崖，明正德十四年改名联璧台。' },
        { q: '小小诸葛亮，独坐中军帐，摆下八卦阵，专捉飞来将（打一动物）', opts: ['蜜蜂', '螃蟹', '蜘蛛', '燕子'], a: 2, hint: '八卦阵是它织的网' }],
        miss => { d.rid = 1; say(miss ? `谜条全撕下（猜错 ${miss} 次）` : '一猜即中，四条全中！'); });
    },
    shadow() { F.pc.shadow = 1; talk([['剪影戏', '（红纸剪的小人儿在灯后动起来）'], ['剪影戏', '诗人乘一叶小舟，在采石江上举杯邀月。'], ['剪影戏', '月影落在江心，他俯身去捞——这便是“太白捉月”的传说。'], ['剪影戏', '传说归传说，采石矶至今留着捉月台、太白楼、李白衣冠冢。']]); },
    cave() { talk([['三元洞', '采石矶最大的天然洞穴。洞口凭栏，矶头绝壁临江，耳边是江涛拍岸。'], ['三元洞', F.frag[2] ? '洞里很安静，只有水声。' : '石缝里夹着一张诗笺……']], null, () => { frag(2); seal('cave'); }); },
    board() { if (!F.ticket) { talk([['艄公', '上船得有船票。镇上茶干铺的掌柜托我的事，你帮着问问？']]); return; } P.mode = 'boat'; P.x = .33; say('上船了：◀ ▶ 划船，去月亮的倒影那儿看看'); },
    swim() { P.mode = 'swim'; P.x = .31; say('下水了：◀ ▶ 游动，捉月台下好像漂着什么'); },
    tianmen() { if (!F.pc.chuang && !CUTS.some((c, i) => !F.cut[i])) { talk([['天门山', '先回去跟剪纸艺人学剪一张窗花，再来吟诗。']]); return; }
      if (CUTS.some((c, i) => !F.cut[i])) { talk([['天门山', `江上还漂着 ${CUTS.filter((c, i) => !F.cut[i]).length} 张剪纸，先都收起来，再来吟诗。`]]); return; }
      order(TMS, '《望天门山》', () => talk([['天门山', '天门山在马鞍山城南的长江两岸，东为东梁山、西为西梁山，隔江对峙如门。']], null, () => seal('cut'))); },
    museum() { talk([['月洞门', '门后连着「李白 3D 虚拟展馆」，将在新窗口打开线上展厅。']], [['进入展厅', () => window.open('https://www.teacherlele.cn/sites/libai/', '_blank')], ['先不去', null]]); },
  };
  // ---------- 热点 ----------
  function hotspots() {
    const s = SC[P.sc], out = [];
    if (P.mode === 'walk') for (const h of s.hs) if (Math.abs(h.x - P.x) < .03 * (s.img.length && imgW(s) > 2000 ? 1 : 2)) out.push(h);
    if (P.sc === 'lantern' && P.mode === 'walk') { LAMPS.forEach((x, i) => { if (!F.lamp[i] && Math.abs(P.x - x) < .04) out.push({ t: '点灯', fn: () => { if (!F.dl.lan) { talk([['灯会', '没有引火灯点不着。先去找扎彩艺人扎一盏兔子灯。']]); return; } F.lamp[i] = 1; say(`点亮第 ${F.lamp.filter(Boolean).length} 盏灯`); if (F.lamp.every(Boolean)) say('五盏灯都亮了，回去告诉灯会主事'); } }); }); }
    if (P.sc === 'lantern' && P.mode === 'walk' && F.dl.whip === 1 && Math.abs(P.x - .13) < .03) out.push({ t: '拾起红缨马鞭', fn: () => { F.dl.whip = 2; say('找到了马鞭，送回给马灯艺人'); } });
    if (P.sc === 'paper' && P.mode === 'walk') CUTS.forEach(([n, x], i) => { if (!F.cut[i] && Math.abs(P.x - x) < .035) out.push({ t: '收纹样「' + n + '」', fn: () => { F.cut[i] = 1; talk([['纹样 · ' + n + `（${F.cut.filter(Boolean).length}/5）`, CUTM[i]]]); } }); });
    if (P.mode === 'ledge') { out.push({ t: '下捉月台', fn: () => { P.mode = 'walk'; P.x = .06; } }); if (P.x > .42) out.push({ t: '临台望月', fn: () => talk([['捉月台', '这块嵌在临江峭壁上的巨石，原名舍身崖，又名捉月台。相传李白醉酒于此跳江捉月。'], ['捉月台', '明正德十四年（1519）改名联璧台。']], null, () => seal('moon')) }); }
    if (P.mode === 'boat') { if (P.x < .34) out.push({ t: '上岸', fn: () => { P.mode = 'walk'; P.x = .27; } }); if (Math.abs(P.x - .4) < .04) out.push({ t: '江上古战场', fn: EV.battle }); if (Math.abs(P.x - .52) < .04) out.push({ t: '听艄公讲地名', fn: EV.wuzhui }); if (P.x > .9) { out.push({ t: '远眺天门山', fn: EV.tianmen2 }); out.push({ t: '顺江远游（舆图）', fn: EV.map }); }
      if (Math.abs(P.x - .72) < .04) out.push({ t: '停船望月', fn: () => talk([['江上', '月亮的倒影就在船边。“登舟望秋月，空忆谢将军”——船舷边漂来一张诗笺。']], null, () => { frag(1); seal('boat'); }) }); }
    if (P.mode === 'swim') { if (P.x < .34) out.push({ t: '上岸', fn: () => { P.mode = 'walk'; P.x = .25; } }); if (Math.abs(P.x - .46) < .035) out.push({ t: '拾起诗笺', fn: () => talk([['江水', '捉月台下的回水里，一张诗笺打着旋儿漂过来。']], null, () => { frag(3); seal('swim'); }) }); if (P.x > .8) out.push({ t: '往回游', fn: () => say('江心水急，往回游吧') }); }
    return out;
  }
  const imgW = s => (imgs[s.img] && imgs[s.img].naturalWidth) || 3072;
  function doHS(h) {
    if (busy || mg.classList.contains('on')) return;
    if (h.fn) return h.fn();
    if (h.go) return goto(h.go[0], h.go[1]);
    if (h.npc) return NPC[h.npc]();
    if (h.ev) return EV[h.ev]();
    if (h.card) return card(h.card[0], h.card[1]);
    if (h.mode === 'ledge') { P.mode = 'ledge'; P.x = .25; say('上了捉月台，往崖边走走'); }
  }
  let fade = 0; function goto(sc, x) { fade = 1; setTimeout(() => { P.sc = sc; P.x = x; P.mode = 'walk'; }, RM ? 0 : 180); }
  const QL = {
    lantern: () => { const d = F.dl; return ['灯会之夜', [['见灯会主事', d.met], ['扎兔子灯', d.lan], ['猜灯谜 4 条', d.rid], [`点亮长街五盏灯 ${F.lamp.filter(Boolean).length}/5`, F.lamp.every(Boolean)], ['擂鼓引龙灯出巡', d.done], ['支线：找回红缨马鞭', d.whip === 2]]]; },
    paper: () => { const p = F.pc, n = F.cut.filter(Boolean).length; return ['剪纸江景', [['拜见剪纸艺人', p.met], [`收纹样 ${n}/5`, n === 5], ['折纸剪窗花', !!p.chuang], ['吟《望天门山》', F.seals.has('cut')], ['看剪影戏《太白捉月》', p.shadow]]]; } };
  function renderQ() { const f = QL[P.sc]; const html = f ? (([t, L]) => `<b>${t}</b>` + L.map(([x, ok]) => `<div class="${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${x}</div>`).join(''))(f()) : '';
    if (qlog.dataset.h !== html) { qlog.dataset.h = html; qlog.innerHTML = html; qlog.style.display = html ? '' : 'none'; } }
  function renderAct() {
    const hs = busy ? [] : hotspots(); const key = hs.map(h => h.t).join('|');
    if (act.dataset.k === key) return; act.dataset.k = key; act.innerHTML = '';
    hs.forEach(h => { const b = document.createElement('button'); b.textContent = h.t; b.onclick = () => doHS(h); act.appendChild(b); });
  }
  // ---------- 输入 ----------
  const keys = {};
  addEventListener('keydown', e => { if (!running) return; keys[e.key] = 1;
    if (['e', 'E', ' ', 'Enter', 'ArrowUp', 'w', 'W'].includes(e.key) && !busy && !mg.classList.contains('on')) { const h = hotspots()[0]; if (h) { doHS(h); e.preventDefault(); } } });
  addEventListener('keyup', e => keys[e.key] = 0);
  const hold = (el, d) => { const on = e => { P.dir = d; e.preventDefault(); }, off = () => P.dir = 0; el.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(k => el.addEventListener(k, off)); };
  hold($('.l2'), -1); hold($('.r2'), 1);
  // ---------- 绘制 ----------
  // 古画人物精灵（AI 生成逐帧图集：每张 2 行×6 帧，朝右；锚点为脚底、头部中线）
  const SPM = {"hero": {"w": 198, "h": 300, "ax": 0.6136883711254421, "n": [6, 6]}, "elder": {"w": 183, "h": 300, "ax": 0.5689048581480649, "n": [6, 6]}, "boat": {"w": 210, "h": 300, "ax": 0.45165607226497156, "n": [6, 6]}, "singer": {"w": 180, "h": 300, "ax": 0.5192447349310094, "n": [6, 6]}}, SPI = {};
  for (const k in SPM) { const im = new Image(); im.src = (window.__SPR || {})[k] || ''; SPI[k] = im; }
  function sprite(k, row, f, x, y, h, face = 1, alpha = 1) {
    const m = SPM[k], im = SPI[k]; if (!im.complete || !im.naturalWidth) return false;
    const n = m.n[row], fi = ((f % n) + n) % n, w = h * m.w / m.h;
    g.save(); g.globalAlpha = alpha; g.translate(x, y); g.scale(face, 1);
    g.fillStyle = 'rgba(40,30,20,.16)'; g.beginPath(); g.ellipse(0, 0, w * .32, h * .025, 0, 0, 7); g.fill();
    g.drawImage(im, fi * m.w, row * m.h, m.w, m.h, -m.ax * w, -h, w, h); g.restore(); return true;
  }
  const NSP = { shi: ['elder', 1, 3], zs: ['elder', 1, 3], zc: ['singer', 1, 3], md: ['boat', 0, 0], shao: ['boat', 1, 5], lao: ['elder', 1, 4], ge: ['singer', 1, 4], zhang: ['elder', 1, 3], jiu: ['singer', 1, 3] };
  // 白描人物（剪纸副本里用作剪影偶；精灵未加载时兜底）
  function person(x, y, s, c, opts = {}) {
    const t = P.t, w = opts.walk ? Math.sin(t * 8) : 0, cut = SC[P.sc].style === 'cut';
    const INK = cut ? '#a3201a' : '#1d1a16', WASH = cut ? '#b3261e' : c, PAPER = cut ? '#f3e7cf' : '#f4ecd9';
    g.save(); g.translate(x, y); g.scale((opts.face || 1) * s / 100, s / 100); g.lineCap = 'round'; g.lineJoin = 'round';
    if (cut) { g.shadowColor = '#fff6e2'; g.shadowBlur = 8; }
    if (!cut) { g.fillStyle = 'rgba(30,25,20,.12)'; g.beginPath(); g.ellipse(0, 0, 15, 2.5, 0, 0, 7); g.fill(); }
    const L = (lw) => { g.lineWidth = lw; g.strokeStyle = INK; };
    // 腿/鞋
    L(2.2); g.beginPath(); g.moveTo(-2, -26); g.lineTo(-3 - w * 7, -1); g.moveTo(2, -26); g.lineTo(3 + w * 7, -1); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(-1 - w * 7, -1, 4, 1.8, 0, 0, 7); g.ellipse(5 + w * 7, -1, 4, 1.8, 0, 0, 7); g.fill();
    // 长袍（衣摆随步摆动）
    g.beginPath(); g.moveTo(-6, -76); g.bezierCurveTo(-11, -55, -13, -30, -15 - w * 3, -9); g.quadraticCurveTo(0, -6 + Math.abs(w) * 2, 14 + w * 3, -9); g.bezierCurveTo(12, -30, 10, -55, 6, -76); g.closePath();
    g.fillStyle = cut ? WASH : PAPER; g.fill();
    if (!cut) { g.globalAlpha = .38; g.fillStyle = WASH; g.fill(); g.globalAlpha = 1; L(1.7); g.stroke();
      L(1); g.beginPath(); g.moveTo(-3, -70); g.quadraticCurveTo(-5, -40, -6 - w * 2, -10); g.moveTo(3, -62); g.quadraticCurveTo(5, -38, 6 + w * 2, -12); g.stroke(); // 衣纹
      L(2.2); g.beginPath(); g.moveTo(-7, -50); g.lineTo(7, -50); g.stroke(); } // 腰带
    else { g.fillStyle = PAPER; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-6 + i * 3.5, -40 + (i & 1) * 6); g.lineTo(-4 + i * 3.5, -36 + (i & 1) * 6); g.lineTo(-2 + i * 3.5, -40 + (i & 1) * 6); g.fill(); } g.fillRect(-7, -51, 14, 1.6); }
    // 宽袖
    g.beginPath(); g.moveTo(-5, -74); g.quadraticCurveTo(-16 + w * 5, -60, -13 + w * 7, -44); g.quadraticCurveTo(-8 + w * 5, -42, -6 + w * 3, -50); g.closePath();
    g.moveTo(5, -74); g.quadraticCurveTo(16 - w * 5, -60, 13 - w * 7, -44); g.quadraticCurveTo(8 - w * 5, -42, 6 - w * 3, -50); g.closePath();
    g.fillStyle = cut ? WASH : PAPER; g.fill(); if (!cut) { L(1.5); g.stroke(); }
    // 头
    g.beginPath(); g.ellipse(0, -84, 6, 7.2, 0, 0, 7); g.fillStyle = cut ? WASH : '#f6e9d6'; g.fill(); if (!cut) { L(1.5); g.stroke(); }
    if (cut) { g.fillStyle = PAPER; g.beginPath(); g.arc(3.4, -85, 1, 0, 7); g.fill(); } else { g.fillStyle = INK; g.fillRect(2.6, -86, 1.4, 1.2); }
    g.fillStyle = INK;
    if (opts.hat) { g.beginPath(); g.moveTo(-15, -86); g.quadraticCurveTo(0, -101, 15, -86); g.quadraticCurveTo(0, -89, -15, -86); g.fill(); }
    else if (opts.f) { g.beginPath(); g.ellipse(-1, -90, 6.5, 4.5, 0, Math.PI, 0); g.fill(); g.beginPath(); g.arc(-4, -94, 3.4, 0, 7); g.fill(); g.fillStyle = cut ? PAPER : '#b3261e'; g.fillRect(1, -96, 2.4, 2.4); }
    else { g.beginPath(); g.ellipse(0, -90, 6.4, 4, 0, Math.PI, 0); g.fill(); g.fillRect(-2.2, -98, 4.4, 6); g.beginPath(); g.moveTo(-2, -93); g.quadraticCurveTo(-11, -93 + Math.sin(t * 3) * 1.5, -13, -88); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke(); }
    if (opts.old) { L(1); g.strokeStyle = cut ? PAPER : '#777'; g.beginPath(); g.moveTo(1, -77); g.quadraticCurveTo(2, -70, 0, -64); g.stroke(); }
    g.restore();
  }
  function swimmer(x, y, s) { const im = imgs.swim; if (!im || !im.complete) return; const fw = im.naturalWidth / 6, fh = im.naturalHeight, f = Math.floor(P.t * 7) % 6, w = s * 1.15, h = w * fh / fw;
    g.save(); g.translate(x, y); g.scale(P.face, 1); g.drawImage(im, f * fw, 0, fw, fh, -w / 2, -h * .62, w, h); g.restore(); }
  function boat(x, y, s) { if (SC[P.sc].style !== 'cut' && imgs.boatride && imgs.boatride.complete) { const im = imgs.boatride, w = s * 2.3, h = w * im.naturalHeight / im.naturalWidth;
      g.save(); g.translate(x, y + Math.sin(P.t * 2) * s * .02); g.scale(P.face, 1); g.drawImage(im, -w / 2, -h * .9, w, h); g.restore(); return; }
 const t = P.t; g.save(); g.translate(x, y + Math.sin(t * 2) * s * .02); g.scale(P.face * s / 100, s / 100);
    const cut = SC[P.sc].style === 'cut'; g.fillStyle = cut ? '#b3261e' : '#f4ecd9'; g.beginPath(); g.moveTo(-75, -12); g.quadraticCurveTo(0, 10, 80, -16); g.lineTo(62, 2); g.lineTo(-58, 2); g.fill();
    g.strokeStyle = cut ? '#b3261e' : '#1d1a16'; g.lineWidth = 2; g.stroke(); if (!cut) { g.beginPath(); for (let i = -50; i < 60; i += 14) { g.moveTo(i, -6); g.lineTo(i + 6, -2); } g.lineWidth = 1; g.stroke(); } g.restore();
    if (SC[P.sc].style === 'cut' || !sprite('hero', 0, 0, x - P.face * s * .1, y - s * .02, s * .95, P.face)) person(x - P.face * s * .1, y - s * .08, s * .78, '#5f8590', { face: P.face });
    g.save(); g.translate(x, y); g.scale(P.face, 1); g.strokeStyle = '#2b241d'; g.lineWidth = 3; g.beginPath(); g.moveTo(-s * .05, -s * .5); g.lineTo(-s * .55 + Math.sin(t * 3) * s * .1, s * .15); g.stroke(); g.restore(); }
  const dark = document.createElement('canvas'), dg = dark.getContext('2d');
  function drawNight(fx, fy, H) {
    if (dark.width !== cv.width) { dark.width = cv.width; dark.height = cv.height; }
    dg.setTransform(dpr, 0, 0, dpr, 0, 0); dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, W, Hh);
    dg.fillStyle = 'rgba(8,12,32,.62)'; dg.fillRect(0, 0, W, Hh); dg.globalCompositeOperation = 'destination-out';
    const lit = F.lamp.filter(Boolean).length;
    LAMPS.forEach((x, i) => { if (!F.lamp[i]) return; const cx = fx(x), cy = fy(.62), r = H * (.28 + .02 * Math.sin(P.t * 3 + i));
      const gr = dg.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gr; dg.fillRect(cx - r, cy - r, r * 2, r * 2); });
    if (lit === 5) { dg.fillStyle = 'rgba(0,0,0,.6)'; dg.fillRect(0, 0, W, Hh); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(dark, 0, 0); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    LAMPS.forEach((x, i) => { const cx = fx(x), cy = fy(.62); g.fillStyle = F.lamp[i] ? 'rgba(255,190,90,.9)' : 'rgba(255,255,255,.25)';
      if (!F.lamp[i]) { g.beginPath(); g.arc(cx, cy, 4 + Math.sin(P.t * 4) * 1.5, 0, 7); g.fill(); } });
    if (F.parade >= 0) { F.parade += 1 / 60; const head = 1.05 - F.parade * .07; drawDragon(fx, fy, H, head); if (head < -1.3) F.parade = -1; }
  }
  function drawDragon(fx, fy, H, head) { // 龙灯巡游：AI 生成的版画风龙灯队伍图
    const im = imgs.dragon; if (!im || !im.complete) return;
    const dh = H * .5, dw = dh * im.naturalWidth / im.naturalHeight, x = fx(head), y = fy(.86) - dh + Math.sin(P.t * 6) * H * .006;
    g.save(); g.shadowColor = 'rgba(255,180,80,.55)'; g.shadowBlur = H * .04; g.drawImage(im, x, y, dw, dh); g.restore();
  }
  function view() { const s = SC[P.sc], im = imgs[s.img], iw = im.naturalWidth || 3072, ih = im.naturalHeight || 1024, ch = (s.crop[1] - s.crop[0]) * ih;
    const k = Math.max(Hh / ch, W / iw); return { s, im, iw, ih, ch, k }; }
  function frame(now) {
    if (!running) return; const dt = Math.min(.05, (now - last) / 1000 || 0); last = now; P.t += dt;
    const V = view(), { s, im, iw, ih, k } = V;
    const dir = busy || mg.classList.contains('on') ? 0 : (P.dir || ((keys.ArrowRight || keys.d || keys.D) ? 1 : (keys.ArrowLeft || keys.a || keys.A) ? -1 : 0));
    const sp = (P.mode === 'swim' ? 90 : P.mode === 'boat' ? 200 : 170) / iw; // 图宽比例/秒
    P.hold = dir ? (P.hold || 0) + dt : 0; const spd = sp * (P.mode === 'walk' || P.mode === 'ledge' ? (P.hold > .8 || keys.Shift ? 2 : 1) : 1);
    P.v += (dir * spd - P.v) * Math.min(1, dt * 8); if (dir) P.face = dir;
    let xr = P.mode === 'ledge' ? LEDGE.xr : (P.mode === 'boat' || P.mode === 'swim') ? WATER.xr : s.xr;
    P.x += P.v * dt;
    if (P.mode === 'walk' && P.x > xr[1] && s.right) goto(...s.right);
    if (P.mode === 'walk' && P.x < xr[0] && s.left) goto(...s.left);
    P.x = Math.max(xr[0], Math.min(xr[1], P.x));
    // 镜头
    const px = P.x * iw * k, camX = Math.max(0, Math.min(iw * k - W, px - W * .45)), oy = (Hh - (s.crop[1] - s.crop[0]) * ih * k) / 2 - s.crop[0] * ih * k;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#e9dcbc'; g.fillRect(0, 0, W, Hh);
    if (im.complete) g.drawImage(im, -camX, oy, iw * k, ih * k);
    const fy = f => oy + f * ih * k, fx = f => f * iw * k - camX, ph = ih * k * .17;
    // 水面月光微动
    if (P.sc === 'cliff' && !RM) { g.strokeStyle = 'rgba(70,60,40,.45)'; g.lineWidth = 1.5; for (let i = 0; i < 8; i++) { const xx = fx(.72) + Math.sin(P.t * 1.3 + i) * 20 - 30, yy = fy(.6 + i * .025); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 40 + i * 4, yy); g.stroke(); } }
    // 诗笺漂浮提示
    if (P.sc === 'cliff' && !F.frag[3]) { g.fillStyle = 'rgba(250,240,215,.95)'; g.save(); g.translate(fx(.46), fy(.66) + Math.sin(P.t * 2) * 3); g.rotate(.2); g.fillRect(-9, -12, 18, 24); g.strokeStyle = '#b3261e'; g.strokeRect(-9, -12, 18, 24); g.restore(); }
    if (P.sc === 'lantern') drawNight(fx, fy, ih * k);
    if (P.sc === 'lantern' && F.dl.whip === 1) { const wx = fx(.13), wy = fy(.855); g.strokeStyle = '#5a3a1a'; g.lineWidth = 3; g.beginPath(); g.moveTo(wx - 18, wy); g.lineTo(wx + 14, wy - 4); g.stroke(); g.fillStyle = '#d8342a'; g.beginPath(); g.arc(wx + 16, wy - 5, 5, 0, 7); g.fill();
      g.fillStyle = `rgba(255,230,150,${.5 + .5 * Math.sin(P.t * 6)})`; g.beginPath(); g.arc(wx, wy - 14, 3, 0, 7); g.fill(); }
    if (P.sc === 'paper' && chuangImg && chuangImg.complete) { const sz = ih * k * .2; g.save(); g.globalAlpha = .95; g.drawImage(chuangImg, fx(.4) - sz / 2, fy(.04), sz, sz); g.restore(); }
    if (P.sc === 'paper') CUTS.forEach(([n, x], i) => { if (F.cut[i]) return; const cx = fx(x), cy = fy(.42) + Math.sin(P.t * 2 + i) * 6, r = ih * k * .05;
      g.save(); g.translate(cx, cy); g.rotate(Math.sin(P.t + i) * .15); g.fillStyle = '#b3261e'; g.beginPath(); for (let j = 0; j < 16; j++) { const a = j / 16 * 6.283, rr = j & 1 ? r * .78 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill();
      g.fillStyle = '#f3e7cf'; g.font = `${r * 1.1}px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 0, 2); g.restore(); });
    const night = P.sc === 'lantern';
    function nameplate(t, x, y, fs, dark) { g.save(); g.font = `700 ${fs}px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const w = g.measureText(t).width + fs * 1.5, h = fs * 1.6, x0 = x - w / 2, y0 = y - h;
      g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
      g.fillStyle = dark ? 'rgba(30,24,20,.86)' : 'rgba(247,240,224,.95)'; g.beginPath(); g.roundRect ? g.roundRect(x0, y0, w, h, 3) : g.rect(x0, y0, w, h); g.fill();
      g.shadowColor = 'transparent'; g.strokeStyle = dark ? 'rgba(240,200,140,.7)' : 'rgba(40,32,24,.55)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#b3261e'; g.fillRect(x0 + fs * .32, y0 + h * .22, fs * .22, h * .56);
      g.fillStyle = dark ? '#f6e7c8' : '#2a211a'; g.fillText(t, x + fs * .12, y0 + h / 2 + 1);
      g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x, y + 5); g.closePath(); g.fillStyle = dark ? 'rgba(30,24,20,.86)' : 'rgba(247,240,224,.95)'; g.fill(); g.restore(); }
    // NPC
    for (const n of s.npcs || []) { const ny = fy(n.y || s.walk); const sp_ = NSP[n.k], cut_ = s.style === 'cut'; if (cut_ || !sp_ || !sprite(sp_[0], sp_[1], Math.floor(P.t * sp_[2] + n.x * 7), fx(n.x), ny, ph * (n.y ? .95 : 1), -1)) person(fx(n.x), ny, ph * (n.y ? .95 : 1), n.c, { hat: n.hat, f: n.f, old: n.old, face: -1 });
      nameplate(n.n, fx(n.x), ny - ph * 1.1, Math.max(13, ph * .15), night); }
    // 玩家
    const moving = Math.abs(P.v) > sp * .2; P.anim = P.anim || 0;
    const run = P.hold > .8 || keys.Shift; P.anim = moving && !RM ? P.anim + dt * (run ? 13 : 9) : 0;
    const hero = (yy, hh) => { if (s.style === 'cut' || !sprite('hero', moving && run ? 1 : 0, moving ? Math.floor(P.anim) : 0, fx(P.x), yy, hh, P.face)) person(fx(P.x), yy, hh, '#5f8590', { walk: moving && !RM, face: P.face }); };
    if (P.mode === 'walk') hero(fy(s.walk), ph);
    if (P.sc === 'lantern' && F.dl.lan && P.mode === 'walk') { const lx = fx(P.x) + P.face * ph * .2, ly = fy(s.walk) - ph * .42 + Math.sin(P.t * 5) * 2;
      g.save(); g.shadowColor = 'rgba(255,170,60,.9)'; g.shadowBlur = ph * .15; g.fillStyle = '#fff0cc'; g.strokeStyle = '#3a2a1a'; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(lx, ly, ph * .07, ph * .045, 0, 0, 7); g.fill(); g.shadowBlur = 0; g.stroke();
      g.beginPath(); g.ellipse(lx + P.face * ph * .04, ly - ph * .06, ph * .012, ph * .035, P.face * .3, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#d8342a'; g.beginPath(); g.arc(lx + P.face * ph * .05, ly - ph * .01, ph * .008, 0, 7); g.fill(); g.restore(); }
    if (P.mode === 'ledge') hero(fy(LEDGE.y), ph * .7);
    if (P.mode === 'swim') swimmer(fx(P.x), fy(WATER.y), ph * .8);
    if (P.mode === 'boat') boat(fx(P.x), fy(WATER.y), ph * 1.1);
    // 热点提示
    for (const h of (P.mode === 'walk' ? s.hs : [])) { const d = Math.abs(h.x - P.x); if (d < .12) { g.globalAlpha = 1 - d / .12; g.fillStyle = '#b3261e'; g.beginPath(); g.arc(fx(h.x), fy(s.walk) - ph * 1.35 + Math.sin(P.t * 3) * 3, 5, 0, 7); g.fill(); g.globalAlpha = 1; } }
    if (fade > 0) { g.fillStyle = `rgba(233,220,188,${Math.min(1, fade * 2)})`; g.fillRect(0, 0, W, Hh); fade -= dt * 2.6; }
    renderQ(); renderAct(); requestAnimationFrame(frame);
  }
  function resize() { W = innerWidth; Hh = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = Hh * dpr; }
  function reset(trial) { F = freshFlags(); chuangImg = null; bar.querySelectorAll('span').forEach(e => e.classList.remove('on')); refreshFrag(); P.sc = 'town'; P.x = .08; P.mode = 'walk'; busy = false; dlg.classList.remove('on'); $('.order').classList.remove('on'); $('.trial2').style.display = trial ? '' : 'none'; }
  const intro = $('.intro2');
  $('.try2').onclick = () => { intro.classList.add('off'); reset(true); };
  $('.start2').onclick = () => { intro.classList.add('off'); reset(false); };
  $('.skip2').onclick = () => { localStorage.setItem('mas-cs-intro', 'skip'); intro.classList.add('off'); reset(false); };
  $('.trial2 button').onclick = () => reset(false);
  $('.back2').onclick = () => { running = false; root.classList.remove('on'); onExit(); };
  $('.help2').onclick = () => intro.classList.remove('off');
  addEventListener('resize', () => running && resize()); addEventListener('orientationchange', () => setTimeout(() => running && resize(), 200));
  refreshFrag();
  window.__cs = { P, F: () => F, doHS, hotspots, goto: (sc, x, m) => { P.sc = sc; P.x = x; P.mode = m || 'walk'; } };
  return { open() { root.classList.add('on'); resize(); running = true; last = performance.now(); requestAnimationFrame(frame);
    if (localStorage.getItem('mas-cs-intro') === 'skip') intro.classList.add('off'); else intro.classList.remove('off'); } };
}
