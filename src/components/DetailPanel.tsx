import type { EtymologyData, Word } from '../data/types'
import type { Selection } from '../lib/graph'

interface Props {
  data: EtymologyData
  selection: Selection | null
  onClose: () => void
}

export default function DetailPanel({ data, selection, onClose }: Props) {
  if (!selection) return null

  // 词汇表索引：wordId → 精简释义（未收录时回退到完整释义）
  const briefMap = new Map(data.glossary.map((g) => [g.wordId, g.brief]))
  const briefOf = (w: Word) => briefMap.get(w.id) ?? w.meaning

  if (selection.kind === 'word') {
    const word = data.words.find((w) => w.id === selection.id)
    if (!word) return null

    const links = data.wordEtymons.filter((we) => we.wordId === word.id)
    const etymons = links.map((we) => ({
      etymon: data.etymons.find((e) => e.id === we.etymonId)!,
      weight: we.weight,
    }))
    const siblingIds = new Set(
      data.wordEtymons
        .filter((we) => links.some((l) => l.etymonId === we.etymonId) && we.wordId !== word.id)
        .map((we) => we.wordId),
    )
    const siblings = data.words.filter((w) => siblingIds.has(w.id))

    return (
      <aside className="detail-panel">
        <div className="detail-head">
          <span className="badge word">单词</span>
          <h2>{word.form}</h2>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <h3>详细释义</h3>
        <p className="meaning detailed">{word.meaning}</p>

        <h3>词源</h3>
        <ul>
          {etymons.map(({ etymon, weight }) => (
            <li key={etymon.id}>
              <span className={`badge ${etymon.type}`}>{etymon.type}</span>
              <strong>{etymon.form}</strong>
              <span className="etymon-meaning">{etymon.meaning}</span>
              <span className="weight">强度 {weight}</span>
            </li>
          ))}
        </ul>

        {siblings.length > 0 && (
          <>
            <h3>同源词</h3>
            <ul>
              {siblings.map((s) => (
                <li key={s.id}>
                  <strong>{s.form}</strong>
                  {/* 词汇表精简释义：避免同源词列表被详细释义撑爆 */}
                  <span className="etymon-meaning">{briefOf(s)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    )
  }

  const etymon = data.etymons.find((e) => e.id === selection.id)
  if (!etymon) return null

  const words = data.wordEtymons
    .filter((we) => we.etymonId === etymon.id)
    .map((we) => data.words.find((w) => w.id === we.wordId)!)

  return (
    <aside className="detail-panel">
      <div className="detail-head">
        <span className={`badge ${etymon.type}`}>{etymon.type}</span>
        <h2>{etymon.form}</h2>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <p className="meaning">{etymon.meaning}</p>

      <h3>关联单词</h3>
      <ul>
        {words.map((w) => (
          <li key={w.id}>
            <strong>{w.form}</strong>
            {/* 词汇表精简释义（词源详情页同样按精简方式列出单词） */}
            <span className="etymon-meaning">{briefOf(w)}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
