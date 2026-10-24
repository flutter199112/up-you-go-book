/**
 * 结果页：答题正确数、鼓励信息、错题回顾；学习结果写入本地存储。
 */
import { useEffect } from 'react'
import type { BookData, QuizResults } from '../types'
import { saveRecord } from '../lib/storage'
import { SafeImg } from './SafeImg'
import { SpeakerButton } from './SpeakerButton'
import { playSuccess } from '../lib/sound'

interface ResultScreenProps {
  book: BookData
  results: QuizResults
  onRestart: () => void
  onHome: () => void
}

function encouragement(correct: number, total: number): { emoji: string; title: string; note: string } {
  const ratio = total > 0 ? correct / total : 0
  if (ratio >= 1) return { emoji: '🏆', title: '太棒了！全部答对！', note: '你真是个英语小达人！' }
  if (ratio >= 0.7) return { emoji: '🌟', title: '真厉害！', note: '大部分都答对啦，继续加油！' }
  if (ratio >= 0.4) return { emoji: '💪', title: '很不错！', note: '多听几遍，你会更棒的！' }
  return { emoji: '🌱', title: '加油！', note: '跟读一遍故事，再来挑战一次吧！' }
}

export function ResultScreen({ book, results, onRestart, onHome }: ResultScreenProps) {
  const msg = encouragement(results.correct, results.total)

  useEffect(() => {
    playSuccess()
    saveRecord({
      bookId: book.id,
      bookTitle: book.title,
      date: new Date().toISOString(),
      correct: results.correct,
      total: results.total,
      wrongIds: results.wrong.map((w) => w.questionId),
    })
  }, [book.id, book.title, results.correct, results.total, results.wrong])

  return (
    <div className="screen result">
      <main className="result-main pop-in">
        <div className="result-emoji">{msg.emoji}</div>
        <h2 className="result-title">{msg.title}</h2>
        <p className="result-note">{msg.note}</p>

        <div className="result-score">
          <span className="score-big">{results.correct}</span>
          <span className="score-total">/ {results.total} 题</span>
        </div>

        {results.wrong.length > 0 ? (
          <div className="result-review">
            <h3 className="review-title">再认识一下这些单词吧：</h3>
            <div className="review-list">
              {results.wrong.map((w) => (
                <div key={w.questionId} className="review-item">
                  <SafeImg src={w.correctImage} alt={w.correctLabel} className="review-img" fallbackText="🖼️" />
                  <div className="review-info">
                    <p className="review-question">{w.question}</p>
                    <p className="review-answer">
                      {w.correctLabel}
                      {w.questionAudio ? <SpeakerButton src={w.questionAudio} size="md" /> : null}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="result-clean">没有错题，太棒啦！</p>
        )}

        <div className="result-actions">
          <button type="button" className="btn btn-primary btn-big" onClick={onRestart}>
            🔁 再学一次
          </button>
          <button type="button" className="btn btn-ghost" onClick={onHome}>
            🏠 回到首页
          </button>
        </div>
      </main>
    </div>
  )
}
