const getPixels = require('get-pixels');
const load = (path) => 
  new Promise((res, rej) => 
    getPixels(path, (err, pixels) => 
      err 
        ? rej(err) 
        : res(pixels)
    )
  );

const rgbValue = (r,g,b) => ((r + g + b) / (255 * 3))

const grayscale = (pixels) => {
  const [width, height, numChannels] = pixels.shape;
  const output = [];
  for (let x = 0; x < width; x ++) {
    output.push([]);
    for (let y = 0; y < height; y ++) {
      if (numChannels === 1) { // first divided by 255
        output[x][y] = pixels.get(x,y,0) / 255;
      } else if (numChannels === 4) {  // sum the first 3, divide by 255, multiply by 4th/255
        const gray = rgbValue(pixels.get(x,y,0), pixels.get(x,y,1), pixels.get(x,y,2));
        const alpha = pixels.get(x,y,3) / 255;
        output[x][y] = gray * alpha;
      } else { // sum the first 3, divide by 255
        output[x][y] = rgbValue(pixels.get(x,y,0), pixels.get(x,y,1), pixels.get(x,y,2));
      }
    }
  }
  return output;
}

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
  .then(grayscale)
  .then(resFactor(8, 16))
  .then(ascii)
  .catch(e => console.error(e))