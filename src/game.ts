
import bgk from "../src/assets/img/bkg.png"

import { generateMap } from "./map";

type asset = { name: string, img: string }


//time speed

const assets = {

    tree: "tree",
    water: "water"
}

const imgBgk = new Image();
imgBgk.src = "../src/assets/img/bkg.png"

let map = generateMap(8, 10)



export const main = () => {
    const canvas = document.querySelector("canvas");

    if (!canvas) return
    const ctx = canvas.getContext("2d");

    // const $sprite = document.querySelector("#sprite")
    // const $bricks = document.querySelector("#bricks")




    const cellPixel = 64

    const width = map[0].length
    const height = map.length


    const player = { pos: { x: 2, y: 2 } }

    canvas.width = width * cellPixel;
    canvas.height = height * cellPixel;

    function drawBkg() {
        if (!ctx) return

        if (!imgBgk.complete) return

        ctx.drawImage(
            imgBgk, // img
            0, // x
            0, // y
            // cellPixel, //img width
            // cellPixel, // img height
        );
    }

    function drawUI() {
        if (!ctx) return
        ctx.fillStyle = "pink"
        ctx.fillText(`FPS: ${framesPerSec}`, 5, 15);
    }


    function cleanCanvas() {
        if (!canvas) return
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    function initEvents() {
        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("keyup", keyUpHandler);

        function keyDownHandler(event: KeyboardEvent) {
            const { key } = event;
            // console.log("--map", JSON.stringify(map))

            console.log("before =>", JSON.stringify(player.pos))
            // console.log("moving")
            if (
                key === "Right" ||
                key === "ArrowRight" ||
                key.toLowerCase() === "d"
            ) {

                if (map[player.pos.y][(player.pos.x + 1)].elem === "WALL") {
                    console.log(map[player.pos.y][player.pos.x + 1])

                    console.log("cant move => wall")

                    return
                }

                player.pos.x += 1

            } else if (
                key === "Left" ||
                key === "ArrowLeft" ||
                key.toLowerCase() === "a"
            ) {

                player.pos.x -= 1
            } else if (
                key === "Up" ||
                key === "ArrowUp" ||
                key.toLowerCase() === "w"
            ) {

                player.pos.y -= 1
            } else if (
                key === "Down" ||
                key === "ArrowDown" ||
                key.toLowerCase() === "s"
            ) {

                player.pos.y += 1
            }

            console.log("after =>", JSON.stringify(player.pos))
            console.log("player =>", player.pos, "/ map=>", map[player.pos.x][player.pos.y])
            console.log("===========")
        }

        function keyUpHandler(event: KeyboardEvent) {
            const { key } = event;
            if (
                key === "Right" ||
                key === "ArrowRight" ||
                key.toLowerCase() === "d"
            ) {
                // rightPressed = false;
            } else if (
                key === "Left" ||
                key === "ArrowLeft" ||
                key.toLowerCase() === "a"
            ) {
                // leftPressed = false;
            }
        }
    }



    let startTime = performance.now()

    function drawTimer() {
        const newTime = performance.now()


        const checkClock = () => {

            if (newTime - startTime > 1000) {
                startTime = newTime
                //map = generateMap(10, 10)
            }
        }


        const drawClock = () => {

            if (!ctx) return

            ctx.fillStyle = 'black';
            ctx.font = "bold 14px arial";
            ctx.fillText(`time: ${Math.floor(startTime / 1000)}`, (cellPixel * ((width - 1))), cellPixel / 4);
        }

        checkClock()
        drawClock()


    }


    const drawCell = (cell: {
        pos: {
            x: number;
            y: number;
        };
        elem: string;
    }) => {

        // const w = 448 / 10;
        // const h = 400 / 10;

        if (!ctx) return

        if (cell.elem === "TREE") {

            ctx.fillStyle = "#FFFA00";

        }
        else if (cell.elem === "GRASS") {

            ctx.fillStyle = "green";

        }
        else if (cell.elem === "WATER") {
            ctx.fillStyle = "blue";

        }
        else if (cell.elem === "ROCK") {
            ctx.fillStyle = "orange";

        } else if (cell.elem === "WALL") {
            ctx.fillStyle = "red";

        } else {
            console.log("ups error cell.elem")
        }




        ctx.fillRect(cell.pos.x * cellPixel, cell.pos.y * cellPixel, cellPixel, cellPixel)

        ctx.fillStyle = "black"
        ctx.fillText(` ${JSON.stringify(cell.elem)}`, (cellPixel * (cell.pos.x)), (cellPixel * (cell.pos.y) + 15));
        ctx.font = "12px arial";
        ctx.fillText(` ${JSON.stringify(cell.pos)}`, (cellPixel * (cell.pos.x)), (cellPixel * (cell.pos.y) + 45));

    }

    const drawMap = () => {
        map.forEach(row => {
            row.forEach(x => {
                drawCell(x)
            })
        })
    }

    const drawPlayer = () => {
        if (!ctx) return

        ctx.fillStyle = "black"
        ctx.fillRect(player.pos.x * cellPixel, player.pos.y * cellPixel, cellPixel, cellPixel)


        ctx.fillStyle = "white"
        ctx.fillText(` ${JSON.stringify(map[player.pos.y][player.pos.x])}`, (cellPixel * (player.pos.x)), (cellPixel * (player.pos.y) + 30));
        ctx.font = "12px arial";
        ctx.fillText(` ${JSON.stringify(player.pos)}`, (cellPixel * (player.pos.x)), (cellPixel * (player.pos.y) + 45));

    }




    const fps = 60;
    let msPrev = window.performance.now();
    let msFPSPrev = window.performance.now() + 1000;
    const msPerFrame = 1000 / fps;
    let frames = 0;
    let framesPerSec = fps;

    function draw() {
        window.requestAnimationFrame(draw);

        const msNow = window.performance.now();
        const msPassed = msNow - msPrev;

        if (msPassed < msPerFrame) return;

        const excessTime = msPassed % msPerFrame;
        msPrev = msNow - excessTime;

        frames++;

        if (msFPSPrev < msNow) {
            msFPSPrev = window.performance.now() + 1000;
            framesPerSec = frames;
            frames = 0;
        }

        //  render 
        cleanCanvas();







        drawMap()
        drawTimer()
        drawBkg()

        // collisions / movements


        drawUI();

        drawPlayer()
    }

    draw();
    initEvents();


}


main()
