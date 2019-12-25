#!/usr/bin/env node
const fs = require('fs')
const level = require('level')
const db = level('db', { valueEncoding: 'json' })
const R = require('ramda')

;(async () => {
  const ops = R.range(1, 5).reduce((acc, i) => {
    const entries = JSON.parse(fs.readFileSync(`data/symbols-train-${i}.json`).toString())
    acc = Object.entries(entries).reduce((acc, [key, value]) => {
      acc.push({ type: 'put', key, value })
      return acc
    }, acc)

    return acc
  }, [])

  await db.batch(ops)
})()
