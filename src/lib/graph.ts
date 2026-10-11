import type { EtymologyData, Word, Etymon } from '../data/types'

// ─────────────────────────────────────────────────────────────
// 数据 → 力导向图结构 转换 + 词源路径计算
// ─────────────────────────────────────────────────────────────

/** 图节点：单词节点 与 词源节点 统一表示 */
export interface GraphNode {
  id: string        // 唯一标识，如 "w1" / "e10"
  kind: 'word' | 'etymon'
  ref: Word | Etymon
}

/** 图连线：单词 ↔ 词源 */
export interface GraphLink {
  id: string
  source: string    // 节点 id
  target: string    // 节点 id
  weight: number    // 关系强度
}

export interface Graph {
  nodes: GraphNode[]
  links: GraphLink[]
}

/** 选中项：可以是一个单词，也可以是一个词源 */
export interface Selection {
  kind: 'word' | 'etymon'
  id: number
}

export const wordNodeId = (id: number) => `w${id}`
export const etymonNodeId = (id: number) => `e${id}`

/** 把三张表转成力导向图需要的 nodes / links */
export function buildGraph(data: EtymologyData): Graph {
  const nodes: GraphNode[] = [
    ...data.words.map((w) => ({ id: wordNodeId(w.id), kind: 'word' as const, ref: w })),
    ...data.etymons.map((e) => ({ id: etymonNodeId(e.id), kind: 'etymon' as const, ref: e })),
  ]

  const links: GraphLink[] = data.wordEtymons.map((we) => ({
    id: `${wordNodeId(we.wordId)}-${etymonNodeId(we.etymonId)}`,
    source: wordNodeId(we.wordId),
    target: etymonNodeId(we.etymonId),
    weight: we.weight,
  }))

  return { nodes, links }
}

/**
 * 计算选中项的「高亮路径」：
 *  - 选中单词：该单词 + 它直接关联的词源（root/prefix/suffix），其余单词保持变暗
 *  - 选中词源：该词源 + 所有与之关联的单词
 * 返回需要发光的节点 id 集合与连线 id 集合，其余节点在渲染层变暗。
 */
export function computeHighlight(
  data: EtymologyData,
  sel: Selection,
): { nodeIds: Set<string>; linkIds: Set<string> } {
  if (sel.kind === 'word') {
    // 只点亮该单词自身 + 它直接关联的词源，同源词保持变暗
    const etymonIds = new Set(
      data.wordEtymons.filter((we) => we.wordId === sel.id).map((we) => we.etymonId),
    )

    const nodeIds = new Set<string>([
      wordNodeId(sel.id),
      ...[...etymonIds].map(etymonNodeId),
    ])
    const linkIds = new Set(
      data.wordEtymons
        .filter((we) => we.wordId === sel.id)
        .map((we) => `${wordNodeId(we.wordId)}-${etymonNodeId(we.etymonId)}`),
    )
    return { nodeIds, linkIds }
  }

  // 选中词源
  const wordIds = new Set(
    data.wordEtymons.filter((we) => we.etymonId === sel.id).map((we) => we.wordId),
  )
  const nodeIds = new Set<string>([etymonNodeId(sel.id), ...[...wordIds].map(wordNodeId)])
  const linkIds = new Set(
    data.wordEtymons
      .filter((we) => we.etymonId === sel.id)
      .map((we) => `${wordNodeId(we.wordId)}-${etymonNodeId(we.etymonId)}`),
  )
  return { nodeIds, linkIds }
}
