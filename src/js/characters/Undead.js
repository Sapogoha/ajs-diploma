import Character from '../Character';
import teams from '../constants/teams';

export default class Undead extends Character {
  constructor(level) {
    super(level, new.target.name);
    this.type = 'undead';
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
    this.team = teams.enemy;
  }
}
