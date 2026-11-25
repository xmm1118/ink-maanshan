// 副本小游戏：灯谜、扎灯工序、击鼓引龙（节奏）、折纸剪窗花
// 每个函数接收 .mg 弹层元素，结束时调用 done(...)
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
function open(mg, title, sub) {
  mg.innerHTML = `<div class="box"><h3>${title}</h3><div class="sub">${sub || ''}</div><div class="body"></div><div class="msg"></div><div class="btns"></div></div>`;
  mg.classList.add('on');
  const q = s => mg.querySelector(s);
  return { body: q('.body'), msg: q('.msg'), btns: q('.btns'), close() { mg.classList.remove('on'); mg.innerHTML = ''; } };
}
const btn = (txt, fn, cls = '') => { const b = document.createElement('button'); b.textContent = txt; b.className = cls; b.onclick = fn; return b; };

// 灯谜：items = [{q, opts:[...], a:index, hint, note}]
export function riddles(mg, items, done, title = '猜灯谜', sub = '灯下悬着谜条，猜中一条撕下一条', last = '撕下谜条') {
  const M = open(mg, title, sub); let i = 0, miss = 0;
  const show = () => {
    const it = items[i]; M.body.innerHTML = `<div class="tiao">${it.q}</div><div class="cnt">第 ${i + 1} / ${items.length} 条</div>`; M.msg.textContent = ''; M.btns.innerHTML = '';
    const grid = document.createElement('div'); grid.className = 'grid';
    it.opts.forEach((o, k) => grid.appendChild(btn(o, e => {
      if (k === it.a) { M.msg.textContent = '猜中了！' + (it.note || ''); grid.querySelectorAll('button').forEach(b => b.disabled = true); e.target.classList.add('ok');
        M.btns.appendChild(btn(i === items.length - 1 ? last : '下一条', () => { i++; i < items.length ? show() : (M.close(), done(miss)); })); }
      else { miss++; e.target.disabled = true; M.msg.textContent = '不对。提示：' + it.hint; }
    })));
    M.body.appendChild(grid);
  }; show();
}

// 工序排序：steps = [[名, 说明]...]（按正确顺序给出）
export function craft(mg, title, sub, steps, done) {
  const M = open(mg, title, sub); let k = 0;
  const row = document.createElement('div'); row.className = 'track'; const grid = document.createElement('div'); grid.className = 'grid';
  steps.forEach((s, i) => { const d = document.createElement('span'); d.textContent = '　'; row.appendChild(d); });
  const order = steps.map((_, i) => i).sort(() => Math.random() - .5);
  order.forEach(i => grid.appendChild(btn(steps[i][0], e => {
    if (i === k) { row.children[k].textContent = steps[i][0]; row.children[k].classList.add('on'); e.target.disabled = true; M.msg.textContent = steps[i][1]; k++;
      if (k === steps.length) { M.btns.appendChild(btn('完成', () => { M.close(); done(); })); } }
    else { M.msg.textContent = `「${steps[i][0]}」还早，先想想上一步该做什么。`; e.target.classList.add('shake'); setTimeout(() => e.target.classList.remove('shake'), 400); }
  })));
  M.body.append(row, grid);
}

// 击鼓引龙：音符从右往左走到龙珠处时击鼓（按钮 / 空格 / 回车）
export function rhythm(mg, done) {
  const M = open(mg, '击鼓引龙', '鼓点走到红色龙珠时击鼓，鼓点准，龙灯舞得才欢');
  const cv = document.createElement('canvas'), W = Math.min(560, innerWidth * .9), H = 120; cv.width = W * 2; cv.height = H * 2; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d'); g.scale(2, 2); M.body.appendChild(cv);
  let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  const drum = (hi) => { if (!ac) return; const o = ac.createOscillator(), v = ac.createGain(); o.frequency.setValueAtTime(hi ? 220 : 110, ac.currentTime); o.frequency.exponentialRampToValueAtTime(45, ac.currentTime + .18);
    v.gain.setValueAtTime(.7, ac.currentTime); v.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .25); o.connect(v).connect(ac.destination); o.start(); o.stop(ac.currentTime + .26); };
  const beat = .6, pat = [0, 1, 2, 3, 4, 4.5, 5, 6, 7, 8, 8.5, 9, 9.5, 10, 11, 12, 13, 13.5, 14, 15];
  const notes = pat.map(b => ({ t: 1.6 + b * beat, hit: 0 })); const end = notes[notes.length - 1].t + 1;
  const HX = 70, SPEED = 230; let t0 = performance.now(), score = 0, combo = 0, best = 0, txt = '', txtT = 0, raf, over = false;
  const hit = () => { if (over) return; const t = (performance.now() - t0) / 1000; let n = null, d = 9;
    for (const x of notes) if (!x.hit && Math.abs(x.t - t) < d) { d = Math.abs(x.t - t); n = x; }
    if (n && d < .26) { n.hit = d < .1 ? 2 : 1; score += n.hit; combo++; best = Math.max(best, combo); txt = n.hit === 2 ? '妙！' : '好'; drum(1); }
    else { combo = 0; txt = '早了'; drum(0); } txtT = t; };
  const key = e => { if ([' ', 'Enter'].includes(e.key)) { e.preventDefault(); hit(); } };
  addEventListener('keydown', key);
  M.btns.appendChild(btn('咚！击鼓', hit, 'big'));
  const draw = () => { const t = (performance.now() - t0) / 1000; g.clearRect(0, 0, W, H);
    g.fillStyle = '#1e2035'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,220,160,.35)'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    g.fillStyle = '#d8342a'; g.shadowColor = '#ff7a40'; g.shadowBlur = 16; g.beginPath(); g.arc(HX, H / 2, 20, 0, 7); g.fill(); g.shadowBlur = 0;
    for (const n of notes) { if (n.t < t - .3 && !n.hit && !n.miss) { n.miss = 1; combo = 0; txt = '漏了'; txtT = t; }
      const x = HX + (n.t - t) * SPEED; if (x < -20 || x > W + 20 || n.hit) continue;
      g.fillStyle = '#ffe9b8'; g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, H / 2, 13, 16, 0, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#f6eadf'; g.font = '16px MaSerif, serif'; g.fillText(`鼓点 ${score}  连击 ${combo}`, W - 150, 22);
    if (t - txtT < .5) { g.font = '22px MaSerif, serif'; g.fillStyle = '#ffd27a'; g.fillText(txt, HX - 18, 28); }
    if (t > end) { over = true; removeEventListener('keydown', key); const max = notes.length * 2, r = score / max;
      const grade = r > .8 ? '上上' : r > .55 ? '上' : r > .3 ? '中' : '下';
      M.msg.textContent = `击鼓 ${notes.filter(n => n.hit).length}/${notes.length}，最高连击 ${best}，评「${grade}」。`; M.btns.innerHTML = '';
      M.btns.append(btn('再来一次', () => { M.close(); rhythm(mg, done); }), btn('龙灯出巡', () => { M.close(); done(grade); })); return; }
    raf = requestAnimationFrame(draw); };
  draw();
}

// 折纸剪窗花：n 为旋转对称数（1=对折，4=四折，6=六折），在楔形上划刀，展开得对称窗花
export function paperCut(mg, done) {
  const M = open(mg, '剪窗花', '选折法，在红纸上按住拖动下剪刀，再点「展开」');
  const S = Math.min(300, innerWidth * .62, innerHeight * .62), cv = document.createElement('canvas'); cv.width = cv.height = S * 2; cv.style.width = cv.style.height = S + 'px'; cv.style.touchAction = 'none';
  const g = cv.getContext('2d'); g.scale(2, 2);
  const wedge = document.createElement('canvas'); wedge.width = wedge.height = S * 2; const wg = wedge.getContext('2d'); wg.scale(2, 2);
  let n = 4, unf = false, down = false, lastP = null;
  const folds = document.createElement('div'); folds.className = 'grid three';
  [[1, '对折'], [4, '四折'], [6, '六折']].forEach(([k, t]) => folds.appendChild(btn(t, e => { n = k; reset(); folds.querySelectorAll('button').forEach(b => b.classList.remove('ok')); e.target.classList.add('ok'); })));
  folds.children[1].classList.add('ok');
  const C = S / 2, R = S * .48;
  const clip = (c) => { c.beginPath(); c.moveTo(C, C); c.arc(C, C, R * 1.5, -Math.PI / 2 - .012, -Math.PI / 2 + Math.PI / n + .012); c.closePath(); };
  function reset() { unf = false; wg.globalCompositeOperation = 'source-over'; wg.clearRect(0, 0, S, S); wg.save(); clip(wg); wg.clip(); wg.fillStyle = '#c0261f'; wg.beginPath(); wg.arc(C, C, R, 0, 7); wg.fill(); wg.restore(); render(); }
  function render(bg = true) { g.clearRect(0, 0, S, S); if (bg) { g.fillStyle = '#f6eedd'; g.fillRect(0, 0, S, S); }
    if (!unf) { g.save(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.setLineDash([4, 4]); g.beginPath(); g.arc(C, C, R, 0, 7); g.stroke(); g.restore(); g.drawImage(wedge, 0, 0, S, S); return; }
    for (let k = 0; k < n; k++) for (const m of [1, -1]) { g.save(); g.translate(C, C); g.rotate(k * 2 * Math.PI / n); g.scale(m, 1); g.translate(-C, -C); g.drawImage(wedge, 0, 0, S, S); g.restore(); } }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * S / r.width, (e.clientY - r.top) * S / r.height]; };
  const cut = (a, b) => { wg.save(); clip(wg); wg.clip(); wg.globalCompositeOperation = 'destination-out'; wg.lineCap = 'round'; wg.lineWidth = Math.max(5, S * .025); wg.beginPath(); wg.moveTo(...a); wg.lineTo(...b); wg.stroke(); wg.restore(); render(); };
  cv.addEventListener('pointerdown', e => { if (unf) return; down = true; lastP = pos(e); cut(lastP, lastP); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!down) return; const p = pos(e); cut(lastP, p); lastP = p; });
  ['pointerup', 'pointercancel'].forEach(k => cv.addEventListener(k, () => down = false));
  const wrap = document.createElement('div'), side = document.createElement('div'); wrap.className = 'cutwrap'; side.className = 'cutside'; folds.className = 'cutside'; side.append(folds, M.btns); wrap.append(cv, side); M.body.append(wrap);
  const bU = btn('展开', () => { unf = !unf; bU.textContent = unf ? '再折起来' : '展开'; render(); if (unf && !RM && cv.animate) cv.animate([{ transform: 'rotate(-30deg) scale(.6)', opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 500 }); });
  M.btns.append(btn('重剪', reset), bU, btn('贴上窗花', () => { unf = true; render(false); const url = cv.toDataURL('image/png'); M.close(); done(url); }));
  reset();
}

// 远游舆图：places = [{k, n, x, y, done}]（x,y 为 0–1），点地名选去处
export function mapPick(mg, places, done) {
  const M = open(mg, '马鞍山舆图 · 顺江远游', '意象插画，非比例尺地图（画面 AI 生成）。点一处地名，艄公载你去');
  const Wd = Math.min(620, innerWidth * .9, innerHeight * .62 * 1.5), H = Wd / 1.5;
  const wrap = document.createElement('div'); wrap.className = 'mapw'; wrap.style.width = Wd + 'px'; wrap.style.height = H + 'px';
  const im = new Image(); im.src = window.__IMG.yutu; im.style.cssText = 'width:100%;height:100%;display:block;border-radius:4px';
  wrap.appendChild(im);
  places.forEach(p => { const b = btn((p.done ? '✓ ' : '') + p.n, () => { M.close(); done(p.k); }, 'pin' + (p.here ? ' here' : '') + (p.done ? ' ok' : '')); b.style.left = p.x * 100 + '%'; b.style.top = p.y * 100 + '%'; if (p.here) b.disabled = true; wrap.appendChild(b); });
  M.body.appendChild(wrap); M.btns.appendChild(btn('回船上', () => { M.close(); done(null); }));
}

// 江上古战场：点击（或触屏点）正在渡江的敌船，拦截在江心；放过 3 艘即失守
export function battle(mg, done) {
  const M = open(mg, '江上古战场 · 守采石', '1161年宋金采石之战。点一点正在渡江的船，把它们拦在江心（画面 AI 生成）');
  const W = Math.min(600, innerWidth * .92), H = Math.min(280, innerHeight * .5);
  const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; cv.style.cssText = `width:${W}px;height:${H}px;touch-action:none;cursor:crosshair`;
  const g = cv.getContext('2d'); g.scale(2, 2); M.body.appendChild(cv);
  const NEED = 12, LOSE = 3, ships = [], fx = []; let sunk = 0, miss = 0, t0 = performance.now(), last = t0, spawn = 0, over = false, raf;
  const info = document.createElement('div'); info.className = 'cnt'; M.body.appendChild(info);
  const upd = () => info.textContent = `拦下 ${sunk} / ${NEED} 艘　·　漏过 ${miss} / ${LOSE}`; upd();
  const bankN = H * .3, bankS = H * .78, sp = RM ? .5 : 1;
  const tap = e => { if (over) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    fx.push({ x, y, t: 0, k: 'splash' });
    for (const s of ships) if (!s.dead && Math.abs(s.x - x) < 30 * s.s && Math.abs(s.y - y) < 30 * s.s) { s.dead = 1; sunk++; fx.push({ x: s.x, y: s.y, t: 0, k: 'fire' }); upd(); break; }
    if (sunk >= NEED) end(true); };
  cv.addEventListener('pointerdown', tap);
  function end(win) { over = true; cancelAnimationFrame(raf); M.msg.textContent = win ? '守住了！采石矶扼守长江天险，历代在这里发生战争二十余次。1161年，虞允文率一万八千宋军以少胜多，击退十七万金军。（资料：长江日报 2023-11-17）' : '让敌船靠了岸。再来一次？';
    M.btns.innerHTML = ''; if (win) M.btns.appendChild(btn('收下朱印', () => { M.close(); done(true); }, 'big')); else { M.btns.appendChild(btn('再守一次', () => { M.close(); battle(mg, done); })); M.btns.appendChild(btn('先离开', () => { M.close(); done(false); })); } }
  const IM = {}; ['riverbg', 'ships'].forEach(k => { IM[k] = new Image(); IM[k].src = window.__IMG[k]; });
  const SW = 64; // 船宽（CSS 像素）
  const shipImg = (s) => { const im = IM.ships; if (!im.complete) return; const c = im.width / 3, r = im.height / 2, k = s.k % 3, row = s.dead ? 1 : 0;
    const w = SW * s.s, h = w * r / c; g.save(); g.globalAlpha = s.dead ? Math.max(0, 1 - (s.dead - 1) * 1.2) : 1; g.drawImage(im, k * c, row * r, c, r, s.x - w / 2, s.y - h * .6, w, h); g.restore(); };
  const draw = now => { const dt = Math.min(.05, (now - last) / 1000) * sp; last = now;
    const bg = IM.riverbg; if (bg.complete) { const kk = Math.max(W / bg.width, H / bg.height), bw = bg.width * kk, bh = bg.height * kk; g.drawImage(bg, (W - bw) / 2, (H - bh) / 2, bw, bh); } else { g.fillStyle = '#d8c9a6'; g.fillRect(0, 0, W, H); }
    spawn -= dt; if (!over && spawn <= 0) { ships.push({ x: 40 + Math.random() * (W * .62), y: bankN - 4, v: (14 + Math.random() * 12 + sunk * 1.1), s: .75 + Math.random() * .35, k: Math.floor(Math.random() * 3) }); spawn = Math.max(.6, 1.6 - sunk * .07); }
    for (const s of ships) { if (s.dead) { s.y += dt * 4; s.dead += dt; } else { s.y += s.v * dt; if (s.y > bankS && !over) { s.dead = 9; miss++; upd(); if (miss >= LOSE) end(false); } } }
    for (const s of ships) if (!s.dead || s.dead < 1.8) shipImg(s);
    for (const f of fx) { f.t += dt; const a = Math.max(0, .7 - f.t * 1.6); if (a <= 0) continue; g.strokeStyle = `rgba(255,250,235,${a})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(f.x, f.y, 4 + f.t * 34, 2 + f.t * 12, 0, 0, 7); g.stroke(); }
    if (!over) raf = requestAnimationFrame(draw); };
  raf = requestAnimationFrame(draw);
  M.btns.appendChild(btn('先离开', () => { over = true; cancelAnimationFrame(raf); M.close(); done(false); }));
}
