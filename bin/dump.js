#!/usr/bin/env node
const level = require('level')
const db = level('db', { valueEncoding: 'json' })

db.createReadStream().on('data', data => console.log(data))
