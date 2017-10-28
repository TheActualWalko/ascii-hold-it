const {resolve} = require('path');
const express = require('express');
const app = express();
const asciiholdit = require('./asciiholdit.js');

app.get('/', asciiholdit('index.html'));
app.use('/pics', (req,res,next) => setTimeout(next, 1000));
app.use('/pics', express.static('pics'));
app.listen(3000, () => console.log('Listening on 3000'));