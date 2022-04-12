export default class GameState {
  constructor() {
    // this.playersTurn = true;
    // this.level = 1;
    // this.this.points = 0;
    this.highestPoints = 0;

    // this.positionedTeamHuman = null;
    // this.positionedTeamComp = null;
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
