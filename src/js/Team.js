import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class Team {
  constructor() {
    this.teamComp = [Daemon, Undead, Vampire];
    this.teamHumanInit = [Bowman, Swordsman];
    this.teamHuman = [Bowman, Magician, Swordsman];
  }
}
