#!/usr/bin/env node

const fs = require('fs');

if (process.argv.length < 4) {
    console.log("convert.js file.scr varPrefix");
    process.exit();
}

try {

    var cc = fs.readFileSync(process.argv[2]);
    // bitmap
    // http://www.zx-modules.de/fileformats/scrformat.html#screen%20third
    chars = [];
    for (var col = 0; col < 32; col++) {
        for (var block = 0; block < 3; block++) {
            for (var line = 0; line < 8; line++) {
                for (var slot = 0; slot < 2048; slot += 256) {
                    var offset = slot + col + 32 * line + 2048 * block;
                    chars.push(cc[offset].toString(10));
                }
            }
        }
    }
    console.log(process.argv[3] + "Data:");
    console.log("ASM");
    console.log("defb " + chars.join(", "));
    console.log("END ASM");

    // colors
    chars = [];
    for (var color = 0; color < 768; color++) {
        chars.push(cc[6144 + color].toString(10));
    }

    console.log(process.argv[3] + "Colors:");
    console.log("ASM");
    console.log("defb " + chars.join(", "));
    console.log("END ASM");

} catch (e) {
    console.log(e);
    process.exit();
};
