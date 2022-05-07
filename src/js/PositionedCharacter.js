import Character from './Character';
import errors from './constants/errors';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error(errors.notInstance);
    }

    if (typeof position !== 'number') {
      throw new Error(errors.notNumber);
    }

    this.character = character;
    this.position = position;
  }
}
