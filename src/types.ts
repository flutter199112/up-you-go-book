/**
 * 绘本数据模型 —— 全部内容来自 public/data/book.json
 */

export interface BookCover {
  image: string
  title: string
  subtitle: string
}

export interface BookAudio {
  /** 音频相对路径（相对 public/，例如 audio/story.mp3） */
  src: string
  /** 可选：音频时长（秒）提示，实际以音频元数据为准 */
  duration?: number
}

export interface BookPage {
  /** 0 起页序号（阅读顺序） */
  index: number
  /** 页面图片相对路径 */
  image: string
  /** 页面英文文字 */
  text: string
  /** 页面中文释义 */
  zh: string
  /** 音频时间轴左边界（秒，包含） */
  start: number
  /** 音频时间轴右边界（秒，不包含） */
  end: number
}

export interface FindTask {
  /** 寻找任务提示语 */
  label: string
  /** 寻找任务使用的图片（一般是绘本整页） */
  pageImage: string
  /** 目标区域，归一化坐标 0..1，热点 = [x1,y1]-[x2,y2] */
  hotspot: { x1: number; y1: number; x2: number; y2: number }
}

export interface WordCard {
  id: string
  /** 英文单词 */
  word: string
  /** 中文释义（仅翻译单词） */
  zh: string
  /** 卡片主图相对路径 */
  image: string
  /** 单词发音音频相对路径 */
  audio: string
  /** 与绘本相关的情境句 */
  sentence: string
  /** 情境句中文 */
  sentenceZh: string
  /** 可选：寻找/动作任务 */
  find?: FindTask
}

export interface QuizOption {
  image: string
  /** 选项英文词 */
  label: string
  correct: boolean
}

export interface QuizQuestion {
  id: string
  /** 中文题目 */
  question: string
  /** 答错时重新播放的问题音频（一般为单词发音） */
  questionAudio?: string
  /** 轻提示（答错时显示） */
  hint: string
  options: QuizOption[]
}

export interface BookData {
  id: string
  title: string
  subtitle: string
  cover: BookCover
  audio: BookAudio
  pages: BookPage[]
  cards: WordCard[]
  quiz: QuizQuestion[]
}

/** 测验结果 */
export interface WrongItem {
  questionId: string
  question: string
  correctLabel: string
  correctImage: string
  questionAudio?: string
}

export interface QuizResults {
  correct: number
  total: number
  wrong: WrongItem[]
}
