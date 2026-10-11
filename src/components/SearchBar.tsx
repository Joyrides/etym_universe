import { useState } from 'react'
import type { EtymologyData } from '../data/types'
import type { Selection } from '../lib/graph'

interface Props {
  data: EtymologyData
  onSelect: (sel: Selection) => void
}

export default function SearchBar({ data, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const submit = () => {
    const q = query.trim().toLowerCase()
    if (!q) return
    const hit = data.words.find(
      (w) => w.form.toLowerCase() === q || w.form.toLowerCase().startsWith(q),
    )
    if (hit) onSelect({ kind: 'word', id: hit.id })
  }

  return (
    <div className="search-bar">
      <input
        list="word-list"
        value={query}
        placeholder="搜索单词，如 educate"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <datalist id="word-list">
        {data.words.map((w) => (
          <option key={w.id} value={w.form} />
        ))}
      </datalist>
      <button onClick={submit}>定位</button>
    </div>
  )
}
