import { Params } from '3d-tiles/types'
import { padEnd, sumLengths } from '3d-tiles/utils'
import { Bounds, Schema } from 'ept'

import { Header } from './header'
import { Rgb } from './rgb'
import { Xyz } from './xyz'

import { View as CopcView, Bounds as CopcBounds } from 'copc'
import { Reproject } from 'utils'
import { CopcNode } from '3d-tiles/tileset/types'

// Work around TS namespaced re-export deficiency.
type _Header = Header
export declare namespace FeatureTable {
  export type Header = _Header
}

export type FeatureTable = { header: Header; binary: Buffer }
export const FeatureTable = { create, createFromCopc }

function create({ view, tileBounds, toEcef, options }: Params): FeatureTable {
  const bounds = Bounds.reproject(
    Bounds.offsetHeight(tileBounds, options.zOffset || 0),
    toEcef
  )
  const header: Header = {
    POINTS_LENGTH: view.length,
    RTC_CENTER: Bounds.mid(bounds),
    POSITION: { byteOffset: 0 },
  }

  const buffers = [Xyz.create({ view, tileBounds, toEcef, options })]

  const has = (name: string) => Schema.has(view.schema, name)

  if (has('Red') && has('Green') && has('Blue')) {
    header.RGB = { byteOffset: sumLengths(buffers) }
    buffers.push(Rgb.create({ view, options }))
  }

  const binary = padEnd(Buffer.concat(buffers))
  return { header, binary }
}

interface ICreateFromCopcArgs {
  node: CopcNode
  copcView: CopcView
  tileBounds: CopcBounds
  toEcef: Reproject
  options: Record<string, any>
}
function createFromCopc({
  node,
  copcView,
  tileBounds,
  toEcef,
  options,
}: ICreateFromCopcArgs): FeatureTable {
  const bounds = Bounds.reproject(
    Bounds.offsetHeight(tileBounds, options!.zOffset! || 0),
    toEcef
  )
  const header: Header = {
    POINTS_LENGTH: node.pointCount,
    RTC_CENTER: Bounds.mid(bounds),
    POSITION: { byteOffset: 0 },
  }
  const getters = ['X', 'Y', 'Z'].map(copcView.getter)
  const buffers = [
    Xyz.createFromCopc({
      getters,
      length: node.pointCount,
      tileBounds,
      toEcef,
      options,
    }),
  ]

  const has = (name: string) => !!copcView.dimensions[name]

  if (has('Red') && has('Green') && has('Blue')) {
    header.RGB = { byteOffset: sumLengths(buffers) }
    const getters = ['Red', 'Green', 'Blue'].map(copcView.getter)
    buffers.push(
      Rgb.createFromCopc({
        getters,
        dimensions: copcView.dimensions,
        length: node.pointCount,
        options,
      })
    )
  }

  const binary = padEnd(Buffer.concat(buffers))
  return { header, binary }
}
