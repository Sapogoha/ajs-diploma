export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    if (new.target.name === 'Character') {
      throw new Error(
        "It's not allowed to create new instances of Characters using 'new Character'. Please use classes that extend class Character instead (Bowman, Daemon, etc.)",
      );
    }
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
      // } else {
      //   throw new Error("You cannot level up a dead character");
    }
  }
}
