/**
 * 音频播放 + 时间轴同步的核心 Hook。
 * - 播放 / 暂停 / 重播 / 进度条 / 上一页 / 下一页
 * - 根据当前播放时间自动切换页面（半开区间，无闪烁）
 * - 暂停、拖动（seek）后正确更新当前页面
 * - 播放结束回调、加载失败回调
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { BookPage } from '../types'
import { findPageIndexForTime } from '../data/loadBook'

export interface AudioSync {
  playing: boolean
  currentTime: number
  duration: number
  /** 当前页面在 pages 中的下标 */
  pageIndex: number
  ready: boolean
  error: string | null
  play: () => void
  pause: () => void
  toggle: () => void
  replay: () => void
  seek: (t: number) => void
  goToPage: (index: number) => void
  /** 音频加载失败后重新尝试加载 */
  retry: () => void
}

export function useAudioSync(
  src: string,
  pages: BookPage[],
  onEnded: () => void,
): AudioSync {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  const syncPage = useCallback(
    (t: number) => {
      setPageIndex(findPageIndexForTime(pages, t))
    },
    [pages],
  )

  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audioRef.current = audio
    setPlaying(false)
    setError(null)
    setReady(false)

    const handleTimeUpdate = () => {
      const t = audio.currentTime
      setCurrentTime(t)
      syncPage(t)
    }
    const handleLoaded = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
      setReady(true)
      setError(null)
      syncPage(audio.currentTime)
    }
    const handleError = () => {
      setError('音频加载失败，请检查文件是否存在后重试。你仍然可以手动翻页阅读。')
    }
    const handleEnded = () => {
      setPlaying(false)
      setCurrentTime(audio.duration || 0)
      onEndedRef.current()
    }

    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('seeked', handleTimeUpdate)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('seeked', handleTimeUpdate)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [src, syncPage, reloadKey])

  const play = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setError('无法播放音频，请重试。'))
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) play()
    else pause()
  }, [play, pause])

  const replay = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    syncPage(0)
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setError('无法播放音频，请重试。'))
  }, [syncPage])

  const seek = useCallback(
    (t: number) => {
      const a = audioRef.current
      if (!a) return
      const clamped = Math.max(0, Math.min(t, a.duration || t))
      a.currentTime = clamped
      setCurrentTime(clamped)
      syncPage(clamped)
    },
    [syncPage],
  )

  const goToPage = useCallback(
    (index: number) => {
      const a = audioRef.current
      if (!a) return
      const page = pages[index]
      if (!page) return
      const t = Math.max(0, Math.min(page.start, (a.duration || page.start)))
      a.currentTime = t
      setCurrentTime(t)
      syncPage(t)
    },
    [pages, syncPage],
  )

  const retry = useCallback(() => {
    setError(null)
    setReloadKey((k) => k + 1)
  }, [])

  return { playing, currentTime, duration, pageIndex, ready, error, play, pause, toggle, replay, seek, goToPage, retry }
}
