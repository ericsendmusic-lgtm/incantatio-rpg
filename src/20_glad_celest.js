/* ===================== GLADIATEUR RUNIQUE et MAGE CÉLESTE ===================== */
ELC.phys = '#ff9a6a'; MK_N.phys = 'Sonné';
delete CL.glad.soon; delete CL.celest.soon;
CL.glad.el = 'phys'; CL.glad.basicD = 'Combo de trois coups de poing : rapide, puissant, dévastateur (onde de choc). Chaque coup remplit la Rage';
CL.glad.spells = [
  {n:'Leaping Strike', k:'rpg', act:'leap', el:'phys', dmg:45, r:5, mana:25, cd:8, d:'Bondit vers le point visé (18 m max) : onde de choc à l\'atterrissage, monstres étourdis 1,5 s'},
  {n:'Seismic Fist', k:'rpg', act:'seismic', el:'phys', dmg:55, len:13, w:3.4, mana:30, cd:11, d:'Frappe le sol : une faille s\'ouvre devant vous, blesse et projette les monstres'},
  {n:'Blood Rune', k:'rpg', act:'blood', el:'phys', dmg:0, mana:30, cd:20, d:'Rune de sang 12 s : 25 % des dégâts que vous infligez vous soignent'},
  {n:'Berserker', k:'rpg', act:'berserk', el:'phys', dmg:0, mana:20, cd:25, d:'Seulement sous 30 % de vie : +50 % de dégâts et coups plus rapides pendant 12 s (aura rouge)'},
  {n:'Gladiator Apex', k:'rpg', act:'apex', el:'phys', ult:1, dmg:0, mana:0, cd:80, d:'ULTIME : toutes les runes s\'embrasent 15 s : +25 % de dégâts, chaque coup fait une onde de choc, +30 % de vitesse, Rage pleine'}];
CL.celest.el = 'spirit'; CL.celest.basicD = 'Clic maintenu : soigne l\'allié visé, ou draine la vie de l\'ennemi visé (seul : la lumière vous soigne doucement)';
CL.celest.spells = [
  {n:'Circle of Life', k:'rpg', act:'circle', el:'spirit', dmg:0, r:6, mana:30, cd:14, d:'Cercle de lumière au sol 8 s : les alliés dedans récupèrent 6 PV par seconde'},
  {n:'Divine Shield', k:'rpg', act:'shield', el:'spirit', dmg:0, mana:24, cd:12, d:'Bouclier de 45 points sur l\'allié visé (ou vous) pendant 8 s'},
  {n:'Resurrection', k:'rpg', act:'rez', el:'spirit', dmg:0, mana:40, cd:40, d:'Relève un allié tombé (25 m). Seul : Second souffle, la prochaine blessure mortelle dans les 40 s vous laisse à 50 % de vie'},
  {n:'Life Drain', k:'rpg', act:'drain', el:'spirit', dmg:14, mana:22, cd:8, d:'Lie l\'ennemi visé 4 s : 28 dégâts par seconde, 60 % reviennent en vie'},
  {n:'Ascension', k:'rpg', act:'ascend', el:'spirit', ult:1, dmg:55, mana:70, cd:75, d:'ULTIME : vous vous envolez 10 s avec des ailes de lumière. Clic gauche : orbes sacrés (55 dégâts de zone). Atterrissage : onde de soin'}];
const pk_ = p => p || 'me', isMe = p => !p || p === 'me' || p === me.peer;
RPG.buff = {}; RPG.combo = 0; RPG.comboT = 0; RPG.hold = 0; RPG.beamT = 0; RPG.grace = 0; RPG.shield = 0; RPG.shieldT = 0; RPG.second = 0; RPG.fly = 0; RPG.leap = null;
const buffOf = p => RPG.buff[pk_(p)] || (RPG.buff[pk_(p)] = {});
const bOn = (p, k) => (buffOf(p)[k] || 0) > T;
/* ---- garde-fous avant le lancer (avant de payer le mana) ---- */
function rpgBlock(id){ const sp = spellOf(id); if (!sp) return false; if (typeof ultBlock === 'function' && ultBlock(sp)) return true;
  if (sp.act === 'berserk' && me.hp >= .3*rpgMaxHp()) { toast('Berserker : seulement sous 30 % de vie'); return true; }
  if (sp.act === 'leap' && RPG.leap) return true; return false; }
/* ---- vitesse, régénération, défense ---- */
function rpgSpeed(){ let k = 1 + mod('spd'); if (bOn(me.peer, 'apex')) k *= 1.3; if (bOn(me.peer, 'berserk')) k *= 1.1; return k; }
function rpgRegen(){ return (me.cls === 'glad' ? .35 : 1)*(1 + mod('mana')); }
function rpgDefend(d){ if (d <= 0) return d; if (typeof expDmg === 'function') d *= expDmg(); d *= 1 - Math.min(.6, mod('def')); if (RPG.fly > T) d *= .3; if (typeof ultAdd === 'function') ultAdd(d*.4); if (me.cls === 'glad') me.mp = Math.min(me.maxMp, me.mp + d*.6*(1 + mod('rage')));
  if (RPG.shield > 0 && T < RPG.shieldT) { const a = Math.min(RPG.shield, d); RPG.shield -= a; d -= a; if (a > 0) { qPop('Bouclier divin', '#ffe9a8'); puff(me.x, me.y - .6, me.z, '#ffe9a8', 8, 3, .5, .5, 1); } }
  if (RPG.second > T && me.hp - d <= 0) { RPG.second = 0; d = Math.max(0, me.hp - 1); fx.push({delay:.05, run:() => { if (!me.dead) { me.hp = rpgMaxHp()*.5; banner('Second souffle !', 'La lumière vous relève'); puff(me.x, me.y - 1, me.z, '#ffe9a8', 40, 5, 1, 1, 3); } }}); }
  return d; }
/* ---- attaque de base ---- */
function rpgBasic2(data){ const c = me.cls;
  if (c === 'glad') { if (T - RPG.comboT > 1.1) RPG.combo = 0; RPG.combo = RPG.combo % 3 + 1; RPG.comboT = T; data.mel = RPG.combo; me.mp = Math.min(me.maxMp, me.mp + 5*(1 + mod('rage'))); fistAnim(RPG.combo); const fast = bOn(me.peer, 'berserk') || bOn(me.peer, 'apex'); cds.basic = now() + (RPG.combo === 3 ? .55 : .34)*(fast ? .75 : 1); }
  else if (c === 'celest') { if (RPG.fly > T) { data.orb = 1; cds.basic = now() + .45; } else data.beam = RPG.beamTg; } }
function rpgBasicCast(data, caster, mine, el, col){ const o = data.o, d = data.d;
  if (fin(data.mel)) { const st = clamp(data.mel, 1, 3), dmg = [10, 15, 28][st - 1]*(fin(data.bm) ? clamp(data.bm, .5, 3) : 1), apex = bOn(caster, 'apex'), dl = Math.hypot(d[0], d[2]) || 1, ux = d[0]/dl, uz = d[2]/dl, fx_ = o[0] + ux*1.8, fz = o[2] + uz*1.8;
    if (!mine) { const oc = others.get(caster); if (oc && oc.g.userData.cast) oc.g.userData.cast(); }
    sndAt(st === 3 ? 'punch3' : 'punch', o[0], o[2]); puff(fx_, o[1] - .3, fz, st === 3 ? '#ffb07a' : '#ffe0c0', st === 3 ? 14 : 5, st === 3 ? 6 : 3, .4, .3, 1);
    if (st === 3 || apex) { shockwave(fx_, groundH(fx_, fz) + .2, fz, st === 3 ? 3 : 2.2, '#ff8a5a', .4); if (mine) shake = Math.max(shake, .12); }
    if (st === 3 && modOf(caster, 'seis')) { fissureFx(o[0], o[2], ux, uz, 7); if (isHost) for (const m of [...mons.values()]) { const rx = m.x - o[0], rz = m.z - o[2], al = rx*ux + rz*uz, sd = Math.abs(-rx*uz + rz*ux); if (al > 2 && al < 7 && sd < 1.6 + MT[m.type].r) hurt(m, 30, {el:'phys', sn:'Rune sismique', rx:1}, ux, uz, caster); } }
    if (isHost) { const cone = [...mons.values()].filter(m => { const rx = m.x - o[0], rz = m.z - o[2], dd = Math.hypot(rx, rz) || 1; return dd < 3.4 + MT[m.type].r && (rx*ux + rz*uz)/dd > .45; }).sort((a, b) => Math.hypot(a.x - o[0], a.z - o[2]) - Math.hypot(b.x - o[0], b.z - o[2])).slice(0, st === 3 ? 3 : 2);
      for (const m of [...mons.values()]) { const rx = m.x - o[0], rz = m.z - o[2], dd = Math.hypot(rx, rz) || 1, r = MT[m.type].r; const inCone = cone.includes(m), inWave = !inCone && (st === 3 || apex) && Math.hypot(m.x - fx_, m.z - fz) < (st === 3 ? 3 : 2.2) + r;
        if (inCone || inWave) { hurt(m, inCone ? dmg : dmg*.35, {el:'phys', sn:'Poings', rx:1, push:st === 3 ? 3 : .6}, rx/dd, rz/dd, caster); if (st === 3 && mons.has(m.id) && !MT[m.type].boss && !MT[m.type].head) m.stunT = Math.max(m.stunT || 0, T + .4); } } }
    return true; }
  if (data.orb === 1) { const sp = {n:'Orbe sacré', dmg:CL.celest.spells[4].dmg*(fin(data.bm) ? clamp(data.bm, .5, 3) : 1), spd:46, size:.85, splash:4.5}; spawnProj({x:o[0], y:o[1], z:o[2], v:new THREE.Vector3(d[0], d[1], d[2]).normalize().multiplyScalar(sp.spd), sp, col:'#ffe9a8', owner:caster, fxd:{el:'spirit', sn:'Orbe sacré'}, el:'spirit'}); sfx('zap', .5); return true; }
  if (data.beam != null) { const b = data.beam, from = isMe(caster) ? staffTipPos() : rpgCasterPos(caster, o);
    if (typeof b === 'number') { const m = mons.get(b); if (m) { const to = new THREE.Vector3(m.x, (m.gy || 0) + MT[m.type].h*.6, m.z); beamFx(from, to, '#c8ff9a', '#ff6a8a'); if (isHost) hurt(m, 7*(1 + modOf(caster, 'drain')), {el:'spirit', sn:'Drain vital', rx:1}, 0, 0, caster); if (mine) { heal(2.2*(1 + mod('heal'))); graceAdd(2); } } }
    else if (typeof b === 'string' && /^[gn]:\d+$/.test(b)) synBeam(b, caster, mine, from);
    else if (typeof b === 'string' && b.startsWith('p:')) { const p = b.slice(2), to = p === me.peer ? new THREE.Vector3(me.x, me.y - .5, me.z) : (() => { const ot = others.get(p); return ot ? ot.g.position.clone().add(new THREE.Vector3(0, 1.2, 0)) : null; })();
      if (to) beamFx(from, to, '#fff2b0', '#ffe9a8'); if (p === me.peer && !me.dead) heal(3.5*(1 + modOf(caster, 'heal'))); if (mine) graceAdd(3.5); }
    return true; }
  return false; }
function staffTipPos(){ const v = new THREE.Vector3(.25, -.25, -1).applyQuaternion(camera.quaternion); return camera.position.clone().add(v); }
function rpgCasterPos(c, o){ if (isMe(c)) return new THREE.Vector3(me.x, me.y - .4, me.z); const ot = others.get(c); return ot ? ot.g.position.clone().add(new THREE.Vector3(0, 1.5, 0)) : new THREE.Vector3(o[0], o[1], o[2]); }
function beamFx(a, b, c1, c2){ lightning([a, b], c1, .28, .05, .02); puff(b.x, b.y, b.z, c2, 2, 1.5, .3, .3, 1); }
function aimAlly(maxD){ let best = null, bd = 1e9; const d = aimDir(); for (const [p, o] of others) { const v = o.g.position.clone().add(new THREE.Vector3(0, 1.1, 0)).sub(camera.position), L = v.length(); if (L > (maxD || 25)) continue; const dot = v.dot(d)/L; if (dot > .96 && L < bd) { bd = L; best = p; } } return best; }
function graceAdd(n){ if (me.cls !== 'celest') return; n *= 1 + mod('grace'); const was = RPG.grace >= 100; RPG.grace = Math.min(100, RPG.grace + n); if (!was && RPG.grace >= 100) { qPop('Grâce céleste prête !', '#ffe9a8'); sfxChime(); } }
/* ---- sorts ---- */
function rpgCast2(data, caster, mine, sp, el, col, t, dmg, pot, big){ const du = fin(data.du) ? clamp(data.du, .5, 3) : 1, o = data.o, B = buffOf(caster), d = data.d, dl = Math.hypot(d[0], d[2]) || 1, ux = d[0]/dl, uz = d[2]/dl;
  if (mine && me.cls === 'celest' && RPG.grace >= 100 && sp.act !== 'ascend') { RPG.grace = 0; pot *= 1.5; big *= 1.25; qPop('Grâce céleste : sort renforcé', '#ffe9a8'); }
  if (sp.act === 'leap') { let tx = t[0], tz = t[1]; const dd = Math.hypot(tx - o[0], tz - o[2]); if (dd > 18) { tx = o[0] + (tx - o[0])/dd*18; tz = o[2] + (tz - o[2])/dd*18; } if (walkH(tx, tz) > 50) { tx = o[0]; tz = o[2]; }
    if (mine) RPG.leap = {x0:me.x, z0:me.z, x1:tx, z1:tz, t0:T, dur:.65}; allyJumpFx(tx, tz, sp.r);
    fx.push({delay:.65, run:() => { allySlamFx(tx, tz, sp.r*big); runeBurst(tx, tz, '#ff7a3a'); if (isHost) for (const m of [...mons.values()]) { const dm = Math.hypot(m.x - tx, m.z - tz); if (dm < sp.r*big + MT[m.type].r) { hurt(m, dmg, {el:'phys', sn:sp.n, push:3, rx:1}, (m.x - tx)/(dm || 1), (m.z - tz)/(dm || 1), caster); if (mons.has(m.id)) m.stunT = Math.max(m.stunT || 0, T + (MT[m.type].boss || MT[m.type].head ? .4 : 1.5)); } } }}); }
  else if (sp.act === 'seismic') { const L = sp.len*big, Wd = sp.w; fissureFx(o[0], o[2], ux, uz, L); if (isHost) fx.push({delay:.2, run:() => { for (const m of [...mons.values()]) { const rx = m.x - o[0], rz = m.z - o[2], al = rx*ux + rz*uz, sd = Math.abs(-rx*uz + rz*ux); if (al > 0 && al < L && sd < Wd/2 + MT[m.type].r) { const wet = m.wetT > T; hurt(m, dmg, {el:'phys', sn:sp.n, push:2, rx:1}, ux, uz, caster); if (wet && mons.has(m.id)) { hurt(m, 30, {el:'storm', sn:'Électrocution', rx:1}, 0, 0, caster); W.hits.push(['arc', r2(o[0]), r2(o[2]), r2(m.x), r2(m.z)]); arcFx(o[0], o[2], m.x, m.z); } if (mons.has(m.id) && !MT[m.type].boss && !MT[m.type].head) m.stunT = Math.max(m.stunT || 0, T + .8); } } }}); }
  if (['circle', 'shield', 'rez', 'ascend'].includes(sp.act)) sndAt('choir', o[0], o[2]); if (['blood', 'berserk', 'apex'].includes(sp.act)) sndAt('rune', o[0], o[2]);
  if (0) {} else if (sp.act === 'blood') { B.blood = T + 12*big*du; runeBurst(o[0], o[2], '#ff2a3a'); }
  else if (sp.act === 'berserk') { B.berserk = T + 12*big*du; runeBurst(o[0], o[2], '#ff3a1a'); if (mine) { banner('Berserker !', '+50 % de dégâts'); } }
  else if (sp.act === 'apex') { B.apex = T + 15*big*du; runeBurst(o[0], o[2], '#ffb03a'); if (mine) { me.mp = me.maxMp; banner('Apogée du gladiateur !', 'Toutes les runes s\'embrasent'); shake = Math.max(shake, .3); } }
  else if (sp.act === 'circle') { const R = sp.r*big, dur = 8*big; let cx = t[0], cz = t[1]; const dd = Math.hypot(cx - o[0], cz - o[2]); if (dd > 12) { cx = o[0] + (cx - o[0])/dd*12; cz = o[2] + (cz - o[2])/dd*12; } circleFx(cx, cz, R, dur); RPG.circles = RPG.circles || []; RPG.circles.push({t0:T, dur, x:cx, z:cz, R, pot:pot*(1 + modOf(caster, 'heal')), mine}); }
  else if (sp.act === 'shield') { const tg = typeof data.tg === 'string' ? data.tg : pk_(caster), tgMe = tg === me.peer || (tg === 'me' && isMe(caster)); buffOf(tg).shield = T + 8; if (tgMe) { RPG.shield = 45*pot*(1 + modOf(caster, 'shield')); RPG.shieldT = T + 8; qPop('Bouclier divin', '#ffe9a8'); } shieldFx(tg); }
  else if (sp.act === 'rez') { if (typeof data.rez === 'string') { if (data.rez === me.peer && me.dead) riseMe(); const ot = others.get(data.rez); if (ot) { puff(ot.g.position.x, 1, ot.g.position.z, '#ffe9a8', 40, 5, 1, 1, 3); flash(ot.g.position.x, 3, ot.g.position.z, '#ffe9a8', 8, .6); } } else if (mine) { RPG.second = T + 40; toast('Second souffle : la prochaine blessure mortelle (40 s) vous laissera à 50 % de vie'); } runeBurst(o[0], o[2], '#ffe9a8'); }
  else if (sp.act === 'drain') { const id = Array.isArray(data.ids) && typeof data.ids[0] === 'number' ? data.ids[0] : null; if (id == null) { if (mine) toast('Life Drain : visez un ennemi'); return; }
    rpgZone({dur:4, every:.5, upd:() => { const m = mons.get(id); if (m && Math.random() < .5) beamFx(isMe(caster) ? staffTipPos() : rpgCasterPos(caster, o), new THREE.Vector3(m.x, (m.gy || 0) + MT[m.type].h*.6, m.z), '#9aff7a', '#ff4a6a'); },
      tick:() => { const m = mons.get(id); if (!m) return; hurt(m, dmg, {el:'spirit', sn:sp.n, rx:1}, 0, 0, caster); const h = dmg*.6*(1 + modOf(caster, 'heal')); if (isMe(caster)) { heal(h); graceAdd(h); } else W.hits.push(['heal', caster, Math.round(h)]); }}); }
  else if (sp.act === 'ascend') { const fd = modOf(caster, 'u_asc') ? 15 : 10; B.ascend = T + fd; if (mine) { RPG.fly = T + fd; banner('Ascension !', 'Clic gauche : orbes sacrés'); } runeBurst(o[0], o[2], '#fff2b0');
    fx.push({delay:fd, run:() => { const p = rpgCasterPos(caster, o); circleFx(p.x, p.z, 6, 1.2); if (Math.hypot(me.x - p.x, me.z - p.z) < 7 && !me.dead) heal(20); }}); }
  else if (typeof necroCast === 'function') necroCast(data, caster, mine, sp, t, dmg, pot, big); }
/* ---- soins des cercles de vie (chaque joueur se soigne lui-même) ---- */
function circlesTick(dt){ const L = RPG.circles || []; for (let i = L.length - 1; i >= 0; i--) { const c = L[i]; if (T > c.t0 + c.dur) { L.splice(i, 1); continue; } synHealSummons(c.x, c.z, c.R, 6*c.pot*dt); if (!me.dead && Math.hypot(me.x - c.x, me.z - c.z) < c.R) { const h = 6*c.pot*dt; heal(h); if (c.mine) graceAdd(h); } } }
/* ---- coups reçus (hôte) : multiplicateurs du gladiateur, vampirisme ---- */
function rpgHurt2(m, dmg, f, by){ const B = RPG.buff[pk_(by)] || {}; if (B.berserk > T) dmg *= 1.5; if (B.apex > T) dmg *= 1.25; const ls = (B.blood > T ? .25 : 0) + (f && !f.aid && !f.nid ? modOf(by, 'ls') : 0);
  if (ls > 0 && dmg > 0) { const h = Math.min(dmg, Math.max(0, m.hp))*ls; if (h > .5) { if (isMe(by)) heal(h); else W.hits.push(['heal', by, Math.round(h)]); } } return dmg; }
/* ---- effets ---- */
function runeBurst(x, z, col){ const y = groundH(x, z); shockwave(x, y + .2, z, 3, col, .6); for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({map:RUNE_TX[i % RUNE_TX.length], color:new THREE.Color(col), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending})); s.scale.setScalar(.7); scene.add(s); const a = i/8*6.28;
    fx.push({t:0, dur:1, upd:k => { s.position.set(x + Math.cos(a + k*3)*(1 + k*1.5), y + .5 + k*2.5, z + Math.sin(a + k*3)*(1 + k*1.5)); s.material.opacity = 1 - k; }, end:() => scene.remove(s)}); } flash(x, y + 1.5, z, col, 5, .4); }
function fissureFx(x0, z0, ux, uz, L){ const m = new THREE.MeshBasicMaterial({color:0xff5a1a, transparent:true, opacity:.9, depthWrite:false, blending:THREE.AdditiveBlending, fog:false}), segs = [];
  for (let d = 1, i = 0; d < L; d += 1.1, i++) { const off = Math.sin(i*1.7)*.35, x = x0 + ux*d - uz*off, z = z0 + uz*d + ux*off, s = new THREE.Mesh(geo('fisSeg', () => new THREE.PlaneGeometry(.22, 1.3).rotateX(-Math.PI/2)), m); s.position.set(x, groundH(x, z) + .08, z); s.rotation.y = Math.atan2(ux, uz) + off*.6; scene.add(s); segs.push(s);
    fx.push({delay:d*.018, run:() => { puff(x, groundH(x, z) + .3, z, '#7a6a5a', 6, 4, .6, .7, 3); puff(x, groundH(x, z) + .2, z, '#ff7a2a', 2, 2, .4, .4, 2); decal(x, z, 1.1, 'scorch', 5); }}); }
  fx.push({t:0, dur:4, upd:k => { m.opacity = .9*(1 - k); }, end:() => { segs.forEach(s => scene.remove(s)); m.dispose(); }}); shake = Math.max(shake, Math.hypot(me.x - x0, me.z - z0) < 15 ? .25 : 0); sfx('boom', .8); }
function circleFx(x, z, R, dur){ const y = groundH(x, z) + .1, mt = new THREE.MeshBasicMaterial({color:0xffe9a8, transparent:true, opacity:.6, depthWrite:false, blending:THREE.AdditiveBlending, fog:false, side:THREE.DoubleSide}), ring = new THREE.Mesh(geo('ccRing', () => new THREE.RingGeometry(.94, 1, 64).rotateX(-Math.PI/2)), mt); ring.scale.setScalar(R); ring.position.set(x, y + .05, z); scene.add(ring);
  const fill = new THREE.Mesh(geo('ccFill', () => new THREE.CircleGeometry(1, 48).rotateX(-Math.PI/2)), new THREE.MeshBasicMaterial({color:0xfff0b0, transparent:true, opacity:.12, depthWrite:false, blending:THREE.AdditiveBlending, fog:false})); fill.scale.setScalar(R); fill.position.set(x, y + .03, z); scene.add(fill);
  const col = new THREE.Mesh(geo('ccCol', () => new THREE.CylinderGeometry(1, 1, 7, 32, 1, true)), new THREE.MeshBasicMaterial({color:0xffe9a8, transparent:true, opacity:.06, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide})); col.scale.set(R, 1, R); col.position.set(x, y + 3.5, z); scene.add(col);
  rpgZone({dur, upd:(dt, k) => { const f = k > .9 ? (1 - k)*10 : Math.min(1, k*10); mt.opacity = .6*f; fill.material.opacity = .12*f; col.material.opacity = .06*f; ring.rotation.y += dt*.4; if (Math.random() < .7) { const a = Math.random()*6.28, d = Math.random()*R; puff(x + Math.cos(a)*d, y + .2, z + Math.sin(a)*d, '#ffe9a8', 1, 1.2, .3, 1.2, 3); } }, end:() => { scene.remove(ring); scene.remove(fill); scene.remove(col); }}); }
function shieldFx(tg){ const p = tg === me.peer || (tg === 'me') ? new THREE.Vector3(me.x, me.y - 1, me.z) : (() => { const o = others.get(tg); return o ? o.g.position.clone().add(new THREE.Vector3(0, 1, 0)) : null; })(); if (!p) return; puff(p.x, p.y, p.z, '#ffe9a8', 30, 4, .7, .8, 2); flash(p.x, p.y + 1, p.z, '#ffe9a8', 5, .4); }
/* ---- vue à la première personne : poings du gladiateur, ailes du céleste ---- */
let FIST = null, WINGS = null;
function fistBuild(){ const g = new THREE.Group(), lm = new THREE.MeshBasicMaterial({color:0x4a3022, map:DET.leather && DET.leather.map || null}), mm = new THREE.MeshBasicMaterial({color:0x6a6a74, map:typeof gladTex === 'function' ? gladTex().metal : null}), rm = new THREE.MeshBasicMaterial({color:0xff7a3a});
  const mk = s => { const f = new THREE.Group(); const arm = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .5, 8).rotateX(Math.PI/2), lm); arm.position.z = .28; f.add(arm); const fist = new THREE.Mesh(new THREE.BoxGeometry(.17, .14, .18), mm); f.add(fist);
    for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.BoxGeometry(.035, .03, .04), mm); k.position.set(-.06 + i*.04, .06, -.09); f.add(k); } const rune = new THREE.Mesh(new THREE.TorusGeometry(.095, .012, 6, 20), rm); rune.position.z = .14; f.add(rune); f.userData = {rune, base:new THREE.Vector3(s < 0 ? -.26 : .1, -.27, -.66), s}; f.position.copy(f.userData.base); f.scale.setScalar(.85); f.rotation.x = .25; g.add(f); return f; };
  g.userData = {L:mk(-1), R:mk(1), rm, t:0, side:1}; return g; }
function fistAnim(st){ if (!FIST) return; FIST.userData.t = .22; FIST.userData.side = st === 2 ? -1 : 1; FIST.userData.st = st; }
function wingsBuild(){ const g = new THREE.Group(), mt = new THREE.MeshBasicMaterial({color:0xfff2c0, transparent:true, opacity:.55, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false});
  const shape = () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(.6, .55, 1.6, .7); for (let i = 0; i < 6; i++) { sh.lineTo(1.55 - i*.25, .35 - i*.07); sh.lineTo(1.4 - i*.25, .5 - i*.09); } sh.lineTo(0, -.15); return new THREE.ShapeGeometry(sh); };
  for (const s of [-1, 1]) { const w = new THREE.Mesh(shape(), mt); w.scale.set(s, 1, 1); w.position.set(s*.35, -.2, .15); w.userData.s = s; g.add(w); } return g; }
function othersWings(){ for (const [p, o] of others) { const on = bOn(p, 'ascend'); if (on && !o.wings) { o.wings = wingsBuild(); o.wings.scale.setScalar(1.6); o.wings.position.set(0, 1.6, .2); o.g.add(o.wings); } if (o.wings) { o.wings.visible = on; o.wings.children.forEach(w => { w.rotation.y = w.userData.s*(.3 + Math.sin(T*7)*.4); }); } if (on) o.g.position.y = groundH(o.g.position.x, o.g.position.z) + 12; } }
function fpTick(dt){ const glad = playing && me.cls === 'glad';
  if (glad && !FIST) { FIST = fistBuild(); camera.add(FIST); } if (FIST) { FIST.visible = glad && !me.dead; const U = FIST.userData; U.t = Math.max(0, U.t - dt); const k = U.t > 0 ? Math.sin((1 - U.t/.22)*Math.PI) : 0;
    for (const f of [U.L, U.R]) { const act = (U.side > 0) === (f.userData.s > 0); f.position.copy(f.userData.base); f.position.y += Math.sin(T*2 + f.userData.s)*.008; if (act && k > 0) { f.position.z -= k*(U.st === 3 ? .45 : .32); f.position.x -= f.userData.s*k*.12; f.position.y += k*(U.st === 3 ? .1 : .04); } }
    const c = bOn(me.peer, 'apex') ? 0xffd04a : bOn(me.peer, 'berserk') ? 0xff1a1a : bOn(me.peer, 'blood') ? 0xc0102a : 0xff7a3a; U.rm.color.setHex(c); }
  const fly = RPG.fly > T; if (fly && !WINGS) { WINGS = wingsBuild(); WINGS.position.set(0, .05, .25); camera.add(WINGS); } if (WINGS) { WINGS.visible = fly; WINGS.children.forEach(w => { w.rotation.y = w.userData.s*(.9 + Math.sin(T*6)*.25); w.rotation.z = w.userData.s*-.3; }); }
  othersWings();
  let v = $('#rpgvig'); if (!v) { v = document.createElement('div'); v.id = 'rpgvig'; v.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;transition:box-shadow .4s'; document.body.appendChild(v); }
  const bz = playing && bOn(me.peer, 'berserk'), ap = playing && bOn(me.peer, 'apex'); v.style.boxShadow = bz ? 'inset 0 0 160px rgba(255,20,10,.55)' : ap ? 'inset 0 0 140px rgba(255,190,60,.45)' : fly ? 'inset 0 0 120px rgba(255,240,180,.35)' : 'none'; }
/* ---- interface de classe (Rage, Grâce, Second souffle, bouclier) ---- */
function classUI(){ let e = $('#clsui'); if (!e) { e = document.createElement('div'); e.id = 'clsui'; e.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:96px;text-align:center;font:14px Georgia,serif;color:#ffe9c8;z-index:12;pointer-events:none;text-shadow:0 1px 3px #000'; document.body.appendChild(e); }
  if (!playing) { e.textContent = ''; return; } const parts = [], B = buffOf(me.peer);
  if (me.cls === 'glad') { for (const [k, n] of [['blood', 'Rune de sang'], ['berserk', 'Berserker'], ['apex', 'Apogée']]) if (B[k] > T) parts.push(n + ' ' + Math.ceil(B[k] - T) + ' s'); if (me.hp < .3*rpgMaxHp() && !(B.berserk > T) && (cds['glad:3'] || 0) < now()) parts.push('<b style="color:#ff5a3a">Berserker disponible !</b>'); }
  if (me.cls === 'celest') { parts.push('Grâce céleste ' + Math.floor(RPG.grace) + ' %' + (RPG.grace >= 100 ? ' : prochain sort renforcé' : '')); if (RPG.second > T) parts.push('Second souffle ' + Math.ceil(RPG.second - T) + ' s'); if (RPG.fly > T) parts.push('<b>Ascension ' + Math.ceil(RPG.fly - T) + ' s</b>'); }
  if (RPG.shield > 0 && RPG.shieldT > T) parts.push('Bouclier divin ' + Math.ceil(RPG.shield));
  if (typeof grandOwned === 'function' && grandOwned(me.cls)) parts.push(CGRS.step ? 'Grande incantation ' + CGRS.step + '/3 : « ' + CGRAND[me.cls].steps[CGRS.step] + ' »' : CGRS.cd > now() ? 'Grande incantation ' + Math.ceil(CGRS.cd - now()) + ' s' : 'Grande incantation prête : « ' + CGRAND[me.cls].steps[0] + ' »');
  const h = parts.join('<br>'); if (e.innerHTML !== h) e.innerHTML = h;
  if (me.cls === 'glad') { const b = $('#mpb'); if (b) b.style.background = 'linear-gradient(#ff9a6a,#c8281a 45%,#4a0a06)'; } else { const b = $('#mpb'); if (b && b.style.background) b.style.background = ''; } }
/* ---- tick ---- */
function rpgTick2(dt){ if (typeof polishTick === 'function') polishTick(dt); if (playing && !me.dead && rpgCls() && mod('hreg')) me.hp = Math.min(rpgMaxHp(), me.hp + mod('hreg')*dt); if (typeof rpgProgTick === 'function') rpgProgTick(); fpTick(dt); circlesTick(dt); classUI(); if (typeof minTick === 'function') minTick(dt);
  if (playing && me.cls === 'celest' && RPG.hold && !me.dead && RPG.fly <= T && T > RPG.beamT) { RPG.beamT = T + .25; const ally = aimAlly(25), sm = ally ? null : aimSummon(); if (ally) RPG.beamTg = 'p:' + ally; else if (sm) RPG.beamTg = sm; else { const o = camera.position, ids = chainTargets(o, aimDir(), 1); RPG.beamTg = typeof ids[0] === 'number' ? ids[0] : null; }
    if (RPG.beamTg != null) castOut('basic'); else { heal(.6); graceAdd(.3); puff(me.x, me.y - .5, me.z, '#ffe9a8', 1, 1, .3, .6, 2); } }
  if (playing && me.cls === 'celest' && RPG.hold && RPG.fly > T && (cds.basic || 0) < now()) { castOut('basic'); }
  if (RPG.leap && T > RPG.leap.t0 + RPG.leap.dur + .05) RPG.leap = null; }
/* ---- déplacement vertical : saut du gladiateur, vol du céleste (appelé dans la physique du joueur) ---- */
function rpgVert(ny, gh, dt){ const L = RPG.leap; if (L) { const k = Math.min(1, (T - L.t0)/L.dur); me.x = L.x0 + (L.x1 - L.x0)*k; me.z = L.z0 + (L.z1 - L.z0)*k; me.vy = 0; me.onG = false; return Math.max(walkH(me.x, me.z) < 50 ? walkH(me.x, me.z) : gh, gh) + 1.7 + Math.sin(Math.PI*k)*5; }
  if (RPG.fly > T) { me.vy = 0; me.onG = false; return me.y + ((gh + 14) - me.y)*Math.min(1, dt*2.5); } return ny; }
function rpgMouse(e){ if (e.button !== 0) return; if (e.type === 'mouseup') { RPG.hold = 0; return; } }
addEventListener('mouseup', rpgMouse);
function rpgClick2(){ if (playing && me.cls === 'celest' && !me.dead) { RPG.hold = 1; if (RPG.fly > T) return false; RPG.beamT = 0; return true; } return false; }
