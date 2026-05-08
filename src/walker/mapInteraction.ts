import { RIGHT, LEFT, UP, DOWN, getInvFromCode } from "./constants";

interface WalkerPos { x: number; y: number; direction: string }

export const nextCell = (wp: WalkerPos): [number, number] => {
  switch (wp.direction) {
    case RIGHT: return [wp.x + 1, wp.y];
    case LEFT: return [wp.x - 1, wp.y];
    case DOWN: return [wp.x, wp.y + 1];
    case UP: return [wp.x, wp.y - 1];
    default: return [wp.x, wp.y];
  }
};

export interface BackpackItem { item: { code: string; name: string; desc: string; price: number }; qty: number }
export interface Backpack { gold: number; items: BackpackItem[] }
export interface InteractionBox { target: { i_code?: string; pick?: string } | null; pos?: [number, number] }

export const addToBackpack = (backpack: Backpack, target: { i_code?: string }): Backpack => {
  const code = target.i_code;
  if (!code) return backpack;

  const existing = backpack.items.find(i => i.item.code === code);
  const newItems = existing
    ? backpack.items.map(i => i.item.code === code ? { ...i, qty: i.qty + 1 } : i)
    : [...backpack.items, { item: getInvFromCode(code)!, qty: 1 }];

  return { ...backpack, items: newItems };
};
