import React from 'react'
import PropTypes from 'prop-types'

const DrawingLine = ({ line }) => {
  const path = 'M ' + line
    .map(p => p.get('x') + ' ' + p.get('y'))
    .join(' L ')

  return <path className='path' d={ path } />
}

DrawingLine.propTypes = {
  line: PropTypes.object.isRequired
}

export default DrawingLine
