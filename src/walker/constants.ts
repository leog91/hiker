export const RIGHT = "RIGHT";
export const LEFT = "LEFT";
export const UP = "UP";
export const DOWN = "DOWN";

export const FINITE = "FINITE";
export const INFINITE = "INFINITE";

export const ACTION = {
  PICK: { FINITE, INFINITE },
  CRAFT: "cauldron",
  SELL: "sell",
};

export const INV_ELEM: Record<string, { desc: string; code: string; name: string; price: number }> = {
  MUSHROOM: { desc: "power up", code: "I_M", name: "mushroom", price: 3 },
  WATER: { desc: "fresh", code: "I_W", name: "water", price: 1 },
  WOOD: { desc: "brownish", code: "I_WO", name: "wood", price: 2 },
  MUSHROOM_SOUP: { desc: "liquid", code: "I_MS", name: "Mushroom Soup", price: 6 },
  HOT_WATER: { desc: "liquidH", code: "H_W", name: "Hot Water", price: 2 },
  CHAIR: { desc: "4 legs", code: "I_C", name: "Chair", price: 12 },
};

export const recipes: { create: typeof INV_ELEM[keyof typeof INV_ELEM]; require: { item: typeof INV_ELEM[keyof typeof INV_ELEM]; qty: number }[] }[] = [
  {
    create: INV_ELEM.MUSHROOM_SOUP,
    require: [
      { item: INV_ELEM.MUSHROOM, qty: 1 },
      { item: INV_ELEM.WATER, qty: 2 },
    ],
  },
  {
    create: INV_ELEM.HOT_WATER,
    require: [{ item: INV_ELEM.WATER, qty: 1 }],
  },
  {
    create: INV_ELEM.CHAIR,
    require: [{ item: INV_ELEM.WOOD, qty: 3 }],
  },
];

export const getInvFromCode = (code: string) => {
  for (const key in INV_ELEM) {
    if (INV_ELEM[key].code === code) return INV_ELEM[key];
  }
};

export const MAP_ELEM: Record<string, { desc?: string; code: string; interact?: string; pick?: string; i_code?: string; action?: string }> = {
  TREE: { desc: "has leafs", code: "TREE", interact: "feels rough", pick: INFINITE, i_code: INV_ELEM.WOOD.code },
  ROCK: { desc: "heavy", code: "ROCK" },
  MUSHROOM: { desc: "power up", code: "MUSHROOM", pick: FINITE, i_code: INV_ELEM.MUSHROOM.code },
  WALL: { desc: "BIG", interact: "road blocked", code: "WALL" },
  CAULDRON: { desc: "smells bad", interact: "throw things", code: "CAULDRON", action: ACTION.CRAFT },
  WELL: { desc: "seems deep", interact: "can drink", code: "WELL", pick: INFINITE, i_code: INV_ELEM.WATER.code },
  TRADER: { desc: "looks rich", interact: "buy & sell", action: ACTION.SELL, code: "TRADER" },
};
