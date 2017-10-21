const getAsciiPlaceholder = require('./index.js');
const {resolve} = require('path');
const fs = require('fs');
const express = require('express');
const cheerio = require('cheerio');
const app = express();


const buildHomepage = () => {
  const $ = cheerio.load(fs.readFileSync('index.html', 'utf8'));
  const srcs = [];
  const elems = [];
  $('[data-asciiholdit]').each((i, element) => {
    srcs.push($(element).attr('src'));
    elems.push(element);
  });
  return Promise
    .all(srcs.map(s => getAsciiPlaceholder(s)))
    .then((placeholders) => elems.forEach((e, i) => {
      $(e).replaceWith(`
        <div class="asciiholdit ${$(e).attr('class')}">
          <pre>${placeholders[i]}</pre>
          <img src="${srcs[i]}" />
        </div>
      `)
    }))
    .then(() => $.html());
}

app.get('/', (req, res) => buildHomepage().then(res.send.bind(res)));
app.get('/cat.jpg', (req, res) => res.sendFile(resolve(__dirname, `cat.jpg`)));
app.listen(3000, () => console.log('Listening on 3000'));