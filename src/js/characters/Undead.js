import Character from '../Character';

export default class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
    this.team = 'comp';
  }
}
