/**
 * 单词卡片页：图片 + 英文单词 + 中文释义 + 情境句 + 寻找/动作任务。
 * 支持点击播放单词发音；全部卡片完成后进入测验。
 */
import { useState } from 'react'
import type { BookData } from '../types'
import { SafeImg } from './SafeImg'
import { SpeakerButton } from './SpeakerButton'
import { FindOverlay } from './FindOverlay'
import { playTap } from '../lib/sound'

interface CardsScreenProps {
  book: BookData
  onFinished: () => void
  onExit: () => void
}

export function CardsScreen({ book, onFinished, onExit }: CardsScreenProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [findOpen, setFindOpen] = useState(false)

  const cards = book.cards
  const card = cards[cardIndex]
  const total = cards.length
  const isLast = cardIndex === total - 1

  const goNext = () => {
    playTap()
    if (isLast) {
      onFinished()
    } else {
      setCardIndex((i) => i + 1)
    }
  }
  const goPrev = () => {
    playTap()
    if (cardIndex > 0) setCardIndex((i) => i - 1)
  }

  return (
    <div className="screen cards">
      <header className="topbar">
        <button type="button" className="btn btn-ghost" onClick={onExit} aria-label="退出">
          ✕
        </button>
        <div className="page-dots" aria-label={`卡片 ${cardIndex + 1} / ${total}`}>
          {cards.map((c, i) => (
            <span key={c.id} className={`dot ${i === cardIndex ? 'dot-active' : ''}`} />
          ))}
        </div>
        <span className="topbar-label">卡片 {cardIndex + 1} / {total}</span>
      </header>

      <main className="cards-main" key={card.id}>
        <div className="card-visual">
          <SafeImg src={card.image} alt={card.word} className="card-img" fallbackText="🖼️" />
        </div>
        <div className="card-panel">
          <div className="card-word-row">
            <h2 className="card-word">{card.word}</h2>
            <SpeakerButton src={card.audio} size="lg" />
          </div>
          <p className="card-zh">{card.zh}</p>
          <div className="card-sentence">
            <p className="card-sentence-en">{card.sentence}</p>
            <p className="card-sentence-zh">{card.sentenceZh}</p>
          </div>
          {card.find ? (
            <button type="button" className="btn btn-task" onClick={() => setFindOpen(true)}>
              🔍 {card.find.label}
            </button>
          ) : (
            <button type="button" className="btn btn-task btn-task-disabled" disabled>
              🎵 听一听，念一念：{card.word}
            </button>
          )}
        </div>
      </main>

      <footer className="cards-footer">
        <button type="button" className="btn btn-nav" onClick={goPrev} disabled={cardIndex === 0}>
          ⏮ 上一张
        </button>
        <button type="button" className="btn btn-primary btn-big" onClick={goNext}>
          {isLast ? '开始猜一猜 →' : '下一张 →'}
        </button>
      </footer>

      {findOpen && card.find ? (
        <FindOverlay
          task={card.find}
          onDone={() => setFindOpen(false)}
          onClose={() => setFindOpen(false)}
        />
      ) : null}
    </div>
  )
}
