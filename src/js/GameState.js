export default class GameState {
  constructor() {
    this.playersTurn = true;
    this.level = 1;
    this.points = 0;
    this.highestPoints = 0;

    this.teamHuman = [];
    this.teamComp = [];
    this.posTeamHuman = [];
    this.posTeamComp = [];
    this.positioned = null;
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
