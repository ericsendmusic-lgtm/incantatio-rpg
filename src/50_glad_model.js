/* ===================== MODÈLE DU GLADIATEUR RUNIQUE (vu par les autres joueurs) =====================
   Corps musclé, casque à crête, pagne de lanières, jambières, gros gantelets ; runes tatouées qui brillent (textures peintes en canvas). */
const GLADTX = {};
function gladTex(){ if (GLADTX.skin) return GLADTX;
  /* peau : dégradé, pores, et carte d'émission avec les runes tatouées */
  GLADTX.skin = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#b0785a'); gr.addColorStop(1, '#8a5a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${60 + Math.random()*40},${30 + Math.random()*20},${20},${Math.random()*.12})`; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
    g.strokeStyle = 'rgba(60,30,20,.35)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(40 + i*30, 0); g.quadraticCurveTo(60 + i*30, h/2, 40 + i*30, h); g.stroke(); } });
  GLADTX.rune = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 6; g.lineWidth = 5; g.lineCap = 'round';
    const glyph = (x, y, s) => { g.beginPath(); g.moveTo(x, y - s); g.lineTo(x, y + s); g.moveTo(x - s*.7, y - s*.4); g.lineTo(x + s*.7, y + s*.2); g.moveTo(x + s*.6, y - s*.8); g.lineTo(x - s*.4, y + s*.1); g.stroke(); };
    for (let i = 0; i < 4; i++) glyph(40 + i*58, 70, 18); for (let i = 0; i < 3; i++) glyph(70 + i*58, 170, 22); g.beginPath(); g.arc(w/2, 120, 34, 0, 6.28); g.stroke(); g.beginPath(); for (let i = 0; i < 6; i++) { const a = i/6*6.28; g.moveTo(w/2, 120); g.lineTo(w/2 + Math.cos(a)*34, 120 + Math.sin(a)*34); } g.stroke(); });
  /* cuir clouté et métal martelé */
  GLADTX.leather = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#4a2c1a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${Math.random()*.25})`; g.fillRect(Math.random()*w, Math.random()*h, 3, 1); } g.fillStyle = '#c8a050'; for (let y = 10; y < h; y += 28) for (let x = 10; x < w; x += 28) { g.beginPath(); g.arc(x, y, 3.2, 0, 6.28); g.fill(); } });
  GLADTX.metal = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#6a6a72'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { const v = 80 + Math.random()*90; g.fillStyle = `rgba(${v},${v},${v + 8},.35)`; g.beginPath(); g.arc(Math.random()*w, Math.random()*h, 2 + Math.random()*5, 0, 6.28); g.fill(); } g.strokeStyle = 'rgba(30,30,35,.6)'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8); });
  return GLADTX; }
function gladMesh(name){ const X = gladTex(), col = new THREE.Color(CL.glad.col), g = new THREE.Group(), body = new THREE.Group(); body.rotation.y = Math.PI; g.add(body);
  const skin = new THREE.MeshStandardMaterial({map:X.skin, roughness:.6, metalness:0, emissive:new THREE.Color(0xff5a1a), emissiveMap:X.rune, emissiveIntensity:1.1});
  const leath = new THREE.MeshStandardMaterial({map:X.leather, roughness:.8}), metal = new THREE.MeshStandardMaterial({map:X.metal, roughness:.35, metalness:.8, color:0xc8c0b0}), bronze = new THREE.MeshStandardMaterial({color:0xb8863a, roughness:.3, metalness:.9}), crest = new THREE.MeshStandardMaterial({color:0x9a1a14, roughness:.9});
  const glow = new THREE.MeshBasicMaterial({color:0xff6a2a});
  const M = (geo_, mt, x, y, z, p) => { const m = new THREE.Mesh(geo_, mt); m.position.set(x, y, z); m.castShadow = true; (p || body).add(m); return m; };
  /* jambes */
  const legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s*.14, .95, 0); body.add(hip); M(new THREE.CylinderGeometry(.11, .085, .48, 10).translate(0, -.24, 0), skin, 0, 0, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -.48; hip.add(knee); M(new THREE.CylinderGeometry(.085, .07, .44, 10).translate(0, -.22, 0), skin, 0, 0, 0, knee); M(new THREE.CylinderGeometry(.095, .08, .34, 10, 1, true).translate(0, -.24, .01), metal, 0, 0, 0, knee); M(new THREE.SphereGeometry(.06, 8, 6), bronze, 0, -.02, .07, knee);
    M(new THREE.BoxGeometry(.12, .06, .24), leath, 0, -.46, .05, knee); return {hip, knee}; });
  /* pagne de lanières et ceinture */
  M(new THREE.TorusGeometry(.2, .045, 8, 24).rotateX(Math.PI/2), bronze, 0, .98, 0); for (let i = 0; i < 12; i++) { const a = i/12*6.28; const st = M(new THREE.BoxGeometry(.07, .3, .02), leath, Math.sin(a)*.2, .82, Math.cos(a)*.2); st.rotation.y = a; st.rotation.x = -.08; }
  /* torse en V, abdominaux, pectoraux */
  const torso = M(new THREE.LatheGeometry([[.14, 0], [.2, .05], [.19, .2], [.23, .35], [.29, .48], [.31, .56], [.24, .62], [.1, .66]].map(([r, y]) => new THREE.Vector2(r, y)), 20), skin, 0, 1, 0); torso.scale.set(1, 1, .72);
  for (const s of [-1, 1]) { M(new THREE.SphereGeometry(.12, 12, 8).scale(1.1, .7, .55), skin, s*.11, 1.47, .13); for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(.045, 8, 6).scale(1.2, .9, .5), skin, s*.05, 1.32 - k*.09, .15); }
  /* épaulière de bronze et sangle en travers */
  const pad = M(new THREE.SphereGeometry(.16, 14, 10, 0, 6.28, 0, 1.4), bronze, -.32, 1.6, 0); pad.rotation.z = .4; for (let i = 0; i < 3; i++) { const p2 = M(new THREE.SphereGeometry(.16 - i*.02, 12, 8, 0, 6.28, 1.2, .5), bronze, -.35 - i*.03, 1.52 - i*.08, 0); p2.rotation.z = .5; }
  const strap = M(new THREE.BoxGeometry(.06, .75, .03), leath, .02, 1.33, .16); strap.rotation.z = .65;
  /* tête : casque à crête et grille */
  const head = new THREE.Group(); head.position.set(0, 1.78, 0); body.add(head); M(new THREE.SphereGeometry(.12, 14, 10), skin, 0, 0, 0, head);
  M(new THREE.SphereGeometry(.15, 16, 10, 0, 6.28, 0, 1.75), metal, 0, .01, 0, head); M(new THREE.TorusGeometry(.17, .025, 6, 24).rotateX(Math.PI/2), bronze, 0, -.06, 0, head);
  for (let i = 0; i < 5; i++) M(new THREE.BoxGeometry(.012, .13, .012), bronze, -.06 + i*.03, -.01, .14, head); for (let i = 0; i < 9; i++) { const f = M(new THREE.BoxGeometry(.03, .14 + Math.sin(i/8*Math.PI)*.08, .05), crest, 0, .2 + Math.sin(i/8*Math.PI)*.04, -.16 + i*.04, head); f.rotation.x = (i - 4)*.12; }
  const eyes = [-1, 1].map(s => M(new THREE.SphereGeometry(.018, 6, 4), glow, s*.04, .01, .12, head));
  /* bras et gros gantelets runiques */
  const arm = s => { const sh = new THREE.Group(); sh.position.set(s*.33, 1.56, 0); body.add(sh); M(new THREE.CylinderGeometry(.085, .075, .34, 10).translate(0, -.17, 0), skin, 0, 0, 0, sh);
    const el = new THREE.Group(); el.position.y = -.34; sh.add(el); M(new THREE.CylinderGeometry(.075, .07, .2, 10).translate(0, -.1, 0), skin, 0, 0, 0, el);
    const gaunt = new THREE.Group(); gaunt.position.y = -.2; el.add(gaunt); M(new THREE.CylinderGeometry(.1, .085, .22, 10).translate(0, -.1, 0), metal, 0, 0, 0, gaunt);
    const fist = M(new THREE.BoxGeometry(.17, .15, .17), metal, 0, -.29, 0, gaunt); for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(.03, .04, .045), bronze, -.06 + i*.04, -.33, .09, gaunt);
    const ring = M(new THREE.TorusGeometry(.105, .016, 6, 20).rotateX(Math.PI/2), glow, 0, -.12, 0, gaunt); return {sh, el, gaunt, ring, fist}; };
  const R = arm(-1), L = arm(1);
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex, color:0xff3a1a, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending})); aura.position.y = 1.1; aura.scale.setScalar(3); g.add(aura);
  g.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  const lb = label(name, '#' + col.getHexString()); lb.position.y = 2.25; g.add(lb); g.userData.lb = lb;
  const S = {mv:0, cast:0, hit:0, die:0, lx:null, lz:null, hp:100, ph:0, side:1};
  g.userData.cast = () => { S.cast = 1; S.side = -S.side; };
  g.userData.upd = (dt, o) => { if (S.lx === null) { S.lx = g.position.x; S.lz = g.position.z; } const sp = Math.hypot(g.position.x - S.lx, g.position.z - S.lz)/Math.max(dt, 1e-3); S.lx = g.position.x; S.lz = g.position.z;
    S.mv += (clamp(sp/5.5, 0, 1.6) - S.mv)*Math.min(1, dt*8); const mv = Math.min(1, S.mv); if (o.hp < S.hp - .5) S.hit = 1; S.hp = o.hp; S.cast = Math.max(0, S.cast - dt*3.5); S.hit = Math.max(0, S.hit - dt*4);
    if (o.dead) { S.die = Math.min(1.6, S.die + dt); g.visible = S.die < 1.5; } else { S.die = 0; g.visible = true; } const dk = Math.min(1, S.die/1.1);
    S.ph += dt*(7 + S.mv*4)*Math.min(1, S.mv*3); const st = Math.sin(S.ph), c = S.cast, pu = Math.sin(c*Math.PI), h = S.hit;
    legs.forEach((l, i) => { const p = i ? -st : st; l.hip.rotation.x = p*.6*mv; l.knee.rotation.x = Math.max(0, -p)*.8*mv + .05; });
    body.position.y = Math.abs(Math.cos(S.ph))*.05*mv - dk*.3; body.rotation.x = -mv*.1 + h*.25 - dk*1.4;
    /* garde haute, coups de poing alternés */
    const punchR = S.side > 0 ? pu : 0, punchL = S.side < 0 ? pu : 0;
    R.sh.rotation.set(-.4 - punchR*1.1 + st*.15*mv, 0, .18 - punchR*.15); R.el.rotation.x = -1.8 + punchR*1.75; L.sh.rotation.set(-.4 - punchL*1.1 - st*.15*mv, 0, -.18 + punchL*.15); L.el.rotation.x = -1.8 + punchL*1.75;
    head.rotation.set(h*.3, Math.sin(T*.6)*.15*(1 - mv), 0);
    const B = (() => { for (const [p, ot] of others) if (ot.g === g) return buffOf(p); return {}; })(), bz = B.berserk > T, ap = B.apex > T, bl = B.blood > T;
    const ec = ap ? 0xffc040 : bz ? 0xff1a0a : bl ? 0xc0102a : 0xff5a1a; skin.emissive.setHex(ec); skin.emissiveIntensity = .9 + Math.sin(T*3)*.25 + c*1.5 + (bz || ap ? 1 : 0); glow.color.setHex(ec); eyes.forEach(e => e.visible = !o.dead);
    aura.material.color.setHex(ec); aura.material.opacity = (bz || ap ? .35 : bl ? .2 : 0) + Math.sin(T*6)*.05*(bz || ap ? 1 : 0); };
  scene.add(g); return g; }
