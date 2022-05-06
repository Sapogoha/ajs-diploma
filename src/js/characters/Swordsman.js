import Character from '../Character';
import teams from '../constants/teams';

export default class Swordsman extends Character {
  constructor(level) {
    super(level, new.target.name);
    // this.type = 'swordsman';
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
    this.team = teams.player;
  }
}
