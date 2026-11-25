/* ===================== RPG : les cinq classes (architecture commune) =====================
   Chaque classe : CL[clé] = {name, col, el (élément par défaut), role, desc, stats, basicD (clic gauche), spells:[...]}
   Chaque sort : {n (formule vocale), k:'rpg' | 'sum', act (comportement), el, dmg, mana, cd, ult (ultime), d (description)}
   Le comportement d'un sort (act) est séparé de son rendu (fonctions *Fx). L'hôte calcule les dégâts, tout le monde voit les effets. */
for (const k of ['fire', 'spirit', 'ice', 'storm', 'shadow']) if (CL[k]) { CL[k].legacy = 1; CL[k].own = 1; }
CL.elem = {rpg:1, own:1, name:'Mage élémentaire', col:'#ff9a3a', pitch:.95, el:'fire', role:'Dégâts de zone et polyvalence',
  desc:'Maître du feu, de l\'eau, de la glace et de la foudre. Il enchaîne les éléments pour déclencher des réactions.',
  stats:{Dégâts:5, Survie:2, Contrôle:4, Soutien:1, Difficulté:4}, basicD:'Projectile de l\'élément actif : celui de votre dernier sort (feu au départ)', spells:[
  {n:'Fire Dragon', k:'rpg', act:'dragon', el:'fire', dmg:60, len:30, w:5, mana:32, cd:9, d:'Un dragon de flammes traverse l\'arène dans la direction visée et laisse une traînée de feu'},
  {n:'Water Triangle', k:'rpg', act:'tri', el:'water', dmg:14, mana:30, cd:11, d:'Cliquez 3 points au sol : un torrent coule dans le triangle, blesse, emporte et mouille les monstres'},
  {n:'Ice Prison', k:'rpg', act:'prison', el:'ice', dmg:30, r:4.5, mana:28, cd:12, d:'Emprisonne les monstres de la zone visée 3,5 s ; frapper une prison la brise pour de gros dégâts'},
  {n:'Tempest', k:'rpg', act:'tempest', el:'storm', dmg:32, r:10, cnt:8, mana:34, cd:10, d:'8 éclairs frappent les monstres de la zone ; les monstres mouillés sont électrocutés (dégâts doublés, l\'éclair rebondit)'},
  {n:'Elemental Apocalypse', k:'rpg', act:'apoc', el:'fire', ult:1, dmg:55, r:16, mana:80, cd:90, d:'ULTIME : pendant 7 s, météores, cristaux de glace, éclairs et vagues ravagent une immense zone'}]};
CL.summon.rpg = 1; CL.summon.el = 'spirit'; CL.summon.name = 'Mage invocateur'; CL.summon.role = 'Puissance et protection grâce au golem';
CL.summon.desc = 'Un golem gardien combat à ses côtés. Ses formules renforcent et commandent le golem.'; CL.summon.stats = {Dégâts:3, Survie:4, Contrôle:3, Soutien:3, Difficulté:2}; CL.summon.basicD = 'Projectile spirituel : désigne aussi la cible du golem';
CL.summon.spells = [
  {n:'Rise Guardian', k:'sum', act:'rise', dmg:0, mana:22, cd:15},
  {n:'Titan Fist', k:'sum', act:'fist', dmg:70, r:5, mana:24, cd:7},
  {n:'Spirit Armor', k:'sum', act:'skin', dmg:0, mana:22, cd:14},
  {n:'Guardian Rage', k:'sum', act:'fury', dmg:0, mana:26, cd:16},
  {n:'Titanic Leap', k:'sum', act:'smash', dmg:70, r:5.5, mana:30, cd:9},
  {n:'Ancestral Colossus', k:'sum', act:'titan', ult:1, dmg:0, mana:70, cd:75}];
Object.assign(SUM_D, {fist:'Le golem frappe le sol : onde de choc, dégâts de zone, monstres repoussés', skin:'Armure spirituelle : le golem subit −50 % de dégâts 8 s, runes lumineuses, il attire les monstres', fury:'Rage du gardien : le golem frappe 40 % plus vite et 60 % plus fort pendant 10 s',
  smash:'Le golem fait un saut titanesque vers le point visé : dégâts de zone, monstres projetés et étourdis', titan:'ULTIME : le golem devient un colosse géant 20 s : plus grand, plus résistant (+50 % de vie), coups en zone', rise:'Rappelle le golem près de vous et lui rend la moitié de sa vie (ou le ressuscite à 60 %)'});
CL.celest = {rpg:1, own:1, soon:1, name:'Mage céleste', col:'#ffe9a8', pitch:1.25, el:'spirit', role:'Soins, soutien, mobilité et dégâts sacrés', desc:'Un mage ailé qui soigne ses alliés, draine la vie des ennemis et s\'envole pour frapper d\'en haut.',
  stats:{Dégâts:2, Survie:3, Contrôle:2, Soutien:5, Difficulté:3}, basicD:'Clic maintenu : soigne l\'allié visé ou draine la vie de l\'ennemi visé', spells:[]};
CL.glad = {rpg:1, own:1, soon:1, name:'Gladiateur runique', col:'#ff5a3a', pitch:.75, el:'fire', role:'Corps à corps, résistance et dégâts explosifs', desc:'Il se bat avec ses poings et des runes gravées sur son corps. Plus il souffre, plus il frappe fort.',
  stats:{Dégâts:4, Survie:5, Contrôle:2, Soutien:1, Difficulté:3}, basicD:'Combo de trois coups de poing : rapide, puissant, dévastateur', spells:[]};
CL.necro = {rpg:1, own:1, soon:1, name:'Nécromancien', col:'#9a7aff', pitch:.65, el:'shadow', role:'Armée, contrôle et gestion des âmes', desc:'Il récolte les âmes des ennemis vaincus et les relève pour bâtir une armée de morts-vivants.',
  stats:{Dégâts:3, Survie:2, Contrôle:4, Soutien:2, Difficulté:5}, basicD:'Projectile nécrotique', spells:[]};
GLYPH.elem = '<path d="M50 10C58 24 70 32 66 50C63 62 56 68 50 68C43 68 35 62 35 51C35 41 42 37 43 27C47 34 49 37 51 38C53 30 53 22 50 10Z" fill="currentColor"/><path d="M50 72v18M41 81h18" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M22 60l10 6-10 6M78 60l-10 6 10 6" stroke="currentColor" stroke-width="4" fill="none"/>';
GLYPH.celest = '<circle cx="50" cy="30" r="9" fill="none" stroke="currentColor" stroke-width="4"/><path d="M50 42v40M50 50C38 40 22 38 12 46C22 52 34 56 46 58M50 50C62 40 78 38 88 46C78 52 66 56 54 58" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>';
GLYPH.glad = '<path d="M30 40h40v34a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z" fill="none" stroke="currentColor" stroke-width="5"/><path d="M30 40v-8a6 6 0 0 1 12 0v8M42 40v-12a6 6 0 0 1 12 0v12M54 40v-10a6 6 0 0 1 12 0v10" fill="none" stroke="currentColor" stroke-width="4"/><path d="M44 56l6 8 6-8-6-6z" fill="currentColor"/>';
GLYPH.necro = '<path d="M50 14C32 14 22 28 22 44c0 10 6 16 10 20v10h36V64c4-4 10-10 10-20 0-16-10-30-28-30z" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="39" cy="44" r="7" fill="currentColor"/><circle cx="61" cy="44" r="7" fill="currentColor"/><path d="M42 74v10M50 74v10M58 74v10" stroke="currentColor" stroke-width="4"/>';
RANK_D.rpg = ['', '+25 % de dégâts', 'zone et durée +25 %'];
ELC.water = '#3aa8ff'; MK_N.water = 'Trempé';
Object.assign(RX, {'fire+water':'Vapeur', 'ice+water':'Sol gelé', 'storm+water':'Électrocution'});
Object.assign(RX_D, {'fire+water':'nuage de vapeur : les monstres proches n\'y voient plus (ils ratent un coup sur deux)', 'ice+water':'le sol gèle : les monstres proches sont figés 2,5 s', 'storm+water':'l\'éclair se propage à tous les monstres mouillés proches', 'fire+ice':'choc thermique : explosion qui blesse les monstres proches et les aveugle'});
const RPG = {lastEl:'fire', tri:null, setup:0, zones:[], prisons:new Map()};
const rpgCls = () => CL[me.cls] && CL[me.cls].rpg;
/* ---- démarrage : la classe connaît toutes ses formules (la progression les débloquera par niveau) ---- */
function rpgStartKnown(){ const C = CL[me.cls]; if (!C || !C.rpg) return; known = C.spells.map((_, i) => me.cls + ':' + i).filter(id => rpgUnlocked(id)); if (!known.length) known = [me.cls + ':0']; page = 0; pageId = known[0]; INC_SEL = {}; known.forEach(id => { INC_SEL[id] = spellOf(id).n; }); }
function rpgUnlocked(id){ return typeof progUnlocked === 'function' ? progUnlocked(id) : true; }
/* ---- point visé au sol ---- */
function aimGround(max){ const d = aimDir(), c = camera.position, M = max || 34; let t = .5; for (; t < M; t += .4) { const x = c.x + d.x*t, z = c.z + d.z*t; if (c.y + d.y*t <= groundH(x, z) + .1) break; } t = Math.min(t, M); return [r2(c.x + d.x*t), r2(c.z + d.z*t)]; }
/* ---- clic gauche : attaque de base de la classe, et sélection des 3 points du triangle d'eau ---- */
function rpgClick(){ const P = RPG.tri; if (!P) return typeof rpgClick2 === 'function' ? rpgClick2() : false; const p = aimGround(30); P.pts.push(p); triMarker(p[0], p[1], P.pts.length); sfxChime(); $('#bkhint').textContent = 'Triangle d\'eau : point ' + P.pts.length + '/3';
  if (P.pts.length >= 3) triGo(P); return true; }
function triGo(P){ RPG.tri = null; RPG.triDone = {id:P.id, pts:P.pts}; castOut(P.id); }
/* le triangle d'eau attend ses 3 points avant de partir (mana et recharge déjà payés) */
function rpgPre(id){ const sp = spellOf(id); if (!sp || sp.act !== 'tri') return false; if (RPG.triDone && RPG.triDone.id === id) return false;
  if (!RPG.tri) { RPG.tri = {id, pts:[], t:T + 6}; toast('Triangle d\'eau : visez et cliquez 3 points au sol (6 s)'); $('#bkhint').textContent = 'Triangle d\'eau : point 0/3'; } return true; }
function rpgData(id, data){ const sp = spellOf(id); if (id === 'basic') { rpgBasic(data); if (typeof ultAdd === 'function') ultAdd(.25); if (typeof CTS !== 'undefined') CTS.basic = 1; return; } if (!sp) return; if (typeof ultAdd === 'function') { if (sp.ult) ultFire(); else ultAdd(6); } if (typeof CTS !== 'undefined') CTS.cast = 1; if (me.cls === 'elem' && sp.el) RPG.lastEl = sp.el;
  if (sp.k === 'rpg' || sp.k === 'sum') data.t = aimGround(34); if (sp.act === 'tri' && RPG.triDone) { data.pts = RPG.triDone.pts; RPG.triDone = null; }
  if (typeof necroData === 'function') necroData(id, data);
  if (sp.act === 'shield') data.tg = aimAlly(30) || me.peer || 'me';
  if (sp.act === 'drain') data.ids = chainTargets(camera.position, aimDir(), 1);
  if (sp.act === 'rez') { let best = null, bd = 25; for (const [p, o] of others) if (o.dead) { const d = Math.hypot(o.g.position.x - me.x, o.g.position.z - me.z); if (d < bd) { bd = d; best = p; } } if (best) data.rez = best; } }
function triTick(){ const P = RPG.tri; if (!P) return; if (T > P.t || me.dead) { /* pas assez de clics : le triangle se forme devant vous */ const g = aimGround(16), fx_ = -Math.sin(me.yaw), fz = -Math.cos(me.yaw), rx = Math.cos(me.yaw), rz = -Math.sin(me.yaw);
    while (P.pts.length < 3) { const n = P.pts.length; P.pts.push(n === 0 ? [r2(me.x + fx_*3), r2(me.z + fz*3)] : n === 1 ? [r2(g[0] + rx*6), r2(g[1] + rz*6)] : [r2(g[0] - rx*6), r2(g[1] - rz*6)]); } triGo(P); } }
/* ---- attaque de base par classe ---- */
function rpgBasic(data){ const c = me.cls; if (c === 'elem') { data.bel = RPG.lastEl; data.bm = 1.35; } else if (c === 'necro') { data.bel = 'shadow'; data.bm = 1.2; } if (typeof rpgBasic2 === 'function') rpgBasic2(data); }
/* ---- lancer : dispatch des comportements ---- */
function rpgCast(data, caster, mine, sp, el, col){ const o = data.o, rk = fin(data.rk) ? data.rk : 1, pot = rk >= 2 ? 1.25 : 1, big = (rk >= 3 ? 1.25 : 1)*(fin(data.zk) ? clamp(data.zk, .5, 3) : 1), t = Array.isArray(data.t) && data.t.every(fin) ? data.t : [o[0], o[2]], dmg = sp.dmg*pot*(fin(data.bm) ? clamp(data.bm, .5, 4) : 1)*(fin(data.q) ? clamp(data.q, .5, 1.3) : 1);
  if (typeof synElem === 'function' && sp.el) synElem(t, sp.el, caster);
  if (sp.act === 'dragon') castDragon(o, data.d, sp, dmg, big, caster, data.sd | 0);
  else if (sp.act === 'tri') { const P = Array.isArray(data.pts) && data.pts.length === 3 && data.pts.every(p => Array.isArray(p) && p.every(fin)) ? data.pts : null; if (P) castTri(P, dmg, big, caster); }
  else if (sp.act === 'prison') castPrison(t, sp, dmg, big, caster);
  else if (sp.act === 'tempest') castTempest(t, sp, dmg, big, caster, data.sd | 0);
  else if (sp.act === 'apoc') castApoc(t, sp, dmg, big, caster, data.sd | 0, mine);
  else if (typeof rpgCast2 === 'function') rpgCast2(data, caster, mine, sp, el, col, t, dmg, pot, big); }
/* ---- zones persistantes (hôte : dégâts ; tous : rendu) ---- */
function rpgZone(z){ z.t0 = T; z.k = 0; RPG.zones.push(z); return z; }
function zonesTick(dt){ for (let i = RPG.zones.length - 1; i >= 0; i--) { const z = RPG.zones[i]; if (T > z.t0 + z.dur) { RPG.zones.splice(i, 1); if (z.end) z.end(); continue; } if (z.upd) z.upd(dt, (T - z.t0)/z.dur); if (isHost && z.tick) { z.k -= dt; if (z.k <= 0) { z.k = z.every || .5; z.tick(); } } } }
const inTri = (x, z, P) => { const s = (a, b, c) => (a[0] - c[0])*(b[1] - c[1]) - (b[0] - c[0])*(a[1] - c[1]), p = [x, z], d1 = s(p, P[0], P[1]), d2 = s(p, P[1], P[2]), d3 = s(p, P[2], P[0]); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
const fxEl = (el, sn, extra) => Object.assign({el, sn}, extra || {});
/* ================= MAGE ÉLÉMENTAIRE ================= */
/* --- Dragon de feu --- */
function castDragon(o, d, sp, dmg, big, by, sd){ const L = sp.len*big, W_ = sp.w*big, dl = Math.hypot(d[0], d[2]) || 1, ux = d[0]/dl, uz = d[2]/dl, x0 = o[0], z0 = o[2], dur = 1.5;
  dragonFx(x0, z0, ux, uz, L, dur, sd);
  if (isHost) { const hitSet = new Set(); for (let s = 0; s <= 10; s++) fx.push({delay:s/10*dur, run:() => { const hx = x0 + ux*L*s/10, hz = z0 + uz*L*s/10;
      for (const m of [...mons.values()]) { if (hitSet.has(m.id)) continue; const rx = m.x - x0, rz = m.z - z0, al = rx*ux + rz*uz, sd_ = Math.abs(-rx*uz + rz*ux); if (al > 0 && al < L*s/10 + 2 && sd_ < W_/2 + MT[m.type].r) { hitSet.add(m.id); hurt(m, dmg, fxEl('fire', sp.n, {dot:8, push:2}), ux, uz, by); } }
      if (s % 2 === 0 && s > 0) firePatch(hx, hz, 2.4*big, 4, dmg*.12, by); }}); } }
function firePatch(x, z, r, dur, dps, by){ W.hits.push(['fpatch', r2(x), r2(z), r2(r), dur]); firePatchFx(x, z, r, dur); rpgZone({dur, every:.5, tick:() => { for (const m of [...mons.values()]) if (Math.hypot(m.x - x, m.z - z) < r + MT[m.type].r) hurt(m, dps*.5, fxEl('fire', 'Traînée de feu', {rx:1}), 0, 0, by); }}); }
function firePatchFx(x, z, r, dur){ decal(x, z, r, 'scorch', dur + 1); const k0 = T; rpgZone({dur, upd:() => { if (Math.random() < .5) { const a = Math.random()*6.28, d = Math.random()*r; puff(x + Math.cos(a)*d, groundH(x, z) + .2, z + Math.sin(a)*d, Math.random() < .5 ? '#ffb040' : '#ff5a10', 1, 2, .7, .6, 3); } }}); }
function dragonFx(x0, z0, ux, uz, L, dur, sd){ const g = new THREE.Group(), segs = [], N = 16, fm = fireMat(), R = rng(sd);
  const head = new THREE.Group(); g.add(head); const skull = new THREE.Mesh(geo('drHead', () => new THREE.ConeGeometry(.9, 2.6, 7).rotateX(Math.PI/2)), fm); head.add(skull);
  const jaw = new THREE.Mesh(geo('drJaw', () => new THREE.ConeGeometry(.6, 2, 6).rotateX(Math.PI/2)), fm); jaw.position.set(0, -.55, .1); jaw.rotation.x = .35; head.add(jaw);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(geo('drHorn', () => new THREE.ConeGeometry(.18, 1.4, 5).rotateX(-Math.PI/2.6)), fm); h.position.set(s*.45, .55, -.7); head.add(h); const e = new THREE.Mesh(geo('drEye', () => new THREE.SphereGeometry(.14, 8, 6)), new THREE.MeshBasicMaterial({color:0xfff2a0})); e.position.set(s*.38, .25, .45); head.add(e); }
  for (const s of [-1, 1]) { const w = new THREE.Mesh(geo('drWing', () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(3.4, .9); sh.lineTo(2.6, -.2); sh.lineTo(3.1, -1.1); sh.lineTo(1.6, -.6); sh.lineTo(1.2, -1.4); sh.lineTo(0, -.6); return new THREE.ShapeGeometry(sh); }), new THREE.MeshBasicMaterial({color:0xff7a2a, transparent:true, opacity:.55, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false})); w.scale.set(s, 1, 1); w.rotation.x = -Math.PI/2; w.userData.s = s; segs.wings = segs.wings || []; segs.wings.push(w); g.add(w); }
  for (let i = 0; i < N; i++) { const r = .85*(1 - i/N*.75), b = new THREE.Mesh(ICO(), fm); b.scale.setScalar(r); g.add(b); const sp_ = new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex, color:0xff6a1a, transparent:true, opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending})); sp_.scale.setScalar(r*4); b.add(sp_); segs.push(b); }
  scene.add(g); const yaw = Math.atan2(ux, uz), px = -uz, pz = ux, hist = [], ph = R()*6;
  fx.push({t:0, dur:dur + .5, upd:k => { const kk = Math.min(1, k*(dur + .5)/dur), d = L*kk, hx = x0 + ux*d + px*Math.sin(kk*8 + ph)*1.4, hz = z0 + uz*d + pz*Math.sin(kk*8 + ph)*1.4, hy = groundH(hx, hz) + 2.2 + Math.sin(kk*5)*.8;
      head.position.set(hx, hy, hz); head.rotation.y = yaw + Math.cos(kk*8 + ph)*.35; hist.unshift([hx, hy, hz]); if (hist.length > 80) hist.pop();
      segs.forEach((b, i) => { const h = hist[Math.min(hist.length - 1, (i + 1)*2)]; b.position.set(h[0], h[1] - i*.02, h[2]); });
      if (segs.wings) segs.wings.forEach(w => { const b = segs[2]; w.position.copy(b.position); w.rotation.set(-Math.PI/2 + Math.sin(T*14)*.5*w.userData.s, 0, yaw - Math.PI/2 + (w.userData.s < 0 ? Math.PI : 0)); w.rotation.order = 'YXZ'; w.rotation.y = yaw + (w.userData.s > 0 ? 0 : 0); });
      if (k < .9) { puff(hx, hy, hz, '#ffd27a', 3, 4, 1.1, .5, 1); puff(hx, hy - .5, hz, '#ff4a0a', 2, 2, 1.6, .8, 2); flash(hx, hy, hz, '#ff7a2a', 4, .1); }
      const fade = k > .8 ? 1 - (k - .8)/.2 : 1; g.scale.setScalar(Math.max(.01, fade)); }, end:() => scene.remove(g)});
  sfx('boom', clamp(1 - Math.hypot(me.x - x0, me.z - z0)/50, .2, 1)); }
/* --- Triangle d'eau --- */
const triMarks = [];
function triMarker(x, z, n){ const m = new THREE.Mesh(geo('triMk', () => new THREE.RingGeometry(.55, .8, 24).rotateX(-Math.PI/2)), new THREE.MeshBasicMaterial({color:0x3aa8ff, transparent:true, opacity:.9, depthWrite:false, blending:THREE.AdditiveBlending, fog:false})); m.position.set(x, groundH(x, z) + .12, z); scene.add(m); triMarks.push(m); puff(x, groundH(x, z) + .3, z, '#7fd0ff', 10, 3, .4, .5, 2);
  setTimeout(() => { scene.remove(m); m.material.dispose(); }, 7000); }
const waterMat = () => new THREE.ShaderMaterial({uniforms:{uT:SPU.uT, uD:{value:new THREE.Vector2(1, 0)}, uA:{value:0}}, transparent:true, depthWrite:false, side:THREE.DoubleSide,
  vertexShader:'varying vec2 vW; void main(){ vec4 w = modelMatrix*vec4(position, 1.); vW = w.xz; gl_Position = projectionMatrix*viewMatrix*w; }',
  fragmentShader:SNOISE + `uniform float uT; uniform vec2 uD; uniform float uA; varying vec2 vW; void main(){ vec2 p = vW*.35 - uD*uT*2.2; float n = snoise(vec3(p, uT*.5))*.5 + .5, n2 = snoise(vec3(p*2.7, uT))*.5 + .5;
    float foam = smoothstep(.72, .95, n*.6 + n2*.6); vec3 c = mix(vec3(.02, .22, .5), vec3(.15, .6, 1.), n) + foam*vec3(.8, .95, 1.); gl_FragColor = vec4(c, uA*(.62 + foam*.3)); }`});
function castTri(P, dmg, big, by){ const cx = (P[0][0] + P[1][0] + P[2][0])/3, cz = (P[0][1] + P[1][1] + P[2][1])/3, mx = (P[1][0] + P[2][0])/2, mz = (P[1][1] + P[2][1])/2; let fx_ = mx - P[0][0], fz = mz - P[0][1]; const fl = Math.hypot(fx_, fz) || 1; fx_ /= fl; fz /= fl;
  const dur = 4*big; triFx(P, fx_, fz, dur);
  rpgZone({dur, every:.4, tick:() => { for (const m of [...mons.values()]) { if (!inTri(m.x, m.z, P) && !inTri(m.x - fx_*MT[m.type].r, m.z - fz*MT[m.type].r, P)) continue; m.wetT = T + 7; hurt(m, dmg, fxEl('water', 'Water Triangle', {slow:1}), fx_, fz, by); if (mons.has(m.id) && !MT[m.type].boss && !MT[m.type].head) moveMon(m, fx_*1.3, fz*1.3, MT[m.type]); } }}); }
function triFx(P, fx_, fz, dur){ const sh = new THREE.Shape(); sh.moveTo(P[0][0], -P[0][1]); sh.lineTo(P[1][0], -P[1][1]); sh.lineTo(P[2][0], -P[2][1]); sh.closePath();
  const gm = new THREE.ShapeGeometry(sh, 8); gm.rotateX(-Math.PI/2); const pos = gm.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, groundH(pos.getX(i), pos.getZ(i)) + .25); pos.needsUpdate = true;
  const mt = waterMat(); mt.uniforms.uD.value.set(fx_*.35, fz*.35); const m = new THREE.Mesh(gm, mt); m.renderOrder = 3; scene.add(m);
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(P.map(p => new THREE.Vector3(p[0], groundH(p[0], p[1]) + .35, p[1]))), new THREE.LineBasicMaterial({color:0x9fe0ff, transparent:true, opacity:.9, blending:THREE.AdditiveBlending})); scene.add(edge);
  sfx('boom', .5); for (const p of P) puff(p[0], groundH(p[0], p[1]) + .5, p[1], '#9fe0ff', 20, 5, .6, .7, 3);
  rpgZone({dur, upd:(dt, k) => { mt.uniforms.uA.value = Math.min(1, k*8)*(k > .85 ? (1 - k)/.15 : 1); edge.material.opacity = mt.uniforms.uA.value*.9;
      if (Math.random() < .9) { const a = Math.random(), b = Math.random()*(1 - a), x = P[0][0] + (P[1][0] - P[0][0])*a + (P[2][0] - P[0][0])*b, z = P[0][1] + (P[1][1] - P[0][1])*a + (P[2][1] - P[0][1])*b; puff(x, groundH(x, z) + .4, z, Math.random() < .5 ? '#d8f2ff' : '#3aa8ff', 1, 3, .5, .6, 2.5); } },
    end:() => { scene.remove(m); scene.remove(edge); mt.dispose(); gm.dispose(); }}); }
/* --- Prison de glace --- */
function castPrison(t, sp, dmg, big, by){ const R = sp.r*big; ringFx(t[0], t[1], R, '#9fe8ff', .6, 'ice'); iceSpikes(t[0], t[1], R*.8, 14); sfx('boom', .6);
  if (!isHost) return; for (const m of [...mons.values()]) { const d = Math.hypot(m.x - t[0], m.z - t[1]); if (d > R + MT[m.type].r) continue; hurt(m, dmg, fxEl('ice', sp.n, {slow:2}), 0, 0, by); if (!mons.has(m.id)) continue;
    const boss = MT[m.type].boss || MT[m.type].head, dur = (boss ? 1 : 3.5)*big; m.stunT = T + dur; m.ipT = T + dur; m.ipBy = by; m.ipD = dmg; W.hits.push(['iprison', m.id, r2(dur)]); prisonFx(m.id, dur); } }
function prisonFx(id, dur){ const m = mons.get(id); if (!m) return; const g = new THREE.Group(), h = MT[m.type].h, r = MT[m.type].r; for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(SHARD(), iceMat()), a = i/9*6.28; s.scale.set(r*.55, h*.42, r*.55); s.position.set(Math.cos(a)*r*.75, h*.4, Math.sin(a)*r*.75); s.rotation.set(Math.cos(a)*.25, a, Math.sin(a)*.25); g.add(s); }
  const core = new THREE.Mesh(geo('ipCore', () => new THREE.CylinderGeometry(1, 1.1, 1, 7, 1)), new THREE.MeshPhysicalMaterial({color:0xbfeaff, transparent:true, opacity:.35, roughness:.05, metalness:0, depthWrite:false})); core.scale.set(r*1.1, h*1.05, r*1.1); core.position.y = h*.5; g.add(core);
  scene.add(g); RPG.prisons.set(id, {g, t:T + dur}); }
function prisonTick(){ for (const [id, P] of RPG.prisons) { const m = mons.get(id); if (!m || T > P.t) { scene.remove(P.g); RPG.prisons.delete(id); if (m) puff(m.x, (m.gy || 0) + 1, m.z, '#e8fbff', 16, 5, .6, .6, 1); continue; } P.g.position.set(m.x, m.gy || groundH(m.x, m.z), m.z); } }
function shatterFx(id){ const P = RPG.prisons.get(id), m = mons.get(id); if (P) { scene.remove(P.g); RPG.prisons.delete(id); } if (m) { const y = (m.gy || 0) + 1; puff(m.x, y, m.z, '#e8fbff', 40, 9, .7, .7, 1); iceSpikes(m.x, m.z, 1.5, 6); flash(m.x, y + 1, m.z, '#bfeaff', 5, .3); sfx('boom', .5); } }
/* --- Tempête --- */
function castTempest(t, sp, dmg, big, by, sd){ const R = sp.r*big, N = Math.round(sp.cnt*big + modOf(by, 'cnt')), dur = N*.35; cloudFx(t[0], t[1], R, dur + .6);
  if (!isHost) return; for (let i = 0; i < N; i++) fx.push({delay:.4 + i*.35, run:() => { const C = [...mons.values()].filter(m => Math.hypot(m.x - t[0], m.z - t[1]) < R + MT[m.type].r && !MT[m.type].prop); let x = t[0] + (Math.random() - .5)*R, z = t[1] + (Math.random() - .5)*R;
    if (C.length) { C.sort((a, b) => (b.wetT > T) - (a.wetT > T) || Math.random() - .5); const m = C[0]; x = m.x; z = m.z; const wet = m.wetT > T || (m.mk && m.mk.el === 'water' && m.mk.t > T);
      hurt(m, dmg*(wet ? 1.6 : 1), fxEl('storm', sp.n, {slow:.6, rx:1}), 0, 0, by); if (wet) { W.hits.push(['qpop', 'Électrocution !']); for (const o of rxNear(m.x, m.z, 6).filter(o => o !== m).slice(0, 2)) { hurt(o, dmg*.4, fxEl('storm', 'Électrocution', {rx:1}), 0, 0, by); W.hits.push(['arc', r2(m.x), r2(m.z), r2(o.x), r2(o.z)]); arcFx(m.x, m.z, o.x, o.z); } } }
    W.hits.push(['tstrike', r2(x), r2(z)]); boltAt(x, z); sfx('boom', .35); }}); }
function cloudFx(x, z, R, dur){ const g = new THREE.Group(), y = groundH(x, z) + 15; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex, color:i % 3 ? 0x1a1e2e : 0x3a3a58, transparent:true, opacity:.0, depthWrite:false})); const a = Math.random()*6.28, d = Math.random()*R*.8; s.position.set(x + Math.cos(a)*d, y + Math.random()*2, z + Math.sin(a)*d); s.scale.setScalar(6 + Math.random()*6); g.add(s); } scene.add(g);
  fx.push({t:0, dur, upd:k => { const op = Math.min(1, k*6)*(k > .85 ? (1 - k)/.15 : 1); g.children.forEach((s, i) => { s.material.opacity = op*.85; s.position.x += Math.sin(T + i)*.01; }); if (Math.random() < .08) flash(x, y, z, '#c8d0ff', 6, .1); }, end:() => scene.remove(g)}); }
function arcFx(x1, z1, x2, z2){ lightning([new THREE.Vector3(x1, groundH(x1, z1) + 1, z1), new THREE.Vector3(x2, groundH(x2, z2) + 1, z2)], '#9fe0ff', .3, .07, .04); }
/* --- Apocalypse élémentaire (ultime) --- */
function castApoc(t, sp, dmg, big, by, sd, mine){ const R = sp.r*big, dur = 7, Rn = rng(sd); banner('Apocalypse élémentaire !', 'Le feu, l\'eau, la glace et la foudre s\'abattent'); apocSky(dur);
  ringFx(t[0], t[1], R, '#ffcf6a', 1.2, 'fire', 1); const dm = Math.hypot(me.x - t[0], me.z - t[1]); if (dm < 40) shake = Math.max(shake, .3);
  const TG = isHost ? [...mons.values()].filter(m => Math.hypot(m.x - t[0], m.z - t[1]) < R && !MT[m.type].prop).map(m => [m.x, m.z]) : [];
  for (let i = 0; i < 40; i++) { const kind = i % 4, a = Rn()*6.28, rr = Math.sqrt(Rn())*R, aim = TG.length && i % 2 ? TG[i % TG.length] : null, x = aim ? aim[0] + (Math.random() - .5)*2 : t[0] + Math.cos(a)*rr, z = aim ? aim[1] + (Math.random() - .5)*2 : t[1] + Math.sin(a)*rr, at = .3 + i*dur/40;
    fx.push({delay:at, run:() => {
      if (kind === 0) spawnProj({x:x + 8, y:30, z:z - 5, v:new THREE.Vector3(-8, -30, 5).normalize().multiplyScalar(48), sp:{dmg, size:1.2, splash:3.5, n:sp.n}, col:'#ff7a2a', owner:by, fxd:fxEl('fire', sp.n, {dot:6}), groundOnly:1, el:'fire'});
      else if (kind === 1) { iceSpikes(x, z, 2.6, 9); puff(x, groundH(x, z) + .5, z, '#e8fbff', 20, 6, .6, .6, 2); if (isHost) for (const m of rxNear(x, z, 3)) hurt(m, dmg*.8, fxEl('ice', sp.n, {slow:3}), 0, 0, by); }
      else if (kind === 2) { boltAt(x, z); if (isHost) for (const m of rxNear(x, z, 2.6)) hurt(m, dmg*(m.wetT > T ? 1.8 : 1), fxEl('storm', sp.n), 0, 0, by); }
      else { shockwave(x, groundH(x, z) + .2, z, 4.5, '#3aa8ff', .8); puff(x, groundH(x, z) + .6, z, '#9fd8ff', 30, 8, .7, .7, 2); if (isHost) for (const m of rxNear(x, z, 4.5)) { m.wetT = T + 7; hurt(m, dmg*.6, fxEl('water', sp.n), 0, 0, by); const dx = m.x - x, dz = m.z - z, d = Math.hypot(dx, dz) || 1; if (mons.has(m.id) && !MT[m.type].boss) moveMon(m, dx/d*2, dz/d*2, MT[m.type]); } }
      if (Math.hypot(me.x - x, me.z - z) < 30) shake = Math.max(shake, .12); }}); } }
function apocSky(dur){ let e = $('#apocsky'); if (!e) { e = document.createElement('div'); e.id = 'apocsky'; e.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;mix-blend-mode:screen;transition:opacity .6s'; document.body.appendChild(e); }
  e.style.opacity = 1; const t0 = T; rpgZone({dur, upd:(dt, k) => { const h = (T*60) % 360; e.style.background = `radial-gradient(ellipse at 50% 0%, hsla(${h},90%,55%,.22), transparent 60%)`; e.style.opacity = k > .9 ? (1 - k)*10 : 1; }, end:() => { e.style.opacity = 0; }}); }
/* ---- coups reçus (hôte) : prisons brisées, électrocution des monstres mouillés ---- */
function rpgHurt(m, dmg, f, by){ if (dmg <= 0 || !f) return dmg; if (f.sn === 'Poings' && (m.stunT > T || m.ipT > T)) dmg *= 1.3;
  if (m.ipT > T && f.sn !== 'Ice Prison' && !f.ipx) { m.ipT = 0; m.stunT = 0; const bonus = (m.ipD || 30)*1.5; W.hits.push(['ishatter', m.id]); shatterFx(m.id); W.hits.push(['qpop', 'Prison brisée !']); if (by === me.peer || by === 'me') qPop('Prison brisée !', '#bfeaff');
    for (const o of rxNear(m.x, m.z, 3)) if (o !== m) hurt(o, bonus*.5, {el:'ice', sn:'Éclats de glace', ipx:1, rx:1}, 0, 0, m.ipBy); dmg += bonus; }
  if (typeof arenaHurt === 'function') dmg = arenaHurt(m, dmg, by);
  if (typeof rpgHurt2 === 'function') dmg = rpgHurt2(m, dmg, f, by); return dmg; }
/* ---- Poing titan du golem ---- */
function rpgFist(g, sp, pot, by){ g.a = .6; const R = (sp.r || 5)*(g.titanT > T ? 1.4 : 1), dmg = (sp.dmg || 55)*allyWk()*pot*(g.furyT > T ? 1.3 : 1); W.hits.push(['gslam', r2(g.x), r2(g.z), r2(R)]); allySlamFx(g.x, g.z, R);
  for (const m of [...mons.values()]) { const d = Math.hypot(m.x - g.x, m.z - g.z); if (d < R + MT[m.type].r) { hurt(m, dmg, {el:'spirit', sn:'Titan Fist', push:3, aid:g.id}, (m.x - g.x)/(d || 1), (m.z - g.z)/(d || 1), g.owner); if (mons.has(m.id) && !MT[m.type].boss && !MT[m.type].head) { m.stunT = T + .8; moveMon(m, (m.x - g.x)/(d || 1)*2.5, (m.z - g.z)/(d || 1)*2.5, MT[m.type]); } } } }
/* ---- réactions avec l'eau ---- */
function rpgReact(key, m, x, z, by, k){ if (key === 'fire+water') { rxNear(x, z, 5).forEach(o => { o.blindT = T + 4; }); return true; }
  if (key === 'ice+water') { rxNear(x, z, 4.5).forEach(o => { if (!MT[o.type].boss && !MT[o.type].head) o.stunT = T + 2.5; o.slowT = Math.max(o.slowT || 0, 4); }); W.hits.push(['frostfloor', r2(x), r2(z)]); decal(x, z, 4.5, 'frost', 4); return true; }
  if (key === 'storm+water') { if (m.elecT > T) return true; m.elecT = T + 2; const L = rxNear(x, z, 8).filter(o => o.wetT > T || (o.mk && o.mk.el === 'water')); L.slice(0, 5).forEach(o => { rxHit(o, 22*k, x, z, by); W.hits.push(['arc', r2(x), r2(z), r2(o.x), r2(o.z)]); arcFx(x, z, o.x, o.z); }); rxHit(m, 30*k, x, z, by); return true; }
  if (key === 'fire+ice') { rxNear(x, z, 4).forEach(o => rxHit(o, 28*k, x, z, by)); return false; }
  return false; }
/* ---- messages réseau ---- */
function rpgHit(h){ const t = h[0];
  if (t === 'fpatch' && fin(h[1])) firePatchFx(h[1], h[2], h[3], h[4]); else if (t === 'iprison') prisonFx(h[1], +h[2] || 3); else if (t === 'ishatter') shatterFx(h[1]);
  else if (t === 'tstrike' && fin(h[1])) boltAt(h[1], h[2]); else if (t === 'arc' && fin(h[1])) arcFx(h[1], h[2], h[3], h[4]); else if (t === 'qpop' && typeof h[1] === 'string') { /* annonce discrète */ }
  else if (t === 'frostfloor' && fin(h[1])) decal(h[1], h[2], 4.5, 'frost', 4);
  if (typeof rpgHit2 === 'function') rpgHit2(h); }
/* ---- tick ---- */
function rpgTick(dt){ if (!RPG.setup) rpgSetup(); triTick(); zonesTick(dt); prisonTick(); if (typeof rpgTick2 === 'function') rpgTick2(dt); }
function rpgSetup(){ RPG.setup = 1; ELN.water = 'Eau'; for (const [k, C] of Object.entries(CL)) if (C.rpg) C.spells.forEach((s, i) => { INCV[k + ':' + i] = [s.n]; });
  WZ_STYLE.elem = {hat:1, trim:0xd8a24a, pad:0x5a2410}; WZ_STYLE.celest = {hat:0, trim:0xfff0c0, pad:0xd8c8a0}; WZ_STYLE.glad = {hat:0, trim:0xb08a5a, pad:0x4a1a10}; WZ_STYLE.necro = {hat:1, trim:0x8a7aa0, pad:0x1a1424}; if (!WZ_STYLE.summon) WZ_STYLE.summon = {hat:0, trim:0x9fd8e8, pad:0x24404a};
  rpgPicker(); }
/* ---- écran de sélection des classes ---- */
function rpgPicker(){ if (!CL[pickCls] || !CL[pickCls].rpg || CL[pickCls].soon) pickCls = 'elem'; try { const s = JSON.parse(localStorage.getItem('incantatio') || '{}'); if (CL[s.c] && CL[s.c].rpg && !CL[s.c].soon) pickCls = s.c; } catch (e) {}
  const el = $('#classes'); if (!el) return; el.classList.add('rpgcls');
  el.innerHTML = ['elem', 'summon', 'celest', 'glad', 'necro'].map(k => [k, CL[k]]).map(([k, c]) => `<button class="cls" data-c="${k}" style="--c:${c.col}" aria-pressed="${k === pickCls}"${c.soon ? ' disabled' : ''}>${glyph(k)}<b>${c.name}</b><em>${esc(c.role)}</em><small>${esc(c.desc)}</small>
    <span class="st">${Object.entries(c.stats).map(([n, v]) => `<i><u>${n}</u><s style="width:${v*20}%"></s></i>`).join('')}</span>
    <small class="sp"><b>Clic gauche :</b> ${esc(c.basicD)}${c.spells.length ? '<br><b>Formules :</b> ' + c.spells.map(s => (s.ult ? '★ ' : '') + '« ' + s.n + ' »').join(' · ') : ''}</small>${c.soon ? '<small class="soon">En préparation</small>' : ''}</button>`).join('');
  if (!$('#rpgcss')) { const st = document.createElement('style'); st.id = 'rpgcss'; st.textContent = `.rpgcls{grid-template-columns:repeat(5,minmax(0,1fr))!important}.rpgcls .cls{min-height:330px;gap:5px;font-size:12px}.rpgcls .cls em{font-style:normal;color:var(--c);font-size:12px}
.rpgcls .cls small{font-size:11.5px}.rpgcls .cls .st{display:grid;gap:2px;margin:2px 0}.rpgcls .cls .st i{display:grid;grid-template-columns:70px 1fr;align-items:center;font-style:normal;font-size:10.5px;color:#bfb39b}.rpgcls .cls .st u{text-decoration:none}.rpgcls .cls .st s{display:block;height:5px;border-radius:3px;background:var(--c);opacity:.85}
.rpgcls .cls .sp b{color:#e8dcc0;font-family:inherit;font-size:11px}.rpgcls .cls[disabled]{opacity:.5;cursor:not-allowed}.rpgcls .cls .soon{color:#ffcf6a;font-style:italic}@media(max-width:1000px){.rpgcls{grid-template-columns:repeat(2,minmax(0,1fr))!important}}`; document.head.appendChild(st); } }
setTimeout(() => { if (!RPG.setup) rpgSetup(); }, 0);
