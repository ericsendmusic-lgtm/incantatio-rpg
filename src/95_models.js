/* ===================== MODÈLES 3D ANIMÉS (KayKit, licence CC0) : personnages des 5 classes et squelettes =====================
   Chargés au démarrage depuis models/. Tant qu'un modèle n'est pas prêt, l'ancien modèle reste affiché, puis il est remplacé. */
const MDL = {list:{mage:'models/Mage.glb', barb:'models/Barbarian.glb', rogueH:'models/Rogue_Hooded.glb', knight:'models/Knight.glb', rogue:'models/Rogue.glb', skRogue:'models/Skeleton_Rogue.glb', skWar:'models/Skeleton_Warrior.glb', skMin:'models/Skeleton_Minion.glb',
  crossbow:'models/props/Skeleton_Crossbow.gltf', shield:'models/props/Skeleton_Shield_Large_A.gltf', blade:'models/props/Skeleton_Blade.gltf', skStaff:'models/props/Skeleton_Staff.gltf'}, g:{}, h:{}, err:{}};
const mdlReady = k => !!MDL.g[k];
(function mdlLoad(){ if (!THREE.GLTFLoader || !THREE.SkeletonUtils) { console.warn('GLTFLoader absent : modèles 3D désactivés'); return; } const L = new THREE.GLTFLoader();
  for (const [k, url] of Object.entries(MDL.list)) L.load(url, gl => { gl.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); const b = new THREE.Box3().setFromObject(gl.scene); MDL.h[k] = Math.max(.1, b.max.y - b.min.y); MDL.g[k] = gl; }, undefined, e => { MDL.err[k] = 1; console.warn('modèle ' + k + ' introuvable', e); }); })();
/* une instance animée : clone du squelette, matériaux teintés, actions par nom */
function mdlInst(k, opt){ opt = opt || {}; const G = MDL.g[k], root = THREE.SkeletonUtils.clone(G.scene), mixer = new THREE.AnimationMixer(root), clips = {}; for (const c of G.animations) clips[c.name] = c;
  const keep = opt.show ? new Set(opt.show) : null, hide = new Set(opt.hide || []);
  root.traverse(o => { if (o.isMesh || o.isSkinnedMesh) { if (hide.has(o.name) || (keep && !keep.has(o.name) && o.name !== '' && !/Body|Arm|Leg|Head|Eyes|Jaw|Skull/.test(o.name))) o.visible = false;
      const ms = (Array.isArray(o.material) ? o.material : [o.material]).map(m => { const c = m.clone(); if (opt.tint) c.color.multiply(new THREE.Color(opt.tint)); if (opt.em) { c.emissive = new THREE.Color(opt.em); c.emissiveIntensity = opt.ei || .25; } c.envMapIntensity = .5; return c; }); o.material = Array.isArray(o.material) ? ms : ms[0]; } });
  root.scale.setScalar((opt.h || 1.9)/(MDL.h[k] || 2)); root.rotation.y = opt.ry || 0;
  const I = {root, mixer, cur:null, curN:'', lock:0};
  I.play = (name, o2) => { o2 = o2 || {}; const c = clips[name]; if (!c) return; if (I.curN === name && !o2.restart) return; const a = mixer.clipAction(c); a.reset(); a.setEffectiveTimeScale(o2.speed || 1); if (o2.once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; I.lock = o2.hold ? 1e9 : c.duration/(o2.speed || 1)*.85; } else a.setLoop(THREE.LoopRepeat, Infinity);
    a.play(); if (I.cur && I.cur !== a) I.cur.crossFadeTo(a, o2.fade ?? .18, false); I.cur = a; I.curN = name; };
  I.attach = (bone, propKey, s, pos, rot) => { const b = root.getObjectByName(bone); if (!b || !mdlReady(propKey)) return null; const p = MDL.g[propKey].scene.clone(true); p.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); if (s) p.scale.setScalar(s); if (pos) p.position.set(...pos); if (rot) p.rotation.set(...rot); b.add(p); return p; };
  I.upd = dt => { I.lock = Math.max(0, I.lock - dt); mixer.update(dt); };
  return I; }
/* ---- joueurs des 5 classes ---- */
const CLS_MDL = {elem:{k:'mage', hide:['Spellbook', 'Spellbook_open', '1H_Wand'], tint:0xffffff},
  summon:{k:'rogue', hide:['Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Knife', 'Throwable'], tint:0xd0e4ff, staff:1},
  celest:{k:'knight', hide:['1H_Sword_Offhand', 'Badge_Shield', 'Rectangle_Shield', 'Round_Shield', 'Spike_Shield', '1H_Sword', '2H_Sword'], tint:0xfff4dc, em:0x6a5020, ei:.2},
  glad:{k:'barb', hide:['1H_Axe_Offhand', 'Barbarian_Round_Shield', '1H_Axe', '2H_Axe', 'Mug'], tint:0xffffff},
  necro:{k:'rogueH', hide:['Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Knife', 'Throwable'], tint:0x5a4c70, staff:1}};
function playerModel(cls, name){ const D = CLS_MDL[cls]; if (!D || !mdlReady(D.k)) return null; const g = new THREE.Group(), I = mdlInst(D.k, {hide:D.hide, tint:D.tint, em:D.em, ei:D.ei, h:1.95, ry:Math.PI}); g.add(I.root);
  if (D.staff) I.attach('handslot.r', 'skStaff', 1, [0, 0, 0], [0, 0, 0]);
  const col = new THREE.Color(CL[cls].col), lb = label(name, '#' + col.getHexString()); lb.position.y = 2.45; g.add(lb); g.userData.lb = lb;
  const S = {lx:null, lz:null, mv:0, hp:100, dead:false, side:0}; const glad = cls === 'glad', idle = glad ? 'Unarmed_Idle' : 'Idle';
  g.userData.model = I; I.play(idle);
  g.userData.cast = () => { if (S.dead) return; if (glad) { S.side ^= 1; I.play(S.side ? 'Unarmed_Melee_Attack_Punch_A' : 'Unarmed_Melee_Attack_Punch_B', {once:1, restart:1, speed:1.4, fade:.08}); } else I.play('Spellcast_Shoot', {once:1, restart:1, speed:1.3, fade:.1}); };
  g.userData.upd = (dt, o) => { if (S.lx === null) { S.lx = g.position.x; S.lz = g.position.z; } const sp = Math.hypot(g.position.x - S.lx, g.position.z - S.lz)/Math.max(dt, 1e-3); S.lx = g.position.x; S.lz = g.position.z; S.mv += (clamp(sp/5.5, 0, 1.6) - S.mv)*Math.min(1, dt*8);
    if (o.dead && !S.dead) { S.dead = true; I.play('Death_A', {once:1, hold:1, fade:.1}); } else if (!o.dead && S.dead) { S.dead = false; I.lock = 0; I.play(idle, {restart:1}); }
    if (!S.dead) { if (o.hp < S.hp - .5 && !I.lock) I.play('Hit_A', {once:1, restart:1, speed:1.4, fade:.08}); let fly = false; for (const [p, ot] of others) if (ot.g === g && bOn(p, 'ascend')) fly = true;
      if (!I.lock) I.play(fly ? 'Jump_Idle' : S.mv > .75 ? 'Running_A' : S.mv > .12 ? 'Walking_A' : idle); }
    S.hp = o.hp; I.upd(dt); g.visible = true; };
  scene.add(g); return g; }
/* ---- monstres squelettes ---- */
const MON_MDL = {6:{k:'skRogue', atk:'1H_Ranged_Shoot', prop:['handslot.r', 'crossbow']}, [MT_ARM]:{k:'skWar', atk:'1H_Melee_Attack_Chop', prop:['handslot.r', 'blade'], prop2:['handslot.l', 'shield']}};
function monModel(t){ const D = MON_MDL[t]; if (!D || !mdlReady(D.k)) return null; const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const I = mdlInst(D.k, {h:MT[t].h*1.05, ry:0}); body.add(I.root);
  if (D.prop) I.attach(D.prop[0], D.prop[1], 1); if (D.prop2) I.attach(D.prop2[0], D.prop2[1], 1);
  const b = bar3(); b.position.y = MT[t].h + .45; g.add(b); g.userData.bar = b; g.userData.body = body; g.userData.bs = 1; g.userData.noSquash = 1; g.userData.model = I; I.play('Idle');
  let lt = null; g.userData.anim = (tt, mv, atk, fl) => { const dt = lt === null ? .016 : clamp(tt - lt, 0, .1); lt = tt; if (atk > .9 && !I.lock) I.play(D.atk, {once:1, restart:1, speed:1.3, fade:.08}); else if (!I.lock) I.play(mv > .6 ? 'Running_A' : mv > .1 ? 'Walking_A' : 'Idle'); I.upd(dt); };
  scene.add(g); return g; }
/* ---- remplacement des anciens modèles dès que les nouveaux sont prêts ---- */
function mdlTick(){ for (const [p, o] of others) { if (!o.g || o.g.userData.model || !CLS_MDL[o.cls] || !mdlReady(CLS_MDL[o.cls].k)) continue; const old = o.g, ng = wizardMesh(o.cls, o.name); if (!ng || !ng.userData.model) continue; ng.position.copy(old.position); ng.rotation.copy(old.rotation); scene.remove(old); o.g = ng; } }
