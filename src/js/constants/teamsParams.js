import teams from './teams';

const teamsParams = {
  human: {
    Bowman: {
      attack: 25,
      defence: 25,
      attackDistance: 2,
      moveDistance: 2,
      team: teams.player,
    },
    Magician: {
      attack: 10,
      defence: 40,
      attackDistance: 4,
      moveDistance: 1,
      team: teams.player,
    },
    Swordsman: {
      attack: 40,
      defence: 10,
      attackDistance: 1,
      moveDistance: 4,
      team: teams.player,
    },
  },
  computer: {
    Daemon: {
      attack: 10,
      defence: 40,
      attackDistance: 4,
      moveDistance: 1,
      team: teams.enemy,
    },
    Undead: {
      attack: 40,
      defence: 10,
      attackDistance: 1,
      moveDistance: 4,
      team: teams.enemy,
    },
    Vampire: {
      attack: 25,
      defence: 25,
      attackDistance: 2,
      moveDistance: 2,
      team: teams.enemy,
    },
  },
};

export default teamsParams;
