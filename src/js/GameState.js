export default class GameState {
  constructor() {
    this.playersTurn = true;
    this.level = 1;
    this.points = 0;
    this.highestPoints = 0;

    this.teamHuman = null;
    this.teamComp = null;
    this.posTeamHuman = null;
    this.posTeamComp = null;
  }

  static from(object) {
    if (typeof object === 'object') {
      return {
        object,
      };
    }
    return null;
  }
}
