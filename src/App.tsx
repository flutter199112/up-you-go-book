/**
 * 应用入口：页面状态机 首页 → 阅读 → 卡片 → 测验 → 结果
 * 绘本内容全部来自 public/data/book.json（运行时加载并校验）。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BookData, QuizResults } from './types'
import { loadBook } from './data/loadBook'
import { loadLastRecord } from './lib/storage'
import { HomeScreen } from './components/HomeScreen'
import { ReadingScreen } from './components/ReadingScreen'
import { CardsScreen } from './components/CardsScreen'
import { QuizScreen } from './components/QuizScreen'
import { ResultScreen } from './components/ResultScreen'

type Screen = 'home' | 'reading' | 'cards' | 'quiz' | 'result'
type LoadState = 'loading' | 'ready' | 'error'

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [book, setBook] = useState<BookData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [screen, setScreen] = useState<Screen>('home')
  const [results, setResults] = useState<QuizResults | null>(null)
  const [runId, setRunId] = useState(0)

  const load = useCallback(async () => {
    setLoadState('loading')
    setLoadError(null)
    const res = await loadBook()
    if (res.book) {
      setBook(res.book)
      setWarnings(res.warnings)
      setLoadState('ready')
    } else {
      setLoadError(res.error)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const lastResult = useMemo(() => {
    if (!book) return null
    const rec = loadLastRecord(book.id)
    if (!rec) return null
    return `答对 ${rec.correct} / ${rec.total} 题`
  }, [book, runId])

  const startReading = useCallback(() => setScreen('reading'), [])
  const toCards = useCallback(() => setScreen('cards'), [])
  const toQuiz = useCallback(() => setScreen('quiz'), [])
  const toHome = useCallback(() => {
    setRunId((r) => r + 1)
    setScreen('home')
  }, [])

  const restart = useCallback(() => {
    setResults(null)
    setRunId((r) => r + 1)
    setScreen('reading')
  }, [])

  const onQuizFinished = useCallback((r: QuizResults) => {
    setResults(r)
    setScreen('result')
  }, [])

  if (loadState === 'loading') {
    return (
      <div className="screen center-screen">
        <div className="loading-book bounce">📖</div>
        <p className="loading-text">正在打开绘本……</p>
      </div>
    )
  }

  if (loadState === 'error' || !book) {
    return (
      <div className="screen center-screen">
        <div className="error-card pop-in">
          <div className="error-emoji">😢</div>
          <h2>绘本打不开</h2>
          <p className="error-detail">{loadError}</p>
          {warnings.length > 0 ? (
            <ul className="warnings">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
          <button type="button" className="btn btn-primary btn-big" onClick={() => void load()}>
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {screen === 'home' ? <HomeScreen book={book} lastResult={lastResult} onStart={startReading} /> : null}
      {screen === 'reading' ? (
        <ReadingScreen key={`reading-${runId}`} book={book} onFinished={toCards} onExit={toHome} />
      ) : null}
      {screen === 'cards' ? (
        <CardsScreen key={`cards-${runId}`} book={book} onFinished={toQuiz} onExit={toHome} />
      ) : null}
      {screen === 'quiz' ? (
        <QuizScreen key={`quiz-${runId}`} book={book} onFinished={onQuizFinished} onExit={toHome} />
      ) : null}
      {screen === 'result' && results ? (
        <ResultScreen book={book} results={results} onRestart={restart} onHome={toHome} />
      ) : null}
    </>
  )
}
