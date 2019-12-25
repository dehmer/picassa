#!/usr/bin/env node
const level = require('level')
const path = '/Users/dehmer/Library//Application Support/picassa/Local Storage/leveldb'
const db = level(path, { valueEncoding: 'json' })

db.createReadStream()
  .on('data', data => console.log(data))
  .on('close', () => console.log('done'))
