import Character from '../Character';
import teams from '../constants/teams';
import teamsParams from '../constants/teamsParams';

export default class Bowman extends Character {
  constructor(level) {
    super(level, new.target.name);
    const {
      attack, defence, attackDistance, moveDistance, team,
    } = teamsParams[teams.player][new.target.name];
    this.attack = attack;
    this.defence = defence;
    this.attackDistance = attackDistance;
    this.moveDistance = moveDistance;
    this.team = team;
  }
}
