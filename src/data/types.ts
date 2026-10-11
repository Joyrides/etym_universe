// ─────────────────────────────────────────────────────────────
// 词源宇宙 · 数据模型
// 对应「Word / Etymon / WordEtymon / Glossary」四张表
// （前三张构成多对多关系，Glossary 为附加的词汇表）
// ─────────────────────────────────────────────────────────────

/** 词源节点类型：词根 / 前缀 / 后缀 */
export type EtymonType = 'root' | 'prefix' | 'suffix'

/** Word 表：用户搜索/学习的英语单词 */
export interface Word {
  id: number
  form: string    // 单词拼写，如 "educate"
  meaning: string // 详细释义（在该单词自己的详情页展示），如 "教育；培养；训练……"
}

/** Glossary 词汇表：单词的精简释义 */
export interface GlossaryEntry {
  wordId: number // 指向 Word.id
  brief: string  // 精简释义，如 "教育；训练"（该单词作为同源词出现在其他单词详情页时展示）
}

/** Etymon 表：词源节点 */
export interface Etymon {
  id: number
  form: string       // 词源写法，如 "*deuk-" / "ex-"
  type: EtymonType   // root | prefix | suffix
  meaning: string    // 含义，如 "引导、领导" / "向外"
}

/** WordEtymon 关联表：单词 ↔ 词源 的多对多关系 */
export interface WordEtymon {
  wordId: number    // 指向 Word.id
  etymonId: number  // 指向 Etymon.id
  weight: number    // 关系强度（1~5，默认 1），用于发光/大小/距离/粗细
}

/** 完整数据集（相当于一个小型词源数据库） */
export interface EtymologyData {
  words: Word[]
  etymons: Etymon[]
  wordEtymons: WordEtymon[]
  glossary: GlossaryEntry[] // 词汇表：wordId → 精简释义
}
