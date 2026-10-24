/**
 * 单词/问题发音播放 Hook（点击按钮播放短音频）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeaker(src: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const play = useCallback(() => {
    if (!src) return
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.onerror = () => setError(true)
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onplay = () => setPlaying(true)
    }
    const a = audioRef.current
    a.currentTime = 0
    const p = a.play()
    if (p) p.catch(() => setError(true))
  }, [src])

  return { play, error, playing }
}
