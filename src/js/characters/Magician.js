import Character from '../Character';
import teams from '../constants/teams';

export default class Magician extends Character {
  constructor(level) {
    super(level, new.target.name);
    // this.type = 'magician';
    this.attack = 10;
    this.defence = 40;
    this.attackDistance = 4;
    this.moveDistance = 1;
    this.team = teams.player;
  }
}
