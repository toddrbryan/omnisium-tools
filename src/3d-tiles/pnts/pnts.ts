import { BatchTable } from '3d-tiles/batch-table'
import { FeatureTable } from '3d-tiles/feature-table'
import { padEnd } from '3d-tiles/utils'

import { Header } from './header'
import { Params } from '../types'

export * as Constants from './constants'

import { View as CopcView } from 'copc'
import { Bounds } from 'copc'
import { Reproject } from 'utils'
import { CopcNode } from '3d-tiles/tileset/types'

export type { BatchTable, FeatureTable }
export function translate(params: Params) {
  const { header: featureTableHeaderObject, binary: featureTableBinary } =
    FeatureTable.create(params)

  const { header: batchTableHeaderObject, binary: batchTableBinary } =
    BatchTable.create(params.view, params.options)

  const featureTableHeader = toStringBuffer(featureTableHeaderObject)
  const batchTableHeader = toStringBuffer(batchTableHeaderObject)

  const header = Header.create({
    featureTableHeader,
    featureTableBinary,
    batchTableHeader,
    batchTableBinary,
  })

  return Buffer.concat([
    header,
    featureTableHeader,
    featureTableBinary,
    batchTableHeader,
    batchTableBinary,
  ])
}

export function translateFromCopc(
  node: CopcNode,
  copcView: CopcView,
  tileBounds: Bounds,
  toEcef: Reproject,
  options: Record<string, any>
) {
  const { header: featureTableHeaderObject, binary: featureTableBinary } =
    FeatureTable.createFromCopc({ node, copcView, tileBounds, toEcef, options })
  console.log('Created feature table')

  // const { header: batchTableHeaderObject, binary: batchTableBinary } =
  //   BatchTable.createFromCopc({ node, copcView, tileBounds, toEcef, options })

  console.log('Created batch table')
  const featureTableHeader = toStringBuffer(featureTableHeaderObject)
  //const batchTableHeader = toStringBuffer(batchTableHeaderObject)

  const header = Header.create({
    featureTableHeader,
    featureTableBinary,
    batchTableHeader: Buffer.alloc(0),
    batchTableBinary: Buffer.alloc(0),
  })
  console.log('Created header', header)

  return Buffer.concat([
    header,
    featureTableHeader,
    featureTableBinary,
    //batchTableHeader,
    //batchTableBinary,
  ])
}

function toStringBuffer(o: object) {
  return padEnd(Buffer.from(JSON.stringify(o)), 0x20)
}
