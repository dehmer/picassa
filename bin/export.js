#!/usr/bin/env node
const { promisify } = require('util')
const fs = require('fs')
const { Transform, Writable } = require('stream')
const { createConverter } = require('convert-svg-to-png')
const level = require('level')

const access = promisify(fs.access)
const writeFile = promisify(fs.writeFile)
const db = level('db', { valueEncoding: 'json' })
const pngPath = (sidc, uuid) => `tmp/png/${sidc}/${uuid}.png`
const svgPath = (sidc, uuid) => `tmp/svg/${sidc}/${uuid}.svg`

const mkdir = name => {
  if (fs.existsSync(name)) return
  fs.mkdirSync(name)
}

;['tmp', 'tmp/svg', 'tmp/png'].forEach(mkdir)


/**
 * Only process image data without existing PNG file.
 */
const filter = () => new Transform({
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
const normalizedSVG = () => {
  const STYLE = 'fill:none; stroke-width:5px; stroke:white; stroke-linejoin:round; stroke-linecap:round;'
  const WIDTH = 260
  const HEIGHT = 200
  const SCALE = 0.25 // supported: 1.0, 0.5, 0.25

  return new Transform({
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
}


/**
 *
 */
const svgWriter = () => new Transform({
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
const pngCreator = () => {
  const converter = createConverter()
  const convert = async ({ sidc, uuid }) => {
    const now = Date.now()
    const inputFilePath = svgPath(sidc, uuid)
    const outputFilePath = pngPath(sidc, uuid)
    const options = { outputFilePath, background: 'black' }
    mkdir(`tmp/png/${sidc}`)
    await converter.convertFile(inputFilePath, options)
    console.log(`created ${outputFilePath} ${Date.now() - now} ms`)
    /* undefined */
  }

  return new Writable({
    objectMode: true,
    write: (chunk, _, next) => convert(chunk).then(next).catch(next),
    async final (next) {
      await converter.destroy()
      next()
    }
  })
}

const stream = db.createReadStream({ limit: null })
  .pipe(filter())
  .pipe(normalizedSVG())
  .pipe(svgWriter())
  .pipe(pngCreator())

stream.on('error', err => {
  console.error(err.message)
  process.exit(-1)
})
