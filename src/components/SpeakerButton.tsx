/**
 * 发音按钮：点击播放一段短音频（单词/题目发音）。
 */
import { useSpeaker } from '../hooks/useSpeaker'

interface SpeakerButtonProps {
  src?: string
  label?: string
  size?: 'md' | 'lg'
  className?: string
}

export function SpeakerButton({ src, label = '🔊', size = 'md', className = '' }: SpeakerButtonProps) {
  const { play, error, playing } = useSpeaker(src)
  if (error) {
    return <span className="speaker-error" title="发音文件缺失">🔇</span>
  }
  return (
    <button
      type="button"
      className={`speaker-btn speaker-${size} ${playing ? 'speaker-playing' : ''} ${className}`}
      onClick={play}
      aria-label="播放发音"
    >
      {label}
    </button>
  )
}
