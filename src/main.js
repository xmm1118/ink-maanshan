import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import D from './data.json';
import A from './area.json'; // 安工大佳山校区、雨山湖公园细节（OSM）
import { createCScroll } from './cscroll.js';
import { addLandmarks } from './landmarks.js';
import { setupPlay } from './poiplay.js';

const PAPER = new THREE.Color(0xef/255, 0xe9/255, 0xdb/255);
const JADE = [.30, .42, .41]; // 青黛山色
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = Math.min(innerWidth, innerHeight) < 600;
const EXT = { x0: -12000, z0: -13000, size: 22000 };

/* ---------- 景点（简介均来自公开资料，见 README） ---------- */
const POIS = [
  { id:'csj', seal:'采石矶', name:'采石矶', x:-4019, z:2056, d:800, game:1,
    text:'古称牛渚矶，绝壁临江，与南京燕子矶、岳阳城陵矶并称“长江三矶”，被誉为三矶之首；李白曾多次登临吟咏，留下“醉酒捉月”的传说。',
    src:'长江采石矶文化生态旅游区官网 csjfjq.com' },
  { id:'tbl', seal:'太白楼', name:'太白楼', x:-3900, z:2380, d:620, approx:true, museum:1, game:1,
    text:'位于翠螺山南麓，依山临江。始建于唐元和年间（806–820），原名“谪仙楼”；现存建筑为清光绪三年（1877）重建，楼高18米，三层两进。',
    src:'csjfjq.com；中国文化研究院' },
  { id:'ysh', seal:'雨山湖', name:'雨山湖', x:150, z:-2500, d:1500,
    text:'位于马鞍山市中心，1959年辟为城市公园；周围九座山峰远近错落、环湖而立，素有“九峰环一湖”之称。',
    src:'马鞍山市雨山湖公园公开介绍' },
  { id:'cj', seal:'长江', name:'长江 · 马鞍山段', x:-5320, z:-1400, d:3600,
    text:'长江自马鞍山城西流过，江中有江心洲分汊。采石矶一带是李白一生赋诗最多的地方，《望天门山》《夜泊牛渚怀古》等名篇都与这段江景相关。',
    src:'长江日报、安徽省政府新闻办公开报道' },
  { id:'ahut', seal:'安工大', chip:'安工大佳山', name:'安徽工业大学 · 佳山校区', x:1330, z:-2700, d:1100, dir:[-.35,-1],
    text:'前身是1958年创建的马鞍山钢铁工业学校，2000年组建为安徽工业大学；现有佳山、秀山两个校区。',
    src:'安徽工业大学官网 ahut.edu.cn；校园建筑轮廓与高度：造形家佳山校区模型' },
  { id:'mt', seal:'游船码头', name:'雨山湖游船码头', x:505, z:-1800, d:500, sub:1,
    text:'雨山湖北岸的游船码头，可乘船游湖。湖北侧高楼为金鹰国际（OSM 记载约228米、45层）。', src:'OpenStreetMap 地名与建筑高度' },
  { id:'tyc', seal:'体育场', name:'安工大佳山校区 · 体育场', x:1476, z:-2488, d:520, sub:1, dir:[-.35,-1],
    text:'佳山校区内的田径场与足球场，位置、轮廓来自 OpenStreetMap。校园楼体轮廓与高度取自造形家佳山校区模型。', src:'OpenStreetMap；造形家模型' },
  { id:'xs', seal:'秀山校区', chip:'安工大秀山', name:'安徽工业大学 · 秀山校区（东校区）', x:4950, z:-760, d:1300,
    text:'位于马向路1530号，学校招生办与多数工科学院在此；迎新资料里称“东校区”，佳山校区称“校本区”。楼体轮廓与高度取自造形家秀山校区模型。',
    src:'安徽工业大学官网、迎新网 yingxin.ahut.edu.cn；造形家模型' },
  { id:'zr', seal:'朱然', chip:'朱然文化园', name:'朱然家族墓地 · 朱然文化公园', x:-520, z:-60, d:650,
    text:'1984年6月在雨山南麓发现三国东吴左大司马、右军师朱然墓，墓中木刺、木谒写有其名，是上世纪80年代初中国十大考古收获之一；2001年列为全国重点文物保护单位。南侧朱然文化公园2003年建成，有三国文化广场与朱然铜雕。',
    src:'安徽省文物考古研究所 ahkaogu.com；中国青年报 2023-01-10；朱然文化公园（雨山区政府）' },
  { id:'gz', seal:'古镇', name:'采石古镇', x:-3753, z:1410, d:700, sub:1,
    text:'翠螺山北麓、长江边的老街区，是长江采石矶文化生态旅游区的一部分；镇上可以听到当涂民歌——2006年列入首批国家级非物质文化遗产名录。',
    src:'OSM 地名；马鞍山文明网；安徽日报 2025-01-27', game:1 },
  { id:'syd', seal:'三元洞', name:'三元洞', x:-4180, z:1960, d:520, sub:1, approx:true,
    text:'采石矶最大的天然洞穴。洞口凭栏，可见矶头绝壁临江，耳边是江涛拍岸之声。', src:'长江日报 2023-11-17' },
  { id:'zyt', seal:'捉月台', name:'联璧台 · 捉月台', x:-4140, z:2150, d:520, sub:1, approx:true,
    text:'嵌在临江峭壁上的一块巨石，原名舍身崖，又名捉月台，相传李白醉酒于此跳江捉月；明正德十四年（1519）改名联璧台。', src:'安徽新闻网《李白在当涂的遗迹》' },
  { id:'war', seal:'古战场', name:'采石古战场', x:-4700, z:1700, d:1400, sub:1,
    text:'采石矶扼守长江天险，历代在此发生战争二十余次。1161年宋金采石之战，虞允文率一万八千宋军以少胜多，击退十七万金军。', src:'长江日报 2023-11-17' },
  { id:'sgj', seal:'诗歌节', name:'滨江文化公园 · 李白诗歌节', x:-4489, z:567, d:700, sub:1,
    text:'1989年马鞍山举办首届中国国际吟诗节，2006年起定名马鞍山李白诗歌节，每年重阳前后举行、从未中断；第36届（2024）在滨江文化公园开幕。', src:'中安在线 2026-10-16；文化和旅游部网站 2024-10-16' },
  { id:'tm', seal:'天门山', name:'天门山（城南方向）', x:-6200, z:6800, d:2600, sub:1, edge:1,
    text:'长江流到马鞍山折身向北。李白《望天门山》“天门中断楚江开，碧水东流至此回”写的就是这一景象。天门山在本图范围以南，此处只标方向。', src:'《学习时报》2024（国家发改委长江经济带网转载）' },
  { id:'hx', seal:'和县猿人', name:'和县猿人遗址（江北方向）', x:-10500, z:-2500, d:2600, sub:1, edge:1,
    text:'江北和县发现的“和县猿人”距今约三四十万年，是继北京周口店、陕西蓝田之后我国发现的第三件直立人头骨化石。遗址在本图范围以外，此处只标方向。', src:'《学习时报》2024；央广网 2019' },
  { id:'ljt', seal:'凌家滩', name:'凌家滩遗址（含山方向）', x:-8700, z:1300, d:900, sub:1, edge:1,
    text:'位于马鞍山市含山县，距今约5800至5300年，出土玉人、玉龟、刻纹玉版等，与红山、良渚并称“史前三大玉文化中心”；遗址博物馆2025年5月开馆，建筑以十字院落为形、仿夯土外墙。遗址在本图范围以外，这里是意象缩景：祭坛、玉人与博物馆。', src:'国家文物局 2025-05-16；新华网 2025-05-20' },
  { id:'qs', seal:'青山', name:'大青山 · 李白墓（当涂方向）', x:3500, z:6900, d:2600, sub:1, edge:1,
    text:'李白终老当涂，魂归青山。大青山李白墓由谷氏家族世代守护，第49代守墓人谷常新已坚守四十余年。墓在本图范围以南，此处只标方向。', src:'中安在线 2026-10-16' },

];

/* ---------- 程序化山体（示意） ---------- */
const HILLS = [[-4150,1950,131,520],[-758,-1249,95,420],[1600,-2240,85,210]];
for (const p of D.peaks) { const e = parseFloat(p[1]) || 90; HILLS.push([p[2], p[3], e, 450 + e * 2]); }
function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const VS = 2.4; // 山体竖向夸张
const inPolyF = (r, x, z) => { let c = false; for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) { const xi = r[i], zi = r[i + 1], xj = r[j], zj = r[j + 1]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const FLAT = [...A.camp, A.park];
function H(x, z) {
  if (x > -600 && x < 1800 && z > -3300 && z < -1800) for (const r of FLAT) if (inPolyF(r, x, z)) return 0;
  let h = 0;
  for (const [px, pz, e, s] of HILLS) {
    const dx = x - px, dz = z - pz, r2 = (dx * dx + dz * dz) / (s * s);
    if (r2 < 9) h = Math.max(h, e * Math.exp(-r2 * 1.1));
  }
  if (h > 1) {
    const n = vnoise(x / 260, z / 260) * 0.5 + vnoise(x / 110, z / 110) * 0.3 + vnoise(x / 50, z / 50) * 0.2;
    h *= 0.65 + 0.7 * n;
  }
  if (h > 0 && x > 3800 && x < 6050 && z > -1900 && z < 130) { // 秀山校区：楼区压平，向外 250 m 过渡
    const dx = Math.max(4050 - x, x - 5800, 0), dz = Math.max(-1650 - z, z + 120, 0);
    h *= Math.min(1, Math.hypot(dx, dz) / 250);
  }
  return h * VS;
}

/* ---------- renderer ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 20, 60000);
const U = { camPos: { value: camera.position }, paper: { value: PAPER }, fogNear: { value: 7000 }, fogFar: { value: 26000 }, time: { value: 0 } };

const fogGL = `
float fogF(float d){return smoothstep(fogNear,fogFar,d);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}`;
const UNI = `uniform vec3 camPos;uniform vec3 paper;uniform float fogNear,fogFar,time;`;

/* ---------- 地面纹理（水墨底图） ---------- */
function P2(x, z, S) { return [(x - EXT.x0) * S, (z - EXT.z0) * S]; }
function buildGroundTex() {
  const N = small ? 2048 : 4096, S = N / EXT.size;
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const g = cv.getContext('2d');
  g.fillStyle = '#ede6d4'; g.fillRect(0, 0, N, N);
  // 纸纹
  const img = g.getImageData(0, 0, N, N), a = img.data;
  for (let i = 0; i < a.length; i += 4) { const n = (Math.random() - 0.5) * 10; a[i] += n; a[i + 1] += n; a[i + 2] += n; }
  g.putImageData(img, 0, 0);
  const path = (arr, off, close) => { g.beginPath(); for (let i = off; i < arr.length; i += 2) { const [u, v] = P2(arr[i], arr[i + 1], S); i === off ? g.moveTo(u, v) : g.lineTo(u, v); } if (close) g.closePath(); };
  g.lineJoin = g.lineCap = 'round';
  // 绿地：淡墨点染
  g.fillStyle = 'rgba(96,138,118,0.16)';
  for (const r of D.green) { path(r, 0, true); g.fill(); }
  g.strokeStyle = 'rgba(60,90,80,0.22)'; g.lineWidth = Math.max(1, 3 * S);
  for (const r of D.green) { path(r, 0, true); g.stroke(); }
  // 长江：两条航道成宽带，多次叠染形成晕边
  const yz = D.wline.filter(w => w.length > 50).sort((p, q) => q.length - p.length);
  const rivers = D.wline.filter(w => (w[1] === -14830) || (w[1] === -11733));
  const widths = { '-14830': 1500, '-11733': 950 };
  g.save(); g.filter = `blur(${Math.round(90 * S)}px)`;
  for (const w of rivers) { g.strokeStyle = 'rgba(70,108,104,0.42)'; g.lineWidth = (widths[w[1]] + 260) * S; path(w, 1, false); g.stroke(); }
  g.restore();
  for (const w of rivers) { g.strokeStyle = 'rgba(150,186,178,0.75)'; g.lineWidth = (widths[w[1]] - 60) * S; path(w, 1, false); g.stroke(); }
  g.save(); g.filter = `blur(${Math.round(160 * S)}px)`;
  for (const w of rivers) { g.strokeStyle = 'rgba(206,224,214,0.55)'; g.lineWidth = (widths[w[1]] * .45) * S; path(w, 1, false); g.stroke(); }
  g.restore();
  // 水纹
  g.strokeStyle = 'rgba(40,74,72,0.30)'; g.lineWidth = Math.max(1.2, 4 * S);
  for (const w of rivers) for (let i = 3; i < w.length - 4; i += 2) {
    for (let k = 0; k < 10; k++) { const [u, v] = P2(w[i] + (Math.random() - .5) * widths[w[1]] * .7, w[i + 1] + (Math.random() - .5) * 600, S);
      g.beginPath(); g.moveTo(u, v); g.quadraticCurveTo(u + 60 * S, v - 14 * S, u + 120 * S, v); g.stroke(); }
  }
  // 湖、塘
  for (const r of D.water) { g.fillStyle = 'rgba(128,170,160,0.62)'; path(r, 0, true); g.fill(); g.strokeStyle = 'rgba(36,60,58,0.55)'; g.lineWidth = Math.max(1, 6 * S); g.stroke(); }
  // 小河
  g.strokeStyle = 'rgba(70,112,106,0.55)';
  for (const w of D.wline) { if (rivers.includes(w)) continue; g.lineWidth = Math.max(1.2, 26 * S); path(w, 1, false); g.stroke(); }
  // 雨山湖公园：草地、湖岸石砌驳岸、园路
  g.fillStyle = 'rgba(110,150,120,0.22)'; path(A.park, 0, true); g.fill();
  for (const r of D.water) { g.strokeStyle = 'rgba(250,248,240,0.9)'; g.lineWidth = Math.max(1, 5 * S); path(r, 0, true); g.stroke(); }
  g.setLineDash([10 * S, 6 * S]); g.strokeStyle = 'rgba(120,96,60,0.65)'; g.lineWidth = Math.max(1, 4 * S);
  for (const r of A.foot) { path(r, 0, false); g.stroke(); }
  g.setLineDash([]);
  // 安工大佳山校区：校园底色、围墙、田径场
  for (const r of A.camp) { g.fillStyle = 'rgba(210,196,160,0.35)'; path(r, 0, true); g.fill(); g.strokeStyle = 'rgba(60,50,40,0.7)'; g.lineWidth = Math.max(1.5, 7 * S); g.setLineDash([16 * S, 5 * S]); g.stroke(); g.setLineDash([]); }
  for (const r of A.woods) { g.fillStyle = 'rgba(80,120,100,0.28)'; path(r, 0, true); g.fill(); }
  g.fillStyle = 'rgba(176,92,64,0.75)'; path(A.track, 0, true); g.fill();
  g.strokeStyle = 'rgba(250,240,225,0.9)'; g.lineWidth = Math.max(1, 1.6 * S); g.stroke();
  g.fillStyle = 'rgba(96,140,96,0.85)'; path(A.pitch, 0, true); g.fill(); g.strokeStyle = 'rgba(250,245,230,0.95)'; g.lineWidth = Math.max(1, 1.5 * S); g.stroke();
  { let cx = 0, cz = 0; const n = A.pitch.length / 2; for (let i = 0; i < A.pitch.length; i += 2) { cx += A.pitch[i]; cz += A.pitch[i + 1]; } const [u, v] = P2(cx / n, cz / n, S);
    g.beginPath(); g.arc(u, v, 9 * S, 0, 7); g.stroke(); }
  // 道路：勾线
  for (const r of D.road) { g.strokeStyle = `rgba(52,50,46,${0.16 + r[0] * 0.08})`; g.lineWidth = Math.max(0.8, (6 + r[0] * 7) * S); path(r, 1, false); g.stroke(); }
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 8; return t;
}

/* ---------- 雨山湖—安工大 局部高清地面 ---------- */
{
  const X0 = -650, Z0 = -3350, W = 2500, HH = 1750, R = small ? 0.7 : 1.4;
  const cv = document.createElement('canvas'); cv.width = Math.round(W * R); cv.height = Math.round(HH * R);
  const g = cv.getContext('2d');
  const pa = (arr, off, close) => { g.beginPath(); for (let i = off; i < arr.length; i += 2) { const u = (arr[i] - X0) * R, v = (arr[i + 1] - Z0) * R; i === off ? g.moveTo(u, v) : g.lineTo(u, v); } if (close) g.closePath(); };
  g.lineJoin = 'round'; g.lineCap = 'round';
  // 公园草地与林
  g.fillStyle = 'rgba(150,182,150,0.55)'; pa(A.park, 0, true); g.fill();
  g.strokeStyle = 'rgba(70,90,70,0.55)'; g.lineWidth = 3 * R; g.stroke();
  for (const r of A.woods) { g.fillStyle = 'rgba(96,136,110,0.55)'; pa(r, 0, true); g.fill(); }
  // 湖面
  for (const r of D.water) { let inb = false; for (let i = 0; i < r.length; i += 2) if (r[i] > X0 && r[i] < X0 + W && r[i + 1] > Z0 && r[i + 1] < Z0 + HH) { inb = true; break; } if (!inb) continue;
    g.fillStyle = 'rgba(126,170,160,0.95)'; pa(r, 0, true); g.fill();
    g.strokeStyle = 'rgba(245,240,226,1)'; g.lineWidth = 7 * R; g.stroke(); g.strokeStyle = 'rgba(60,64,58,0.8)'; g.lineWidth = 2 * R; g.stroke(); }
  // 园路
  g.strokeStyle = 'rgba(236,224,196,0.95)'; g.lineWidth = 5 * R; for (const r of A.foot) { pa(r, 0, false); g.stroke(); }
  g.strokeStyle = 'rgba(120,96,60,0.7)'; g.lineWidth = 1.2 * R; for (const r of A.foot) { pa(r, 0, false); g.stroke(); }
  // 校园
  for (const r of A.camp) { g.fillStyle = 'rgba(222,208,172,0.75)'; pa(r, 0, true); g.fill(); }
  for (const r of A.camp) { g.strokeStyle = 'rgba(70,56,44,0.85)'; g.lineWidth = 4 * R; g.setLineDash([14 * R, 6 * R]); pa(r, 0, true); g.stroke(); g.setLineDash([]); }
  g.fillStyle = 'rgba(178,88,60,0.95)'; pa(A.track, 0, true); g.fill(); g.strokeStyle = 'rgba(255,248,236,1)'; g.lineWidth = 1.6 * R; g.stroke();
  g.fillStyle = 'rgba(92,146,92,1)'; pa(A.pitch, 0, true); g.fill(); g.stroke();
  { let cx = 0, cz = 0; const n = A.pitch.length / 2; for (let i = 0; i < A.pitch.length; i += 2) { cx += A.pitch[i]; cz += A.pitch[i + 1]; }
    g.beginPath(); g.arc((cx / n - X0) * R, (cz / n - Z0) * R, 9 * R, 0, 7); g.stroke(); }
  // 道路
  for (const r of D.road) { g.strokeStyle = `rgba(60,56,50,${0.35 + r[0] * 0.1})`; g.lineWidth = (5 + r[0] * 6) * R; pa(r, 1, false); g.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8; tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(W, HH, 125, 88); geo.rotateX(-Math.PI / 2); geo.translate(X0 + W / 2, 0, Z0 + HH / 2);
  const pp = geo.attributes.position; for (let i = 0; i < pp.count; i++) pp.setY(i, H(pp.getX(i), pp.getZ(i)) + 1.5);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  m.renderOrder = 1; scene.add(m);
}
/* ---------- 地形 ---------- */
{
  const seg = small ? 180 : 260;
  const geo = new THREE.PlaneGeometry(EXT.size, EXT.size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  geo.translate(EXT.x0 + EXT.size / 2, 0, EXT.z0 + EXT.size / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...U, map: { value: buildGroundTex() } },
    vertexShader: `varying vec2 vUv;varying vec3 vW;varying vec3 vN;
      void main(){vUv=uv;vN=normal;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: UNI + fogGL + `uniform sampler2D map;varying vec2 vUv;varying vec3 vW;varying vec3 vN;
      void main(){
        vec3 c=texture2D(map,vec2(vUv.x,1.-vUv.y)).rgb;
        float h=vW.y;
        if(h>2.){
          float slope=1.-vN.y;
          float cun=fbm(vW.xz*vec2(.012,.04)+vec2(h*.02));
          float ink=clamp(.10+h/240.+slope*1.9+(cun-.5)*.9,0.,1.);
          float ridge=smoothstep(.55,.75,slope+cun*.2);
          vec3 jade=vec3(.30,.42,.41);
          float strokes=fbm(vec2(dot(vW.xz,vec2(.7,.7))*.09,h*.25));
          vec3 inkC=mix(mix(paper,vec3(.64,.74,.70),.75),jade,clamp(.12+h/300.+slope*1.4+(cun-.5)*1.3,0.,1.));
          inkC=mix(inkC,vec3(.14,.2,.2),ridge*.5+smoothstep(.62,.8,strokes)*.35);
          inkC=mix(inkC,paper,smoothstep(.55,.3,strokes)*.18);
          c=mix(c,inkC,smoothstep(2.,26.,h));
        }
        vec2 e=abs(vUv-.5)*2.;float edge=smoothstep(.72,1.,max(e.x,e.y));
        float d=distance(camPos,vW);
        c=mix(c,paper,max(fogF(d),edge));
        gl_FragColor=vec4(c,1.);
      }`
  });
  scene.add(new THREE.Mesh(geo, mat));
}

/* ---------- 建筑（合并几何 + 勾线） ---------- */
{
  const pos = [], nrm = [], lin = [], tops = [], la = [];
  const add = (pts, h) => {
    // ensure CCW (x,z plane, viewed from above)
    let A = 0; for (let i = 0; i < pts.length; i++) { const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length]; A += x1 * z2 - x2 * z1; }
    if (A > 0) pts.reverse();
    let cx = 0, cz = 0; for (const [x, z] of pts) { cx += x; cz += z; } cx /= pts.length; cz /= pts.length;
    const b = H(cx, cz) - 1, t = b + h + 1;
    for (let i = 0; i < pts.length; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
      const nx = z2 - z1, nz = -(x2 - x1), L = Math.hypot(nx, nz) || 1;
      pos.push(x1, b, z1, x2, b, z2, x2, t, z2, x1, b, z1, x2, t, z2, x1, t, z1);
      for (let k = 0; k < 6; k++) { nrm.push(-nx / L, 0, -nz / L); tops.push(t, h); }
      lin.push(x1, t, z1, x2, t, z2, x1, b, z1, x1, t, z1); la.push(1, 1, .25, .25);
    }
    const tri = THREE.ShapeUtils.triangulateShape(pts.map(([x, z]) => new THREE.Vector2(x, z)), []);
    for (const f of tri) for (const k of f) { pos.push(pts[k][0], t, pts[k][1]); nrm.push(0, 1, 0); tops.push(t, h); }
  };
  for (const r of D.b) { const pts = []; for (let i = 1; i < r.length; i += 2) pts.push([r[i], r[i + 1]]); if (pts.length >= 3) add(pts, Math.max(4, r[0])); }
  for (const r of A.cbld) { const pts = []; for (let i = 1; i < r.length; i += 2) pts.push([r[i], r[i + 1]]); if (pts.length >= 3) add(pts, r[0]); }
  for (const [x, z, w, d, a, h] of D.pb) {
    const c = Math.cos(a), s = Math.sin(a), pts = [];
    for (const [u, v] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) pts.push([x + u * c - v * s, z + u * s + v * c]);
    add(pts, h > 24 ? 18 + (h - 24) * .15 : h); // 示意体量压低，突出黛瓦屋面
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute('top', new THREE.Float32BufferAttribute(tops, 2));
  const near = `float d=distance(camPos,vW);float fade=smoothstep(60.,340.,d);
      if(hash(floor(gl_FragCoord.xy))>fade) discard;`;
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `attribute vec2 top;varying vec2 vT;varying vec3 vW;varying vec3 vN;void main(){vT=top;vN=normal;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: UNI + fogGL + `varying vec2 vT;varying vec3 vW;varying vec3 vN;
      void main(){` + near + `
        vec3 L=normalize(vec3(-.55,.6,.35));
        float l=dot(normalize(vN),L);
        vec3 wall=vec3(.965,.955,.93);
        float tone=l>.15?1.:(l>-.2?.86:.74);
        vec3 c=wall*tone;
        float n=fbm(vW.xy*.09+vW.zy*.09);
        c-=n*.05;
        // 屋顶：黛瓦
        vec3 roof=vec3(.30,.32,.33)+n*.12;
        float rh=min(2.2,vT.y*.18);
        if(vN.y>.5) c=roof; else { float eave=smoothstep(vT.x-rh-.4,vT.x-rh,vW.y); c=mix(c,roof*.9,eave);
          float foot=1.-smoothstep(vT.x-vT.y,vT.x-vT.y+3.,vW.y); c=mix(c,vec3(.55,.6,.58),foot*.5); }
        // 窗格（高楼）
        if(vN.y<.5 && vT.y>14.){ vec2 q=vec2(dot(vW.xz,normalize(vec2(-vN.z,vN.x))),vW.y); vec2 f=fract(q/vec2(3.2,3.)); float win=step(.3,f.x)*step(f.x,.7)*step(.35,f.y)*step(f.y,.75)*step(vW.y,vT.x-rh-1.);
          c=mix(c,vec3(.62,.66,.66),win*.3); }
        c=mix(c,paper,fogF(d));
        gl_FragColor=vec4(c,1.);}`
  });
  scene.add(new THREE.Mesh(geo, mat));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lin, 3)); lg.setAttribute('la', new THREE.Float32BufferAttribute(la, 1));
  const lm = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float la;varying float vA;varying vec3 vW;void main(){vA=la;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z-=.002*gl_Position.w;}`,
    fragmentShader: UNI + fogGL + `varying float vA;varying vec3 vW;void main(){` + near + `
      float a=.62*vA*(1.-fogF(d)*1.1)*(.35+.65*smoothstep(9000.,2500.,d));gl_FragColor=vec4(vec3(.12,.13,.13),a);}`
  });
  scene.add(new THREE.LineSegments(lg, lm));
  window.__tris = pos.length / 9;
}

/* ---------- 林木点染（绿地、山坡；采石矶、雨山湖点几树梅花） ---------- */
{
  const pos = [], col = [], siz = [];
  const inPoly = (r, x, z) => { let c = false; for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) { const xi = r[i], zi = r[i + 1], xj = r[j], zj = r[j + 1]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const put = (x, z, pink) => { const y = H(x, z); pos.push(x, y + 6, z);
    if (pink) col.push(.86, .55, .58); else { const t = rnd(); col.push(.20 + t * .12, .32 + t * .12, .30 + t * .08); }
    siz.push(pink ? 26 + rnd() * 14 : 22 + rnd() * 22); };
  for (const r of D.green) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); z0 = Math.min(z0, r[i + 1]); z1 = Math.max(z1, r[i + 1]); }
    const n = Math.min(260, Math.ceil((x1 - x0) * (z1 - z0) / 9000));
    for (let k = 0; k < n; k++) { const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0); if (inPoly(r, x, z)) put(x, z, false); } }
  for (const r of D.water) { if (r.length < 40) continue; for (let i = 0; i < r.length; i += 2) { const j = (i + 2) % r.length, n = Math.ceil(Math.hypot(r[j] - r[i], r[j + 1] - r[i + 1]) / 22);
      for (let k = 0; k < n; k++) { const t = k / n, x = r[i] + (r[j] - r[i]) * t, z = r[i + 1] + (r[j + 1] - r[i + 1]) * t; if (x > -600 && x < 900 && z > -3300 && z < -1750) { pos.push(x + (rnd() - .5) * 14, 7, z + (rnd() - .5) * 14); col.push(.42, .58, .40); siz.push(22 + rnd() * 10); } } } }
  for (const r of [...A.woods, A.park]) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); z0 = Math.min(z0, r[i + 1]); z1 = Math.max(z1, r[i + 1]); }
    for (let k = 0; k < 500; k++) { const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0); if (inPoly(r, x, z) && !D.water.some(w => w.length > 40 && inPoly(w, x, z))) put(x, z, false); } }
  for (const r of A.camp) for (let i = 0; i < r.length; i += 2) { const j = (i + 2) % r.length, n = Math.ceil(Math.hypot(r[j] - r[i], r[j + 1] - r[i + 1]) / 18);
    for (let k = 0; k < n; k++) { const t = k / n; put(r[i] + (r[j] - r[i]) * t + (rnd() - .5) * 8, r[i + 1] + (r[j + 1] - r[i + 1]) * t + (rnd() - .5) * 8, false); } }
  for (const [px, pz, e, sz] of HILLS) for (let k = 0; k < 220; k++) { const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * sz * 1.3, x = px + Math.cos(a) * rr, z = pz + Math.sin(a) * rr; if (H(x, z) > 10) put(x, z, false); }
  for (const [cx, cz, n] of [[-3820, 1700, 40], [-3950, 2250, 30], [250, -2250, 60], [-4489, 600, 30]]) for (let k = 0; k < n; k++) put(cx + (rnd() - .5) * 700, cz + (rnd() - .5) * 600, true);
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  for (let i = 0; i < 9; i++) { const x = 20 + Math.random() * 24, y = 18 + Math.random() * 26, r = 9 + Math.random() * 9; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.7, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setAttribute('sz', new THREE.Float32BufferAttribute(siz, 1));
  const m = new THREE.ShaderMaterial({ uniforms: { ...U, map: { value: new THREE.CanvasTexture(cv) }, ps: { value: innerHeight } }, transparent: true, depthWrite: false,
    vertexShader: `attribute float sz;attribute vec3 color;uniform float ps;varying vec3 vC;varying vec3 vW;void main(){vC=color;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(sz*ps*.9/-mv.z,1.5,16.);}`,
    fragmentShader: UNI + fogGL + `uniform sampler2D map;varying vec3 vC;varying vec3 vW;void main(){float a=texture2D(map,gl_PointCoord).a;float d=distance(camPos,vW);
      if(a<.05)discard;gl_FragColor=vec4(mix(vC,paper,fogF(d)),a*.85*(1.-fogF(d)));}` });
  window.__treeMat = m;
  scene.add(new THREE.Points(geo, m));
}

/* ---------- 落日 ---------- */
{
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(226,96,70,.95)'); gr.addColorStop(.62, 'rgba(232,112,84,.85)'); gr.addColorStop(.7, 'rgba(240,160,130,.25)'); gr.addColorStop(1, 'rgba(240,180,150,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthWrite: false, fog: false }));
  sun.position.set(-14000, 1300, -22000); sun.scale.set(2600, 2600, 1); sun.renderOrder = -10; scene.add(sun);
}

/* ---------- 飞鸟、江帆 ---------- */
const birds = [], boats = [];
{
  const bm = new THREE.LineBasicMaterial({ color: 0x2a2c2c, transparent: true, opacity: .75 });
  for (let f = 0; f < 3; f++) for (let i = 0; i < 6; i++) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-14, 4, 0, 0, 0, 0, 0, 0, 0, 14, 4, 0], 3));
    const l = new THREE.LineSegments(g, bm); l.userData = { f, i, ox: (i % 3) * 40 + Math.random() * 20, oz: Math.floor(i / 3) * 34 + Math.random() * 20, ph: Math.random() * 6 };
    scene.add(l); birds.push(l);
  }
  const hull = new THREE.MeshBasicMaterial({ color: 0x3b3027 }), sail = new THREE.MeshBasicMaterial({ color: 0xf2ece0, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) { const b = new THREE.Group(); b.add(new THREE.Mesh(new THREE.BoxGeometry(60, 6, 14), hull));
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(30, 40), sail); sg.position.set(0, 24, 0); sg.rotation.y = Math.PI / 2; b.add(sg);
    b.userData = { k: i / 7, sp: .004 + Math.random() * .004, side: (i & 1) ? 1 : -1 }; scene.add(b); boats.push(b); }
}
const riverLine = (() => { const w = D.wline.find(w => w[1] === -14830) || D.wline.sort((a, b) => b.length - a.length)[0]; const pts = []; for (let i = 1; i < w.length; i += 2) pts.push(new THREE.Vector3(w[i], 2, w[i + 1])); return new THREE.CatmullRomCurve3(pts); })();

/* ---------- 远山层叠 ---------- */
{
  const layers = [[15000, 1100, .8], [19000, 1700, .62], [24000, 2500, .45]];
  layers.forEach(([R, Hm, a], li) => {
    const n = 360, pos = [], v = [];
    for (let i = 0; i <= n; i++) {
      const th = i / n * Math.PI * 2, x = Math.cos(th) * R - 1000, z = Math.sin(th) * R - 1000;
      const k = th * 6 + li * 10;
      let h = Hm * (0.25 + 0.45 * Math.pow(vnoise(k, li), 2) + 0.3 * vnoise(k * 3.1, li + 3) * vnoise(k * .7, li));
      if (Math.cos(th) < -0.3 && li === 0) h *= 0.4; // 江面方向放低
      pos.push(x, -50, z, x, h, z); v.push(0, 1);
    }
    const idx = []; for (let i = 0; i < n; i++) { const a0 = i * 2; idx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('vv', new THREE.Float32BufferAttribute(v, 1)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: { ...U, al: { value: a } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `attribute float vv;varying float vV;varying vec3 vW;void main(){vV=vv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader: UNI + fogGL + `uniform float al;` + `const int li=${li};` + `varying float vV;varying vec3 vW;
        void main(){float n=fbm(vW.xz*.002+vec2(vW.y*.004));
        float a=al*smoothstep(.0,.85,vV)*(.75+.5*n);
        gl_FragColor=vec4(mix(vec3(.24,.36,.36),paper,.12+.55*(1.-vV)+.12*float(li)),a);}`
    });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = -1 - li; scene.add(mesh);
  });
}

/* ---------- 江雾 ---------- */
const mists = [];
{
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
  for (let i = 0; i < 70; i++) { const r = 18 + Math.random() * 30, x = 50 + Math.random() * 156, y = 70 + Math.random() * 116;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(250,248,240,.35)'); gr.addColorStop(1, 'rgba(250,248,240,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  const tex = new THREE.CanvasTexture(cv);
  const spots = [[-7600, 3600], [-4200, -7000], [-9500, -1500], [-3600, 8200]];
  spots.forEach(([x, z], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5200, 2200), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .4 }));
        m.rotation.x = -Math.PI / 2; m.rotation.z = 1.25 + i * .1; m.position.set(x, 30 + i * 12, z); m.userData.x0 = x; m.userData.z0 = z; scene.add(m); mists.push(m);
  });
}

/* ---------- 控制 ---------- */
const controls = new MapControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.minDistance = 120; controls.maxDistance = 14000; controls.maxPolarAngle = 1.35; controls.minPolarAngle = .25;
controls.screenSpacePanning = false;
addLandmarks(scene, U, H, UNI, fogGL);
const HOME = { t: new THREE.Vector3(-1900, 0, -500), p: new THREE.Vector3(1700, 2500, 4800) };
camera.position.copy(HOME.p); controls.target.copy(HOME.t);

let fly = null, orbit = 0, tour = null, play = null;
canvas.addEventListener('pointerdown', () => { orbit = -1; tour = null; }); canvas.addEventListener('wheel', () => { orbit = -1; tour = null; });
function tourNext() { if (!tour) return; const q = tour.pts[tour.i++]; if (!q) { tour = null; return; } flyTo({ x: q[0], z: q[1], d: q[2], dir: [q[3], q[4]] }); if (fly) fly.dur = RM ? 1 : 3200; }
function flyTo(poi) {
  const tgt = new THREE.Vector3(poi.x, H(poi.x, poi.z), poi.z);
  const dir = camera.position.clone().sub(controls.target); dir.y = 0; dir.normalize();
  if (poi.dir) dir.set(poi.dir[0], 0, poi.dir[1]).normalize();
  if (!isFinite(dir.x)) dir.set(.6, 0, .8);
  const pol = 0.95, dist = poi.d;
  const end = tgt.clone().add(new THREE.Vector3(dir.x * Math.sin(pol) * dist, Math.cos(pol) * dist, dir.z * Math.sin(pol) * dist));
  fly = { t0: performance.now(), dur: RM ? 1 : 2600, p0: camera.position.clone(), t0v: controls.target.clone(), p1: end, t1: tgt };
}
function flyHome() { fly = { t0: performance.now(), dur: RM ? 1 : 2400, p0: camera.position.clone(), t0v: controls.target.clone(), p1: HOME.p.clone(), t1: HOME.t.clone() }; }
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- 朱印标签 ---------- */
const layer = document.getElementById('labels');
for (const p of POIS) {
  const el = document.createElement('button'); el.className = 'seal'; el.setAttribute('aria-label', '飞往' + p.name);
  el.innerHTML = `<span>${p.seal}</span>`; if (p.sub) el.classList.add('sub'); if (p.edge) el.classList.add('edge'); el.onclick = () => select(p); layer.appendChild(el); p.el = el;
  p.v = new THREE.Vector3(p.x, H(p.x, p.z) + 60, p.z);
}
const card = document.getElementById('card');
function select(p) {
  flyTo(p);
  card.querySelector('h2').textContent = p.name;
  card.querySelector('p').textContent = p.text;
  card.querySelector('small').textContent = '资料：' + p.src + (p.approx ? '　· 点位为示意，精确位置待核实' : '');
  const ex = card.querySelector('.cx'); ex.innerHTML = '';
  if (p.game) ex.innerHTML += '<button data-a="game">游采石长卷</button>';
  if (p.museum) ex.innerHTML += '<button data-a="museum">进入李白展厅</button>';
  if (play) play.onSelect(p);
  card.classList.add('on'); orbit = 0; document.body.classList.add('carding');
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === p.id));
}
const bar = document.getElementById('chips');
for (const p of POIS.filter(p => !p.sub)) { const b = document.createElement('button'); b.className = 'chip'; b.dataset.id = p.id; b.textContent = p.chip || p.name.split(' ·')[0]; b.onclick = () => select(p); bar.appendChild(b); }
document.getElementById('home').onclick = () => { card.classList.remove('on'); document.body.classList.remove('carding'); document.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); flyHome(); };
card.querySelector('.x').onclick = () => { card.classList.remove('on'); document.body.classList.remove('carding'); };
window.__select = id => select(POIS.find(p => p.id === id));
window.__jump = id => { select(POIS.find(p => p.id === id)); fly.dur = 1; };

/* ---------- 泛舟长卷 ---------- */
let paused = false;
const scroll = createCScroll(document.getElementById('cs'), () => { paused = false; requestAnimationFrame(frame); }, window.__IMG || {});
document.getElementById('boat').onclick = () => { paused = true; card.classList.remove('on'); scroll.open(); };
card.querySelector('.cx').addEventListener('click', e => { const a = e.target.dataset.a;
  if (a === 'game') document.getElementById('boat').click();
  if (a === 'museum') window.open('https://www.teacherlele.cn/sites/libai/', '_blank'); });
window.__openScroll = () => document.getElementById('boat').click();
const toast3 = document.getElementById('toast3');
play = setupPlay({ POIS, card, mg: document.getElementById('mg3'),
  openScroll: (sc, x, m) => { tour = null; document.getElementById('boat').click(); window.__cs && window.__cs.goto(sc, x, m); },
  tourTo: pts => { tour = { pts, i: 0 }; tourNext(); },
  onSeal: p => { toast3.textContent = '盖下城印「' + p.seal + '」'; toast3.classList.add('on'); clearTimeout(toast3.t); toast3.t = setTimeout(() => toast3.classList.remove('on'), 2200); } });
window.__play = play;

/* ---------- 引导 ---------- */
const intro = document.getElementById('intro');
const closeIntro = () => intro.classList.add('off');
if (localStorage.getItem('mas-intro') === 'skip') closeIntro();
document.getElementById('go').onclick = closeIntro;
document.getElementById('skip').onclick = () => { localStorage.setItem('mas-intro', 'skip'); closeIntro(); };

/* ---------- 尺寸 ---------- */
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false);
  camera.aspect = w / h; if (window.__treeMat) window.__treeMat.uniforms.ps.value = h; camera.fov = w / h < 0.8 ? 58 : 42; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200)); resize();

/* ---------- 循环 ---------- */
const tmp = new THREE.Vector3();
let lastT = 0;
function frame(now) {
  if (paused) return;
  const dtf = Math.min(.1, (now - (lastT || now)) / 1000) * .02; lastT = now;
  U.time.value = now / 1000;
  if (fly) {
    const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k);
    controls.target.lerpVectors(fly.t0v, fly.t1, e);
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    camera.position.y += Math.sin(Math.PI * e) * fly.p0.distanceTo(fly.p1) * .18;
    if (k >= 1) { fly = null; if (tour) { orbit = -1; setTimeout(tourNext, RM ? 0 : 700); } else if (orbit === 0 && card.classList.contains('on') && !RM) orbit = 1; }
  }
  controls.update();
  // 山体避让
  const gh = H(camera.position.x, camera.position.z) + 70;
  if (camera.position.y < gh) camera.position.y = gh;
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, -9000, 7000);
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, -10000, 7000);
  if (!RM) mists.forEach((m, i) => { const s = Math.sin(now / 9000 + i * 1.7); m.position.x = m.userData.x0 + s * 260; m.position.z = m.userData.z0 - s * 600; });
  if (!RM) {
    const T = now / 1000;
    birds.forEach(b => { const u = b.userData, a = T * .05 + u.f * 2.1, cx = -2600 + Math.cos(a) * (2600 + u.f * 600), cz = 200 + Math.sin(a) * (1800 + u.f * 400);
      b.position.set(cx + u.ox, 420 + u.f * 90 + Math.sin(T + u.ph) * 8, cz + u.oz); b.rotation.y = -a; b.scale.y = .5 + .5 * Math.abs(Math.sin(T * 5 + u.ph)); });
    boats.forEach(b => { const u = b.userData; u.k = (u.k + u.sp * dtf) % 1; const p = riverLine.getPointAt(u.k), t = riverLine.getTangentAt(u.k);
      b.position.set(p.x + t.z * 260 * u.side, 3, p.z - t.x * 260 * u.side); b.rotation.y = Math.atan2(-t.z, t.x); });
  }
  if (orbit === 1 && !fly) { const o = camera.position.clone().sub(controls.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), .0016); camera.position.copy(controls.target).add(o); }
  renderer.render(scene, camera);
  const w = innerWidth, h = innerHeight;
  const placed = [];
  for (const p of POIS) {
    tmp.copy(p.v).project(camera);
    let vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1 && !(p.sub && !p.edge && camera.position.distanceTo(p.v) > 3200);
    if (vis) {
      if (!p.bw) { p.el.style.display = ''; p.bw = p.el.offsetWidth || 26; p.bh = p.el.offsetHeight || 60; }
      let x = (tmp.x * .5 + .5) * w, y = (-tmp.y * .5 + .5) * h, dx = 0;
      for (let tries = 0; tries < 4; tries++) {
        const r = [x + dx - p.bw / 2 - 3, y - p.bh - 3, x + dx + p.bw / 2 + 3, y];
        const hit = placed.find(q => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
        if (!hit) { placed.push(r); break; }
        if (p.sub && !p.edge) { vis = false; break; }
        dx = (hit[2] + p.bw / 2 + 4) - x; if (tries === 3) vis = false;
      }
      if (vis) p.el.style.transform = `translate(${x + dx}px,${y}px) translate(-50%,-100%)`;
      p.el.classList.toggle('shift', dx !== 0);
    }
    p.el.style.display = vis ? '' : 'none';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__ready = true;
