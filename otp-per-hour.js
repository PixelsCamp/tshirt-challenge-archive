a = function () {
    let otps = ["1", "2", "3", "4"];
    i = Math.floor(Date.now() / (60 * 60 * 1000)) % otps.length;
    return otps[i];
}