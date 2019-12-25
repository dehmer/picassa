#!/usr/bin/env node

const path = require('path')
const level = require('level')
const uuid = require('uuid-random')
const express = require('express')
const bodyParser = require('body-parser')

const db = level('db', { valueEncoding: 'json' })

const app = express()
app.use(express.static(path.join('dist')))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(8002, '192.168.1.199', () => {
  console.log('server bound.')
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
