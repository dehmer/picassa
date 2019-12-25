import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import ms from 'milsymbol'
import './renderer.css'
import evented from './evented'
import DrawArea from './DrawArea'

const symbols = [
  { sidc: 'SFGPUCD---', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AIR DEFENSE' },
  { sidc: 'SFGPUCDG--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AIR DEFENSE / GUN UNIT' },
  { sidc: 'SFGPUCA---', hierarchy: 'GROUND TRACK / UNIT / COMBAT / ARMOR' },
  { sidc: 'SFGPUCAA--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / ANTIARMOR' },
  { sidc: 'SFGPUCAAA-', hierarchy: 'GROUND TRACK / UNIT / COMBAT / ANTIARMOR / ARMORED' },
  { sidc: 'SFGPUCAAO-', hierarchy: 'GROUND TRACK / UNIT / COMBAT / ANTIARMOR / MOTORIZED' },
  { sidc: 'SFGPUCI---', hierarchy: 'GROUND TRACK / UNIT / COMBAT / INFANTRY' },
  { sidc: 'SFGPUCIM--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / INFANTRY / MOTORIZED' },
  { sidc: 'SFGPUCIZ--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / INFANTRY / MECHANIZED' },
  { sidc: 'SFGPUCV---', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AVIATION' },
  { sidc: 'SFGPUCVF--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AVIATION / FIXED WING' },
  { sidc: 'SFGPUCVR--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AVIATION / ROTARY WING' },
  { sidc: 'SFGPUCVRUE', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AVIATION / ROTARY WING / MEDEVAC' },
  { sidc: 'SFGPUCVS--', hierarchy: 'GROUND TRACK / UNIT / COMBAT / AVIATION / SEARCH AND RESCUE' },
  { sidc: 'SFGPUCE---', hierarchy: 'GROUND TRACK / UNIT / COMBAT / ENGINEER' },
  { sidc: 'SFGPUCF---', hierarchy: 'GROUND TRACK / UNIT / COMBAT / FIELD ARTILLERY' },
  { sidc: 'SFGPUCFHE-', hierarchy: 'GROUND TRACK / UNIT / COMBAT / FIELD ARTILLERY / HOWITZER/GUN / SELF-PROPELLED' }
]

const randomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)]

const App = () => {
  const [symbol, setSymbol] = useState(randomSymbol())

  const onClear = () => {
    evented.dispatchEvent(new CustomEvent('clear'))
  }

  const onSkip = () => {
    evented.dispatchEvent(new CustomEvent('clear'))
    setSymbol(randomSymbol())
  }

  const onSubmmit = () => {
    evented.dispatchEvent(new CustomEvent('submit', { detail: { sidc: symbol.sidc } }))
    setSymbol(randomSymbol())
  }

  const url = new ms.Symbol(symbol.sidc, {}).asCanvas().toDataURL()
  return (
    <div className={ 'container' }>
      <h1 className={ 'title' }>Picassa: Learn me some Symbols</h1>
      <div className={ 'hierarchy' }>{ symbol.hierarchy }</div>
      <img className={ 'symbol' } src={ url }></img>
      <DrawArea/>
      <div className={ 'sidc' }>{ symbol.sidc }</div>
      <div className={ 'buttons' }>
        <Button variant="contained" onClick={ onClear }>Clear</Button>
        <Button variant="contained" onClick={ onSkip }>Skip</Button>
        <Button variant="contained" color="primary" onClick={ onSubmmit }>Submit</Button>
      </div>
    </div>
  )
}

export default App
