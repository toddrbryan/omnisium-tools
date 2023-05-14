import { Copc, Getter, Hierarchy } from 'copc'

interface Entry {
  createdAt: Date
  copc: Copc
  getter: Getter
  hierarchy: Hierarchy.Subtree
}

type Map = Record<string, Entry | undefined>

export const Cache = { create }
export type Cache = ReturnType<typeof create>

function create(timeout = 60000) {
  const cache: Map = {}

  async function get(filename: string): Promise<Entry> {
    const existing = cache[filename]
    if (existing) return new Promise((resolve) => resolve(existing))
    const remote = Getter.create(filename as string)
    const copc = await Copc.create(remote)
    const hierarchy = await Copc.loadHierarchyPage(
      remote,
      copc.info.rootHierarchyPage
    )
    cache[filename] = {
      copc,
      createdAt: new Date(),
      getter: remote,
      hierarchy,
    }
    return new Promise((resolve) => resolve(cache[filename]!))
  }

  let interval =
    timeout &&
    setInterval(() => {
      const now = new Date()

      Object.entries(cache).forEach(([filename, entry]) => {
        if (!entry) return
        const { createdAt } = entry

        if (now.getTime() - createdAt.getTime() > timeout)
          delete cache[filename]
      })
    }, 60000)

  function destroy() {
    if (interval) clearInterval(interval)
  }

  return { get, destroy }
}
