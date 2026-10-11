import { useEffect, useMemo, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { Etymon } from '../data/types'
import type { EtymologyData } from '../data/types'
import { buildGraph, computeHighlight, wordNodeId, etymonNodeId } from '../lib/graph'
import type { GraphNode, Selection } from '../lib/graph'

interface Props {
  data: EtymologyData
  selection: Selection | null
  onSelect: (sel: Selection | null) => void
}

/** 节点颜色：单词 = 青蓝；词源按类型区分 */
function nodeColor(node: GraphNode): string {
  if (node.kind === 'word') return '#4fc3f7'
  const type = (node.ref as Etymon).type
  if (type === 'root') return '#ffd54f'
  if (type === 'prefix') return '#ba68c8'
  return '#66bb6a' // suffix
}

export default function Universe({ data, selection, onSelect }: Props) {
  const graph = useMemo(() => buildGraph(data), [data])
  const highlight = useMemo(
    () => (selection == null ? null : computeHighlight(data, selection)),
    [data, selection],
  )
  const fgRef = useRef<any>(null)

  // 轨道距离：关系越强（weight 越大）连线越短，节点靠得越近
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    const linkForce = fg.d3Force('link')
    if (linkForce) linkForce.distance((l: any) => 90 - ((l.weight ?? 1) - 1) * 12)
    const chargeForce = fg.d3Force('charge')
    if (chargeForce) chargeForce.strength(-150)
    fg.d3ReheatSimulation()
  }, [])

  // 每个节点的「度」与「最大关系强度」，用于控制大小 / 发光
  const nodeMeta = useMemo(() => {
    const degree = new Map<string, number>()
    const maxWeight = new Map<string, number>()
    for (const l of graph.links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1)
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1)
      for (const id of [l.source, l.target]) {
        maxWeight.set(id, Math.max(maxWeight.get(id) ?? 0, l.weight))
      }
    }
    return { degree, maxWeight }
  }, [graph])

  // 粒子流动方向：画出「选中词 → 词源 → 同源词」的历史轨迹
  const particleDir = useMemo(() => {
    const m = new Map<string, number>()
    if (!selection) return m
    if (selection.kind === 'word') {
      // 选中词自己的连线：词 → 词源（正方向）；同源词的连线：词源 → 词（反向）
      for (const we of data.wordEtymons) {
        const linkId = `${wordNodeId(we.wordId)}-${etymonNodeId(we.etymonId)}`
        m.set(linkId, we.wordId === selection.id ? 1 : -1)
      }
    } else {
      // 选中词源：词源 → 各关联单词（反向）
      for (const we of data.wordEtymons) {
        if (we.etymonId === selection.id) {
          m.set(`${wordNodeId(we.wordId)}-${etymonNodeId(we.etymonId)}`, -1)
        }
      }
    }
    return m
  }, [data, selection])

  const isActive = (id: string) => highlight == null || highlight.nodeIds.has(id)
  const isDim = (id: string) => highlight != null && !highlight.nodeIds.has(id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const active = isActive(node.id as string)
    const dim = isDim(node.id as string)
    const degree = nodeMeta.degree.get(node.id) ?? 0
    const maxW = nodeMeta.maxWeight.get(node.id) ?? 1

    const baseR = 4 + degree * 1.4 + (maxW - 1) * 0.6
    const radius = (active ? baseR * 1.35 : dim ? baseR * 0.45 : baseR) / globalScale
    const color = nodeColor(node as GraphNode)

    if (active) {
      ctx.shadowBlur = 14 + maxW * 5
      ctx.shadowColor = color
    }

    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = dim ? 'rgba(110,110,130,0.28)' : color
    ctx.fill()
    ctx.shadowBlur = 0

    // 当前选中节点加白色外圈
    if (selection && node.kind === selection.kind && node.ref?.id === selection.id) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius + 2.5 / globalScale, 0, 2 * Math.PI)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5 / globalScale
      ctx.stroke()
    }

    const label = node.ref?.form ?? ''
    const fontSize = (active ? 13 : dim ? 9 : 11) / globalScale
    ctx.font = `${fontSize}px 'Segoe UI', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = dim ? 'rgba(150,150,165,0.45)' : active ? '#ffffff' : 'rgba(215,215,230,0.85)'
    ctx.fillText(label, node.x, node.y + radius + 3 / globalScale)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkCanvasObject = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const active = highlight == null || highlight.linkIds.has(link.id)
    const dim = highlight != null && !highlight.linkIds.has(link.id)
    const width = (link.weight * (active ? 1.6 : 0.8)) / globalScale

    if (active) {
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(140,180,255,0.85)'
    }
    ctx.strokeStyle = dim ? 'rgba(110,110,130,0.12)' : 'rgba(140,180,255,0.5)'
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(link.source.x, link.source.y)
    ctx.lineTo(link.target.x, link.target.y)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  const particleCount = (link: any) =>
    highlight != null && highlight.linkIds.has(link.id) ? 3 : 0

  return (
    <div className="universe">
      <ForceGraph2D
        ref={fgRef}
        graphData={graph as any}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={nodeCanvasObject as any}
        linkCanvasObject={linkCanvasObject as any}
        // 路径发光动画：沿高亮连线流动的粒子（历史轨迹）
        linkDirectionalParticles={particleCount}
        linkDirectionalParticleWidth={(l: any) => (particleCount(l) > 0 ? 1.8 : 0)}
        linkDirectionalParticleSpeed={(l: any) => (particleDir.get(l.id) ?? 1) * 0.008}
        linkDirectionalParticleColor={() => 'rgba(190,220,255,0.95)'}
        onNodeClick={(node) => {
          const n = node as GraphNode
          onSelect({ kind: n.kind, id: n.ref.id })
        }}
        onBackgroundClick={() => onSelect(null)}
        cooldownTicks={80}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  )
}
