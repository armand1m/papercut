const unified = require('unified')
const stream = require('unified-stream')
const markdown = require('remark-parse')
const stringify = require('remark-stringify')
const contributors = require('remark-contributors')
const gfm = require('remark-gfm');
const codeImport = require('./codeImport')
const packageJson = require('../package.json');

const processor = unified()
  .use(markdown)
  .use(gfm)
  .use(contributors, {
    contributors: packageJson.contributors,
  })
  .use(codeImport)
  .use(stringify)

process.stdin.pipe(stream(processor)).pipe(process.stdout)
