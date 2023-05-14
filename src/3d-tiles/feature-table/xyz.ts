import { Bounds } from 'ept'

import * as Constants from '3d-tiles/pnts/constants'
import { Params } from '3d-tiles/types'
import { Reproject } from 'utils'
import { Bounds as CopcBounds } from 'copc'

export const Xyz = { create, createFromCopc }

function create({
  view,
  tileBounds,
  toEcef,
  options: { zOffset = 0 },
}: Params) {
  const { getter, length } = view
  const getters = ['X', 'Y', 'Z'].map(getter)

  const buffer = Buffer.allocUnsafe(length * Constants.xyzSize)
  const mid = Bounds.mid(Bounds.reproject(tileBounds, toEcef))

  for (let index = 0, offset = 0; index < length; ++index) {
    const x = getters[0](index)
    const y = getters[1](index)
    const z = getters[2](index) + zOffset
    toEcef([x, y, z]).forEach((v, i) => {
      buffer.writeFloatLE(v - mid[i], offset)
      offset += 4
    })
  }

  return buffer
}

interface ICreateFromCopcArgs {
  getters: ((index: number) => number)[]
  length: number
  tileBounds: CopcBounds
  toEcef: Reproject
  options: Record<string, any>
}

function createFromCopc({
  getters,
  length,
  tileBounds,
  toEcef,
  options: { zOffset = 0 },
}: ICreateFromCopcArgs) {
  console.log('LENGTH', length)
  const buffer = Buffer.allocUnsafe(length * Constants.xyzSize)
  const mid = Bounds.mid(Bounds.reproject(tileBounds, toEcef))

  for (let index = 0, offset = 0; index < length; ++index) {
    const x = getters[0](index)
    const y = getters[1](index)
    const z = getters[2](index) + zOffset
    toEcef([x, y, z]).forEach((v, i) => {
      buffer.writeFloatLE(v - mid[i], offset)
      offset += 4
    })
  }

  return buffer
}
