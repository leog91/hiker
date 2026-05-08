import { RIGHT, LEFT, UP, DOWN, MAP_ELEM, INV_ELEM, recipes, FINITE } from "./constants";
import { initialMap, getMap } from "./world";
import { nextCell, addToBackpack } from "./mapInteraction";
import type { Backpack } from "./mapInteraction";

const CELL = 48;
const COLS = 10;
const ROWS = 10;
const MAP_W = COLS * CELL;
const MAP_H = ROWS * CELL;
const SIDEBAR = 280;
const TOTAL_W = MAP_W + SIDEBAR;
const TOTAL_H = MAP_H;
const PAD = 8;

type Mode = "map" | "menu" | "inventory" | "craft" | "require" | "trader" | "sell";

const state = {
  walkerPosition: { x: 0, y: 0, direction: RIGHT },
  map: [[]] as any[][],
  backpack: {
    gold: 2,
    items: [
      { item: INV_ELEM.WATER, qty: 1 },
      { item: INV_ELEM.MUSHROOM, qty: 1 },
    ],
  } as Backpack,
  time: 0,
  mode: "map" as Mode,
  menuCursor: 0,
  interactionBox: { target: null as any, pos: undefined as [number, number] | undefined },
  payload: null as any,
  menu: ["Inventory", "exit"],
  statusMessage: "Ready",
};

const traderGoods = [INV_ELEM.WATER, INV_ELEM.MUSHROOM, INV_ELEM.WOOD];

const C = {
  bg: "#1e3a5f", sidebar: "#0d2137", border: "#2c5282",
  text: "#68d391", textDim: "#48b576", highlight: "#f6e05e",
  player: "#FF5722", grass: "#3a6b35", tree: "#1a4a0e",
  wall: "#555555", mushroom: "#8B4513", cauldron: "#444444",
  well: "#1565C0", trader: "#B8860B", rock: "#6d4c41", passage: "#9b59b6",
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let eventsBound = false;

function setStatus(message: string) {
  state.statusMessage = message;
}

function initCanvas() {
  const el = document.querySelector("canvas");
  if (!el) { console.error("canvas not found"); return; }
  canvas = el;
  ctx = canvas.getContext("2d")!;
  canvas.width = TOTAL_W;
  canvas.height = TOTAL_H;
  console.log("canvas init", TOTAL_W, TOTAL_H);
}

function cellBg(content?: string): string {
  switch (content) {
    case MAP_ELEM.TREE.code: return C.tree;
    case MAP_ELEM.WALL.code: return C.wall;
    case MAP_ELEM.MUSHROOM.code: return C.mushroom;
    case MAP_ELEM.CAULDRON.code: return C.cauldron;
    case MAP_ELEM.WELL.code: return C.well;
    case MAP_ELEM.TRADER.code: return C.trader;
    case MAP_ELEM.ROCK.code: return C.rock;
    default: return C.grass;
  }
}

function drawMap() {
  const dirSym: Record<string, string> = { RIGHT: "→", LEFT: "←", UP: "↑", DOWN: "↓" };
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const cell = state.map[x]?.[y];
      const content = cell?.content;
      const px = x * CELL, py = y * CELL;

      ctx.fillStyle = cellBg(content);
      ctx.fillRect(px, py, CELL, CELL);

      ctx.strokeStyle = "#2a5a2a";
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, CELL, CELL);

      if (content) {
        ctx.fillStyle = "#fff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(content.substring(0, 5), px + CELL / 2, py + CELL / 2 + 4);
      }

      if (cell?.passage) {
        ctx.strokeStyle = C.passage;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4);

        const portalDir = cell.passage.direction;
        const arrow = dirSym[portalDir] || "?";
        ctx.fillStyle = C.passage;
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText(arrow, px + CELL / 2, py + CELL / 2 + 8);
      }
    }
  }
}

function drawPlayer() {
  const { x, y } = state.walkerPosition;
  const px = x * CELL, py = y * CELL;

  ctx.fillStyle = C.player;
  ctx.fillRect(px + 4, py + 4, CELL - 8, CELL - 8);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  const dirSym: Record<string, string> = { RIGHT: "→", LEFT: "←", UP: "↑", DOWN: "↓" };
  ctx.fillText(dirSym[state.walkerPosition.direction] || "?", px + CELL / 2, py + CELL / 2 + 5);
}

function drawSidebar() {
  const sx = MAP_W;

  ctx.fillStyle = C.sidebar;
  ctx.fillRect(sx, 0, SIDEBAR, TOTAL_H);

  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, 0);
  ctx.lineTo(sx, TOTAL_H);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = C.text;
  ctx.font = "bold 16px monospace";
  ctx.fillText("WALKER", sx + PAD, 20);

  ctx.font = "13px monospace";
  ctx.fillStyle = C.textDim;
  ctx.fillText(`gold: ${state.backpack.gold}`, sx + PAD, 44);
  ctx.fillText(`time: ${state.time}`, sx + PAD, 62);
  ctx.fillText(`pos: (${state.walkerPosition.x},${state.walkerPosition.y})`, sx + PAD, 80);
  ctx.fillText(`dir: ${state.walkerPosition.direction}`, sx + PAD, 98);
  ctx.fillText(`status: ${state.statusMessage}`, sx + PAD, 116);

  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + PAD, 128);
  ctx.lineTo(sx + SIDEBAR - PAD, 128);
  ctx.stroke();

  let yOff = 148;

  if (state.mode === "map") {
    const ib = state.interactionBox;
    if (ib.target) {
      ctx.fillStyle = C.text;
      ctx.font = "bold 13px monospace";
      ctx.fillText("* interaction *", sx + PAD, yOff);
      ctx.font = "12px monospace";
      ctx.fillStyle = C.highlight;
      ctx.fillText(`> ${ib.target.code}`, sx + PAD, yOff + 20);
      ctx.fillStyle = C.textDim;
      if (ib.target.desc) ctx.fillText(`  ${ib.target.desc}`, sx + PAD, yOff + 38);
      if (ib.target.interact) ctx.fillText(`  [action] ${ib.target.interact}`, sx + PAD, yOff + 56);
      if (ib.target.pick) ctx.fillText(`  [PICK] - x`, sx + PAD, yOff + 74);
    } else {
      ctx.fillStyle = C.textDim;
      ctx.font = "12px monospace";
      ctx.fillText("Explore...", sx + PAD, yOff + 20);
      ctx.fillText("x: interact  z: back", sx + PAD, yOff + 40);
      ctx.fillText("Enter: menu", sx + PAD, yOff + 58);
    }
  }

  if (state.mode === "menu") {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px monospace";
    ctx.fillText("* menu *", sx + PAD, yOff);
    ctx.font = "12px monospace";
    state.menu.forEach((item, i) => {
      ctx.fillStyle = i === state.menuCursor ? C.highlight : C.textDim;
      ctx.fillText(`${i === state.menuCursor ? ">" : " "} ${item}`, sx + PAD, yOff + 20 + i * 20);
    });
  }

  if (state.mode === "inventory") {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px monospace";
    ctx.fillText("* inventory *", sx + PAD, yOff);
    ctx.font = "12px monospace";
    if (state.backpack.items.length === 0) {
      ctx.fillStyle = C.textDim;
      ctx.fillText(" (empty)", sx + PAD, yOff + 20);
    }
    state.backpack.items.forEach((item, i) => {
      ctx.fillStyle = i === state.menuCursor ? C.highlight : C.textDim;
      ctx.fillText(`${i === state.menuCursor ? ">" : " "} ${item.qty} - ${item.item.name} [$${item.item.price}]`, sx + PAD, yOff + 20 + i * 20);
    });
  }

  if (state.mode === "craft") {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px monospace";
    ctx.fillText("* crafting *", sx + PAD, yOff);
    ctx.font = "12px monospace";
    recipes.forEach((r, i) => {
      ctx.fillStyle = i === state.menuCursor ? C.highlight : C.textDim;
      ctx.fillText(`${i === state.menuCursor ? ">" : " "} ${r.create.name}`, sx + PAD, yOff + 20 + i * 20);
    });
  }

  if (state.mode === "require") {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px monospace";
    ctx.fillText(`* ${state.payload?.create?.name || "?"} *`, sx + PAD, yOff);
    ctx.font = "12px monospace";
    state.payload?.require?.forEach((r: any, i: number) => {
      const stock = state.backpack.items.find((bi: any) => bi.item.code === r.item.code)?.qty || 0;
      ctx.fillStyle = stock >= r.qty ? C.textDim : "#e53e3e";
      ctx.fillText(`  ${r.item.name}: ${stock}/${r.qty}`, sx + PAD, yOff + 20 + i * 20);
    });
    ctx.fillStyle = C.highlight;
    ctx.fillText("  [craft] - x", sx + PAD, yOff + 20 + (state.payload?.require?.length || 0) * 20 + 10);
  }

  if (state.mode === "trader") {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px monospace";
    ctx.fillText("* trader *", sx + PAD, yOff);
    ctx.font = "12px monospace";
    traderGoods.forEach((item, i) => {
      ctx.fillStyle = i === state.menuCursor ? C.highlight : C.textDim;
      ctx.fillText(`${i === state.menuCursor ? ">" : " "} buy ${item.name} [$${item.price}]`, sx + PAD, yOff + 20 + i * 20);
    });
    const sellIndex = traderGoods.length;
    const exitIndex = traderGoods.length + 1;
    ctx.fillStyle = state.menuCursor === sellIndex ? C.highlight : C.textDim;
    ctx.fillText(`${state.menuCursor === sellIndex ? ">" : " "} sell items`, sx + PAD, yOff + 20 + sellIndex * 20);
    ctx.fillStyle = state.menuCursor === exitIndex ? C.highlight : C.textDim;
    ctx.fillText(`${state.menuCursor === exitIndex ? ">" : " "} exit`, sx + PAD, yOff + 20 + exitIndex * 20);
  }

  if (state.mode === "sell") {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px monospace";
    ctx.fillText("* sell items *", sx + PAD, yOff);
    ctx.font = "12px monospace";
    if (state.backpack.items.length === 0) {
      ctx.fillStyle = C.textDim;
      ctx.fillText(" (empty)", sx + PAD, yOff + 20);
    }
    state.backpack.items.forEach((item, i) => {
      ctx.fillStyle = i === state.menuCursor ? C.highlight : C.textDim;
      ctx.fillText(`${i === state.menuCursor ? ">" : " "} ${item.qty} - ${item.item.name} [+ $${item.item.price}]`, sx + PAD, yOff + 20 + i * 20);
    });
    ctx.fillStyle = C.textDim;
    ctx.fillText("x: sell one  z: back", sx + PAD, yOff + 20 + Math.max(state.backpack.items.length, 1) * 20 + 10);
  }
}

function cleanCanvas() {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {
  cleanCanvas();
  drawMap();
  drawPlayer();
  drawSidebar();
}

function isMapLimit() {
  const wp = state.walkerPosition;
  const h = state.map.length;
  const v = state.map[0]?.length || 0;
  switch (wp.direction) {
    case DOWN: return wp.y >= v - 1;
    case UP: return wp.y <= 0;
    case RIGHT: return wp.x >= h - 1;
    case LEFT: return wp.x <= 0;
    default: return false;
  }
}

function isBlockedPath() {
  const [x, y] = nextCell(state.walkerPosition);
  return state.map[x]?.[y]?.content === MAP_ELEM.WALL.code;
}

function removeFromBackpack(code: string, qty: number) {
  const idx = state.backpack.items.findIndex(i => i.item.code === code);
  if (idx === -1) return;
  const item = state.backpack.items[idx];
  if (item.qty > qty) {
    state.backpack.items[idx] = { ...item, qty: item.qty - qty };
  } else {
    state.backpack.items.splice(idx, 1);
  }
}

function addInventoryItem(item: typeof INV_ELEM[keyof typeof INV_ELEM], qty = 1) {
  const idx = state.backpack.items.findIndex((i: any) => i.item.code === item.code);
  if (idx !== -1) {
    state.backpack.items[idx].qty += qty;
  } else {
    state.backpack.items.push({ item, qty });
  }
}

function craft() {
  const p = state.payload;
  if (!p) {
    setStatus("No recipe selected");
    return;
  }
  const hasAll = p.require.every((r: any) => {
    const stock = state.backpack.items.find((i: any) => i.item.code === r.item.code)?.qty || 0;
    return stock >= r.qty;
  });
  if (!hasAll) {
    setStatus("Missing ingredients");
    return;
  }

  const idx = state.backpack.items.findIndex((i: any) => i.item.code === p.create.code);
  if (idx !== -1) {
    state.backpack.items[idx].qty += 1;
  } else {
    state.backpack.items.push({ item: p.create, qty: 1 });
  }

  p.require.forEach((r: any) => removeFromBackpack(r.item.code, r.qty));
  setStatus(`Crafted ${p.create.name}`);
}

function buyItem(item: typeof INV_ELEM[keyof typeof INV_ELEM]) {
  if (state.backpack.gold < item.price) {
    setStatus(`Not enough gold for ${item.name}`);
    return;
  }
  state.backpack.gold -= item.price;
  addInventoryItem(item, 1);
  setStatus(`Bought ${item.name}`);
}

function sellSelectedItem() {
  const selected = state.backpack.items[state.menuCursor];
  if (!selected) {
    setStatus("No item selected to sell");
    return;
  }
  state.backpack.gold += selected.item.price;
  removeFromBackpack(selected.item.code, 1);
  if (state.backpack.items.length === 0) {
    state.menuCursor = 0;
  } else {
    state.menuCursor = Math.min(state.menuCursor, state.backpack.items.length - 1);
  }
  setStatus(`Sold ${selected.item.name}`);
}

export function move(dir: string) {
  const wp = state.walkerPosition;
  if (wp.direction !== dir) {
    wp.direction = dir;
    setStatus(`Facing ${dir.toLowerCase()}`);
    render();
    return;
  }

  const cell = state.map[wp.x]?.[wp.y];
  if (cell?.passage?.direction === dir) {
    state.map = getMap(cell.passage.map);
    wp.x = cell.passage.walkerPosition[0];
    wp.y = cell.passage.walkerPosition[1];
    wp.direction = cell.passage.direction;
    state.mode = "map";
    state.interactionBox = { target: null };
    state.menuCursor = 0;
    setStatus(`Moved to map ${cell.passage.map}`);
    render();
    return;
  }

  if (isMapLimit()) {
    setStatus("Map limit reached");
    return;
  }
  if (isBlockedPath()) {
    setStatus("Blocked by wall");
    return;
  }

  const [nx, ny] = nextCell(wp);
  state.time++;
  wp.x = nx;
  wp.y = ny;
  state.interactionBox = { target: null };
  setStatus(`Moved to (${wp.x}, ${wp.y})`);
  render();
}

function mapHandler(key: string) {
  switch (key) {
    case "ArrowUp": move(UP); break;
    case "ArrowRight": move(RIGHT); break;
    case "ArrowLeft": move(LEFT); break;
    case "ArrowDown": move(DOWN); break;
    case "Enter": state.mode = "menu"; state.menuCursor = 0; setStatus("Opened menu"); render(); break;
    case "x": {
      const ib = state.interactionBox;
      if (ib.target?.pick) {
        state.backpack = addToBackpack(state.backpack, ib.target);
        if (ib.target.pick === FINITE && ib.pos) {
          state.map[ib.pos[0]][ib.pos[1]].content = "";
        }
        state.interactionBox = { target: null };
        setStatus(`Picked ${ib.target.code.toLowerCase()}`);
        render();
        break;
      }
      const [cx, cy] = nextCell(state.walkerPosition);
      if (!isMapLimit() && state.map[cx]?.[cy]?.content) {
        const c = state.map[cx][cy].content;
        if (c === MAP_ELEM.CAULDRON.code) {
          state.mode = "craft";
          state.menuCursor = 0;
          setStatus("Opened crafting");
          render();
        } else if (c === MAP_ELEM.TRADER.code) {
          state.mode = "trader";
          state.menuCursor = 0;
          setStatus("Opened trader");
          render();
        } else {
          state.interactionBox = { target: MAP_ELEM[c], pos: [cx, cy] };
          setStatus(`Inspecting ${c.toLowerCase()}`);
          render();
        }
      } else {
        setStatus("Nothing to interact with");
        render();
      }
      break;
    }
  }
}

function menuHandler(key: string) {
  if (key === "ArrowUp") state.menuCursor = Math.max(0, state.menuCursor - 1);
  if (key === "ArrowDown") state.menuCursor = Math.min(state.menu.length - 1, state.menuCursor + 1);
  if (key === "x") {
    const choice = state.menu[state.menuCursor];
    if (choice === "Inventory") { state.mode = "inventory"; state.menuCursor = 0; setStatus("Opened inventory"); }
    if (choice === "exit") { state.mode = "map"; state.menuCursor = 0; setStatus("Closed menu"); }
  }
  render();
}

function inventoryHandler(key: string) {
  if (key === "ArrowUp") state.menuCursor = Math.max(0, state.menuCursor - 1);
  if (key === "ArrowDown") state.menuCursor = Math.min(Math.max(0, state.backpack.items.length - 1), state.menuCursor + 1);
  render();
}

function craftHandler(key: string) {
  if (key === "ArrowUp") state.menuCursor = Math.max(0, state.menuCursor - 1);
  if (key === "ArrowDown") state.menuCursor = Math.min(recipes.length - 1, state.menuCursor + 1);
  if (key === "x") {
    state.payload = recipes[state.menuCursor];
    state.mode = "require";
    state.menuCursor = 0;
  }
  render();
}

function requireHandler(key: string) {
  if (key === "x") { craft(); render(); }
}

function traderHandler(key: string) {
  const maxIndex = traderGoods.length + 1;
  if (key === "ArrowUp") state.menuCursor = Math.max(0, state.menuCursor - 1);
  if (key === "ArrowDown") state.menuCursor = Math.min(maxIndex, state.menuCursor + 1);
  if (key === "x") {
    if (state.menuCursor < traderGoods.length) {
      buyItem(traderGoods[state.menuCursor]);
    } else if (state.menuCursor === traderGoods.length) {
      state.mode = "sell";
      state.menuCursor = 0;
      setStatus("Sell mode");
    } else {
      state.mode = "map";
      state.menuCursor = 0;
      setStatus("Left trader");
    }
  }
  render();
}

function sellHandler(key: string) {
  if (key === "ArrowUp") state.menuCursor = Math.max(0, state.menuCursor - 1);
  if (key === "ArrowDown") state.menuCursor = Math.min(Math.max(0, state.backpack.items.length - 1), state.menuCursor + 1);
  if (key === "x") sellSelectedItem();
  render();
}

function handler(key: string) {
  const normalizedKey = key.length === 1 ? key.toLowerCase() : key;

  if (normalizedKey === "z") {
    if (state.mode === "require") { state.mode = "craft"; state.menuCursor = 0; render(); return; }
    if (state.mode === "sell") { state.mode = "trader"; state.menuCursor = 0; setStatus("Back to trader"); render(); return; }
    if (state.mode !== "map") { state.mode = "map"; state.interactionBox = { target: null }; state.menuCursor = 0; setStatus("Back to map"); render(); return; }
    return;
  }

  switch (state.mode) {
    case "map": mapHandler(normalizedKey); break;
    case "craft": craftHandler(normalizedKey); break;
    case "menu": menuHandler(normalizedKey); break;
    case "inventory": inventoryHandler(normalizedKey); break;
    case "require": requireHandler(normalizedKey); break;
    case "trader": traderHandler(normalizedKey); break;
    case "sell": sellHandler(normalizedKey); break;
  }
}

function initEvents() {
  if (eventsBound) return;
  eventsBound = true;
  document.addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
    handler(e.key);
  });
}

export function main() {
  initCanvas();
  state.map = initialMap();
  state.walkerPosition = { x: 0, y: 0, direction: RIGHT };
  setStatus("Ready");
  render();
  initEvents();

  (window as any).__w = { handler, move };
}
