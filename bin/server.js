#!/usr/bin/env node

const path = require('path')
const level = require('level')
const uuid = require('uuid-random')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('../config/server.json')
const db = level('db', { valueEncoding: 'json' })
const app = express()

app.use(express.static(path.join('dist')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const listener = app.listen(config.port, config.host, () => {
  console.log('server bound:', listener.address())
})

app.post('/symbols/:sidc', (req, res) => {
  const { params, body } = req
  db.put(`${params.sidc}:${uuid()}`, body).then(() => res.end())
})

app.get('/symbols', (req, res) => {
  const acc = {}
  db.createReadStream()
    .on('data', data => (acc[data.key] = data.value))
    .on('close', () => res.end(JSON.stringify(acc)))
})
