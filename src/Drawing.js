import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import DrawingLine from './DrawingLine'

const Drawing = ({ bboxChanged, lines }) => {
  const ref = useRef()

  useEffect(() => {
    const bbox = ref.current.getBBox()
    bboxChanged(bbox)
  }, [lines])

  return (
    <svg ref={ ref } className='svg'>
      {lines.map((line, index) => (
        <DrawingLine key={index} line={line} />
      ))}
    </svg>
  )
}

Drawing.propTypes = {
  bboxChanged: PropTypes.func.isRequired,
  lines: PropTypes.object.isRequired
}

export default Drawing
