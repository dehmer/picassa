import path from 'path'
import React from 'react'
import { remote } from 'electron'
import level from 'level'
import uuid from 'uuid-random'

export const db = level('db', { valueEncoding: 'json' })
const express = window.require('express')
const bodyParser = window.require('body-parser')

const app = express()
app.use(express.static(path.join(remote.app.getAppPath(), 'dist')))
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

const Server = () => <h1>Server</h1>
export default Server
