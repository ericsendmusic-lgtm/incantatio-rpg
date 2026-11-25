# Incantatio RPG

Arène de magie vocale à cinq classes, construite sur Incantatio Arena. Le clic gauche lance l'attaque de base de la classe ; la voix lance les sorts, en criant leur formule en anglais.

**Jouer :** https://ericsendmusic-lgtm.github.io/incantatio-rpg/

## Classes

| Classe | Rôle | Formules | État |
|---|---|---|---|
| Mage élémentaire | Dégâts de zone, réactions | Fire Dragon · Water Triangle · Ice Prison · Tempest · ★ Elemental Apocalypse | jouable |
| Mage invocateur | Golem gardien | Rise Guardian · Titan Fist · Spirit Armor · Guardian Rage · Titanic Leap · ★ Ancestral Colossus | jouable |
| Mage céleste | Soins, drain, vol | Circle of Life · Divine Shield · Resurrection · Life Drain · ★ Ascension | jouable |
| Gladiateur runique | Corps à corps, runes, Rage | Gladiator Leap · Seismic Fist · Blood Rune · Berserker · ★ Gladiator Apex | jouable |
| Nécromancien | Armée d'âmes | — | en préparation |

## Organisation du code

- `tools/base.html` : le moteur d'Incantatio Arena (rendu, voix, réseau, vagues, boss, guide…).
- `src/*.js` : les modules RPG (classes, sorts, invocations, progression), insérés dans l'ordre de leur nom.
- `tools/build.py` : assemble `index.html` à partir de la base, des modules et des points d'accroche listés dans le script. Lancer `python3 tools/build.py` après chaque modification.
- `tex/`, `vosk/` : textures et modèle de reconnaissance vocale.
