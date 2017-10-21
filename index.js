const getPixels = require('get-pixels');
const load = (path) => 
  new Promise((res, rej) => 
    getPixels(path, (err, pixels) => 
      err 
        ? rej(err) 
        : res(pixels)
    )
  );

const ratio = (byte) => byte/255;
const average = (xs) => xs.reduce((s,x) => s+x, 0) / xs.length
const readChannels = (pixels, x, y) => [0,1,2].map(i => pixels.get(x,y,i))

const nest = (pixels) => {
  const [width, height, numChannels] = pixels.shape;
  const output = [];
  for (let x = 0; x < width; x ++) {
    output.push([]);
    for (let y = 0; y < height; y ++) {
      output[x][y] = readChannels(pixels, x, y, numChannels);
    }
  }
  return output;
}

const grayscale = (grid) => 
  grid.map(
    column => column.map(
      channels => 
        channels.length === 4
          ? ratio(average(channels.slice(0,3))) * ratio(channels[3])
          : ratio(average(channels))
    )
  );

const resFactor = (factorX, factorY = factorX) => (grid) => {
  const output = [];
  for (let x = 0; x < grid.length; x += factorX) {
    output.push([]);
    for (let y = 0; y < grid[x].length; y += factorY) {
      output[x/factorX][y/factorY] = grid[x][y];
    }
  }
  return output;
}

const charset = "   .-*###";

const ascii = (grid) => {
  let output = "";
  for (let y = 0; y < grid[0].length; y ++) {
    for (let x = 0; x < grid.length; x ++) {
      output += charset[Math.floor((charset.length - 1) * grid[x][y])]
    }
    if (y < grid[0].length-1) {
      output += '\n';
    }
  }
  return output;
};

module.exports = (path) => load(path)
  .then(nest)
  .then(resFactor(8, 16))
  .then(grayscale)
  .then(ascii)
  .catch(e => console.error(e))