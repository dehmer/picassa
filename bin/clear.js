#!/usr/bin/env node
const level = require('level')
const db = level('db', { valueEncoding: 'json' })

db.del('SFGPUCIM--:7aeda11d-8211-467f-9131-1ca121c6b36e')
db.del('SFGPUCAA--:db29fc78-6d1a-4dc3-895c-729ac8cdb947')
db.del('SFGPUCV---:cd83cac6-74d2-4af9-bd3b-f2c5d5078948')
