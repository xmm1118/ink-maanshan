import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import D from './data.json';
import { createCScroll } from './cscroll.js';
import { addLandmarks } from './landmarks.js';

const PAPER = new THREE.Color(0xed/255, 0xe6/255, 0xd4/255);
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
  { id:'ysh', seal:'雨山湖', name:'雨山湖', x:250, z:-2250, d:900,
    text:'位于马鞍山市中心，1959年辟为城市公园；周围九座山峰远近错落、环湖而立，素有“九峰环一湖”之称。',
    src:'马鞍山市雨山湖公园公开介绍' },
  { id:'cj', seal:'长江', name:'长江 · 马鞍山段', x:-5320, z:-1400, d:3600,
    text:'长江自马鞍山城西流过，江中有江心洲分汊。采石矶一带是李白一生赋诗最多的地方，《望天门山》《夜泊牛渚怀古》等名篇都与这段江景相关。',
    src:'长江日报、安徽省政府新闻办公开报道' },
  { id:'ahut', seal:'安工大', name:'安徽工业大学 · 佳山校区', x:1403, z:-2656, d:1300,
    text:'前身是1958年创建的马鞍山钢铁工业学校，2000年组建为安徽工业大学；现有佳山、秀山两个校区。',
    src:'安徽工业大学官网 ahut.edu.cn' },
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
  { id:'ljt', seal:'凌家滩', name:'凌家滩遗址（含山方向）', x:-10800, z:1500, d:2600, sub:1, edge:1,
    text:'位于马鞍山市含山县，距今约5800至5300年，出土玉人、玉龟、刻纹玉版等，与红山、良渚并称“史前三大玉文化中心”。遗址在本图范围以外，此处只标方向。', src:'国家文物局 2025-05-16；人民日报海外版' },
  { id:'qs', seal:'青山', name:'大青山 · 李白墓（当涂方向）', x:3500, z:6900, d:2600, sub:1, edge:1,
    text:'李白终老当涂，魂归青山。大青山李白墓由谷氏家族世代守护，第49代守墓人谷常新已坚守四十余年。墓在本图范围以南，此处只标方向。', src:'中安在线 2026-10-16' },

];

/* ---------- 程序化山体（示意） ---------- */
const HILLS = [[-4150,1950,131,520],[-758,-1249,95,420],[1592,-2215,100,430]];
for (const p of D.peaks) { const e = parseFloat(p[1]) || 90; HILLS.push([p[2], p[3], e, 450 + e * 2]); }
function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const VS = 1.6; // 山体竖向夸张
function H(x, z) {
  let h = 0;
  for (const [px, pz, e, s] of HILLS) {
    const dx = x - px, dz = z - pz, r2 = (dx * dx + dz * dz) / (s * s);
    if (r2 < 9) h = Math.max(h, e * Math.exp(-r2 * 1.1));
  }
  if (h > 1) {
    const n = vnoise(x / 260, z / 260) * 0.5 + vnoise(x / 110, z / 110) * 0.3 + vnoise(x / 50, z / 50) * 0.2;
    h *= 0.65 + 0.7 * n;
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
const U = { camPos: { value: camera.position }, paper: { value: PAPER }, fogNear: { value: 4000 }, fogFar: { value: 19000 }, time: { value: 0 } };

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
  g.fillStyle = 'rgba(70,78,66,0.07)';
  for (const r of D.green) { path(r, 0, true); g.fill(); }
  // 长江：两条航道成宽带，多次叠染形成晕边
  const yz = D.wline.filter(w => w.length > 50).sort((p, q) => q.length - p.length);
  const rivers = D.wline.filter(w => (w[1] === -14830) || (w[1] === -11733));
  const widths = { '-14830': 1500, '-11733': 950 };
  g.save(); g.filter = `blur(${Math.round(120 * S)}px)`;
  for (const w of rivers) { g.strokeStyle = 'rgba(150,160,162,0.30)'; g.lineWidth = (widths[w[1]] + 300) * S; path(w, 1, false); g.stroke(); }
  g.restore();
  for (const w of rivers) { g.strokeStyle = 'rgba(232,230,220,0.55)'; g.lineWidth = (widths[w[1]] - 150) * S; path(w, 1, false); g.stroke(); }
  // 水纹
  g.strokeStyle = 'rgba(60,70,72,0.16)'; g.lineWidth = Math.max(1, 3 * S);
  for (const w of rivers) for (let i = 3; i < w.length - 4; i += 2) {
    for (let k = 0; k < 6; k++) { const [u, v] = P2(w[i] + (Math.random() - .5) * widths[w[1]] * .7, w[i + 1] + (Math.random() - .5) * 600, S);
      g.beginPath(); g.moveTo(u, v); g.quadraticCurveTo(u + 60 * S, v - 14 * S, u + 120 * S, v); g.stroke(); }
  }
  // 湖、塘
  for (const r of D.water) { g.fillStyle = 'rgba(120,132,136,0.20)'; path(r, 0, true); g.fill(); g.strokeStyle = 'rgba(40,40,40,0.35)'; g.lineWidth = Math.max(1, 6 * S); g.stroke(); }
  // 小河
  g.strokeStyle = 'rgba(80,92,98,0.35)';
  for (const w of D.wline) { if (rivers.includes(w)) continue; g.lineWidth = Math.max(1.2, 26 * S); path(w, 1, false); g.stroke(); }
  // 道路：勾线
  for (const r of D.road) { g.strokeStyle = `rgba(30,30,30,${0.12 + r[0] * 0.07})`; g.lineWidth = Math.max(0.8, (6 + r[0] * 7) * S); path(r, 1, false); g.stroke(); }
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 8; return t;
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
          vec3 inkC=mix(paper,vec3(.16,.17,.16),ink*.75);
          inkC=mix(inkC,vec3(.1),ridge*.35);
          c=mix(c,inkC,smoothstep(2.,30.,h));
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
  const pos = [], nrm = [], lin = [];
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
      for (let k = 0; k < 6; k++) nrm.push(-nx / L, 0, -nz / L);
      lin.push(x1, t, z1, x2, t, z2, x1, b + h * 0.35, z1, x1, t, z1);
    }
    const tri = THREE.ShapeUtils.triangulateShape(pts.map(([x, z]) => new THREE.Vector2(x, z)), []);
    for (const f of tri) for (const k of f) { pos.push(pts[k][0], t, pts[k][1]); nrm.push(0, 1, 0); }
  };
  for (const r of D.b) { const pts = []; for (let i = 1; i < r.length; i += 2) pts.push([r[i], r[i + 1]]); if (pts.length >= 3) add(pts, Math.max(4, r[0])); }
  for (const [x, z, w, d, a, h] of D.pb) {
    const c = Math.cos(a), s = Math.sin(a), pts = [];
    for (const [u, v] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) pts.push([x + u * c - v * s, z + u * s + v * c]);
    add(pts, h);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  const near = `float d=distance(camPos,vW);float fade=smoothstep(60.,340.,d);
      if(hash(floor(gl_FragCoord.xy))>fade) discard;`;
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `varying vec3 vW;varying vec3 vN;void main(){vN=normal;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: UNI + fogGL + `varying vec3 vW;varying vec3 vN;
      void main(){` + near + `
        vec3 L=normalize(vec3(-.55,.6,.35));
        float l=dot(normalize(vN),L);
        float tone=vN.y>.5?.97:(l>.15?.88:(l>-.2?.74:.62));
        tone-=fbm(vW.xy*.08+vW.zy*.08)*.08;
        vec3 c=mix(vec3(.12),paper,tone);
        float mist=1.-smoothstep(0.,38.,vW.y-0.);
        c=mix(c,paper,mist*.85);
        c=mix(c,paper,fogF(d));
        gl_FragColor=vec4(c,1.);}`
  });
  scene.add(new THREE.Mesh(geo, mat));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lin, 3));
  const lm = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z-=.002*gl_Position.w;}`,
    fragmentShader: UNI + fogGL + `varying vec3 vW;void main(){` + near + `
      float a=.55*(1.-fogF(d)*1.1)*smoothstep(6.,40.,vW.y);gl_FragColor=vec4(vec3(.1),a);}`
  });
  scene.add(new THREE.LineSegments(lg, lm));
  window.__tris = pos.length / 9;
}

/* ---------- 远山层叠 ---------- */
{
  const layers = [[16000, 900, .55], [20000, 1400, .42], [25000, 2000, .3]];
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
      fragmentShader: UNI + fogGL + `uniform float al;varying float vV;varying vec3 vW;
        void main(){float n=fbm(vW.xz*.002+vec2(vW.y*.004));
        float a=al*smoothstep(.0,.85,vV)*(.75+.5*n);
        gl_FragColor=vec4(mix(vec3(.2,.22,.22),paper,.25+.3*(1.-vV)),a);}`
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
  const spots = [[-5600, 3000], [-5000, -1200], [-4200, -6000], [-8500, 1500], [-3600, 7500]];
  spots.forEach(([x, z], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5200, 2200), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .9 }));
        m.rotation.x = -Math.PI / 2; m.rotation.z = 1.25 + i * .1; m.position.set(x, 30 + i * 12, z); m.userData.x0 = x; m.userData.z0 = z; scene.add(m); mists.push(m);
  });
}

/* ---------- 控制 ---------- */
const controls = new MapControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.minDistance = 120; controls.maxDistance = 14000; controls.maxPolarAngle = 1.35; controls.minPolarAngle = .25;
controls.screenSpacePanning = false;
addLandmarks(scene, U, H, UNI, fogGL);
const HOME = { t: new THREE.Vector3(-1400, 0, -300), p: new THREE.Vector3(2600, 4200, 6200) };
camera.position.copy(HOME.p); controls.target.copy(HOME.t);

let fly = null, orbit = 0;
canvas.addEventListener('pointerdown', () => orbit = -1); canvas.addEventListener('wheel', () => orbit = -1);
function flyTo(poi) {
  const tgt = new THREE.Vector3(poi.x, H(poi.x, poi.z), poi.z);
  const dir = camera.position.clone().sub(controls.target); dir.y = 0; dir.normalize();
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
  card.classList.add('on'); orbit = 0;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === p.id));
}
const bar = document.getElementById('chips');
for (const p of POIS.filter(p => !p.sub)) { const b = document.createElement('button'); b.className = 'chip'; b.dataset.id = p.id; b.textContent = p.name.split(' ·')[0]; b.onclick = () => select(p); bar.appendChild(b); }
document.getElementById('home').onclick = () => { card.classList.remove('on'); document.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); flyHome(); };
card.querySelector('.x').onclick = () => card.classList.remove('on');
window.__select = id => select(POIS.find(p => p.id === id));
window.__jump = id => { select(POIS.find(p => p.id === id)); fly.dur = 1; };

/* ---------- 泛舟长卷 ---------- */
let paused = false;
const scroll = createCScroll(document.getElementById('cs'), () => { paused = false; requestAnimationFrame(frame); }, window.__IMG || {});
document.getElementById('boat').onclick = () => { paused = true; card.classList.remove('on'); scroll.open(); };
card.querySelector('.cx').addEventListener('click', e => { const a = e.target.dataset.a;
  if (a === 'game') document.getElementById('boat').click();
  if (a === 'museum') window.open('李白3D虚拟展馆_离线版/李白3D虚拟展馆.html', '_blank'); });
window.__openScroll = () => document.getElementById('boat').click();

/* ---------- 引导 ---------- */
const intro = document.getElementById('intro');
const closeIntro = () => intro.classList.add('off');
if (localStorage.getItem('mas-intro') === 'skip') closeIntro();
document.getElementById('go').onclick = closeIntro;
document.getElementById('skip').onclick = () => { localStorage.setItem('mas-intro', 'skip'); closeIntro(); };

/* ---------- 尺寸 ---------- */
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w / h < 0.8 ? 58 : 42; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200)); resize();

/* ---------- 循环 ---------- */
const tmp = new THREE.Vector3();
function frame(now) {
  if (paused) return;
  U.time.value = now / 1000;
  if (fly) {
    const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k);
    controls.target.lerpVectors(fly.t0v, fly.t1, e);
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    camera.position.y += Math.sin(Math.PI * e) * fly.p0.distanceTo(fly.p1) * .18;
    if (k >= 1) { fly = null; if (orbit === 0 && card.classList.contains('on') && !RM) orbit = 1; }
  }
  controls.update();
  // 山体避让
  const gh = H(camera.position.x, camera.position.z) + 70;
  if (camera.position.y < gh) camera.position.y = gh;
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, -9000, 7000);
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, -10000, 7000);
  if (!RM) mists.forEach((m, i) => { const s = Math.sin(now / 9000 + i * 1.7); m.position.x = m.userData.x0 + s * 260; m.position.z = m.userData.z0 - s * 600; });
  if (orbit === 1 && !fly) { const o = camera.position.clone().sub(controls.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), .0016); camera.position.copy(controls.target).add(o); }
  renderer.render(scene, camera);
  const w = innerWidth, h = innerHeight;
  for (const p of POIS) {
    tmp.copy(p.v).project(camera);
    const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1 && !(p.sub && !p.edge && camera.position.distanceTo(p.v) > 3200);
    p.el.style.display = vis ? '' : 'none';
    if (vis) p.el.style.transform = `translate(${(tmp.x * .5 + .5) * w}px,${(-tmp.y * .5 + .5) * h}px) translate(-50%,-100%)`;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__ready = true;
