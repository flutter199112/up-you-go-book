/**
 * 带加载失败兜底的图片组件（支持 ref 转发）：
 * 图片加载失败时显示友好的占位（不破坏学习流程）。
 */
import { forwardRef, useEffect, useState } from 'react'
import type { CSSProperties, ImgHTMLAttributes } from 'react'

interface SafeImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string
  alt: string
  fallbackText?: string
  style?: CSSProperties
}

export const SafeImg = forwardRef<HTMLImageElement, SafeImgProps>(function SafeImg(
  { src, alt, className, style, fallbackText = '📖', draggable = true, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (failed) {
    return (
      <div className={`img-fallback ${className ?? ''}`} style={style} role="img" aria-label={alt}>
        <span className="img-fallback-emoji">{fallbackText}</span>
        <span className="img-fallback-text">{alt}</span>
      </div>
    )
  }
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      draggable={draggable}
      {...rest}
    />
  )
})
