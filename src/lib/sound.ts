/**
 * 轻量音效（WebAudio 合成，无任何外部资源，离线可用）。
 * 注意：必须在用户手势（点击）中触发，浏览器才会允许 AudioContext 播放。
 */
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.2) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, c.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(volume, c.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + duration + 0.05)
}

/** 答对 / 找到：轻快的上行音 */
export function playSuccess() {
  tone(523.25, 0, 0.15, 'triangle', 0.25)
  tone(659.25, 0.12, 0.15, 'triangle', 0.25)
  tone(783.99, 0.24, 0.3, 'triangle', 0.25)
}

/** 答错：温和的下行音（不吓到孩子） */
export function playSoftFail() {
  tone(392, 0, 0.2, 'sine', 0.2)
  tone(330, 0.16, 0.3, 'sine', 0.2)
}

/** 翻页 / 点击 */
export function playTap() {
  tone(600, 0, 0.08, 'sine', 0.12)
}
