/* ===================== NÉCROMANCIEN : âmes, serviteurs morts-vivants ===================== */
delete CL.necro.soon; CL.necro.basicD = 'Projectile nécrotique. Les âmes des monstres tués se ramassent en passant dessus';
CL.necro.spells = [
  {n:'Harvest', k:'rpg', act:'harvest', el:'shadow', dmg:0, r:18, mana:15, cd:8, d:'Aspire toutes les âmes au sol à 18 m autour de vous'},
  {n:'Arise', k:'rpg', act:'arise', el:'shadow', dmg:0, mana:25, cd:6, d:'Vide toute la réserve d\'âmes : chaque âme récoltée se relève en serviteur qui attaque les monstres'},
  {n:'Macabre Explosion', k:'rpg', act:'macabre', el:'shadow', dmg:45, r:4, mana:28, cd:12, d:'Vos serviteurs explosent : dégâts de zone selon leur vie restante'},
  {n:'Army of the Damned', k:'rpg', act:'army', el:'shadow', dmg:0, mana:30, cd:20, d:'Vos serviteurs gagnent +50 % de dégâts et de vitesse pendant 12 s'},
  {n:'King of the Dead', k:'rpg', act:'king', el:'shadow', ult:1, dmg:60, r:12, mana:75, cd:80, d:'ULTIME : vague d\'énergie noire (dégâts, monstres terrifiés 3 s), armée ×2 dégâts et soignée, 3 goules temporaires 20 s'}];
/* coût en capacité de chaque âme, et niveau de nécromancien requis */
const SOUL = {0:{c:1, l:1}, 1:{c:1, l:1}, 7:{c:1, l:1}, 9:{c:1, l:1}, 6:{c:2, l:6}, 10:{c:2, l:6}, 8:{c:2, l:6}, 2:{c:3, l:11}, 3:{c:6, l:21}, 4:{c:6, l:21}};
const SOUL_N = t => MT[t] ? MT[t].n : '?';
const NC = {res:[], orbs:new Map(), oid:1, mins:new Map(), mid:1, ui:null};
const necroLvl = () => typeof progLevel === 'function' ? progLevel('necro') : 1;
/* niveaux 1-5 : 2 serviteurs (capacité 2) · 6-10 : 3 (4) · 11-15 : 4 (7) · 16-20 : 5 (9) · 21+ : 6 (14), dont 2 puissants au plus */
function necroCap(l, owner){ l = l || necroLvl(); const b = l >= 21 ? {n:6, c:14} : l >= 16 ? {n:5, c:9} : l >= 11 ? {n:4, c:7} : l >= 6 ? {n:3, c:4} : {n:2, c:2}; return {n:b.n + Math.round(modOf(owner, 'capN')), c:b.c + Math.round(modOf(owner, 'capC'))}; }
const anyNecro = () => (playing && me.cls === 'necro') || [...others.values()].some(o => o.cls === 'necro');
/* ---- âmes au sol ---- */
function soulDrop(m){ if (!isHost || !anyNecro()) return; const t = MT[m.type]; if (t.prop || t.head || t.phyl || m.ally) return; const ty = SOUL[m.type] ? m.type : (t.boss ? null : null); if (ty == null) return;
  const id = NC.oid++, x = r2(m.x), z = r2(m.z); W.hits.push(['soul', id, x, z, ty, m.champ ? 1 : 0]); soulOrb(id, x, z, ty, m.champ ? 1 : 0); }
function soulOrb(id, x, z, ty, el){ if (NC.orbs.has(id)) return; const g = new THREE.Group(), c = el ? 0xffd04a : MT[ty].boss ? 0xff4aff : 0xa07aff, s = new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex, color:c, transparent:true, opacity:.9, depthWrite:false, blending:THREE.AdditiveBlending})); s.scale.setScalar(MT[ty].boss ? 1.6 : .9); g.add(s);
  const core = new THREE.Mesh(geo('soulCore', () => new THREE.IcosahedronGeometry(.14, 1)), new THREE.MeshBasicMaterial({color:0xffffff})); g.add(core); g.position.set(x, groundH(x, z) + 1, z); scene.add(g); NC.orbs.set(id, {id, x, z, ty, el, g, t:T}); }
function soulGone(id){ const o = NC.orbs.get(id); if (!o) return; scene.remove(o.g); NC.orbs.delete(id); }
const resMax = () => necroCap(necroLvl(), me.peer).n + Math.round(mod('res'));
function soulTake(o){ const S = SOUL[o.ty] || {l:1}; if (S.l > necroLvl()) { if (T > (NC.lockT || 0)) { NC.lockT = T + 4; qPop(SOUL_N(o.ty) + ' : âme trop puissante (niveau ' + S.l + ')', '#c8a8ff'); } return; } if (NC.res.length >= resMax()) { if (T > (NC.fullT || 0)) { NC.fullT = T + 4; qPop('Réserve d\'âmes pleine : dites Arise', '#c8a8ff'); } return; } soulGone(o.id); if (room) room.emit('cast', {sc:o.id}).catch(()=>{}); NC.res.push({ty:o.ty, el:o.el ? 1 : 0}); puff(me.x, me.y - .6, me.z, '#c8a8ff', 10, 3, .5, .5, 2); }
function soulsTick(){ for (const o of [...NC.orbs.values()]) { o.g.position.y = groundH(o.x, o.z) + 1 + Math.sin(T*3 + o.id)*.2; if (Math.random() < .15) puff(o.x, o.g.position.y, o.z, '#a07aff', 1, .6, .25, .8, 1.5);
    if (T - o.t > 25) { soulGone(o.id); continue; } if (playing && me.cls === 'necro' && !me.dead && Math.hypot(o.x - me.x, o.z - me.z) < 2.2) soulTake(o); } }
/* ---- serviteurs (hôte) ---- */
function minSpawn(owner, ty, x, z, temp){ const t = MT[ty], wk = 1 + .07*Math.max(0, W.w - 1), lv = necroLvlOf(owner), mx = Math.round(t.hp*(t.boss ? .45 : 1.4)*wk*(1 + lv*.01)*(1 + modOf(owner, 'mHp'))); const n = {id:NC.mid++, ty, owner, x, z, hp:mx, max:mx, yaw:0, a:0, atk:0, end:T + (temp ? 20 : 75*(1 + modOf(owner, 'mLife'))), temp:!!temp, mv:0, wk, lv}; NC.mins.set(n.id, n); W.hits.push(['nrise', r2(x), r2(z)]); minRiseFx(x, z); return n; }
const necroLvlOf = owner => isMe(owner) ? necroLvl() : ((others.get(owner) || {}).nlv || 1);
const minsOf = owner => [...NC.mins.values()].filter(n => n.owner === pk_(owner) || (isMe(owner) && isMe(n.owner)));
function minHost(dt){ for (const n of [...NC.mins.values()]) { const t = MT[n.ty]; if (T > n.end || n.hp <= 0 || (!isMe(n.owner) && !others.has(n.owner))) { minDie(n); continue; } n.a = Math.max(0, n.a - dt); n.mv = 0;
    const B = buffOf(n.owner), army = B.army > T, king = B.king > T, op = isMe(n.owner) ? {x:me.x, z:me.z} : (() => { const o = others.get(n.owner); return o ? {x:o.tx, z:o.tz} : {x:n.x, z:n.z}; })();
    let tg = null, bd = 1e9; for (const m of mons.values()) { if (m.charmT > T || MT[m.type].phyl) continue; const d = Math.hypot(m.x - n.x, m.z - n.z); if ((d < 16 || Math.hypot(m.x - op.x, m.z - op.z) < 14) && d < bd) { bd = d; tg = m; } }
    const spd = t.spd*.75*(army ? 1.5 : 1)*(1 + modOf(n.owner, 'mSpd')), dmgK = (army ? 1.5 : 1)*(king ? 2 : 1)*(1 + modOf(n.owner, 'mDmg'))*(n.elite && modOf(n.owner, 'mElite') ? 1.3 : 1);
    if (tg) { const dx = tg.x - n.x, dz = tg.z - n.z, d = Math.hypot(dx, dz) || 1, rg = t.ranged, reach = rg ? 13 : t.reach + MT[tg.type].r*.5; n.yaw = Math.atan2(dx, dz);
      if (d > reach) { if (moveMon(n, dx/d*spd*dt, dz/d*spd*dt, t)) n.mv = 1; }
      else { n.atk -= dt; if (n.atk <= 0) { n.atk = (rg ? rg.cd*.8 : t.cd); n.a = .4; const dmg = Math.max(9, (rg ? rg.dmg : t.dmg)*2)*n.wk*(1 + n.lv*.015)*dmgK; hurt(tg, dmg, {el:'shadow', sn:'Serviteur', rx:1, nid:n.id}, dx/d, dz/d, n.owner === 'me' ? me.peer : n.owner); W.hits.push(['nhit', n.id, r2(tg.x), r2(tg.z), rg ? 1 : 0]); minHitFx(n, tg.x, tg.z, !!rg); } } }
    else { const dx = op.x - n.x, dz = op.z - n.z, d = Math.hypot(dx, dz); if (d > 40) { n.x = op.x + 2; n.z = op.z; } else if (d > 3.5) { n.yaw = Math.atan2(dx, dz); if (moveMon(n, dx/d*spd*dt, dz/d*spd*dt, t)) n.mv = 1; } }
    collide(n, t.r*.8, 60); }
  const arr = [...NC.mins.values()]; for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) { const a = arr[i], b = arr[j], rr = (MT[a.ty].r + MT[b.ty].r)*.8, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d < rr && d > 0) { const k = (rr - d)/2/d; a.x -= dx*k; a.z -= dz*k; b.x += dx*k; b.z += dz*k; } } }
function minDie(n){ NC.mins.delete(n.id); W.hits.push(['ndie', n.id]); minDieFx(n); if (modOf(n.owner, 'mBoom') && T < n.end) { W.hits.push(['nboom', r2(n.x), r2(n.z), 3]); boomFx(n.x, n.z, 3); for (const m of [...mons.values()]) if (Math.hypot(m.x - n.x, m.z - n.z) < 3 + MT[m.type].r) hurt(m, 25*n.wk, {el:'shadow', sn:'Cadavre explosif', rx:1}, 0, 0, n.owner); } }
function minHurt(id, dmg){ const n = NC.mins.get(id); if (!n) return; n.hp -= dmg; if (n.hp <= 0) minDie(n); }
function minTarget(m, t, tg, bd){ if (!NC.mins.size || m.charmT > T || t.head || t.prop || t.boss) return null; if (m.nPref === undefined) m.nPref = Math.random() < .25; const fly = rpgFlyAny(); let best = null, bb = 1e9;
  for (const n of NC.mins.values()) { const d = Math.hypot(n.x - m.x, n.z - m.z); if ((((m.nPref || fly) && d < 12) || (d < 6 && d < bd*.8)) && d < bb) { bb = d; best = n; } }
  return best ? {tg:{peer:'#n' + best.id, x:best.x, z:best.z}, bd:bb} : null; }
function minHitPlayer(peer, dmg){ if (typeof peer === 'string' && peer.startsWith('#n')) { minHurt(+peer.slice(2), dmg); return true; } return false; }
/* ---- sorts ---- */
function necroCast(data, caster, mine, sp, t, dmg, pot, big){ const o = data.o, B = buffOf(caster);
  if (sp.act === 'harvest') { const R = sp.r*big; ringFx(o[0], o[2], R, '#a07aff', .6, 'shadow', 1); if (mine) { let n = 0; for (const s of [...NC.orbs.values()]) if (Math.hypot(s.x - me.x, s.z - me.z) < R) { soulTake(s); n++; } qPop(n ? n + ' âme' + (n > 1 ? 's' : '') + ' récoltée' + (n > 1 ? 's' : '') : 'Aucune âme', '#c8a8ff'); } }
  else if (sp.act === 'arise') { ringFx(o[0], o[2], 4, '#7dff9c', .6, 'shadow'); if (isHost && Array.isArray(data.tys)) { const L = data.tys.filter(x => Array.isArray(x) && MT[x[0]] && SOUL[x[0]]).slice(0, 12); L.forEach((x, i) => { const a = i/Math.max(1, L.length)*6.28; const n = minSpawn(pk_(caster), x[0], o[0] + Math.cos(a)*2.5, o[2] + Math.sin(a)*2.5); if (x[1] === 1) n.elite = 1; });
      /* l'armée ne dépasse pas la limite du niveau : les plus anciens serviteurs retombent en poussière ; 2 créatures puissantes au plus */
      const cap = necroCap(necroLvlOf(caster), caster), arr = minsOf(caster).filter(n => !n.temp).sort((a, b) => a.id - b.id); while (arr.length > cap.n) minDie(arr.shift()); const big = arr.filter(n => (SOUL[n.ty] || {}).c >= 6); while (big.length > 2) minDie(big.shift()); } }
  else if (sp.act === 'macabre') { if (isHost) for (const n of minsOf(caster)) { const R = sp.r*big, d = dmg + n.hp*.3; W.hits.push(['nboom', r2(n.x), r2(n.z), r2(R)]); boomFx(n.x, n.z, R); for (const m of [...mons.values()]) if (Math.hypot(m.x - n.x, m.z - n.z) < R + MT[m.type].r) hurt(m, d, {el:'shadow', sn:sp.n, push:2}, 0, 0, caster); NC.mins.delete(n.id); W.hits.push(['ndie', n.id]); minDieFx(n); } }
  else if (sp.act === 'army') { B.army = T + 12*big; ringFx(o[0], o[2], 8, '#7dff9c', .6, 'shadow', 1); }
  else if (sp.act === 'king') { B.king = T + 20; const R = sp.r*big; banner('Roi des morts !', 'L\'armée des damnés se lève'); shockwave(o[0], groundH(o[0], o[2]) + .2, o[2], R, '#7a3aff', 1.2); ringFx(o[0], o[2], R, '#7a3aff', 1, 'shadow');
    if (isHost) { for (const m of [...mons.values()]) { const d = Math.hypot(m.x - o[0], m.z - o[2]); if (d < R + MT[m.type].r) { hurt(m, dmg, {el:'shadow', sn:sp.n}, (m.x - o[0])/(d || 1), (m.z - o[2])/(d || 1), caster); if (mons.has(m.id) && !MT[m.type].boss && !MT[m.type].head) m.stunT = Math.max(m.stunT || 0, T + 3); } }
      for (const n of minsOf(caster)) n.hp = n.max; for (let i = 0; i < 3; i++) { const a = i/3*6.28; minSpawn(pk_(caster), 1, o[0] + Math.cos(a)*3, o[2] + Math.sin(a)*3, 1); } } } }
/* le client du nécromancien choisit l'âme à relever (sa réserve est chez lui) */
function necroData(id, data){ const sp = spellOf(id); if (!sp || sp.act !== 'arise') return; if (!NC.res.length) { toast('Aucune âme en réserve : tuez des monstres et ramassez leurs âmes'); return; }
  data.tys = NC.res.map(r => [r.ty, r.el ? 1 : 0]); qPop('Arise ! ' + NC.res.length + ' âme' + (NC.res.length > 1 ? 's' : '') + ' se relève' + (NC.res.length > 1 ? 'nt' : ''), '#c8a8ff'); NC.res = []; }
/* ---- réseau ---- */
function minPack(){ return [...NC.mins.values()].map(n => [n.id, n.ty, n.owner, r2(n.x), r2(n.z), Math.round(n.hp), n.max, (buffOf(n.owner).army > T ? 1 : 0) | (buffOf(n.owner).king > T ? 2 : 0) | (n.temp ? 4 : 0) | (n.mv ? 8 : 0), r2(n.yaw), n.a > 0 ? 1 : 0]); }
function minRecv(L){ if (!Array.isArray(L)) return; const seen = new Set(); for (const t of L) { if (!Array.isArray(t) || !fin(t[0]) || !MT[t[1]]) continue; const [id, ty, owner, x, z, hp, mx, fl, yaw, at] = t; seen.add(id); let n = NC.mins.get(id); if (!n) { n = {id, ty, x, z}; NC.mins.set(id, n); }
    Object.assign(n, {owner:String(owner), tx:x, tz:z, hp, max:mx, fl, tyaw:yaw}); if (at && !(n.a > 0)) n.a = .4; } for (const [id, n] of NC.mins) if (!seen.has(id)) { if (n.g) scene.remove(n.g); NC.mins.delete(id); } }
function rpgPreApply(data, caster, mine){ if (fin(data.sc)) { soulGone(data.sc); return true; } if (data.pm && typeof data.pm === 'object') { const o = others.get(caster); if (o && !mine) o.pm = data.pm; return true; } if (fin(data.nlv) && !mine) { const o = others.get(caster); if (o) o.nlv = clamp(data.nlv, 1, 50); return true; } return false; }
function rpgHit2(h){ const t = h[0];
  if (t === 'soul' && fin(h[1])) soulOrb(h[1], h[2], h[3], h[4], h[5]); else if (t === 'nrise' && fin(h[1])) minRiseFx(h[1], h[2]); else if (t === 'ndie') { const n = NC.mins.get(h[1]); if (n) minDieFx(n); }
  else if (t === 'nhit') { const n = NC.mins.get(h[1]); if (n && fin(h[2])) { n.a = .4; minHitFx(n, h[2], h[3], h[4] === 1); } } else if (t === 'nboom' && fin(h[1])) boomFx(h[1], h[2], h[3]); }
/* ---- effets et rendu ---- */
function minRiseFx(x, z){ const y = groundH(x, z); puff(x, y + .3, z, '#7dff9c', 30, 4, .9, 1, 2.5); groundTentacles(x, z, '#7dff9c', 5); flash(x, y + 1, z, '#5aff8a', 4, .4); }
function minDieFx(n){ if (n.g) { scene.remove(n.g); n.g = null; } puff(n.x, groundH(n.x, n.z) + 1, n.z, '#7dff9c', 18, 4, .6, .8, 2); }
function minHitFx(n, x, z, rg){ if (rg) lightning([new THREE.Vector3(n.x, groundH(n.x, n.z) + 1.5, n.z), new THREE.Vector3(x, groundH(x, z) + 1, z)], '#7dff9c', .2, .04, .02); puff(x, groundH(x, z) + 1, z, '#7dff9c', 5, 3, .4, .3, 1); }
function boomFx(x, z, R){ const y = groundH(x, z); shockwave(x, y + .2, z, R, '#7dff9c', .6); puff(x, y + 1, z, '#4a2a6a', 30, 7, 1, .8, 1); puff(x, y + 1, z, '#7dff9c', 20, 8, .6, .6, 1); flash(x, y + 1.5, z, '#7dff9c', 6, .3); sfx('boom', clamp(1 - Math.hypot(me.x - x, me.z - z)/40, .1, .8)); }
function minMesh(ty){ const g = monsterMesh(ty), ghost = new THREE.Color(0x7dff9c); g.traverse(o => { if (o.isMesh && o.material && !o.isSprite) { const ms = Array.isArray(o.material) ? o.material : [o.material]; const cl = ms.map(m => { const c = m.clone(); if (c.color) c.color.lerp(ghost, .45); if ('emissive' in c && c.emissive) { c.emissive = new THREE.Color(0x1a6a3a); c.emissiveIntensity = .6; } c.transparent = true; c.opacity = Math.min(c.opacity ?? 1, .82); return c; }); o.material = Array.isArray(o.material) ? cl : cl[0]; } });
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex, color:0x5aff8a, transparent:true, opacity:.18, depthWrite:false, blending:THREE.AdditiveBlending})); aura.scale.setScalar(MT[ty].h*1.6); aura.position.y = MT[ty].h*.5; g.add(aura); g.userData.aura = aura;
  if (g.userData.bar) { const fg = g.userData.bar.userData.fg; if (fg) fg.material = new THREE.MeshBasicMaterial({color:0x5aff8a, depthWrite:false}); } return g; }
function minTick(dt){ if (isHost && playing && !(paused && !room)) minHost(dt);
  for (const n of NC.mins.values()) { if (!n.g) { n.g = minMesh(n.ty); scene.add(n.g); }
    if (!isHost && n.tx != null) { const k = Math.min(1, dt*10); if (Math.hypot(n.tx - n.x, n.tz - n.z) > 10) { n.x = n.tx; n.z = n.tz; } n.x += (n.tx - n.x)*k; n.z += (n.tz - n.z)*k; let dy = (n.tyaw || 0) - (n.yaw || 0); dy = Math.atan2(Math.sin(dy), Math.cos(dy)); n.yaw = (n.yaw || 0) + dy*Math.min(1, dt*8); n.a = Math.max(0, (n.a || 0) - dt); }
    if (n.g.userData.anim) { const mvT = isHost ? (n.mv ? 1 : 0) : (Math.hypot((n.tx ?? n.x) - n.x, (n.tz ?? n.z) - n.z) > .05 ? 1 : 0); n.mvS = (n.mvS || 0) + (mvT - (n.mvS || 0))*Math.min(1, dt*6); n.g.userData.anim(T + n.id*1.7, n.mvS, clamp((n.a || 0)/.4, 0, 1), 0); }
    const at = n.a > 0 ? Math.sin((1 - n.a/.4)*Math.PI) : 0, fl = isHost ? (buffOf(n.owner).army > T ? 1 : 0) | (buffOf(n.owner).king > T ? 2 : 0) : (n.fl || 0);
    n.g.position.set(n.x + Math.sin(n.yaw || 0)*at*.4, groundH(n.x, n.z) + Math.abs(Math.sin(T*8 + n.id))*.05, n.z + Math.cos(n.yaw || 0)*at*.4); n.g.rotation.y = n.yaw || 0;
    if (n.g.userData.aura) { n.g.userData.aura.material.color.setHex(fl & 2 ? 0xa04aff : fl & 1 ? 0xff5a8a : 0x5aff8a); n.g.userData.aura.material.opacity = .14 + (fl ? .14 : 0) + Math.sin(T*4 + n.id)*.04; }
    const b = n.g.userData.bar; if (b) { b.quaternion.copy(camera.quaternion); b.quaternion.premultiply(n.g.quaternion.clone().invert()); const k = clamp(n.hp/(n.max || 1), 0, 1); b.userData.fg.scale.x = k || .001; b.userData.fg.position.x = -.6*(1 - k); } }
  soulsTick(); necroUI();
  if (!playing && (NC.mins.size || NC.orbs.size || NC.res.length)) { for (const n of NC.mins.values()) if (n.g) scene.remove(n.g); NC.mins.clear(); for (const o of NC.orbs.values()) scene.remove(o.g); NC.orbs.clear(); NC.res = []; }
  if (playing && me.cls === 'necro' && room && T > (NC.lvT || 0)) { NC.lvT = T + 5; room.emit('cast', {nlv:necroLvl()}).catch(()=>{}); } }
function necroUI(){ let e = NC.ui; if (!e) { e = NC.ui = document.createElement('div'); e.id = 'necroui'; e.style.cssText = 'position:fixed;left:16px;bottom:122px;font:13px Georgia,serif;color:#e0d0ff;z-index:12;pointer-events:none;text-shadow:0 1px 2px #000;max-width:340px'; document.body.appendChild(e); }
  if (!playing || me.cls !== 'necro') { e.style.display = 'none'; return; } e.style.display = 'block'; const lv = necroLvl(), cap = necroCap(lv, me.peer), mine_ = [...NC.mins.values()].filter(n => isMe(n.owner)), cnt = {};
  NC.res.forEach(r => { const t = r.ty + (r.el ? 'e' : ''); cnt[t] = (cnt[t] || 0) + 1; }); const res = Object.entries(cnt).map(([t, c]) => SOUL_N(parseInt(t)) + (t.endsWith('e') ? ' élite' : '') + (c > 1 ? ' ×' + c : '') + ((SOUL[parseInt(t)] || {l:1}).l > lv ? ' 🔒' : '')).join(', ');
  const h = '<b style="color:#c8a8ff;font-family:Cinzel,serif">Âmes ' + NC.res.length + '/' + resMax() + '</b> <span style="display:inline-block;width:90px;height:7px;background:#0008;border:1px solid #c8a8ff66;border-radius:4px;vertical-align:middle"><s style="display:block;height:100%;text-decoration:none;background:#a07aff;width:' + Math.min(100, NC.res.length/resMax()*100) + '%"></s></span> ' + (res || '—') + '<br>Serviteurs ' + mine_.filter(n => !n.temp).length + '/' + cap.n + ' (niveau ' + lv + ') · dites Arise pour les relever';
  if (e.innerHTML !== h) e.innerHTML = h; }
