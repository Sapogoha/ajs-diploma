import Character from '../Character';
import teams from '../constants/teams';

export default class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
    this.attackDistance = 2;
    this.moveDistance = 2;
    this.team = teams.player;
  }
}
