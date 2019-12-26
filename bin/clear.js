#!/usr/bin/env node
const level = require('level')
const db = level('db', { valueEncoding: 'json' })

db.del('SFGPUCIM--:7aeda11d-8211-467f-9131-1ca121c6b36e')
