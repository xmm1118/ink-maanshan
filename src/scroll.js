// 泛舟长卷：沿江写意长卷 + 划船集印（2D Canvas，程序绘制，无外部素材）
const H = 720, GY = 440, TW = 1024, KAI = '"LXGW WenKai","STKaiti","KaiTi","Kaiti SC","Songti SC","Noto Serif CJK SC","Noto Sans CJK SC",serif';
const ST = [
 {k:'tianmen',seal:'天门',name:'天门山 · 碧水东流至此回',type:'tianmen',
  text:'长江流到马鞍山折身向北。李白《望天门山》“天门中断楚江开，碧水东流至此回”写的就是这一景象，相传是他二十五岁出川途经此地时所作。',src:'《学习时报》（国家发改委长江经济带网转载）；长江日报 2023'},
 {k:'war',seal:'古战',name:'采石古战场',type:'war',
  text:'采石矶扼守长江天险，历代在此发生战争二十余次。1161年宋金采石之战，虞允文率一万八千宋军以少胜多，击退十七万金军。',src:'长江日报 2023-11-17'},
 {k:'csj',seal:'采石矶',name:'采石矶',type:'cliff',
  text:'古称牛渚矶，绝壁临江，与南京燕子矶、岳阳城陵矶并称“长江三矶”，被誉为三矶之首，国家5A级旅游景区。',src:'长江采石矶文化生态旅游区官网'},
 {k:'cave',seal:'三元',name:'三元洞',type:'cave',
  text:'采石矶最大的天然洞穴。于洞口凭栏，矶头绝壁临江的奇崛立现眼前，耳边是江涛拍岸之声。',src:'长江日报 2023-11-17'},
 {k:'moon',seal:'捉月',name:'联璧台 · 捉月台',type:'moon',
  text:'嵌在临江峭壁上的一块巨石，原名舍身崖，又名捉月台，相传李白醉酒于此跳江捉月。明正德十四年（1519）改名联璧台。',src:'安徽新闻网《李白在当涂的遗迹》'},
 {k:'tbl',seal:'太白楼',name:'太白楼',type:'tower',
  text:'位于翠螺山南麓，依山临江。始建于唐元和年间，原名“谪仙楼”；现存建筑为清光绪三年（1877）重建，楼高18米，三层两进。',src:'长江采石矶文化生态旅游区官网'},
 {k:'song',seal:'民歌',name:'当涂民歌',type:'town',
  text:'当涂民歌2006年列入首批国家级非物质文化遗产名录，悠扬婉转、清新淳朴，代表作有《唱得绿海泛金波》。',src:'马鞍山文明网；安徽日报 2025-01-27'},
 {k:'horse',seal:'乌骓',name:'马鞍山 · 地名传说',type:'saddle',
  text:'民间传说：项羽兵败乌江，乌骓马不舍主人跃江而去，马鞍落在江东化作山峦，这便是“马鞍山”地名的由来。',src:'长江日报 2023-11-17（讲解员讲述的民间传说）'},
 {k:'ape',seal:'猿人',name:'和县猿人遗址',type:'stele',sub:'江北 · 和县',
  text:'江北和县发现的“和县猿人”距今约三四十万年，是继北京周口店、陕西蓝田之后，我国发现的第三件直立人头骨化石。',src:'《学习时报》2024；央广网 2019'},
 {k:'jade',seal:'凌家滩',name:'凌家滩遗址',type:'jade',sub:'含山',
  text:'位于马鞍山市含山县，距今约5800至5300年，出土玉人、玉龟、刻纹玉版等，与红山、良渚并称“史前三大玉文化中心”。',src:'国家文物局 2025-05-16；人民日报海外版'},
 {k:'poem',seal:'诗歌节',name:'马鞍山李白诗歌节',type:'stage',
  text:'1989年马鞍山举办首届中国国际吟诗节，2006年起定名马鞍山李白诗歌节，每年重阳前后举行、从未中断；2014年马鞍山获“中国诗歌之城”称号。',src:'中安在线 2026-10-16'},
 {k:'tomb',seal:'青山',name:'大青山 · 李白墓',type:'tomb',
  text:'李白终老当涂，魂归青山。大青山李白墓由谷氏家族世代守护，第49代守墓人谷常新已坚守四十余年。',src:'中安在线 2026-10-16'},
];
const GAP = 1500, X0 = 1300, END = X0 + GAP * (ST.length - 1) + 1200;
ST.forEach((s, i) => s.x = X0 + i * GAP);

// ---------- 工具 ----------
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function n1(x) { const i = Math.floor(x), f = x - i, h = k => { const s = Math.sin(k * 127.1) * 43758.5453; return s - Math.floor(s); }; const u = f * f * (3 - 2 * f); return h(i) * (1 - u) + h(i + 1) * u; }
const ink = a => `rgba(28,28,26,${a})`;

function hill(g, x, w, h, base, a, seed, saddle) {
  const r = rng(seed), pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40; let s = Math.pow(Math.sin(Math.PI * t), 1.25);
    if (saddle) s = Math.max(Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.9)), 1.3) * (t < .53 ? 1 : 0), Math.pow(Math.sin(Math.PI * Math.max(0, (t - .47) * 1.9)), 1.3) * (t > .47 ? .92 : 0), .55 * Math.sin(Math.PI * t));
    pts.push([x - w / 2 + t * w, base - h * s * (0.86 + 0.14 * n1(seed + t * 7))]);
  }
  const gr = g.createLinearGradient(0, base - h, 0, base);
  gr.addColorStop(0, ink(a)); gr.addColorStop(.55, ink(a * .45)); gr.addColorStop(1, ink(0));
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2, base); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(x + w / 2, base); g.fill();
  g.strokeStyle = ink(Math.min(.85, a * 1.6)); g.lineWidth = 2.2; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  // 皴擦
  g.lineWidth = 1.2;
  for (let i = 0; i < w / 14; i++) {
    const t = r(), px = x - w / 2 + t * w, top = pts[Math.round(t * 40)][1], py = top + r() * (base - top) * .6;
    g.strokeStyle = ink(a * (.4 + r() * .5)); g.beginPath(); g.moveTo(px, py); g.lineTo(px - 6 - r() * 10, py + 10 + r() * 16); g.stroke();
  }
  for (let i = 0; i < w / 30; i++) { const t = r(), px = x - w / 2 + t * w, py = pts[Math.round(t * 40)][1] + 3; g.fillStyle = ink(.5 * a + .2); g.beginPath(); g.arc(px, py, 1.5 + r() * 2.5, 0, 7); g.fill(); }
}
function willow(g, x, y, s, seed) {
  const r = rng(seed); g.strokeStyle = ink(.75); g.lineWidth = 3 * s;
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8 * s, y - 40 * s, x - 4 * s, y - 80 * s); g.stroke();
  g.lineWidth = 1;
  for (let i = 0; i < 26; i++) { const bx = x - 4 * s + (r() - .5) * 70 * s, by = y - 80 * s - r() * 20 * s;
    g.strokeStyle = `rgba(60,72,58,${.25 + r() * .35})`; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + 6 * s, by + 30 * s, bx + (r() - .5) * 10 * s, by + (45 + r() * 35) * s); g.stroke(); }
}
function pine(g, x, y, s, seed) {
  const r = rng(seed); g.strokeStyle = ink(.8); g.lineWidth = 3.5 * s;
  g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x - 10 * s, y - 30 * s, x + 12 * s, y - 50 * s, x + 2 * s, y - 85 * s); g.stroke();
  for (let i = 0; i < 4; i++) { const cy = y - (40 + i * 14) * s, cx = x + (r() - .4) * 24 * s;
    g.fillStyle = ink(.55); g.beginPath(); g.ellipse(cx, cy, (26 - i * 4) * s, 5 * s, (r() - .5) * .3, 0, 7); g.fill(); }
}
function roof(g, x, y, w, h, up) {
  g.fillStyle = ink(.82); g.beginPath();
  g.moveTo(x - w / 2 - 10, y - up); g.quadraticCurveTo(x - w / 2 + 6, y, x - w / 2 + 14, y - 2);
  g.lineTo(x + w / 2 - 14, y - 2); g.quadraticCurveTo(x + w / 2 - 6, y, x + w / 2 + 10, y - up);
  g.lineTo(x + w / 2 - 12, y - h); g.lineTo(x - w / 2 + 12, y - h); g.closePath(); g.fill();
}
function house(g, x, y, w, h, seed) {
  g.fillStyle = 'rgba(246,242,232,.9)'; g.fillRect(x - w / 2, y - h, w, h);
  g.strokeStyle = ink(.6); g.lineWidth = 1.3; g.strokeRect(x - w / 2, y - h, w, h);
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x - w / 2 + i * w / 4, y - h + 6); g.lineTo(x - w / 2 + i * w / 4, y); g.stroke(); }
  roof(g, x, y - h, w + 6, 16, 7);
}
function tower(g, x, y, levels, w) {
  for (let i = 0; i < levels; i++) {
    const ww = w * (1 - i * .16), hh = 34 - i * 4;
    g.fillStyle = 'rgba(246,242,232,.95)'; g.fillRect(x - ww / 2, y - hh, ww, hh);
    g.strokeStyle = ink(.65); g.lineWidth = 1.3; g.strokeRect(x - ww / 2, y - hh, ww, hh);
    for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(x - ww / 2 + k * ww / 5, y - hh); g.lineTo(x - ww / 2 + k * ww / 5, y); g.stroke(); }
    roof(g, x, y - hh, ww + 18, 14, 10); y -= hh + 12;
  }
  g.fillStyle = ink(.85); g.fillRect(x - 2, y - 12, 4, 12);
}
function stele(g, x, y, text) {
  g.fillStyle = 'rgba(232,226,210,.95)'; g.strokeStyle = ink(.7); g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x - 16, y - 70); g.quadraticCurveTo(x, y - 84, x + 16, y - 70); g.lineTo(x + 16, y); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = ink(.8); g.font = `16px ${KAI}`; g.textAlign = 'center';
  [...text].forEach((c, i) => g.fillText(c, x, y - 52 + i * 17));
  g.fillStyle = ink(.6); g.fillRect(x - 24, y - 4, 48, 6);
}
function ship(g, x, y, s) {
  g.fillStyle = ink(.7); g.beginPath(); g.moveTo(x - 60 * s, y - 10 * s); g.quadraticCurveTo(x, y + 12 * s, x + 64 * s, y - 14 * s); g.lineTo(x + 50 * s, y - 2 * s); g.lineTo(x - 50 * s, y - 2 * s); g.fill();
  g.strokeStyle = ink(.8); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 6 * s); g.lineTo(x, y - 90 * s); g.stroke();
  g.fillStyle = 'rgba(200,190,170,.55)'; g.beginPath(); g.moveTo(x + 3, y - 86 * s); g.quadraticCurveTo(x + 46 * s, y - 50 * s, x + 4, y - 16 * s); g.fill();
  g.strokeStyle = ink(.5); g.lineWidth = 1; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x + 3, y - 86 * s + i * 14 * s); g.lineTo(x + 30 * s, y - 80 * s + i * 14 * s); g.stroke(); }
  g.fillStyle = '#b3261e'; g.fillRect(x - 2, y - 104 * s, 14 * s, 10 * s);
}
function bank(g, x0, x1) {
  g.fillStyle = 'rgba(120,110,90,.10)'; g.fillRect(x0, GY - 30, x1 - x0, 40);
  g.strokeStyle = ink(.55); g.lineWidth = 2;
  g.beginPath(); for (let x = x0; x <= x1; x += 16) { const y = GY + 4 + n1(x / 140) * 8; x === x0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  g.lineWidth = 1; g.strokeStyle = ink(.25);
  for (let x = Math.ceil(x0 / 60) * 60; x < x1; x += 60) { if (n1(x * .37) > .55) { g.beginPath(); g.moveTo(x, GY + 2); g.lineTo(x + 18, GY - 6); g.stroke(); } }
}

// ---------- 场景元素（按 x 排列，确定性） ----------
function drawFar(g, x0, x1) {
  // 远山：淡墨层叠
  for (let L = 0; L < 2; L++) {
    const base = 330 + L * 40, a = L ? .16 : .09;
    g.fillStyle = ink(a); g.beginPath(); g.moveTo(x0, base + 40);
    for (let x = x0; x <= x1; x += 12) { const y = base - 110 * Math.pow(n1(x / (420 - L * 120) + L * 9), 1.6) - 40 * n1(x / 90 + L); g.lineTo(x, y); }
    g.lineTo(x1, base + 40); g.fill();
  }
}
function drawNear(g, x0, x1) {
  bank(g, x0, x1);
  // 沿岸杂树、民居（确定性布置，避开景点）
  for (let x = Math.floor(x0 / 170) * 170; x < x1 + 170; x += 170) {
    const r = rng(x * 7 + 3), near = ST.some(s => Math.abs(s.x - x) < 330);
    if (x < 200 || x > END - 100) continue;
    if (!near) { const v = r(); if (v < .35) willow(g, x + r() * 60, GY + 2, .9 + r() * .4, x); else if (v < .55) pine(g, x + r() * 60, GY, .8 + r() * .5, x); else if (v < .68) house(g, x + r() * 40, GY, 46 + r() * 30, 24 + r() * 10, x); }
  }
  for (const s of ST) if (s.x > x0 - 600 && s.x < x1 + 600) drawStation(g, s);
  // 卷首卷尾
  if (x0 < 900) { g.fillStyle = ink(.85); g.font = `54px ${KAI}`; g.textAlign = 'center'; ['泛', '舟', '长', '卷'].forEach((c, i) => g.fillText(c, 360, 110 + i * 60)); g.fillStyle = '#b3261e'; g.fillRect(400, 300, 34, 34); g.fillStyle = '#f6eadf'; g.font = `14px ${KAI}`; g.fillText('诗城', 417, 322); }
  if (x1 > END - 1000) { g.fillStyle = ink(.85); g.font = `40px ${KAI}`; g.textAlign = 'center'; ['一', '江', '诗', '意', '到', '青', '山'].forEach((c, i) => g.fillText(c, END - 300, 70 + i * 46)); }
}
function drawStation(g, s) {
  const x = s.x, r = rng(x);
  switch (s.type) {
    case 'tianmen': hill(g, x - 160, 360, 250, GY, .55, 11); hill(g, x + 240, 300, 200, GY - 10, .32, 12); pine(g, x - 220, GY - 175, .7, 3); break;
    case 'war': hill(g, x + 200, 380, 120, GY, .3, 21); ship(g, x - 120, GY + 70, 1); ship(g, x + 60, GY + 110, .8); ship(g, x + 250, GY + 60, .65); break;
    case 'cliff': hill(g, x, 520, 280, GY, .6, 31);
      g.fillStyle = ink(.62); g.beginPath(); g.moveTo(x - 140, GY - 120); g.lineTo(x - 210, GY - 60); g.lineTo(x - 250, GY + 30); g.lineTo(x - 120, GY + 40); g.lineTo(x - 80, GY - 30); g.fill();
      g.strokeStyle = ink(.85); g.lineWidth = 2; g.stroke(); for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(x - 220 + i * 12, GY - 50 + r() * 30); g.lineTo(x - 230 + i * 12, GY + 20); g.stroke(); }
      pine(g, x + 40, GY - 230, .8, 5); pine(g, x - 60, GY - 200, .7, 6); break;
    case 'cave': hill(g, x, 420, 210, GY, .5, 41);
      g.fillStyle = ink(.85); g.beginPath(); g.ellipse(x - 40, GY - 60, 34, 26, 0, Math.PI, 0); g.lineTo(x - 6, GY - 40); g.lineTo(x - 74, GY - 40); g.fill();
      g.strokeStyle = ink(.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 90, GY - 38); g.lineTo(x + 10, GY - 38); g.stroke(); break;
    case 'moon': hill(g, x + 80, 420, 230, GY, .5, 51);
      g.fillStyle = ink(.7); g.beginPath(); g.moveTo(x - 60, GY - 110); g.lineTo(x - 170, GY - 120); g.lineTo(x - 180, GY - 100); g.lineTo(x - 70, GY - 70); g.fill();
      g.fillStyle = ink(.85); g.beginPath(); g.moveTo(x - 140, GY - 122); g.quadraticCurveTo(x - 150, GY - 150, x - 138, GY - 160); g.quadraticCurveTo(x - 120, GY - 150, x - 128, GY - 122); g.fill();
      g.strokeStyle = ink(.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 136, GY - 150); g.quadraticCurveTo(x - 100, GY - 165, x - 90, GY - 140); g.stroke();
      g.strokeStyle = 'rgba(28,28,26,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(x - 160, 130, 34, 0, 7); g.stroke();
      g.fillStyle = 'rgba(28,28,26,.15)'; g.beginPath(); g.ellipse(x - 160, GY + 120, 34, 7, 0, 0, 7); g.fill(); break;
    case 'tower': hill(g, x + 120, 520, 260, GY, .45, 61); pine(g, x - 120, GY - 30, 1, 7); pine(g, x + 110, GY - 40, 1.1, 8); tower(g, x, GY - 20, 3, 120);
      g.fillStyle = ink(.4); g.fillRect(x - 80, GY - 22, 160, 4); break;
    case 'town': for (let i = 0; i < 6; i++) house(g, x - 260 + i * 92 + r() * 20, GY, 70 + r() * 20, 28 + r() * 14, x + i);
      willow(g, x - 300, GY + 2, 1.1, 9); willow(g, x + 300, GY + 2, 1, 10);
      g.strokeStyle = ink(.55); g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 30 + i * 30, GY - 100); g.quadraticCurveTo(x - 20 + i * 30, GY - 120, x - 10 + i * 30, GY - 104); g.stroke(); }
      g.fillStyle = ink(.7); g.font = `22px ${KAI}`; g.textAlign = 'center'; g.fillText('♪', x + 80, GY - 110); break;
    case 'saddle': hill(g, x, 640, 230, GY, .5, 71, true); break;
    case 'stele': hill(g, x + 160, 300, 90, GY - 20, .18, 81); stele(g, x, GY, '和县猿人'); g.fillStyle = ink(.5); g.font = `14px ${KAI}`; g.textAlign = 'center'; g.fillText(s.sub, x, GY + 24); break;
    case 'jade': hill(g, x - 160, 300, 100, GY - 10, .2, 91); stele(g, x, GY, '凌家滩');
      g.strokeStyle = 'rgba(70,96,86,.85)'; g.lineWidth = 3; g.beginPath(); g.arc(x + 70, GY - 50, 20, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 70, GY - 50, 7, 0, 7); g.stroke(); break;
    case 'stage': house(g, x - 200, GY, 60, 26, 1); house(g, x + 210, GY, 70, 30, 2);
      g.fillStyle = 'rgba(246,242,232,.95)'; g.fillRect(x - 110, GY - 26, 220, 26); g.strokeStyle = ink(.7); g.lineWidth = 1.5; g.strokeRect(x - 110, GY - 26, 220, 26);
      g.beginPath(); g.moveTo(x - 100, GY - 26); g.lineTo(x - 100, GY - 110); g.moveTo(x + 100, GY - 26); g.lineTo(x + 100, GY - 110); g.stroke(); roof(g, x, GY - 110, 240, 16, 10);
      for (let i = 0; i < 5; i++) { g.fillStyle = '#b3261e'; g.beginPath(); g.ellipse(x - 80 + i * 40, GY - 86, 7, 9, 0, 0, 7); g.fill(); }
      g.fillStyle = ink(.85); g.font = `30px ${KAI}`; g.textAlign = 'center'; g.fillText('诗', x, GY - 40); break;
    case 'tomb': hill(g, x + 80, 640, 300, GY, .55, 101); pine(g, x - 140, GY - 4, 1.1, 11); pine(g, x + 140, GY - 6, 1, 12);
      g.fillStyle = 'rgba(120,112,96,.55)'; g.beginPath(); g.ellipse(x, GY, 70, 34, 0, Math.PI, 0); g.fill(); g.strokeStyle = ink(.7); g.lineWidth = 1.6; g.stroke(); stele(g, x, GY + 2, '李白墓'); break;
  }
}

// ---------- 主体 ----------
export function createScroll(root, onExit) {
  const cv = root.querySelector('canvas'), g = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, Hh = 0, S = 1, dpr = 1, tiles = new Map(), running = false, last = 0;
  const st = { x: 300, v: 0, cam: 0, got: new Set(), trial: false, near: null, dir: 0 };
  // 纸纹
  const paper = document.createElement('canvas'); paper.width = paper.height = 256;
  { const p = paper.getContext('2d'), d = p.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const n = 232 + Math.random() * 14; d.data[i] = n + 5; d.data[i + 1] = n; d.data[i + 2] = n - 14; d.data[i + 3] = 255; } p.putImageData(d, 0, 0); }
  function tile(layer, i) {
    const key = layer + ':' + i; if (tiles.has(key)) return tiles.get(key);
    const c = document.createElement('canvas'); c.width = Math.ceil(TW * S * dpr); c.height = Math.ceil(H * S * dpr);
    const t = c.getContext('2d'); t.scale(S * dpr, S * dpr); t.translate(-i * TW, 0);
    (layer ? drawNear : drawFar)(t, i * TW, (i + 1) * TW);
    tiles.set(key, c); if (tiles.size > 14) tiles.delete(tiles.keys().next().value); return c;
  }
  function resize() {
    W = innerWidth; Hh = innerHeight; dpr = Math.min(devicePixelRatio || 1, W < 900 ? 1.5 : 2);
    cv.width = W * dpr; cv.height = Hh * dpr; S = Hh / H; if (W / Hh < 1) S = Math.min(S, W / 520); tiles.clear();
  }
  // seals bar
  const bar = root.querySelector('.yinpu'); bar.innerHTML = '';
  ST.forEach(s => { const b = document.createElement('span'); b.textContent = s.seal; b.title = s.name; s.el = b; bar.appendChild(b); });
  const stop = root.querySelector('.stop'), card = root.querySelector('.scard'), hint = root.querySelector('.trialtag');
  function showCard(title, text, src, extra) { card.querySelector('h2').textContent = title; card.querySelector('p').textContent = text; card.querySelector('small').textContent = src ? '资料：' + src : ''; card.querySelector('.extra').innerHTML = extra || ''; card.classList.add('on'); }
  function collect() {
    const s = st.near; if (!s) return;
    showCard(s.name, s.text, s.src);
    if (!st.got.has(s.k)) { st.got.add(s.k); s.el.classList.add('on'); s.el.animate && !RM && s.el.animate([{ transform: 'scale(1.8)' }, { transform: 'scale(1)' }], { duration: 500 }); }
    if (st.got.size === ST.length && !st.trial) setTimeout(() => showCard('长卷已成', '十二枚朱印尽收：从天门山的“碧水东流至此回”，到青山脚下的诗仙长眠处，这一卷是马鞍山的山水、遗址与风俗。', '', '<button class="again">再划一程</button>'), 900);
  }
  card.addEventListener('click', e => { if (e.target.classList.contains('again')) { reset(false); card.classList.remove('on'); } if (e.target.classList.contains('x')) card.classList.remove('on'); });
  stop.onclick = collect;
  function reset(trial) { st.x = 300; st.v = 0; st.got.clear(); ST.forEach(s => s.el.classList.remove('on')); st.trial = trial; hint.style.display = trial ? '' : 'none'; card.classList.remove('on'); }
  // 输入
  const keys = {};
  addEventListener('keydown', e => { if (!running) return; keys[e.key] = 1; if ((e.key === ' ' || e.key === 'Enter') && st.near) { collect(); e.preventDefault(); } });
  addEventListener('keyup', e => { keys[e.key] = 0; });
  const hold = (el, d) => { const on = e => { st.dir = d; e.preventDefault(); }, off = () => { st.dir = 0; };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointerleave', off); el.addEventListener('pointercancel', off); };
  hold(root.querySelector('.rowL'), -1); hold(root.querySelector('.rowR'), 1);
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, sx: st.x }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (drag) st.x = Math.max(200, Math.min(END - 200, drag.sx - (e.clientX - drag.x) / S * 1.2)); });
  cv.addEventListener('pointerup', () => drag = null);
  cv.addEventListener('wheel', e => { st.x = Math.max(200, Math.min(END - 200, st.x + (e.deltaY + e.deltaX) * .8)); e.preventDefault(); }, { passive: false });
  // 引导
  const intro = root.querySelector('.sintro');
  root.querySelector('.try').onclick = () => { intro.classList.add('off'); reset(true); };
  root.querySelector('.start').onclick = () => { intro.classList.add('off'); reset(false); };
  root.querySelector('.skipi').onclick = () => { localStorage.setItem('mas-scroll-intro', 'skip'); intro.classList.add('off'); reset(false); };
  hint.querySelector('button').onclick = () => reset(false);
  root.querySelector('.back').onclick = () => { close(); onExit(); };
  root.querySelector('.again2').onclick = () => intro.classList.remove('off');

  function boat(t) {
    const bx = (st.x - st.cam) * S, by = (GY + 95 + (RM ? 0 : Math.sin(t * 2) * 3)) * S, k = S, f = st.v < -5 ? -1 : 1;
    g.save(); g.translate(bx, by); g.scale(k * f, k);
    g.fillStyle = ink(.85); g.beginPath(); g.moveTo(-52, -6); g.quadraticCurveTo(0, 12, 56, -10); g.lineTo(44, 0); g.lineTo(-42, 0); g.fill();
    g.strokeStyle = ink(.8); g.lineWidth = 1.6; g.beginPath(); g.moveTo(-26, -8); g.quadraticCurveTo(0, -30, 26, -8); g.stroke();
    g.fillStyle = ink(.85); g.beginPath(); g.moveTo(10, -10); g.lineTo(18, -34); g.lineTo(26, -10); g.fill();
    g.beginPath(); g.ellipse(18, -36, 16, 4, 0, 0, 7); g.fill();
    g.lineWidth = 2; g.beginPath(); g.moveTo(22, -24); g.lineTo(-30 + (RM ? 0 : Math.sin(t * 3) * 6), 22); g.stroke();
    g.restore();
    // 尾迹
    g.strokeStyle = ink(.18); g.lineWidth = 1.2 * S;
    for (let i = 1; i < 4; i++) { const w = Math.min(1, Math.abs(st.v) / 200) * i * 26 * S; if (w < 2) break; g.beginPath(); g.moveTo(bx - f * (50 + i * 22) * S, by + 4 * S); g.lineTo(bx - f * (50 + i * 22) * S - f * w, by + (4 + i * 3) * S); g.stroke(); }
  }
  function frame(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now; const t = now / 1000;
    const dir = st.dir || ((keys.ArrowRight || keys.d || keys.D) ? 1 : (keys.ArrowLeft || keys.a || keys.A) ? -1 : 0);
    st.v += (dir * 320 - st.v) * Math.min(1, dt * 3); st.x = Math.max(200, Math.min(END - 200, st.x + st.v * dt));
    const target = st.x - (W / S) * .38; st.cam += (target - st.cam) * (RM ? 1 : Math.min(1, dt * 4)); st.cam = Math.max(0, Math.min(END - W / S, st.cam));
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = g.createPattern(paper, 'repeat'); g.fillRect(0, 0, W, Hh);
    const vh = H * S, oy = (Hh - vh) / 2; g.save(); g.translate(0, oy);
    // 远山（视差）
    const fc = st.cam * .45, f0 = Math.floor(fc / TW), f1 = Math.floor((fc + W / S) / TW);
    for (let i = f0; i <= f1; i++) g.drawImage(tile(0, i), Math.floor((i * TW - fc) * S), 0, Math.ceil(TW * S) + 1, H * S);
    // 江雾
    const mg = g.createLinearGradient(0, 300 * S, 0, 420 * S); mg.addColorStop(0, 'rgba(240,236,224,0)'); mg.addColorStop(.6, 'rgba(240,236,224,.55)'); mg.addColorStop(1, 'rgba(240,236,224,0)');
    g.fillStyle = mg; g.fillRect(0, 300 * S, W, 120 * S);
    // 江面
    const wg = g.createLinearGradient(0, GY * S, 0, H * S); wg.addColorStop(0, 'rgba(110,122,124,.10)'); wg.addColorStop(1, 'rgba(110,122,124,.24)');
    g.fillStyle = wg; g.fillRect(0, GY * S, W, Hh - oy - GY * S + 2);
    const n0 = Math.floor(st.cam / TW), n1i = Math.floor((st.cam + W / S) / TW);
    for (let i = n0; i <= n1i; i++) g.drawImage(tile(1, i), Math.floor((i * TW - st.cam) * S), 0, Math.ceil(TW * S) + 1, H * S);
    // 水纹
    g.strokeStyle = ink(.16); g.lineWidth = 1.2 * S;
    for (let row = 0; row < 7; row++) {
      const y = GY + 40 + row * 34, sp = 140 - row * 6, off = (st.cam * (1 + row * .08) - (RM ? 0 : t * (10 + row * 4))) % sp;
      for (let x = -off - sp; x < W / S + sp; x += sp) { const xx = x + ((row * 53) % sp); g.beginPath(); g.moveTo(xx * S, y * S); g.quadraticCurveTo((xx + 22) * S, (y - 5) * S, (xx + 44) * S, y * S); g.stroke(); }
    }
    boat(t);
    // 朱印标签
    st.near = null;
    for (const s of ST) {
      const sx = (s.x - st.cam) * S; if (sx < -80 || sx > W + 80) continue;
      const got = st.got.has(s.k), y = 150 * S;
      g.fillStyle = got ? '#b3261e' : 'rgba(179,38,30,.0)'; g.strokeStyle = '#b3261e'; g.lineWidth = 2;
      const fs = Math.max(13, 17 * S), n = [...s.seal].length, bw = fs + 12, bh = n * fs + 12;
      g.fillRect(sx - bw / 2, y, bw, bh); g.strokeRect(sx - bw / 2, y, bw, bh);
      g.fillStyle = got ? '#f6eadf' : '#b3261e'; g.font = `${fs}px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'top';
      [...s.seal].forEach((c, i) => g.fillText(c, sx, y + 6 + i * fs));
      if (Math.abs(st.x - s.x) < 220) st.near = s;
    }
    g.restore();
    stop.classList.toggle('on', !!st.near);
    if (st.near) stop.querySelector('b').textContent = st.near.seal;
    root.querySelector('.prog i').style.width = (100 * (st.x - 200) / (END - 400)) + '%';
    requestAnimationFrame(frame);
  }
  function open() { root.classList.add('on'); resize(); running = true; last = performance.now(); requestAnimationFrame(frame);
    if (localStorage.getItem('mas-scroll-intro') === 'skip') { intro.classList.add('off'); if (!st.trial && st.got.size === 0) reset(false); } else intro.classList.remove('off'); }
  function close() { running = false; root.classList.remove('on'); }
  addEventListener('resize', () => running && resize()); addEventListener('orientationchange', () => setTimeout(() => running && resize(), 200));
  window.__scroll = { st, ST, collect: () => { st.near = st.near || ST.find(s => Math.abs(s.x - st.x) < 220); collect(); }, go: x => { st.x = x; st.cam = x - (W / S) * .38; } };
  return { open, close, get running() { return running; } };
}
