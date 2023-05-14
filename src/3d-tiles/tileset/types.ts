export type CopcNode = {
  pointCount: number
  pointDataOffset: number
  pointDataLength: number
}

export type CopcNodes = Record<string, CopcNode>
