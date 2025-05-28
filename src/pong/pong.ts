const D = { WEST: "WEST", EAST: "EAST", NORTH: "NORTH", SOUTH: "SOUTH" }


let block = {
    pos: { x: 0, y: 0 },
    direction: D.EAST
}


let movingObject = {
    pos: { x: 0, y: 0 },
    direction: D.EAST,
    speed: 50,
    interval: 50

}

const Player = {
    RED: "RED",
    BLUE: "BLUE",
}
const cellPixel = 64

const width = 10
const height = 12


const randomPlayer = () => Object.entries(Player)[Math.floor(Math.random() * Object.entries(Player).length)][1]


let map: any = []

for (let y = 0; y < height; y++) {
    let row = []

    for (let x = 0; x < width; x++) {

        row.push(randomPlayer())



    }

    map.push(row)

}




const movingObjectInterval = () => {

    const distance = Math.ceil(movingObject.speed / 4)


    setInterval(() => {


        if (movingObject.direction === D.EAST && movingObject.pos.x >= (width - 1) * cellPixel) {
            movingObject.direction = D.WEST
            movingObject.pos.x -= distance

            return
        }

        if (movingObject.direction === D.WEST && movingObject.pos.x <= 0) {
            movingObject.direction = D.EAST
            movingObject.pos.x = distance
            return
        }

        if (movingObject.direction === D.EAST) {
            movingObject.pos.x += distance
            return
        }

        if (movingObject.direction === D.WEST) {
            movingObject.pos.x -= distance
            return
        }

    },

        movingObject.interval);

}



export const main = () => {



    const canvas = document.querySelector("canvas");

    if (!canvas) return
    const ctx = canvas.getContext("2d");

    function cleanCanvas() {
        if (!canvas) return
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }






    let speed = 80

    setInterval(() => {




        // 

        if (block.direction === D.EAST && map[block.pos.y][block.pos.x + 1] === "RED") {




            block.direction = D.WEST
            let draftBlock = { ...block, pos: { x: block.pos.x - 1, y: block.pos.y } }
            map[block.pos.y][block.pos.x + 1] = "BLUE"


            block = draftBlock



            return
        }

        if (block.direction === D.WEST && map[block.pos.y][block.pos.x - 1] === "RED") {




            block.direction = D.EAST
            let draftBlock = { ...block, pos: { x: block.pos.x + 1, y: block.pos.y } }
            map[block.pos.y][block.pos.x - 1] = "BLUE"


            block = draftBlock



            return
        }



        if (block.direction === D.EAST && block.pos.x === width - 1) {


            block.direction = D.WEST
            let draftBlock = { ...block, pos: { x: block.pos.x - 1, y: block.pos.y } }
            block = draftBlock

            return
        }
        if (block.direction === D.EAST) {
            let draftBlock = { ...block, pos: { x: block.pos.x + 1, y: block.pos.y } }
            block = draftBlock
            return
        }

        if (block.direction === D.WEST && block.pos.x < 1) {


            block.direction = D.EAST
            let draftBlock = { ...block, pos: { x: block.pos.x + 1, y: block.pos.y } }
            block = draftBlock

            return
        }

        if (block.direction === D.WEST) {
            let draftBlock = { ...block, pos: { x: block.pos.x - 1, y: block.pos.y } }
            block = draftBlock
            return
        }


    }, speed);




    movingObjectInterval()


    canvas.width = width * cellPixel;
    canvas.height = height * cellPixel;



    const drawOject = (color = "green", width = cellPixel, height = cellPixel) => {
        if (!ctx) return

        ctx.fillStyle = color
        ctx.fillRect((movingObject.pos.x), (movingObject.pos.y), width, height)




    }




    const drawBlock = () => {
        if (!ctx) return

        ctx.fillStyle = "black"
        ctx.fillRect((block.pos.x) * cellPixel, (block.pos.y) * cellPixel, cellPixel, cellPixel)




    }



    function drawUI() {
        if (!ctx) return
        ctx.fillStyle = "pink"
        ctx.font = "bold 24px monospace";
        ctx.fillText(`FPS: ${framesPerSec}`, 5, 25);
    }


    function paintMap() {
        if (!ctx) return


        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {



                ctx.fillStyle = map[y][x]

                ctx.fillRect(x * cellPixel, y * cellPixel, cellPixel, cellPixel);
            }
        }
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





        cleanCanvas();
        paintMap()

        drawBlock();

        drawOject()

        drawUI();
    }
    draw()

}