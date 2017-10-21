const getAsciiPlaceholder = require('./to-ascii.js');
const {resolve} = require('path');
const fs = require('fs');
const express = require('express');
const cheerio = require('cheerio');
const app = express();


const buildHomepage = () => {
  const $ = cheerio.load(fs.readFileSync('index.html', 'utf8'));
  const images = [];
  $('[data-asciiholdit]').each((i, el) => {
    images.push({
      src: $(el).attr('src'),
      classname: $(el).attr('class'),
      scale: +$(el).attr('data-asciiholdit'),
      el
    })
  });
  return Promise.all(
    images.map(
      ({src, el, classname, scale}) => 
        getAsciiPlaceholder(src, scale, 1.5 * scale).then(
          placeholder => $(el).replaceWith(`
            <div class="asciiholdit ${classname}">
              <pre style="
                font-size: ${1.67*scale}px; 
                line-height: ${1.5 * scale}px; 
                filter: blur(${scale*0.75}px);
                margin-top: ${-scale/2}px;
                margin-left: ${scale*(-3/8)}px;
              ">${placeholder}</pre>
              <img src="${src}" />
            </div>
          `)
      )
    )
  ).then(() => $.html());
}

app.get('/', (req, res) => buildHomepage().then(res.send.bind(res)));
app.use('/pics', express.static('pics'));
app.listen(3000, () => console.log('Listening on 3000'));