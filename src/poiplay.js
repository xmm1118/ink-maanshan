// 3D 首页景点互动：答题盖「城印」、跳进长卷、镜头游线、木刺拼字
import { riddles, craft } from './mini.js';

// 每题均取自卡片简介里已核实的资料
export const QZ = {
  csj: { q: '采石矶与南京燕子矶、岳阳城陵矶并称什么？', opts: ['长江三矶', '江南三楼', '天下三关', '吴楚三渡'], a: 0, hint: '都在长江边', note: '采石矶被誉为“长江三矶”之首。' },
  tbl: { q: '太白楼现存建筑是哪一年重建的？', opts: ['唐元和年间', '明正德十四年', '清光绪三年（1877）', '1959年'], a: 2, hint: '清代', note: '楼高18米，三层两进；始建时名“谪仙楼”。' },
  ysh: { q: '雨山湖素有什么美称？', opts: ['九峰环一湖', '三山半落青天外', '一湖映双塔', '十里荷花'], a: 0, hint: '数一数湖边的山', note: '1959年辟为城市公园。' },
  cj: { q: '下面哪首李白名篇与马鞍山这段江景相关？', opts: ['《早发白帝城》', '《望天门山》', '《黄鹤楼送孟浩然》', '《蜀道难》'], a: 1, hint: '天门中断楚江开', note: '采石矶一带是李白赋诗最多的地方之一。' },
  ahut: { q: '安徽工业大学的前身创建于哪一年？', opts: ['1958年', '1978年', '1985年', '2000年'], a: 0, hint: '马鞍山钢铁工业学校', note: '2000年组建为安徽工业大学。' },
  mt: { q: '雨山湖北侧那栋最高的楼是？', opts: ['金鹰国际', '太白楼', '电视塔', '佳山图书馆'], a: 0, hint: '约228米、45层', note: '高度来自 OpenStreetMap。' },
  tyc: { q: '体育场所在的是安工大哪个校区？', opts: ['佳山校区', '秀山校区', '采石校区', '当涂校区'], a: 0, hint: '就在雨山湖东南', note: '迎新资料称佳山为“校本区”。' },
  xs: { q: '秀山校区在迎新资料里又被称为？', opts: ['东校区', '西校区', '新校区', '老校区'], a: 0, hint: '在城东', note: '地址：马向路1530号。' },
  zr: { q: '朱然墓靠什么迅速确认了墓主身份？', opts: ['墓碑', '木刺与木谒', '铜印', '族谱'], a: 1, hint: '相当于古人的名片', note: '出土木刺14枚、木谒3枚。' },
  gz: { q: '2006年列入首批国家级非遗名录的是？', opts: ['当涂民歌', '黄梅戏', '凤阳花鼓', '徽州三雕'], a: 0, hint: '古镇上能听到的歌', note: '马鞍山本地的民歌。' },
  syd: { q: '三元洞在采石矶算是？', opts: ['最大的天然洞穴', '人工开凿的石窟', '地下暗河', '古代矿洞'], a: 0, hint: '天然形成', note: '洞口凭栏可见矶头绝壁临江。' },
  zyt: { q: '捉月台的传说讲的是谁？', opts: ['李白', '杜甫', '苏轼', '白居易'], a: 0, hint: '醉酒跳江捉月', note: '明正德十四年（1519）改名联璧台。' },
  war: { q: '1161年采石之战，率宋军以少胜多的是？', opts: ['虞允文', '岳飞', '韩世忠', '辛弃疾'], a: 0, hint: '姓虞', note: '一万八千宋军击退十七万金军。' },
  sgj: { q: '马鞍山李白诗歌节一般在什么时候举行？', opts: ['重阳前后', '元宵', '清明', '端午'], a: 0, hint: '登高的节日', note: '1989年首届吟诗节，2006年起定名李白诗歌节。' },
  tm: { q: '“天门中断楚江开”的下一句是？', opts: ['碧水东流至此回', '孤帆一片日边来', '两岸青山相对出', '唯见长江天际流'], a: 0, hint: '江水在这里折身向北', note: '出自李白《望天门山》。' },
  hx: { q: '和县猿人距今大约多少年？', opts: ['三四十万年', '五千年', '一百万年', '三千年'], a: 0, hint: '直立人', note: '我国发现的第三件直立人头骨化石。' },
  ljt: { q: '凌家滩与红山、良渚并称什么？', opts: ['史前三大玉文化中心', '三大青铜文化', '三大陶器之乡', '三大古城'], a: 0, hint: '出土玉人、玉龟', note: '距今约5800至5300年。' },
  qs: { q: '李白墓所在的大青山属于哪里？', opts: ['当涂', '和县', '含山', '博望'], a: 0, hint: '李白终老之地', note: '谷氏家族世代守墓。' },
};
// 跳进长卷：[场景, 位置, 模式, 按钮字]
export const JUMP = {
  csj: ['cliff', .2, 'walk', '去长卷 · 采石矶'], tbl: ['tower', .28, 'walk', '去长卷 · 太白楼'], gz: ['town', .1, 'walk', '去长卷 · 古镇'],
  sgj: ['town', .44, 'walk', '去长卷 · 诗会'], syd: ['cliff', .23, 'walk', '去长卷 · 三元洞'], zyt: ['cliff', .06, 'walk', '去长卷 · 捉月台'],
  war: ['cliff', .4, 'boat', '去长卷 · 江上古战场'], cj: ['cliff', .5, 'boat', '去长卷 · 泛舟'],
  tm: ['cliff', .9, 'boat', '乘船远眺天门山'], hx: ['cliff', .93, 'boat', '乘船去舆图'], ljt: ['cliff', .93, 'boat', '乘船去舆图'], qs: ['cliff', .93, 'boat', '乘船去舆图'],
};
// 镜头游线：[x,z,距离,方向x,方向z]
export const TOUR = {
  ysh: { t: '环湖泛舟', pts: [[505, -1800, 520, 0, 1], [-150, -2250, 560, -1, .3], [-40, -2950, 600, -.4, -1], [700, -3050, 560, .8, -.6], [900, -2300, 600, 1, .4], [150, -2500, 1500, .2, 1]] },
  cj: { t: '顺江而下', pts: [[-6200, -6000, 1600, .9, .4], [-5600, -3000, 1500, .9, .2], [-5320, -1400, 1500, 1, 0], [-4600, 900, 1300, 1, -.2], [-4019, 2056, 900, 1, -.4], [-5200, 5200, 2400, .8, -.8]] },
  ahut: { t: '两校区巡游', pts: [[1330, -2700, 900, -.35, -1], [1476, -2488, 520, -.35, -1], [3200, -1900, 1400, .2, -1], [4950, -760, 1100, .3, -1], [4950, -760, 1700, -.6, .8]] },
  xs: { t: '两校区巡游', pts: [[4950, -760, 1100, .3, -1], [3200, -1900, 1400, .2, -1], [1330, -2700, 900, -.35, -1]] },
};

export function setupPlay({ POIS, card, mg, openScroll, tourTo, tourStop, onSeal }) {
  const KEY = 'mas-cityseal';
  let got = new Set(); try { got = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {}
  const ids = POIS.filter(p => QZ[p.id]).map(p => p.id);
  const badge = document.getElementById('cityseal');
  const book = document.getElementById('sealbook');
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...got])); } catch (e) {} };
  const refresh = () => {
    badge.querySelector('b').textContent = got.size + ' / ' + ids.length;
    POIS.forEach(p => p.el && p.el.classList.toggle('got', got.has(p.id)));
    book.querySelector('.grid9').innerHTML = ids.map(id => { const p = POIS.find(q => q.id === id); return `<button data-id="${id}" class="${got.has(id) ? 'on' : ''}"><i>${p.seal}</i><span>${got.has(id) ? '已盖印' : '未寻得'}</span></button>`; }).join('');
    book.querySelector('.done').hidden = got.size < ids.length;
  };
  badge.onclick = () => { refresh(); book.classList.add('on'); };
  book.querySelector('.x').onclick = () => book.classList.remove('on');
  book.querySelector('.grid9').onclick = e => { const b = e.target.closest('button'); if (!b) return; book.classList.remove('on'); window.__select(b.dataset.id); };
  book.querySelector('.reset').onclick = () => { got.clear(); save(); refresh(); };
  const stamp = id => { if (got.has(id)) return; got.add(id); save(); refresh(); onSeal && onSeal(POIS.find(p => p.id === id)); };

  // 卡片按钮
  function buttons(p) {
    const ex = card.querySelector('.cx'); let h = '';
    if (QZ[p.id]) h += got.has(p.id) ? '<button class="did" data-a="quiz">城印已盖 · 再答一次</button>' : '<button class="hot" data-a="quiz">答一题 · 盖城印</button>';
    if (TOUR[p.id]) h += `<button data-a="tour">${TOUR[p.id].t}</button>`;
    if (p.id === 'zr') h += '<button data-a="ci">拼木刺 · 三国名片</button>';
    if (p.id === 'ljt') h += '<button data-a="jade">凌家滩玉器 · 认一认</button>';
    if (JUMP[p.id]) h += `<button data-a="jump">${JUMP[p.id][3]}</button>`;
    ex.insertAdjacentHTML('beforeend', h);
  }
  let cur = null;
  card.querySelector('.cx').addEventListener('click', e => {
    const a = e.target.dataset.a; if (!a || !cur) return; const p = cur;
    if (a === 'quiz') { const z = QZ[p.id]; riddles(mg, [z], miss => { stamp(p.id); buttons2(p); }, '寻城印 · ' + p.seal, '答对即在集印册上盖下「' + p.seal + '」', '盖印'); }
    if (a === 'jump') { const j = JUMP[p.id]; openScroll(j[0], j[1], j[2]); }
    if (a === 'tour') tourTo(TOUR[p.id].pts);
    if (a === 'ci') craft(mg, '拼木刺 · 三国名片', '朱然墓出土14枚木刺，按木刺上的原文顺序点字，拼出一枚“名片”', [
      ['丹杨', '丹杨：郡名，朱然的籍贯。名刺开头先写郡名。'], ['朱然', '朱然：东吴左大司马、右军师。'], ['再拜', '“再拜”是拜访时的敬语。'],
      ['问起居', '“问起居”：问候对方近况。'], ['故鄣', '故鄣：县名，今浙江安吉。'], ['字义封', '“义封”是朱然的表字。木刺原文“丹杨朱然再拜 问起居 故鄣字义封”。']], () => {
      mg.innerHTML = '<div class="box"><h3>一枚三国“名片”</h3><div class="mz">丹杨朱然再拜　问起居　故鄣字义封</div><div class="sub">木刺长约24.8厘米、宽3.4厘米，字体隶中带楷；另有木谒3枚，书“持节右军师左大司马当阳侯丹杨朱然再拜”。资料：中国青年报 2023-01-10；澎湃新闻 2024-08-27</div><div class="btns"><button class="big">收好</button></div></div>';
      mg.classList.add('on'); mg.querySelector('.big').onclick = () => { mg.classList.remove('on'); mg.innerHTML = ''; };
    });
    if (a === 'jade') riddles(mg, [
      { q: '凌家滩出土的玉人，被认为是什么？', opts: ['史前玉器中的人像', '汉代陶俑', '唐代石刻', '近代仿品'], a: 0, hint: '距今五千多年', note: '凌家滩出土玉人、玉龟、刻纹玉版等。' },
      { q: '凌家滩遗址博物馆建筑的外形以什么为形？', opts: ['十字院落', '圆形土楼', '高塔', '船形'], a: 0, hint: '看一看模型', note: '仿夯土外墙，2025年5月开馆。' }], () => stamp('ljt'), '凌家滩 · 认玉', '玉人、玉龟、刻纹玉版……', '收下');
  });
  function buttons2(p) { if (cur !== p) return; const ex = card.querySelector('.cx'); const q = ex.querySelector('[data-a="quiz"]'); if (q) { q.className = 'did'; q.textContent = '城印已盖 · 再答一次'; } }
  refresh();
  return { onSelect(p) { cur = p; buttons(p); }, stamp, got };
}
