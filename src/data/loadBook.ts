/**
 * 加载并校验绘本数据（book.json）。
 * 所有绘本内容必须来自 JSON，这里负责：抓取 → 结构校验 → 时间轴规范化。
 */
import type { BookData, BookPage } from '../types'

export interface LoadResult {
  book: BookData | null
  error: string | null
  warnings: string[]
}

export async function loadBook(): Promise<LoadResult> {
  const url = `${import.meta.env.BASE_URL}data/book.json`
  try {
    const resp = await fetch(url, { cache: 'no-cache' })
    if (!resp.ok) {
      return { book: null, error: `绘本数据加载失败（HTTP ${resp.status}）：${url}`, warnings: [] }
    }
    const raw: unknown = await resp.json()
    return validateBook(raw)
  } catch (e) {
    return {
      book: null,
      error: `绘本数据加载失败，请确认 data/book.json 存在且为有效 JSON。${e instanceof Error ? e.message : ''}`,
      warnings: [],
    }
  }
}

export function validateBook(raw: unknown): LoadResult {
  const warnings: string[] = []
  const book = raw as BookData | null
  if (!book || typeof book !== 'object') {
    return { book: null, error: '绘本数据不是有效对象', warnings }
  }

  // ---- 基础结构检查 ----
  if (!Array.isArray(book.pages) || book.pages.length === 0) {
    return { book: null, error: '绘本数据缺少 pages（至少 1 页）', warnings }
  }
  if (!Array.isArray(book.cards) || book.cards.length === 0) {
    return { book: null, error: '绘本数据缺少 cards（至少 1 张单词卡）', warnings }
  }
  if (!Array.isArray(book.quiz) || book.quiz.length < 3) {
    return { book: null, error: '绘本数据缺少 quiz（至少 3 道题）', warnings }
  }
  if (!book.audio || typeof book.audio.src !== 'string' || !book.audio.src) {
    return { book: null, error: '绘本数据缺少 audio.src', warnings }
  }
  if (!book.cover || typeof book.cover.image !== 'string') {
    return { book: null, error: '绘本数据缺少 cover.image', warnings }
  }

  // ---- 时间轴校验与规范化 ----
  const sorted = [...book.pages].sort((a, b) => a.index - b.index)
  const normalized: BookPage[] = []
  for (let i = 0; i < sorted.length; i++) {
    const p = { ...sorted[i] }
    if (!Number.isFinite(p.start) || !Number.isFinite(p.end)) {
      return { book: null, error: `第 ${i + 1} 页时间轴无效（start/end 必须是数字）`, warnings }
    }
    if (p.end <= p.start) {
      return { book: null, error: `第 ${i + 1} 页时间轴无效（end 必须大于 start）`, warnings }
    }
    if (i > 0) {
      const prev = normalized[i - 1]
      if (p.start < prev.start) {
        return { book: null, error: `第 ${i + 1} 页时间轴无效（start 未按顺序排列）`, warnings }
      }
      if (p.start < prev.end) {
        // 轻微重叠：裁剪前一页右边界，保证半开区间不二义
        warnings.push(`第 ${i} 页与第 ${i + 1} 页时间轴重叠，已自动裁剪`)
        prev.end = p.start
      }
    }
    normalized.push(p)
  }

  // ---- quiz 选项检查 ----
  for (const q of book.quiz) {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return { book: null, error: `题目「${q.question}」选项不足`, warnings }
    }
    if (!q.options.some((o) => o.correct)) {
      return { book: null, error: `题目「${q.question}」缺少正确答案`, warnings }
    }
  }

  return {
    book: { ...book, pages: normalized },
    error: null,
    warnings,
  }
}

/**
 * 根据音频时间点找到当前应显示的页面序号（返回 pages 数组下标）。
 * 规则：半开区间 [start, end) 唯一归属；时间落在间隔中时保持上一页；
 * 早于第一页时显示第一页；晚于最后一页时显示最后一页。
 */
export function findPageIndexForTime(pages: BookPage[], time: number): number {
  if (pages.length === 0) return 0
  if (time < pages[0].start) return 0
  let last = 0
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    if (time >= p.start && time < p.end) return i
    if (time >= p.end) last = i
  }
  return last
}
