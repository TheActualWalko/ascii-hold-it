const getAsciiPlaceholder = require('./index.js');
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
      scale: $(el).attr('data-asciiholdit'),
      el
    })
  });
  return Promise.all(
    images.map(
      ({src, el, classname, scale}) => 
        getAsciiPlaceholder(src, scale).then(
          placeholder => $(el).replaceWith(`
            <div class="asciiholdit ${classname}" style="font-size: ${(7/4)*scale}px; line-height: ${2*scale}px;">
              <pre>${placeholder}</pre>
              <img src="${src}" />
            </div>
          `)
      )
    )
  ).then(() => $.html());
}

app.get('/', (req, res) => buildHomepage().then(res.send.bind(res)));
app.get('/cat.jpg', (req, res) => res.sendFile(resolve(__dirname, `cat.jpg`)));
app.listen(3000, () => console.log('Listening on 3000'));