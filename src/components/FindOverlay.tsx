/**
 * 寻找任务浮层：在绘本整页图上点一点，找到目标区域。
 * - 点中热点：成功庆祝，1.6s 后自动返回
 * - 点错：温和提示；连续错 3 次后显示发光提示圈，避免孩子卡住
 */
import { useRef, useState } from 'react'
import type { FindTask } from '../types'
import { SafeImg } from './SafeImg'
import { playSuccess, playSoftFail } from '../lib/sound'

interface FindOverlayProps {
  task: FindTask
  onDone: () => void
  onClose: () => void
}

export function FindOverlay({ task, onDone, onClose }: FindOverlayProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [status, setStatus] = useState<'idle' | 'found'>('idle')
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(0)
  const [ratio, setRatio] = useState<number | null>(null)

  const showHint = misses >= 3
  const hx = ((task.hotspot.x1 + task.hotspot.x2) / 2) * 100
  const hy = ((task.hotspot.y1 + task.hotspot.y2) / 2) * 100

  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status === 'found') return
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!nw || !nh) return
    const scale = Math.min(rect.width / nw, rect.height / nh)
    const drawW = nw * scale
    const drawH = nh * scale
    const dx = rect.left + (rect.width - drawW) / 2
    const dy = rect.top + (rect.height - drawH) / 2
    const nx = (e.clientX - dx) / drawW
    const ny = (e.clientY - dy) / drawH
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return
    const { x1, y1, x2, y2 } = task.hotspot
    if (nx >= x1 && nx <= x2 && ny >= y1 && ny <= y2) {
      playSuccess()
      setStatus('found')
      window.setTimeout(onDone, 1600)
    } else {
      playSoftFail()
      setMisses((m) => m + 1)
      setShake((s) => s + 1)
    }
  }

  return (
    <div className="find-overlay" role="dialog" aria-label={task.label}>
      <div className="find-head">
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="返回卡片">
          ✕
        </button>
        <p className="find-question">{task.label}</p>
      </div>

      <div
        className={`find-stage ${shake ? `shake-${shake % 2}` : ''}`}
        onPointerUp={handleTap}
      >
        <div
          className="find-img-wrap"
          style={ratio ? { aspectRatio: `${ratio} / 1` } : undefined}
        >
          <SafeImg
            ref={imgRef}
            src={task.pageImage}
            alt={task.label}
            className="find-img"
            fallbackText="🔍"
            onLoad={(e) => {
              const el = e.currentTarget
              if (el.naturalWidth > 0 && el.naturalHeight > 0) {
                setRatio(el.naturalWidth / el.naturalHeight)
              }
            }}
          />
          <div
            className="hotspot"
            style={{
              left: `${task.hotspot.x1 * 100}%`,
              top: `${task.hotspot.y1 * 100}%`,
              width: `${(task.hotspot.x2 - task.hotspot.x1) * 100}%`,
              height: `${(task.hotspot.y2 - task.hotspot.y1) * 100}%`,
            }}
          />
          {showHint ? (
            <div
              className="hotspot-hint"
              style={{
                left: `${hx}%`,
                top: `${hy}%`,
              }}
              aria-hidden="true"
            >
              👆
            </div>
          ) : null}
        </div>
      </div>

      <div className="find-foot">
        {status === 'found' ? (
          <div className="find-result found-result pop-in">🎉 真棒！找到了！</div>
        ) : misses === 0 ? (
          <p className="find-tip">点一点图片，把它找出来！</p>
        ) : misses < 3 ? (
          <p className="find-tip">再看看，它在图片的哪里呢？</p>
        ) : (
          <p className="find-tip">跟着 👆 小手指点一点！</p>
        )}
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          跳过
        </button>
      </div>
    </div>
  )
}
