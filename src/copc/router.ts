import express, { Request, Response } from 'express'
import { Copc, Getter, View as CopcView } from 'copc'

import { Bounds, DataType, Key } from 'ept'
import { Pnts, Tileset } from '3d-tiles'
import { CopcNode, CopcNodes } from '3d-tiles/tileset/types'
import { Reproject } from 'utils'
import { Cache } from './cache'

const router = express.Router()
const cache = Cache.create()

// router.get('/3dtiles/:subpart', async (req: Request, res: Response) => {
//   const { url } = req.query

//   if (!url) {
//     return res.status(400).send('Provide a URL to a remote file')
//   }

//   try {
//     const remote = Getter.create(url as string)
//     const copc = await Copc.create(remote)
//     //const body = await translate_copc({ copc, options, cache })
//     return res.send({})
//   } catch (err) {
//     console.error(err)
//     return res.status(500).send('Error fetching file from URL')
//   }
// })

router.get('/3dtiles/tileset.json', async (req: Request, res: Response) => {
  const { url } = req.query
  const options = req.query as Record<string, any>

  if (!url) {
    return res.status(400).send('Provide a URL to a remote file')
  }
  try {
    const { copc, hierarchy } = await cache.get(url as string)
    console.log('Got copc', copc)
    const nodes = hierarchy.nodes as CopcNodes
    const rootNode = nodes['0-0-0-0']!

    const key = Key.create()
    const result = Tileset.translateCopc({
      copc,
      nodes,
      rootNode,
      key,
      options,
    })
    return res.send(result)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error fetching file from URL')
  }
})

router.get('/3dtiles/:content', async (req: Request, res: Response) => {
  const { url } = req.query
  const { content } = req.params
  const options = req.query as Record<string, any>

  if (!url) {
    return res.status(400).send('Provide a URL to a remote file')
  }
  const [root, extension] = content.split('.')
  const key = Key.parse(root)

  if (extension !== 'pnts') {
    return res.status(400).send('Only pnts files are supported')
  }
  try {
    const { copc, hierarchy, getter } = await cache.get(url as string)
    const nodes = hierarchy.nodes as CopcNodes
    // TODO Support zOffset?
    const bounds = Bounds.stepTo(Bounds.offsetHeight(copc.info.cube, 0), key)
    const node = nodes[Key.stringify(key)]!
    console.log(Key.stringify(key))
    const copcView = await Copc.loadPointDataView(getter, copc, node)

    // TODO: support original projection!!
    const toEcef = Reproject.create('EPSG:4978', 'EPSG:4978')
    return res.send(
      Pnts.translateFromCopc(node, copcView, bounds, toEcef, options)
    )
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error fetching file from URL')
  }
})

export default router
