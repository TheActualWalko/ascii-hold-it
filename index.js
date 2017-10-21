const getPixels = require('get-pixels');
const load = (path) => 
  new Promise((res, rej) => 
    getPixels(path, (err, pixels) => 
      err 
        ? rej(err) 
        : res(pixels)));

const ratio = byte => byte/255;
const average = xs => xs.reduce((s,x) => s+x, 0) / xs.length
const readChannels = (pixels, x, y) => [0,1,2].map(i => pixels.get(x,y,i))

const nest = pixels => {
  const [width, height, numChannels] = pixels.shape;
  const output = [];
  for (let y = 0; y < height; y ++) {
    output.push([]);
    for (let x = 0; x < width; x ++) {
      output[y][x] = readChannels(pixels, x, y, numChannels);
    }
  }
  return output;
}

const grayscale = multiChannelGrid => 
  multiChannelGrid.map(
    row => 
      row.map(channels => 
        channels.length === 4
          ? ratio(average(channels.slice(0,3))) * ratio(channels[3])
          : ratio(average(channels))));

const everyNth = (array, n) => array.filter((x, i) => !(i % n))

const resFactor = (factorX, factorY = factorX) => 
  grid =>
    everyNth(grid, factorY)
      .map(row => 
        everyNth(row, factorX));

const charset = "   .-*###";

const closestChar = (ratio) => charset[Math.floor((charset.length - 1) * ratio)]

const ascii = valueGrid => 
  valueGrid
    .map((row) => 
      row.map(closestChar)
        .join(''))
    .join('\n')

module.exports = path => load(path)
  .then(nest)
  .then(resFactor(8, 16))
  .then(grayscale)
  .then(ascii)
  .catch(e => console.error(e))