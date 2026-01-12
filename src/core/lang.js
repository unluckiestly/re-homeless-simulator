export const EN = {
  stats: {
    health: "Health",
    hunger: "Hunger",
    warmth: "Warmth",
  },

  hud: {
    time: "Time",
    toWin: "To win",
    day: "Day",
    night: "Night",
    cycle: "Cycle",
    outside: "You are outside",
    shelter: "You are in shelter",
    shelterHint: "Warmth drains slower",
  },

  game: {
    startTitle: "Survival Prototype",
    startText1: "Survive for 5 minutes.",
    startText2: "Night is cold. Shelter matters.",
    winTitle: "Victory",
    loseTitle: "You died",
    winText: (t) => `You survived ${t}.`,
    loseText: (t) => `Time survived: ${t}.`,
  },

  items: {
    food: "Food",
    water: "Water",
    jacket: "Jacket",
    cardboard: "Cardboard",
    medkit: "Medkit",
  },

  toast: {
    picked: (name) => `Picked up: ${name}`,
    inventoryFull: "Inventory is full",
    ate: "You ate food",
    drank: "You drank water",
    healed: "You used a medkit",
    jacket: "You put on a jacket",
    cardboard: "You used cardboard for warmth",
  },
};
