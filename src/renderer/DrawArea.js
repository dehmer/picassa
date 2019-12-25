import React, { useRef, useState, useEffect, useCallback } from 'react'
import Immutable from 'immutable'
import Drawing from './Drawing'
import evented from './evented'

const DrawArea = () => {
  const drawArea = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [lines, setLines] = useState(Immutable.List())
  const [bbox, setBBox] = useState({})

  const clear = useCallback(() => {
    setLines(Immutable.List())
    setBBox({})
  }, [bbox, lines])

  const submit = useCallback(event => {
    const { detail } = event

    const payload = lines.map(line =>
      line.map(point => `${point.get('x')} ${point.get('y')}`).join(',')
    )

    var xhr = new XMLHttpRequest()
    xhr.open('POST', `http://192.168.1.199:8002/symbols/${detail.sidc}`, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
      bbox: {
        height: bbox.height,
        width: bbox.width,
        x: bbox.x,
        y: bbox.y
      },
      path: payload
    }))
    setLines(Immutable.List())
  }, [bbox, lines])

  useEffect(() => {
    evented.addEventListener('clear', clear)
    evented.addEventListener('submit', submit)

    return () => {
      evented.removeEventListener('clear', clear)
      evented.removeEventListener('submit', submit)
    }
  }, [bbox, lines, clear, submit])

  const touchstart = event => {
    if (event.touches.length !== 1) return

    event.preventDefault()
    setDrawing(true)
    const point = relativeCoordinates(event.touches[0])
    setLines(lines.push(Immutable.List([point])))
  }

  const touchmove = event => {
    if (!drawing) return

    event.preventDefault()
    const point = relativeCoordinates(event.touches[0])
    setLines(lines.updateIn([lines.size - 1], line => line.push(point)))
  }

  const touchend = event => {
    event.preventDefault()
    setDrawing(false)
  }

  const relativeCoordinates = event => {
    const { left, top } = drawArea.current.getBoundingClientRect()
    return new Immutable.Map({
      x: event.clientX - left,
      y: event.clientY - top
    })
  }

  const mousedown = event => {
    setDrawing(true)
    const point = relativeCoordinates(event)
    setLines(lines.push(Immutable.List([point])))
  }

  const mouseup = event => {
    setDrawing(false)
  }

  const mousemove = event => {
    if (!drawing) return
    const point = relativeCoordinates(event)
    setLines(lines.updateIn([lines.size - 1], line => line.push(point)))
  }

  const bboxChanged = bbox => {
    setBBox(bbox)
    console.log('bbox', bbox)
  }

  return (
    <div
      ref={ drawArea }
      className={ 'drawing' }
      onMouseDown={ mousedown }
      onMouseMove={ mousemove }
      onMouseUp={ mouseup }
      onTouchStart={ touchstart }
      onTouchMove={ touchmove }
      onTouchEnd={ touchend }
    >
      <Drawing bboxChanged={ bboxChanged } lines={ lines } />
    </div>
  )
}

export default DrawArea
