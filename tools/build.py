#!/usr/bin/env python3
"""Construit index.html : tools/base.html (le jeu Incantatio Arena) + les modules src/*.js + les points d'accroche ci-dessous."""
import glob, os, sys
VERSION = 'v0.1 · 25/11'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(ROOT, 'tools/base.html')).read(); MISS = []; N = [0]
def R(a, b, n=1):
    global s
    if s.count(a) != n: MISS.append(str(s.count(a)) + ' × ' + a[:90]); return
    s = s.replace(a, b); N[0] += 1
ANCHOR = "/* ===================== ARÈNE VIVANTE : biomes, transformations"
mods = ''.join(open(f).read() + '\n' for f in sorted(glob.glob(os.path.join(ROOT, 'src/*.js'))))
R(ANCHOR, mods + ANCHOR)
# --- points d'accroche dans le moteur existant ---
R("({fire:'fire', storm:'storm', ice:'ice', spirit:'spirit', shadow:'shadow', summon:'spirit'})[cls] || 'arcane';", "((spellOf(sid) || {}).el || ({fire:'fire', storm:'storm', ice:'ice', spirit:'spirit', shadow:'shadow', summon:'spirit'})[cls] || (CL[cls] && CL[cls].el) || 'arcane');")
R("function castOut(id){", "function castOut(id){ if (rpgPre(id)) return;")
R("allyOut(id, data);", "allyOut(id, data); rpgData(id, data);")
R("el = ELEM(data.s, cls);", "el = data.s === 'basic' && ELC[data.bel] ? data.bel : ELEM(data.s, cls);")
R("data.s === 'basic' ? (data.sb === 1 ? '#8fd8ff' : '#f3ead2')", "data.s === 'basic' ? (data.sb === 1 ? '#8fd8ff' : ELC[data.bel] || '#f3ead2')")
R("if (sp.k === 'sum') { allyCast(data, caster, mine, sp); return; }", "if (sp.k === 'sum') { allyCast(data, caster, mine, sp); return; } if (sp.k === 'rpg') { rpgCast(data, caster, mine, sp, el, col); return; }")
R("if (e.button === 0 && !me.dead && !hasB('mains')", "if (e.button === 0 && rpgClick()) return; if (e.button === 0 && !me.dead && !hasB('mains')")
R("function hurt(m, dmg, f, px, pz, by){", "function hurt(m, dmg, f, px, pz, by){ dmg = rpgHurt(m, dmg, f, by);")
R("rxFx(key, x, z, by); W.hits.push(['rx', key, r2(x), r2(z), by || '']);\n  switch (key) {", "rxFx(key, x, z, by); W.hits.push(['rx', key, r2(x), r2(z), by || '']); if (rpgReact(key, m, x, z, by, k)) return;\n  switch (key) {")
R("gpHit(h); allyHit(h);", "gpHit(h); allyHit(h); rpgHit(h);")
R("function gpTick(dt){ allyTick(dt);", "function gpTick(dt){ allyTick(dt); rpgTick(dt);")
R("pickInc(known[0]); } renderBook();", "pickInc(known[0]); rpgStartKnown(); } renderBook();")
R("let pickCls = 'fire'", "let pickCls = 'elem'")
R("const me = {pwT:0, cls:'fire',", "const me = {pwT:0, cls:'elem',")
R("else if (act === 'smash') {", "else if (act === 'fist') rpgFist(g, sp, pot, caster); else if (act === 'smash') {")
R("else if (act === 'titan') g.titanT = T + 20*dur;", "else if (act === 'titan') { g.titanT = T + 20*dur; g.hp = Math.min(g.max*1.5, g.hp + g.max*.5); }")
R("sum:(SUM_D[sp.act] || 'Gardien')}", "sum:(SUM_D[sp.act] || 'Gardien'),rpg:(sp.d || '')}")
R("  $('#classes').innerHTML = Object.entries(CL).map(([k, c]) => `<button class=\"cls\" data-c=\"${k}\" style=\"--c:${c.col}\" aria-pressed=\"${k === pickCls}\" title=", "  if (0) $('#classes').innerHTML = Object.entries(CL).map(([k, c]) => `<button class=\"cls\" data-c=\"${k}\" style=\"--c:${c.col}\" aria-pressed=\"${k === pickCls}\" title=")
R("<title>Incantatio Arena</title>", "<title>Incantatio RPG</title>")
R("    <h1>Incantatio Arena</h1>", "    <h1>Incantatio RPG</h1>")
R("Choisissez votre école de magie, entrez dans l'arène et <b>criez vos incantations dans le micro</b> : vos coéquipiers vous entendent pour de vrai. Farmez monstres et boss pour récupérer des parchemins et débloquer de nouveaux sorts, en coop ou chacun pour soi.", "Choisissez l'une des cinq classes, entrez dans l'arène et <b>criez vos formules dans le micro</b> (en anglais) : le clic gauche lance votre attaque de base, la voix lance vos sorts. En coop ou chacun pour soi.")
R("v.textContent = 'Incantatio Arena ' + GAME_VER;", "v.textContent = 'Incantatio RPG ' + '" + VERSION + "';")
if MISS: print('POINTS D\'ACCROCHE MANQUANTS :'); [print('  ' + m) for m in MISS]; sys.exit(1)
open(os.path.join(ROOT, 'index.html'), 'w').write(s); print('index.html construit :', N[0], 'accroches,', len(glob.glob(os.path.join(ROOT, 'src/*.js'))), 'modules')
