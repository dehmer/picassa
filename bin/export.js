#!/usr/bin/env node
const fs = require('fs')
const { createConverter } = require('convert-svg-to-png')
const train = require('../data/symbols-train-4.json')

const WIDTH = 260
const HEIGHT = 200

const style = 'style="fill:none; stroke-width:5px;stroke:black;stroke-linejoin:round;stroke-linecap:round;"'

const mkdir = name => {
  if (fs.existsSync(name)) return
  fs.mkdirSync(name)
}

mkdir('tmp')
mkdir('tmp/svg')
mkdir('tmp/png')

Object.keys(train).forEach(key => {
  const [sidc] = key.split(':')
  mkdir(`tmp/svg/${sidc}`)
  mkdir(`tmp/png/${sidc}`)
})

Object.entries(train).forEach(([key, value]) => {
  const [sidc, uuid] = key.split(':')
  const { bbox } = value

  const cx = bbox.width / 2 + bbox.x
  const cy = bbox.height / 2 + bbox.y
  const rx = bbox.width / WIDTH
  const ry = bbox.height / HEIGHT
  const s = 1 + (1 - Math.max(rx, ry))

  // NOTE: application is right to left
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${s}) translate(${-cx} ${-cy}) `

  const paths = value.path.map(line => {
    const [head, ...tail] = line.split(',')
    const g =
      `<g ${style} transform="${transform}">` +
      '<path d="M ' + head + tail.map(tuple => ' L ' + tuple).join('') + `"></path>` +
      '</g>'

    return g
  })

  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="${WIDTH}" height="${HEIGHT}">
  ${paths.join('')}
</svg>
  `

  fs.writeFileSync(`tmp/svg/${sidc}/${uuid}.svg`, svg)
})

;(async () => {
  const converter = createConverter()
  const queue = Object.keys(train)
    .map(key => key.split(':'))
    .filter(([sidc, uuid]) => !fs.existsSync(`tmp/png/${sidc.substring(0, 10)}/${uuid}.png`))

  try {
    for (const [sidc, uuid] of queue) {
      const now = Date.now()
      const inputFilePath = `tmp/svg/${sidc}/${uuid}.svg`
      const outputFilePath = `tmp/png/${sidc}/${uuid}.png`
      await converter.convertFile(inputFilePath, { outputFilePath })
      console.log('converted', inputFilePath, (Date.now() - now), 'ms')
    }
  } finally {
    await converter.destroy()
  }
})()
