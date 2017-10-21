const getPixels = require('get-pixels');
const cache = {};
const load = (path) => 
  new Promise((res, rej) => 
    getPixels(path, (err, pixels) => 
      err 
        ? rej(err) 
        : res(pixels)));

const ratio = byte => byte/255;
const average = xs => xs.reduce((s,x) => s+x, 0) / xs.length
const readChannels = (pixels, x, y) => [0,1,2].map(i => pixels.get(x,y,i))

const nest = (xRatio, yRatio) => pixels => {
  const [width, height, numChannels] = pixels.shape;
  console.log(width, height, numChannels, xRatio, yRatio);
  const output = [];
  for (let y = 0; y < height; y += yRatio) {
    const row = [];
    for (let x = 0; x < width; x += xRatio) {
      row.push(readChannels(pixels, x, y, numChannels));
    }
    output.push(row);
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

const charset = " .-*@#";

const closestChar = (ratio) => charset[Math.floor((charset.length - 1) * ratio)]

const ascii = valueGrid => 
  valueGrid
    .map((row) => 
      row.map(closestChar)
        .join(''))
    .join('\n')

module.exports = (path, xRatio, yRatio) => load(path)
  .then(nest(xRatio, yRatio))
  .then(grayscale)
  .then(ascii)
  .catch(e => console.error(e))