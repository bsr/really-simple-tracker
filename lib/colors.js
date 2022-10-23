/**
 * add colors to strings for console output
 * reference: https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797#colors--graphics-mode
 *
 */

import convert from "color-convert";
import colors from "color-name";

const ESC = "\x1B";

const rangeBig = [25, 50, 75, 100, 125, 150, 175, 200, 225, 255];
const rangeSmall = [50, 100, 150, 200, 255];

function text(color, string) {
    let [r, g, b] = color;
    let retval = `\x1B[38;2;${r};${g};${b}m${string}\x1B[39m`;
    // console.log("retval", retval);
    return retval;
}

function range(rangeArray, index) {
    if (rangeArray[index] === undefined) {
        return rangeArray[rangeArray.length - 1];
    }
    return rangeArray[index];
}

/**
 * return a sequence of colors from -> to in the HSL space in n steps
 * @param {[r,g,b]} from color to start at
 * @param {[r,g,b]} to color to end at
 * @param {integer} steps number of steps to
 */
function sequence(from, to, steps) {
    let fromHSL = convert.rgb.hsl(from);
    let toHSL = convert.rgb.hsl(to);

    let hStep = (toHSL[0] - fromHSL[0]) / (steps - 1);
    let sStep = (toHSL[1] - fromHSL[1]) / (steps - 1);
    let lStep = (toHSL[2] - fromHSL[2]) / (steps - 1);

    let sequence = [fromHSL];
    for (let i = 1; i < steps; i++) {
        let [h, s, l] = sequence[i - 1];
        sequence[i] = [h + hStep, s + sStep, l + lStep];
    }

    sequence = sequence
        // .map((e) => {
        //     let [h, s, l] = e;
        //     return [Math.round(h), Math.round(s), Math.round(l)];
        // })
        .map((e) => {
            return convert.hsl.rgb(e);
        });

    return sequence;
}

export { text, range, rangeBig, rangeSmall, colors, sequence };
