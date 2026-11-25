// 景点细节：程序化古建（示意，非实测），合并几何 + 描边
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const WALL = [.93, .91, .86], ROOF = [.34, .34, .33], RED = [.66, .2, .16], STONE = [.45, .44, .41], WOOD = [.42, .3, .22];
export function addLandmarks(scene, U, H, UNI, fogGL) {
  const parts = [];
  const put = (g, col, x, y, z, ry = 0) => {
    g = g.toNonIndexed(); if (ry) g.rotateY(ry); g.translate(x, y, z);
    const n = g.attributes.position.count, c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) c.set(col, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.deleteAttribute('uv'); parts.push(g);
  };
  const box = (w, h, d, col, x, y, z, ry) => put(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), col, x, y, z, ry);
  // 歇山/庑殿顶近似：四棱台 + 外挑檐口
  const roof = (w, d, h, x, y, z, ry = 0) => {
    const g1 = new THREE.CylinderGeometry(.2, .72, h, 4, 1).rotateY(Math.PI / 4).scale(w * 1.42, 1, d * 1.42).translate(0, h / 2 + h * .18, 0);
    const g2 = new THREE.CylinderGeometry(.72, .86, h * .2, 4, 1).rotateY(Math.PI / 4).scale(w * 1.42, 1, d * 1.42).translate(0, h * .1, 0);
    put(g1, ROOF, x, y, z, ry); put(g2, ROOF, x, y, z, ry);
  };
  const gable = (w, d, h, x, y, z, ry = 0) => put(new THREE.CylinderGeometry(.6, .6, w * 1.08, 3, 1).rotateZ(Math.PI / 2).scale(1, h / .9, d / 1.04).translate(0, h * .3, 0), ROOF, x, y, z, ry);
  const tower = (x, z, levels, w, s, ry) => {
    let y = H(x, z) - 2; box(w * 1.3 * s, 4 * s, w * 1.1 * s, STONE, x, y, z, ry); y += 4 * s;
    for (let i = 0; i < levels; i++) {
      const ww = w * (1 - i * .12) * s, hh = 8.5 * s;
      box(ww, hh, ww * .78, WALL, x, y, z, ry); box(ww * 1.04, .8 * s, ww * .82, RED, x, y + hh * .15, z, ry);
      roof(ww * 1.12, ww * .9, (i === levels - 1 ? 4.2 : 1.5) * s, x, y + hh, z, ry); y += hh + 1.2 * s;
    }
  };
  const pavilion = (x, z, w, s, y0) => {
    const y = y0 ?? H(x, z) - 1;
    box(w * 1.3 * s, 1.2 * s, w * 1.3 * s, STONE, x, y, z);
    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(.7 * s, 4.5 * s, .7 * s, RED, x + u * w * .45 * s, y + 1.2 * s, z + v * w * .45 * s);
    roof(w * 1.25 * s, w * 1.25 * s, 3.4 * s, x, y + 5.7 * s, z);
  };
  const house = (x, z, w, d, s, ry) => { const y = H(x, z) - 1; box(w * s, 4 * s, d * s, WALL, x, y, z, ry); gable(w * s, d * s, 3 * s, x, y + 4 * s, z, ry); };
  const S = 2.6;
  // 太白楼：三层，翠螺山南麓（点位示意）
  tower(-3900, 2380, 3, 22, S, .5);
  for (let i = 0; i < 6; i++) box(18 * S, 1.2 * S, 3 * S, STONE, -3900 + Math.sin(.5) * (40 + i * 9) * S * .3, H(-3900, 2380) - 6 - i * 2.5 * S, 2380 + Math.cos(.5) * (40 + i * 9) * S * .3, .5);
  // 采石矶：矶头亭 + 捉月台（临江巨石）+ 三元洞口
  { const x = -4019, z = 2056; pavilion(x, z, 8, S); }
  { const x = -4170, z = 2150, y = H(-4120, 2150); put(new THREE.BoxGeometry(70, 10, 34).translate(30, 0, 0), STONE, x, y - 30, z, .15); put(new THREE.DodecahedronGeometry(26, 0).scale(1.6, .8, 1), STONE, x + 30, y - 46, z, .3); }
  { const x = -4180, z = 1960; put(new THREE.CylinderGeometry(14, 14, 8, 14, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(0), [.12, .12, .12], x, Math.max(6, H(x, z) * .25), z, Math.PI / 2); }
  // 采石古镇：沿街民居
  { const cx = -3753, cz = 1410, a = .45;
    for (let i = -6; i <= 6; i++) for (const side of [-1, 1]) {
      const u = i * 15 * S, v = side * 11 * S, x = cx + u * Math.cos(a) - v * Math.sin(a), z = cz + u * Math.sin(a) + v * Math.cos(a);
      house(x, z, 11, 8 + (i & 1) * 2, S * .9, -a);
    }
    pavilion(cx + 110 * Math.cos(a), cz + 110 * Math.sin(a), 7, S); }
  // 雨山湖：游船码头（OSM 点位 505,-1836，湖北岸）+ 停泊游船；不再放未经核实的湖心亭/拱桥
  { const x = 505, z = -1836; box(10, 1.6, 70, STONE, x, 0, z + 30); box(40, 1.6, 8, STONE, x, 0, z + 62);
    box(14, 5, 9, WALL, x - 14, 1.6, z + 4); gable(14, 9, 3.5, x - 14, 6.6, z + 4);
    for (const [dx, dz, r] of [[-26, 72, .1], [22, 74, -.2], [-8, 92, .3], [30, 96, .05], [120, 260, .8], [-60, 420, 1.2]])
      { put(new THREE.CylinderGeometry(2.4, 2.4, 16, 6).rotateZ(Math.PI / 2).scale(1, 1, 1.5), WOOD, x + dx, 1.5, z + dz, r); box(7, 4, 5, RED, x + dx, 3, z + dz, r); gable(8, 6, 2.6, x + dx, 7, z + dz, r); } }
  // 滨江文化公园：亭 + 长廊（诗歌节主会场之一）
  pavilion(-4489, 567, 9, S);
  for (let i = 0; i < 8; i++) { const x = -4489 + 30 + i * 18, z = 567 + 40 + i * 6; box(16, 6, 6, WALL, x, H(x, z) - 1, z, .3); gable(16, 6, 3, x, H(x, z) + 5, z, .3); }
  // 朱然家族墓地博物馆（仿汉建筑群，示意）+ 墓丘 + 朱然文化公园铜雕广场；点位据 OSM 朱然文化公园与公开坐标
  { const x = -560, z = -110, y = H(x, z) - 1, HAN = [.80, .74, .62];
    box(70, 12, 34, HAN, x, y, z); box(72, 1.2, 36, RED, x, y + 9, z); roof(74, 38, 9, x, y + 12, z);
    for (const u of [-1, 1]) { box(12, 22, 12, HAN, x + u * 30, y, z + 52); roof(15, 15, 4, x + u * 30, y + 22, z + 52); }
    put(new THREE.SphereGeometry(22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.3, .5, 1), [.52, .56, .44], x - 70, y, z - 10);
    const px = -466, pz = -10, py = H(px, pz) - 1;
    box(60, 1.2, 60, STONE, px, py, pz); box(5, 8, 5, STONE, px, py + 1.2, pz);
    put(new THREE.CylinderGeometry(1.6, 2.6, 9, 8).translate(0, 4.5, 0), [.36, .30, .22], px, py + 9.2, pz);
    put(new THREE.SphereGeometry(1.8, 8, 6), [.36, .30, .22], px, py + 20, pz);
    for (let i = 0; i < 5; i++) box(10, 5, 2, [.58, .52, .44], px - 26 + i * 13, py + 1.2, pz - 28); }
  // 凌家滩意象缩景（遗址在图外，含山方向）：三层祭坛、玉人、十字院落仿夯土博物馆
  { const x = -8700, z = 1300, y = H(x, z) - 1, JADE = [.66, .78, .70], EARTH = [.70, .58, .42];
    for (let i = 0; i < 3; i++) box(120 - i * 34, 7, 120 - i * 34, EARTH, x, y + i * 7, z);
    const jy = y + 21;
    put(new THREE.CylinderGeometry(7, 9, 34, 8).translate(0, 17, 0), JADE, x, jy, z);
    put(new THREE.CylinderGeometry(6.5, 7, 9, 8).translate(0, 38.5, 0), JADE, x, jy, z);
    put(new THREE.ConeGeometry(8, 7, 8).translate(0, 46.5, 0), JADE, x, jy, z);
    for (const u of [-1, 1]) put(new THREE.BoxGeometry(3, 14, 3).translate(u * 8.5, 24, 1).rotateZ(u * -.05), JADE, x, jy, z);
    const mx = x + 260, mz = z - 40, my = H(mx, mz) - 1;
    box(150, 12, 40, EARTH, mx, my, mz); box(40, 12, 150, EARTH, mx, my, mz); box(52, 18, 52, EARTH, mx, my, mz);
    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(44, 1, 44, [.62, .72, .62], mx + u * 50, my, mz + v * 50); }
  // 江上帆船（长江示意）
  const sails = [[-5600, 900], [-5300, 2600], [-6100, -1200], [-5000, 3800], [-6400, -3200]];
  for (const [x, z] of sails) { put(new THREE.BoxGeometry(46, 6, 12), WOOD, x, 3, z, 1.3); put(new THREE.BoxGeometry(2, 40, 26).translate(0, 26, 0), [.9, .87, .8], x, 3, z, 1.3); }

  const geo = mergeGeometries(parts); geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `attribute vec3 color;varying vec3 vC;varying vec3 vW;varying vec3 vN;void main(){vC=color;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: UNI + fogGL + `varying vec3 vC;varying vec3 vW;varying vec3 vN;void main(){
      float d=distance(camPos,vW);float l=dot(vN,normalize(vec3(-.55,.6,.35)));
      float t=vN.y>.6?1.:(l>.1?.92:.74);vec3 c=vC*t;c=mix(c,paper,fogF(d));gl_FragColor=vec4(c,1.);}`
  });
  const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
  const eg = new THREE.EdgesGeometry(geo, 30);
  const lm = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z-=.0015*gl_Position.w;}`,
    fragmentShader: UNI + fogGL + `varying vec3 vW;void main(){float d=distance(camPos,vW);gl_FragColor=vec4(vec3(.08),.7*(1.-fogF(d)));}` });
  scene.add(new THREE.LineSegments(eg, lm));
  return geo.attributes.position.count / 3;
}
