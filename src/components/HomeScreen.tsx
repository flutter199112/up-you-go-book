/**
 * 首页：绘本封面 + 开始学习按钮
 */
import type { BookData } from '../types'
import { SafeImg } from './SafeImg'

interface HomeScreenProps {
  book: BookData
  lastResult?: string | null
  onStart: () => void
}

export function HomeScreen({ book, lastResult, onStart }: HomeScreenProps) {
  return (
    <div className="screen home">
      <div className="home-card pop-in">
        <div className="cover-frame float-slow">
          <SafeImg src={book.cover.image} alt={book.title} className="cover-img" fallbackText="📚" />
        </div>
        <h1 className="book-title">{book.title}</h1>
        <p className="book-subtitle">{book.subtitle}</p>
        {lastResult ? <p className="home-last">上次成绩：{lastResult}</p> : null}
        <button type="button" className="btn btn-primary btn-big btn-bounce" onClick={onStart}>
          ▶ 开始学习
        </button>
        <p className="home-tip">跟着音频读一读，然后来玩找一找和猜一猜！</p>
      </div>
    </div>
  )
}
