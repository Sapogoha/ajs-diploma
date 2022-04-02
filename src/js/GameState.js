export default class GameState {
  constructor() {
    this.playersTurn = null;
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
