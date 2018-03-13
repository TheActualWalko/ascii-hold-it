const getAsciiPlaceholder = require('./to-ascii.js');
const cheerio = require('cheerio');
const fs = require('fs');

module.exports = (filename) => {
  const $ = cheerio.load(fs.readFileSync(filename, 'utf8'));
  const images = [];
  $('[data-asciiholdit]').each((i, el) => {
    $(el).attr('data-asciiholdit-index', i);
    $(el).addClass('asciiholdit-hidden');
    images.push({
      src: $(el).attr('src'),
      classname: $(el).attr('class'),
      scale: +$(el).attr('data-asciiholdit'),
      el
    })
  });
  return Promise.all(
    images.map(
      ({src, el, classname, scale}, index) =>
        getAsciiPlaceholder(src, scale, 1.5 * scale).then(
          placeholder => `
          <pre class="asciiholdit" data-asciiholdit-index="${index}" style="
            font-size:${1.67*scale}px;
            line-height:${1.5*scale}px;
            //filter:blur(${scale*0.75}px);
            margin-top:${-scale/2}px;
            margin-left:${scale*(-3/8)}px;
            position:absolute;
          ">${placeholder}</pre>`
      )
    )
  ).then((placeholders) => {
    $('head').append(`
      <script>const getAsciiPlaceholder = (x) => ${JSON.stringify(placeholders)}[+x];</script>
      <style>
        .asciiholdit {
          background-color: #333;
          color: #fff;
          position:relative;
          font-family: 'Courier New';
          opacity: 1;
          transition: opacity 0.5s ease;
          padding: 0;
          margin: 0;
          overflow: hidden;
          left: auto;
          right: auto;
        }

        .asciiholdit-hidden {
          opacity: 0;
        }
      </style>
    `);
    $('body').append(`
      <script>
        const doPlaceholder = (firstLoad) => {
          document.querySelectorAll('img[data-asciiholdit]').forEach(img => {
            const index = img.getAttribute('data-asciiholdit-index');
            if (firstLoad) {
              img.insertAdjacentHTML(
                'beforeBegin',
                getAsciiPlaceholder(index)
              );
            }
            const placeholder = document.querySelector(\`pre[data-asciiholdit-index="\${index}"]\`);
            const scaleFactor = img.clientWidth / placeholder.clientWidth;
            placeholder.style.transform = \`scale(\${scaleFactor})\`;
            if (firstLoad) {
              placeholder.style.position = 'absolute';
              placeholder.style.transformOrigin = '0 0';
              img.style.display = 'block';
              img.style.height = (placeholder.clientHeight * scaleFactor) + 'px';
              img.className = img.className.replace('asciiholdit-hidden', '');
            } else {

            }
            placeholder.style.top = \`\${img.offsetTop}px\`;
            if (firstLoad) {
              img.addEventListener('load', () => {
                placeholder.className += ' asciiholdit-hidden'
                img.style.display = '';
                img.style.height = '';
              });
            }
          });
        }
        document.addEventListener('DOMContentLoaded', () => {
          doPlaceholder(true);
        });
        window.addEventListener('resize', () => {
          doPlaceholder(false);
        });
      </script>
    `);
    return $.html();
  });
}