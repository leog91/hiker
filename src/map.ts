



const mapElem = ["TREE", "WATER", "ROCK", "WALL"]



export const generateMap = (cols: number = 5, rows: number = 10): {
    pos: {
        x: number;
        y: number;
    };
    elem: string;
}[][] => {



    const randomElem = () => mapElem[Math.floor(Math.random() * mapElem.length)]



    const map = []

    for (let y = 0; y < rows; y++) {
        // const element = array[x];
        const row = []

        for (let x = 0; x < cols; x++) {



            // const elemq = 

            const cell = { pos: { x: x, y: y }, elem: (Math.random() < .7) ? "GRASS" : randomElem() }

            row.push(cell)

        }
        map.push(row)

    }

    // console.log(map)

    console.log("===================")
    console.log("-------", new Date().getMilliseconds(), "-------")
    console.log("===================")

    return map



}



// generateMap()

