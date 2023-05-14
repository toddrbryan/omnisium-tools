import { Cors } from '3d-tiles/server/cors'
import { program } from 'commander'
import { Getter, Copc } from 'copc'
import express from 'express'
import cors from 'cors'

import fileRouter from './router'

const handleFile = async (path: string) => {
  const copc = await Copc.create(path)
  console.log(copc)
  return copc
}

const handleUrl = async (url: string) => {
  const getter = Getter.create(url)
  const copc = await Copc.create(getter)
  console.log(copc)
  const { nodes, pages } = await Copc.loadHierarchyPage(
    getter,
    copc.info.rootHierarchyPage
  )
  const root = nodes['0-0-0-0']!
  const view = await Copc.loadPointDataView(getter, copc, root)
  const dims: Record<string, string>[] = []
  Object.keys(view.dimensions).forEach((key) => {
    dims.push({
      name: key,
      type: view.dimensions[key]!.type,
      size: view.dimensions[key]!.size.toString(),
    })
  })
  const bounds = copc.header.min.concat(copc.header.max)
  console.log(bounds)
  console.log(dims)
  //console.log(nodes)

  const child = nodes['4-0-13-15']!
  const childView = await Copc.loadPointDataView(getter, copc, child)
  console.log(childView)

  return copc
}

program
  .version('1.0.0')
  .option('-f, --file <path>', 'path to COPC file')
  .option('-u, --url <url>', 'URL of remote COPC file')
  .option('-s, --serve', 'Start server')
  .parse(process.argv)

const options = program.opts()

if (options.serve) {
  console.log('Starting server')
  const app = express()
  app.use(cors())
  app.use('/api', fileRouter)

  app.listen(3069, () => {
    console.log('Server listening on port 3069')
  })
} else if (!options.file && !options.url) {
  console.error('Please provide either a file path or a URL to a COPC file')
  process.exit(1)
}

if (options.file) {
  handleFile(options.file)
} else if (options.url) {
  handleUrl(options.url)
}
