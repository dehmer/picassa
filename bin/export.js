#!/usr/bin/env node
const { promisify } = require('util')
const fs = require('fs')
const { Transform, Writable } = require('stream')
const { createConverter } = require('convert-svg-to-png')
const level = require('level')

const SCALE = 0.25 // supported: 1.0, 0.5, 0.25

const access = promisify(fs.access)
const writeFile = promisify(fs.writeFile)
const db = level('db', { valueEncoding: 'json' })
const pngPath = (sidc, uuid) => `tmp/png/${sidc}/${uuid}.png`
const svgPath = (sidc, uuid) => `tmp/svg/${sidc}/${uuid}.svg`

const mkdir = name => {
  if (fs.existsSync(name)) return
  fs.mkdirSync(name)
}


/**
 *
 */
const filter = new Transform({
  objectMode: true,
  async transform ({ key, value }, _, next) {
    const [sidc, uuid] = key.split(':')
    const file = pngPath(sidc, uuid)
    try {
      await access(file, fs.constants.F_OK)
      next() // file already exists, nothing to do.
    } catch (err) {
      const { bbox, path } = value
      this.push({ sidc, uuid, bbox, lines: path })
      next()
    }
  }
})


/**
 *
 */
const STYLE = 'fill:none; stroke-width:5px; stroke:black; stroke-linejoin:round; stroke-linecap:round;'
const WIDTH = 260
const HEIGHT = 200

const normalizedSVG = new Transform({
  objectMode: true,
  transform ({ sidc, uuid, bbox, lines }, _, next) {
    const cx = bbox.width / 2 + bbox.x
    const cy = bbox.height / 2 + bbox.y
    const rx = bbox.width / WIDTH
    const ry = bbox.height / HEIGHT
    const s = 1 + (1 - Math.max(rx, ry))

    // NOTE: application is right to left
    const transform = `translate(${WIDTH * SCALE / 2} ${HEIGHT * SCALE / 2}) scale(${SCALE}) scale(${s}) translate(${-cx} ${-cy}) `

    const paths = lines.map(line => {
      const [head, ...tail] = line.split(',')
      return `<g style="${STYLE}" transform="${transform}">` +
             '<path d="M ' + head + tail.map(tuple => ' L ' + tuple).join('') + `"></path>` +
             '</g>'
    })

    const svg =
`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="${WIDTH * SCALE}" height="${HEIGHT * SCALE}">
  ${paths.join('')}
</svg>`

    this.push({ sidc, uuid, svg })
    next()
  }
})


/**
 *
 */
mkdir('tmp/svg')
const svgWriter = new Transform({
  objectMode: true,
  async transform ({ sidc, uuid, svg }, _, next) {
    try {
      mkdir(`tmp/svg/${sidc}`)
      const file = `tmp/svg/${sidc}/${uuid}.svg`
      await writeFile(file, svg)
      this.push({ sidc, uuid })
      next()
    } catch (err) {
      next(err)
    }
  }
})


/**
 *
 */
mkdir('tmp/png')
const converter = createConverter()
const pngCreator = new Writable({
  objectMode: true,
  async write ({ sidc, uuid }, _, next) {
    const now = Date.now()
    const inputFilePath = svgPath(sidc, uuid)
    const outputFilePath = pngPath(sidc, uuid)
    try {
      mkdir(`tmp/png/${sidc}`)
      await converter.convertFile(inputFilePath, { outputFilePath })
      console.log('created', outputFilePath, (Date.now() - now), 'ms')
      next()
    } catch (err) {
      next(err)
    }
  },
  async final (next) {
    await converter.destroy()
    next()
  }
})


const stream = db.createReadStream({ limit: null })
  .pipe(filter)
  .pipe(normalizedSVG)
  .pipe(svgWriter)
  .pipe(pngCreator)

stream.on('error', err => console.log(err))
