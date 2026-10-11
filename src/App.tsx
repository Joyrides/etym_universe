import { useState } from 'react'
import { seedData } from './data/seed'
import type { Selection } from './lib/graph'
import Universe from './components/Universe'
import SearchBar from './components/SearchBar'
import DetailPanel from './components/DetailPanel'

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>词源宇宙</h1>
        <span className="subtitle">Etymology Universe</span>
      </header>

      <SearchBar data={seedData} onSelect={setSelection} />
      <Universe data={seedData} selection={selection} onSelect={setSelection} />
      <DetailPanel data={seedData} selection={selection} onClose={() => setSelection(null)} />
    </div>
  )
}
