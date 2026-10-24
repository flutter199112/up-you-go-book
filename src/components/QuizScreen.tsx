/**
 * 测验页：3-5 道图片选择题。
 * - 立即反馈：答对 → 庆祝并进入下一题；答错 → 重新播放问题 + 轻提示，可再试
 * - 只记录“第一次作答”的对错；结束后回调结果
 */
import { useEffect, useRef, useState } from 'react'
import type { BookData, QuizResults, WrongItem } from '../types'
import { SafeImg } from './SafeImg'
import { SpeakerButton } from './SpeakerButton'
import { playSuccess, playSoftFail } from '../lib/sound'

interface QuizScreenProps {
  book: BookData
  onFinished: (results: QuizResults) => void
  onExit: () => void
}

type Phase = 'answering' | 'correct' | 'wrong'

export function QuizScreen({ book, onFinished, onExit }: QuizScreenProps) {
  const quiz = book.quiz
  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  // 用 ref 同步记录最终结果，避免 setTimeout 闭包读到旧值
  const correctRef = useRef(0)
  const wrongRef = useRef<WrongItem[]>([])
  const firstTryRef = useRef<boolean | null>(null)
  const recordedRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const q = quiz[qIndex]
  const total = quiz.length
  const isLast = qIndex === total - 1

  // 每道题出现时播放问题音频（用户刚点过按钮，属于手势上下文）
  useEffect(() => {
    firstTryRef.current = null
    recordedRef.current = false
    setPickedId(null)
    setPhase('answering')
    setShowHint(false)
    if (q?.questionAudio) {
      const t = window.setTimeout(() => {
        const a = new Audio(q.questionAudio!)
        a.play().catch(() => undefined)
      }, 300)
      return () => window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const advance = () => {
    if (isLast) {
      onFinished({ correct: correctRef.current, total, wrong: wrongRef.current })
    } else {
      setQIndex((i) => i + 1)
    }
  }

  const choose = (option: (typeof q.options)[number], optionId: number) => {
    if (phase !== 'answering') return
    if (firstTryRef.current === null) firstTryRef.current = option.correct

    if (option.correct) {
      setPickedId(`opt-${optionId}`)
      setPhase('correct')
      playSuccess()
      if (firstTryRef.current) {
        correctRef.current += 1
      }
      timerRef.current = window.setTimeout(advance, 1500)
    } else {
      setPickedId(`opt-${optionId}`)
      setPhase('wrong')
      playSoftFail()
      setShowHint(true)
      // 首次作答即答错 → 记入错题回顾（同一题只记一次）
      if (!recordedRef.current && firstTryRef.current === false) {
        recordedRef.current = true
        const item: WrongItem = {
          questionId: q.id,
          question: q.question,
          correctLabel: q.options.find((o) => o.correct)?.label ?? '',
          correctImage: q.options.find((o) => o.correct)?.image ?? '',
          questionAudio: q.questionAudio,
        }
        wrongRef.current = [...wrongRef.current, item]
      }
      // 重新播放问题 + 轻提示，稍后恢复作答
      if (q.questionAudio) {
        window.setTimeout(() => {
          const a = new Audio(q.questionAudio!)
          a.play().catch(() => undefined)
        }, 200)
      }
      timerRef.current = window.setTimeout(() => {
        setPickedId(null)
        setPhase('answering')
      }, 2500)
    }
  }

  const correctOptionId = q.options.findIndex((o) => o.correct)

  return (
    <div className="screen quiz">
      <header className="topbar">
        <button type="button" className="btn btn-ghost" onClick={onExit} aria-label="退出">
          ✕
        </button>
        <div className="page-dots" aria-label={`第 ${qIndex + 1} 题，共 ${total} 题`}>
          {quiz.map((qq, i) => (
            <span key={qq.id} className={`dot ${i < qIndex ? 'dot-done' : i === qIndex ? 'dot-active' : ''}`} />
          ))}
        </div>
        <span className="topbar-label">猜一猜 {qIndex + 1} / {total}</span>
      </header>

      <main className="quiz-main">
        <div className="quiz-question">
          <h2 className="quiz-title">{q.question}</h2>
          {q.questionAudio ? <SpeakerButton src={q.questionAudio} size="lg" /> : null}
        </div>

        <div className="quiz-options">
          {q.options.map((opt, i) => {
            const id = `opt-${i}`
            const isCorrect = i === correctOptionId
            const isPicked = pickedId === id
            let cls = 'quiz-option'
            if (phase === 'correct' && isCorrect) cls += ' option-correct'
            if (phase === 'wrong' && isPicked) cls += ' option-wrong'
            return (
              <button
                key={id}
                type="button"
                className={cls}
                onClick={() => choose(opt, i)}
                disabled={phase !== 'answering'}
              >
                <SafeImg src={opt.image} alt={opt.label} className="quiz-option-img" fallbackText="🖼️" />
                <span className="quiz-option-label">{opt.label}</span>
                {phase === 'correct' && isCorrect ? <span className="option-badge">✓</span> : null}
              </button>
            )
          })}
        </div>
      </main>

      <footer className="quiz-foot">
        {phase === 'correct' ? (
          <div className="quiz-feedback correct pop-in">🎉 答对啦！真棒！</div>
        ) : phase === 'wrong' ? (
          <div className="quiz-feedback wrong">
            <p className="quiz-hint">{q.hint}</p>
            <p className="quiz-hint-sub">再听一次，再选一选吧～</p>
          </div>
        ) : showHint ? (
          <div className="quiz-feedback wrong">
            <p className="quiz-hint">{q.hint}</p>
            <p className="quiz-hint-sub">再看看图片，再选一次吧～</p>
          </div>
        ) : (
          <p className="quiz-hint-sub">点一点你觉得正确的图片！</p>
        )}
      </footer>
    </div>
  )
}
