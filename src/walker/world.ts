import { RIGHT, LEFT, UP, MAP_ELEM } from "./constants";

interface Cell {
  id: string;
  content?: string;
  passage?: { map: string; walkerPosition: [number, number]; direction: string };
}

export const emptyMap = (x = 10, y = 10): Cell[][] =>
  Array.from({ length: x }, (_, ix) =>
    Array.from({ length: y }, (_, iy) => ({
      id: `x${ix}y${iy}`,
    }))
  );

export const initialMap = (): Cell[][] => {
  const map = emptyMap();

  map[3][3].content = MAP_ELEM.TREE.code;
  map[5][3].content = MAP_ELEM.MUSHROOM.code;
  map[1][2].content = MAP_ELEM.CAULDRON.code;

  map[9][2].content = MAP_ELEM.WALL.code;
  map[9][3].content = MAP_ELEM.WALL.code;
  map[9][4].content = MAP_ELEM.WALL.code;
  map[9][7].content = MAP_ELEM.WALL.code;
  map[9][8].content = MAP_ELEM.WALL.code;
  map[9][9].content = MAP_ELEM.WALL.code;

  map[4][6].content = MAP_ELEM.WELL.code;
  map[1][8].content = MAP_ELEM.TRADER.code;

  map[9][6].passage = { map: "2-1", walkerPosition: [0, 5], direction: RIGHT };
  map[4][9].passage = { map: "2-1", walkerPosition: [0, 8], direction: RIGHT };
  map[3][0].passage = { map: "2-1", walkerPosition: [3, 9], direction: UP };

  return map;
};

export const RightMap = (): Cell[][] => {
  const map = emptyMap();

  map[2][3].content = MAP_ELEM.TREE.code;
  map[5][3].content = MAP_ELEM.MUSHROOM.code;
  map[5][2].content = MAP_ELEM.WALL.code;
  map[5][4].content = MAP_ELEM.WALL.code;
  map[5][7].content = MAP_ELEM.WALL.code;
  map[5][8].content = MAP_ELEM.WALL.code;
  map[5][9].content = MAP_ELEM.WALL.code;

  map[0][1].passage = { map: "1-1", walkerPosition: [9, 1], direction: LEFT };

  return map;
};

export const getMap = (coord: string): Cell[][] => {
  switch (coord) {
    case "0-0": return emptyMap();
    case "1-1": return initialMap();
    case "2-1": return RightMap();
    default: return emptyMap();
  }
};
