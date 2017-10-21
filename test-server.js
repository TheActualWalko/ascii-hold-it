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
      el
    })
  });
  return Promise.all(
    images.map(
      ({src, el, classname}) => 
        getAsciiPlaceholder(src).then(
          placeholder => $(el).replaceWith(`
            <div class="asciiholdit ${classname}">
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