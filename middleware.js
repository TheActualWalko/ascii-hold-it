const asciiholdit = require('./asciiholdit');

module.exports = (filename) => (req, res, next) => asciiholdit(filename).then(next);