import Character from '../Character';

import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';

test('test character creation', () => {
  expect(() => new Character(1)).toThrow();
  expect(() => new Bowman(1)).not.toThrow();
  expect(() => new Daemon(1)).not.toThrow();
});

test('levelUp an alive character with a standart level of health, attack and defence', () => {
  const bowman = new Bowman(1);
  bowman.levelUp();
  expect([bowman.level, bowman.attack, bowman.defence, bowman.health]).toEqual([
    2, 33, 33, 100,
  ]);
  bowman.levelUp();
  expect([bowman.level, bowman.attack, bowman.defence, bowman.health]).toEqual([
    3, 59, 59, 100,
  ]);
});

test('levelUp an alive character with a low level of health', () => {
  const bowman = new Bowman(1);
  bowman.health = 10;
  bowman.levelUp();

  expect([bowman.level, bowman.attack, bowman.defence, bowman.health]).toEqual([
    2, 25, 25, 90,
  ]);
  bowman.levelUp();
  expect([bowman.level, bowman.attack, bowman.defence, bowman.health]).toEqual([
    3, 43, 43, 100,
  ]);
});

test('levelUp a dead character', () => {
  const bowman = new Bowman(1);
  bowman.health = 0;
  expect(() => bowman.levelUp()).toThrow();
});
