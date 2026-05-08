

## Walker game notes

The project includes a small grid game at `/walker`.

### Run locally

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Open `http://localhost:4321/walker`

### Controls

- Movement: Arrow keys, or on-screen arrow buttons
- Interact / confirm: `x` (also works with `X`)
- Back / cancel: `z` (also works with `Z`)
- Open menu: `Enter`

### Current behavior

- The sidebar shows player data (`gold`, `time`, `position`, `direction`) and a live `status` message for actions and errors.
- Input listeners are bound once, so re-running game initialization does not stack duplicate key handlers.
- Interacting with a `TRADER` opens a dedicated trader menu:
  - buy `water`, `mushroom`, or `wood` (costs gold)
  - enter sell mode and sell backpack items one-by-one for their item price
