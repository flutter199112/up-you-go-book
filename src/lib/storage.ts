/**
 * 学习结果本地存储（第一版仅保存在浏览器 localStorage，无后端）
 */

export interface LearningRecord {
  bookId: string
  bookTitle: string
  date: string
  correct: number
  total: number
  wrongIds: string[]
}

const KEY = 'up-you-go:records:v1'
const MAX_RECORDS = 50

export function loadRecords(): LearningRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecord(record: LearningRecord): void {
  try {
    const list = loadRecords()
    list.push(record)
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_RECORDS)))
  } catch {
    // 隐私模式 / 存储满等情况：静默失败，不影响学习流程
  }
}

export function loadLastRecord(bookId: string): LearningRecord | null {
  const list = loadRecords()
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].bookId === bookId) return list[i]
  }
  return null
}
