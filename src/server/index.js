import React from 'react'
import ReactDOM from 'react-dom'
import Server from './Server'

// Create root </div> to mount application in:
const rootId = 'root'
const root = document.createElement('div')
root.id = rootId
document.body.appendChild(root)
ReactDOM.render(<Server/>, root)
