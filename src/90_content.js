/* ===================== CONTENU : ennemis qui obligent à s'adapter, boss qui réagissent aux classes, apparences de niveau ===================== */
/* ---- trois nouveaux ennemis ---- */
const MT_FLY = MT.length; MT.push({n:'Gargouille', hp:70, spd:4.6, dmg:9, r:.8, h:1.6, reach:2.2, cd:1.3, fly:1, rpgMesh:t => gargMesh(t)});
const MT_ARM = MT.length; MT.push({n:'Chevalier d\'os blindé', hp:170, spd:3.1, dmg:14, r:.9, h:2.2, reach:2.3, cd:1.4, armor:1, rpgMesh:t => knightMesh(t)});
const MT_EAT = MT.length; MT.push({n:'Mange-âmes', hp:55, spd:5.2, dmg:6, r:.6, h:1.1, reach:1.7, cd:1, eater:1, rpgMesh:t => eaterMesh(t)});
setTimeout(() => Object.assign(WEAK, {[MT_FLY]:{storm:1.5, ice:1.2}, [MT_ARM]:{phys:1.3, storm:1.2, fire:.7}, [MT_EAT]:{spirit:1.6, fire:1.2, shadow:.4}}), 0);
/* apparition (hôte) : à partir de la vague 4, certains monstres ordinaires sont remplacés */
function rpgSpawnType(t){ if (!isHost || !rpgCls() || ![0, 1, 7, 10, 6].includes(t)) return t; const r = Math.random(), w = W.w;
  if (w >= 4 && r < .1) return MT_FLY; if (w >= 6 && r < .18) return MT_ARM; if (anyNecro() && w >= 3 && r < .26) return MT_EAT; return t; }
/* qui touche quoi : les gargouilles volent (seuls projectiles, foudre, rayons et orbes les atteignent bien, ou quand elles piquent pour attaquer) ;
   les chevaliers blindés ne cèdent qu'au corps à corps (poings, golem, serviteurs) */
function contentHurt(m, dmg, f, by){ const t = MT[m.type]; if (!f) return dmg;
  if (t.fly && !(m.a > 0)) { const air = f.air || f.el === 'storm' || /Drain|Orbe|Tempest|Électrocution/.test(f.sn || ''); if (!air) { dmg *= .25; if (isMe(by) && T > (RPGC.flyMsg || 0)) { RPGC.flyMsg = T + 8; toast('Gargouille en vol : projectiles, foudre ou rayons, ou frappez quand elle pique'); } } }
  if (t.armor) { const melee = f.el === 'phys' || f.aid || f.nid || f.sn === 'Gardien'; if (!melee) { dmg *= .3; if (isMe(by) && T > (RPGC.armMsg || 0)) { RPGC.armMsg = T + 8; toast('Chevalier blindé : seuls les coups au corps à corps le blessent vraiment (poings, golem, serviteurs)'); } } }
  if (m.type === 4 && m.mirT > T && !(f.el === 'phys' || f.aid || f.nid || f.sn === 'Gardien')) { const back = Math.min(15, dmg*.3); if (by) hitPlayer(isMe(by) ? (me.peer || 'me') : by, back); W.hits.push(['mirhit', r2(m.x), r2(m.z)]); dmg *= .2; }
  return dmg; }
const RPGC = {};
/* ---- comportements (hôte) ---- */
function soulEaterTarget(m, t, tg, bd){ if (!t.eater || !NC.orbs.size) return null; let best = null, bb = 22; for (const o of NC.orbs.values()) { const d = Math.hypot(o.x - m.x, o.z - m.z); if (d < bb) { bb = d; best = o; } } if (!best) return null;
  if (bb < 2.3) { soulGone(best.id); W.hits.push(['soulx', best.id, r2(m.x), r2(m.z)]); eatFx(m.x, m.z); m.hp = Math.min(m.max*2, m.hp + m.max*.25); m.max = Math.round(m.max*1.1); m.spdK = (m.spdK || 1)*1.05; m.eaten = (m.eaten || 0) + 1; }
  return {tg:{peer:'#soul', x:best.x, z:best.z}, bd:bb}; }
function bossReact(dt){ if (!isHost) return; for (const m of mons.values()) { if (m.type === 4) { m.mirC = (m.mirC ?? 10) - dt; if (m.mirC <= 0) { m.mirC = 12; m.mirT = T + 3.5; W.hits.push(['mirror', m.id]); lichMirrorFx(m.id); bossMsg('La Liche dresse un miroir : vos sorts à distance vous reviennent (3 s). Golem, serviteurs et poings passent !'); } } } }
/* le Golem des Ruines cherche à briser les golems et les serviteurs */
function bossTarget(m, t, tg, bd){ if (m.type !== 3) return null; let best = null, bb = 26; for (const a of ALLIES.values()) { if (a.deadT || a.sm) continue; const d = Math.hypot(a.x - m.x, a.z - m.z); if (d < bb) { bb = d; best = {peer:'#a' + a.id, x:a.x, z:a.z}; } }
  for (const n of NC.mins.values()) { const d = Math.hypot(n.x - m.x, n.z - m.z); if (d < bb - 4) { bb = d; best = {peer:'#n' + n.id, x:n.x, z:n.z}; } } if (best && T > (RPGC.gbMsg || 0)) { RPGC.gbMsg = T + 30; bossMsg('Le Golem des Ruines s\'acharne sur vos invocations !'); } return best ? {tg:best, bd:bb} : null; }
/* ---- modèles ---- */
function rpgMonMesh(t, build){ const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const anim = build(body, g); const b = bar3(); b.position.y = MT[t].h + .45 + (MT[t].fly ? 3.2 : 0); g.add(b); g.userData.bar = b; g.userData.anim = anim; g.userData.body = body; g.userData.bs = 1; g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; }
function gargMesh(t){ return rpgMonMesh(t, body => { const st = new THREE.MeshStandardMaterial({color:0x5a5a62, roughness:.9, flatShading:true}), ey = new THREE.MeshBasicMaterial({color:0xff4a2a});
  const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(.42, 0), st); torso.scale.set(1, 1.2, .8); torso.position.y = .9; body.add(torso); const head = new THREE.Mesh(new THREE.DodecahedronGeometry(.26, 0), st); head.position.set(0, 1.45, .15); body.add(head);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), ey); e.position.set(s*.1, 1.5, .37); body.add(e); const h = new THREE.Mesh(new THREE.ConeGeometry(.06, .3, 5), st); h.position.set(s*.15, 1.7, .05); h.rotation.z = -s*.4; body.add(h); }
  const wings = [-1, 1].map(s => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.3, .5); sh.lineTo(1.1, 0); sh.lineTo(1.25, -.35); sh.lineTo(.8, -.2); sh.lineTo(.6, -.5); sh.lineTo(0, -.2); const w = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({color:0x3a3a44, roughness:.9, side:THREE.DoubleSide})); w.scale.set(s, 1, 1); w.position.set(s*.25, 1.05, -.15); body.add(w); return w; });
  const claws = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.ConeGeometry(.08, .35, 5), st); c.position.set(s*.2, .35, .1); c.rotation.x = Math.PI; body.add(c); return c; });
  return (tt, mv, atk) => { body.position.y = 3.2 - atk*2.6 + Math.sin(tt*2)*.25; wings.forEach((w, i) => { w.rotation.y = (i ? -1 : 1)*(.2 + Math.sin(tt*9)*.6); }); body.rotation.x = atk*.6; claws.forEach(c => c.rotation.z = atk*.5); }; }); }
function knightMesh(t){ return rpgMonMesh(t, body => { const ar = new THREE.MeshStandardMaterial({color:0x6a6e78, roughness:.35, metalness:.85}), bone = new THREE.MeshStandardMaterial({color:0xd8d0b8, roughness:.7}), ey = new THREE.MeshBasicMaterial({color:0x9fe8ff});
  const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s*.16, .9, 0); body.add(l); const m = new THREE.Mesh(new THREE.BoxGeometry(.16, .9, .18).translate(0, -.45, 0), ar); l.add(m); return l; });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.6, .75, .38), ar); torso.position.y = 1.3; body.add(torso); for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.5, .04, .4), bone); r.position.set(0, 1.12 + i*.15, 0); body.add(r); }
  const head = new THREE.Mesh(new THREE.CylinderGeometry(.17, .19, .34, 8), ar); head.position.y = 1.9; body.add(head); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.06, .03, .02), ey); e.position.set(s*.07, 1.92, .18); body.add(e); }
  const shield = new THREE.Mesh(new THREE.BoxGeometry(.08, .9, .6), ar); shield.position.set(-.42, 1.25, .1); body.add(shield); const sw = new THREE.Group(); sw.position.set(.4, 1.5, 0); body.add(sw); const blade = new THREE.Mesh(new THREE.BoxGeometry(.06, 1, .12).translate(0, -.5, 0), ar); sw.add(blade);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8, 0, 6.28, 0, 1.4), ar); p.position.set(s*.38, 1.62, 0); body.add(p); }
  return (tt, mv, atk) => { const st = Math.sin(tt*6)*mv; legs[0].rotation.x = st*.5; legs[1].rotation.x = -st*.5; sw.rotation.x = -atk*1.8 + .3; body.position.y = Math.abs(Math.cos(tt*6))*.03*mv; }; }); }
function eaterMesh(t){ return rpgMonMesh(t, body => { const fl = new THREE.MeshStandardMaterial({color:0x3a2a4a, roughness:.6, emissive:0x2a0a3a, emissiveIntensity:.6}), mouth = new THREE.MeshBasicMaterial({color:0xa07aff});
  const b = new THREE.Mesh(new THREE.SphereGeometry(.45, 14, 10), fl); b.scale.set(1, .8, 1.2); b.position.y = .5; body.add(b); const jaw = new THREE.Mesh(new THREE.TorusGeometry(.22, .06, 6, 16, Math.PI), mouth); jaw.position.set(0, .5, .48); body.add(jaw);
  const legs = []; for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .02, .55, 5), fl); l.position.set(s*.4, .25, -.25 + Math.floor(i/2)*.25); l.rotation.z = s*.9; body.add(l); legs.push(l); }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex, color:0xa07aff, transparent:true, opacity:.5, blending:THREE.AdditiveBlending, depthWrite:false})); glow.scale.setScalar(1.4); glow.position.y = .5; body.add(glow);
  return (tt, mv, atk) => { legs.forEach((l, i) => l.rotation.x = Math.sin(tt*14 + i)*.5*mv); jaw.rotation.x = Math.sin(tt*8)*.2 + atk*.6; glow.material.opacity = .35 + Math.sin(tt*5)*.15; }; }); }
function lichMirrorFx(id){ const m = mons.get(id); if (!m) return; const s = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({color:0xc8e8ff, transparent:true, opacity:.18, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide})); scene.add(s);
  fx.push({t:0, dur:3.5, upd:k => { const mm = mons.get(id); if (mm) s.position.set(mm.x, (mm.gy || 0) + 3, mm.z); s.material.opacity = .18 + Math.sin(k*40)*.05; s.rotation.y += .05; }, end:() => scene.remove(s)}); }
const eatFx = (x, z) => { puff(x, groundH(x, z) + .8, z, '#a07aff', 16, 3, .5, .6, 1); rpgSnd('whisper', .3); };
function contentHit(h){ const t = h[0]; if (t === 'mirror') lichMirrorFx(h[1]); else if (t === 'mirhit' && fin(h[1])) puff(h[1], 6, h[2], '#c8e8ff', 6, 4, .4, .4, 1); else if (t === 'soulx' && fin(h[1])) { soulGone(h[1]); eatFx(h[2], h[3]); } }
/* ---- apparences débloquées aux niveaux 10, 20, 30, 40, 50 ---- */
const SKINS = [{lv:1, n:'D\'origine'}, {lv:10, n:'Azur', c:0x3aa8ff}, {lv:20, n:'Or', c:0xffc840}, {lv:30, n:'Sang', c:0xff2a3a}, {lv:40, n:'Améthyste', c:0xb06aff}, {lv:50, n:'Aurore', c:0x7dffd8}];
const skinOf = c => { const P = progOf(c), i = P.skin || 0; return SKINS[i] && P.lv >= SKINS[i].lv ? i : 0; };
function skinColorFor(peer, cls){ const i = isMe(peer) ? skinOf(me.cls) : ((others.get(peer) || {}).pm || {}).skin || 0; return SKINS[i] && SKINS[i].c ? SKINS[i].c : null; }
function skinsHTML(c){ const P = progOf(c); return '<h4>Apparences</h4><div class="rt-skins">' + SKINS.map((s, i) => `<button class="rt-skin${skinOf(c) === i ? ' on' : ''}" data-sk="${i}" ${P.lv >= s.lv ? '' : 'disabled'} style="--sc:${s.c ? '#' + s.c.toString(16).padStart(6, '0') : CL[c].col}">${s.n}${P.lv >= s.lv ? '' : ' · niv. ' + s.lv}</button>`).join('') + '</div><small>Teinte des runes, ailes, golem, âmes et orbes de votre classe, visible par tous.</small>'; }
addEventListener('click', e => { const t = e.target.closest && e.target.closest('.rt-skin'); if (!t || t.disabled) return; const c = TREE_C || me.cls; progOf(c).skin = +t.dataset.sk; progSave(); const p = $('#tree'); if (p) p.innerHTML = rpgTreeHTML(c); }, true);
function skinTick(){ if (!playing) return; const myc = skinColorFor(me.peer, me.cls);
  for (const a of ALLIES.values()) { if (!a.g) continue; const c = skinColorFor(a.owner === 'me' ? me.peer : a.owner, 'summon'); if (c && !(a.fl & (2 | 4 | 16 | 64 | 128 | 256)) && !(isHost && (a.skinT > T || a.furyT > T || a.linkT > T))) { a.g.userData.glow.color.setHex(c); a.g.userData.aura.material.color.setHex(c); } }
  if (myc) { if (me.cls === 'glad' && FIST && !(bOn(me.peer, 'berserk') || bOn(me.peer, 'apex') || bOn(me.peer, 'blood'))) FIST.userData.rm.color.setHex(myc); if (WINGS) WINGS.children.forEach(w => w.material.color.setHex(myc)); }
  for (const n of NC.mins.values()) { const c = skinColorFor(n.owner === 'me' ? me.peer : n.owner, 'necro'); if (c && n.g && n.g.userData.aura && !(n.fl || 0)) n.g.userData.aura.material.color.setHex(c); } }
function contentTick(dt){ bossReact(dt); skinTick(); }
