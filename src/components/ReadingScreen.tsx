/**
 * 阅读页：绘本图片 + 音频同步播放
 * - 播放 / 暂停 / 重播 / 进度条 / 上一页 / 下一页
 * - 根据音频时间自动翻页（半开区间，无闪烁）
 * - 暂停或拖动进度条时正确更新当前页面
 * - 音频播完自动进入单词卡片页
 */
import { useRef, useState } from 'react'
import type { BookData } from '../types'
import { useAudioSync } from '../hooks/useAudioSync'
import { SafeImg } from './SafeImg'

interface ReadingScreenProps {
  book: BookData
  onFinished: () => void
  onExit: () => void
}

function formatTime(t: number): string {
  if (!Number.isFinite(t) || t < 0) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ReadingScreen({ book, onFinished, onExit }: ReadingScreenProps) {
  const { pages, audio } = book
  const {
    playing, currentTime, duration, pageIndex, error,
    play, toggle, replay, seek, goToPage, retry,
  } = useAudioSync(audio.src, pages, onFinished)

  const [dragging, setDragging] = useState(false)
  const [dragValue, setDragValue] = useState(0)
  const dragRef = useRef(false)

  const page = pages[pageIndex]
  const total = pages.length

  const startDrag = (e: React.PointerEvent<HTMLInputElement>) => {
    dragRef.current = true
    setDragging(true)
    setDragValue(Number((e.target as HTMLInputElement).value))
  }
  const onDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragValue(Number(e.target.value))
  }
  const endDrag = () => {
    if (!dragRef.current) return
    dragRef.current = false
    setDragging(false)
    seek(dragValue)
  }

  const goPrev = () => {
    if (pageIndex > 0) goToPage(pageIndex - 1)
  }
  const goNext = () => {
    if (pageIndex < total - 1) goToPage(pageIndex + 1)
  }

  return (
    <div className="screen reading">
      <header className="topbar">
        <button type="button" className="btn btn-ghost" onClick={onExit} aria-label="退出阅读">
          ✕
        </button>
        <div className="page-dots" aria-label={`第 ${pageIndex + 1} 页，共 ${total} 页`}>
          {pages.map((p, i) => (
            <span key={p.index} className={`dot ${i === pageIndex ? 'dot-active' : ''}`} />
          ))}
        </div>
        <button type="button" className="btn btn-ghost" onClick={replay} aria-label="重新播放">
          ⟲ 重播
        </button>
      </header>

      {error ? (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-small" onClick={retry}>重试加载</button>
        </div>
      ) : null}

      <main className="reading-main">
        <div key={page.index} className="page-stage page-turn-in">
          <SafeImg
            src={page.image}
            alt={page.text}
            className="page-img"
            fallbackText="📖"
          />
        </div>
        <div className="page-text-bar">
          <div className="page-text-en">
            <span>{page.text}</span>
            <button
              type="button"
              className="page-sound-btn"
              onClick={() => {
                // 读句子：跳到本页开头播放（如果正在播放则忽略，避免打断）
                if (!playing) goToPage(pageIndex)
                if (!playing) play()
              }}
              aria-label="播放本页句子"
            >
              🔊
            </button>
          </div>
          <div className="page-text-zh">{page.zh}</div>
          <div className="page-num">
            第 {pageIndex + 1} / {total} 页
          </div>
        </div>
      </main>

      <footer className="reading-footer">
        <div className="progress-row">
          <span className="time-label">{formatTime(dragging ? dragValue : currentTime)}</span>
          <input
            type="range"
            className="progress"
            min={0}
            max={duration > 0 ? duration : 100}
            step={0.1}
            value={dragging ? dragValue : Math.min(currentTime, duration || 0)}
            onChange={onDrag}
            onPointerDown={startDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyUp={endDrag}
            aria-label="音频进度"
          />
          <span className="time-label">{formatTime(duration)}</span>
        </div>

        <div className="controls-row">
          <button type="button" className="btn btn-nav" onClick={goPrev} disabled={pageIndex === 0} aria-label="上一页">
            ⏮ 上一页
          </button>
          <button type="button" className="btn btn-play" onClick={toggle} aria-label={playing ? '暂停' : '播放'}>
            {playing ? '⏸' : '▶'}
          </button>
          <button type="button" className="btn btn-nav" onClick={goNext} disabled={pageIndex === total - 1} aria-label="下一页">
            下一页 ⏭
          </button>
        </div>

        <button type="button" className="btn btn-skip" onClick={onFinished}>
          听完啦，去卡片学习 →
        </button>
      </footer>
    </div>
  )
}
