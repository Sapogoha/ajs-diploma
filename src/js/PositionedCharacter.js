import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error(
        'character must be instance of Character or its children',
      );
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  levelUp() {
    if (this.health > 0) {
      this.level += 1;
      this.attack = Math.max(
        this.attack,
        Math.round(this.attack * (0.8 + this.health / 100)),
      );
      this.defence = Math.max(
        this.defence,
        Math.round(this.defence * (0.8 + this.health / 100)),
      );
      this.health < 20 ? (this.health += 80) : (this.health = 100);
    }
  }
}
