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
| Nécromancien | Armée d'âmes | Harvest · Arise · Macabre Explosion · Army of the Damned · ★ King of the Dead | jouable |

## Progression

- **Pendant la partie** : on commence avec une formule (deux pour l'invocateur). Les autres se débloquent avec les parchemins et une révélation toutes les 3 vagues ; l'ultime à partir de la vague 6. L'autel des choix propose, après les vagues, des améliorations propres à la classe (commune, rare, épique dès la vague 4, légendaire dès la vague 8), cumulables jusqu'à une limite. Tout cela disparaît à la fin de la partie.
- **Permanente** : niveau 1 à 50 par classe (expérience des éliminations, plafonnée par vague, des vagues, des boss, des objectifs et des événements ; pas d'expérience après une commande de test). Un point de compétence par niveau, un arbre de 3 branches par classe, une spécialisation au niveau 7 et une deuxième au niveau 25, des paliers aux niveaux 3, 5, 10, 12, 15, 20, 30, 40 et 50. Touche K ou bouton « Arbre des compétences ». Réinitialisation de l'arbre hors partie, une fois par jour. Sauvegarde dans le navigateur.

## Organisation du code

- `tools/base.html` : le moteur d'Incantatio Arena (rendu, voix, réseau, vagues, boss, guide…).
- `src/*.js` : les modules RPG (classes, sorts, invocations, progression), insérés dans l'ordre de leur nom.
- `tools/build.py` : assemble `index.html` à partir de la base, des modules et des points d'accroche listés dans le script. Lancer `python3 tools/build.py` après chaque modification.
- `tex/`, `vosk/` : textures et modèle de reconnaissance vocale.
