# Up You Go · 儿童英语绘本学习网页（第一版）

面向学龄前儿童的互动英语绘本学习网页，以牛津阅读树 **《Up You Go》（1-23）** 为内容：
首页封面 → 阅读页（音频时间轴自动翻页）→ 单词卡片页（找一找任务）→ 图片选择题测验 → 结果页。

**技术栈**：React 19 + TypeScript + Vite · HTML Audio 播放 MP3 · 全部绘本数据从 JSON 读取。
第一版无数据库、无账号系统、不接入 AI API、不含任何密钥；学习记录仅保存在浏览器本地（localStorage）。

---

## 一、功能清单（对应需求）

| 需求 | 实现 |
|---|---|
| 首页显示绘本封面与「开始学习」 | `HomeScreen`，封面 + 书名 + 大按钮 |
| 阅读页适配 iPad 横屏，显示绘本图片 | 页面图片 `object-fit: contain`，横屏两栏布局（左图右文），大按钮 |
| 音频播放 / 暂停 / 重新播放 / 进度条 / 上一页 / 下一页 | `useAudioSync` + `ReadingScreen` |
| 按音频时间自动切换绘本图片 | 时间轴为**半开区间 [start, end)**，`timeupdate` 每 250ms 判定一次，切页带防抖，无闪烁 |
| 暂停或拖动音频时正确更新当前页 | 拖动中显示拖动值、松手才 seek；暂停时翻页按「当前页 ± 1」seek 到目标页起点 |
| 音频播完自动进入卡片页 | 监听 `ended` 事件 → 自动进入 `CardsScreen` |
| 卡片：图片 + 英文 + 中文释义（仅单词）+ 情境句 + 寻找任务 + 点击发音 | `CardsScreen` + `FindOverlay`（热点点击判定，错 3 次出现 👆 提示）+ `SpeakerButton` |
| 3–5 道图片选择题，立即反馈 | `QuizScreen`：答对 🎉 进入下一题；答错**重播问题音频 + 轻提示**，2.5 秒后可再选；只按「首次作答」计分 |
| 结果页：正确数 + 鼓励 + 错题回顾 | `ResultScreen`：星级表情鼓励、错题缩略图 + 单词发音 + 「再学一次 / 回到首页」 |
| 儿童友好：大按钮、温暖配色、少文字、简单动画 | 暖色调（奶油/橙/绿）、圆角大按钮、pop-in / shake / bounce 轻动画 |
| 数据与质量：内容从 JSON 读取、路径可配置 | `public/data/book.json` 是唯一内容源；图片/音频路径全部相对 `public/` |
| 时间轴边界处理正确，不闪烁 | 见上方「半开区间 + 防抖」；无效区间会被修正（见 loadBook 校验） |
| 音频/图片加载失败处理 | 音频失败显示「重试加载」横幅且可手动翻页；图片失败显示 🖼️ 占位并保留功能 |
| 学习记录仅本地 | `src/lib/storage.ts`，localStorage key `up-you-go:records:v1`，最多 50 条 |

---

## 二、目录结构

```
up-you-go-app/
├── index.html                     # 入口 HTML（中文标题、内联 favicon）
├── package.json                   # 依赖与脚本
├── vite.config.ts
├── public/                        # 静态资源（构建时原样复制）
│   ├── data/book.json             # ★ 唯一内容源：页面/时间轴/词卡/测验
│   ├── audio/
│   │   ├── story.mp3              # 绘本朗读（1:31，含导读）
│   │   └── words/                 # 8 个单词发音（美音）
│   │       ├── up.mp3  go.mp3  kipper.mp3  biff.mp3
│   │       ├── chip.mp3  dad.mp3  slide.mp3  pool.mp3
│   └── images/
│       ├── cover.jpg              # 封面
│       ├── page-01..08.jpg        # 8 个故事页（PDF 渲染图）
│       └── cards/                 # 7 张词汇/测验用对象裁切图
│           ├── kipper.jpg  biff.jpg  chip.jpg  dad.jpg
│           └── slide.jpg  pool.jpg  go.jpg
└── src/
    ├── main.tsx / App.tsx         # 状态机：home→reading→cards→quiz→result
    ├── types.ts                   # BookData / BookPage / WordCard / QuizQuestion / ...
    ├── data/loadBook.ts           # fetch book.json + 结构校验 + 时间轴规范化
    ├── hooks/
    │   ├── useAudioSync.ts        # 音频状态机：播放/暂停/seek/ended/失败重试/页同步
    │   └── useSpeaker.ts          # 单词发音（防重复播放）
    ├── lib/
    │   ├── storage.ts             # localStorage 学习记录
    │   └── sound.ts               # WebAudio 合成的小音效（成功/失败/点击）
    └── components/
        ├── HomeScreen.tsx         # 首页
        ├── ReadingScreen.tsx      # 阅读页
        ├── CardsScreen.tsx        # 词卡页
        ├── FindOverlay.tsx        # 「找一找」热点浮层
        ├── QuizScreen.tsx         # 测验
        ├── ResultScreen.tsx       # 结果页
        ├── SafeImg.tsx            # 图片失败占位
        └── SpeakerButton.tsx      # 圆形发音按钮
```

---

## 三、安装与运行

需要 Node.js ≥ 18。

```bash
cd up-you-go-app
npm install        # 安装依赖
npm run dev        # 开发模式，默认 http://localhost:5173
```

生产构建与预览：

```bash
npm run build      # 产出 dist/
npm run preview    # 本地预览 http://localhost:4173/
```

iPad 横屏体验：用 iPad 的 Safari 打开上述地址，或本地把窗口拉成横版（宽 > 高）。

---

## 四、数据配置（public/data/book.json）

所有内容都在 `book.json`，改内容只改它，无需动组件代码。

```jsonc
{
  "id": "up-you-go-1-23",
  "title": "Up You Go",
  "audio": { "src": "audio/story.mp3" },          // 绘本音频，路径相对 public/
  "pages": [                                        // 阅读页 + 音频时间轴
    {
      "index": 0,
      "image": "images/cover.jpg",                  // 路径相对 public/
      "text": "Up You Go",                          // 页上英文（用于无障碍）
      "zh": "上去吧！",
      "start": 0,                                   // 该页音频起始秒
      "end": 33.06                                  // 结束秒（半开区间 [start, end)）
    }
    // ... 共 9 页（封面 + 8 故事页）
  ],
  "cards": [                                        // 单词卡片
    {
      "id": "up", "word": "up", "zh": "向上",       // 中文释义只译单词
      "image": "images/cards/kipper.jpg",
      "audio": "audio/words/up.mp3",                // 发音
      "sentence": "Up you go, Kipper.",             // 情境句
      "sentenceZh": "上去吧，Kipper。",
      "find": {                                     // 找一找任务
        "label": "找一找：Kipper 在哪里？",
        "pageImage": "images/page-01.jpg",
        "hotspot": { "x1": 0.10, "y1": 0.16, "x2": 0.50, "y2": 0.80 }  // 归一化坐标 0~1
      }
    }
    // ... 共 8 张卡
  ],
  "quiz": [                                         // 图片选择题（5 道）
    {
      "id": "q-slide", "question": "哪个是滑梯？",
      "questionAudio": "audio/words/slide.mp3",     // 题目语音
      "hint": "滑梯滑滑的，小朋友从上面滑下来。",       // 答错后的轻提示
      "options": [
        { "image": "images/cards/slide.jpg", "label": "slide", "correct": true },
        { "image": "images/cards/pool.jpg", "label": "pool", "correct": false }
        // 每题 4 个选项，correct 有且仅有一个
      ]
    }
    // ... 共 5 题
  ]
}
```

**换一本绘本**：替换 `public/audio/story.mp3`、`public/images/page-*.jpg`、`cards/*`，并按实际逐句时间修改 `pages[].start/end` 即可。时间轴要求：递增、`start < end`、区间可相接但不重叠（程序会自动裁剪重叠并把越界区间修进 [0, 音频时长]）。

---

## 五、音频时间轴（本册音画对应）

朗读音频 91.58 秒，开头 0–33.06s 为封面导读，8 个故事页逐句如下（来自转写 + 视觉识别核对）：

| 页 | 画面 | 英文 | 时间（秒） |
|---|---|---|---|
| 0 | 封面 | Up You Go（导读） | 0 – 33.06 |
| 1 | Kipper 爬上滑梯 | Up you go, Kipper. | 33.06 – 39.82 |
| 2 | 滑下入水池 | Go! | 39.82 – 44.80 |
| 3 | Biff 攀爬 | Up you go, Biff. | 44.80 – 51.52 |
| 4 | 戏水 | Go, go! | 51.52 – 58.38 |
| 5 | 三孩加小狗 | Chip, up you go. | 58.38 – 66.38 |
| 6 | 水花四溅 | Go, go, go! | 66.38 – 73.38 |
| 7 | 爸爸要滑 | No, Dad. | 73.38 – 82.12 |
| 8 | 爸爸摔倒 | No, no, no! | 82.12 – 91.58 |

---

## 六、逐模块测试指南（每个模块完成后如何验证）

**0. 通用**：`npm run dev` 或 `npm run preview` 打开页面，用浏览器开发者工具（F12 → Console / Network）观察报错与资源请求（404 即资源路径配错）。

**1. 首页**：封面图显示、标题正确、「开始学习」按钮可点、点击后进入阅读页。测试：直接访问首页 → 观察 Network 中 `book.json / cover.jpg` 均 200。

**2. 阅读页与音频同步**：
- 点击「播放」→ 按钮变「暂停」，进度条秒数增长；
- 播放到 33s 附近 → 自动切到第 2 页（可把进度条拖到 35s 验证）；
- 拖动进度条到不同页区间（如 42s / 66s）→ 页面与页点跟随正确；
- 播放中暂停 → 进度停住；暂停后点「下一页/上一页」→ 跳到相邻页起点且保持暂停；
- 点「重播」→ 回到 0s 从头播放。
验证方法：观察页点（第 X / 9 页）、进度条数值、按钮文案三者一致。

**3. 播完自动进卡片**：把进度条拖到约 90s 后点播放，等音频自然结束 → 自动进入「卡片 1 / 8」。

**4. 卡片页**：
- 点 🔊 → 播放单词发音（Console 无 404）；
- 点「找一找」→ 浮层显示整页图与虚线框；点框外 → 出现「再看看」提示；连错 3 次 → 出现 👆 手指提示；点框内 → 「真棒！找到了！」并自动返回；
- 「上一张 / 下一张」逐卡浏览 8 张卡，发音与中文释义正确。

**5. 测验**：
- 答对 → 绿色高亮 + 🎉 + 1.5 秒后自动进入下一题；
- 答错 → 题目音频重播 + 提示文字，2.5 秒后按钮恢复可再选；再答对 → 进入下一题；
- 全部答完 → 进入结果页。

**6. 结果页**：正确数 = 首次作答答对的题数；错题回顾列出所有「首次作答答错」的题（图 + 词 + 发音）；鼓励语随正确率变化（全对 / 大部分 / 一般）；「再学一次」回阅读页、「回到首页」回首页；刷新后 F12 → Application → Local Storage 可见 `up-you-go:records:v1` 记录。

**7. 容错**：临时把 `book.json` 中音频或某张图路径改成不存在的文件 → 音频失败出现「重试加载」横幅且可手动翻页；图片失败显示 🖼️ 占位且其余功能正常（测试后记得改回）。

**8. 构建**：`npm run build` 无 TypeScript 报错；`npm run preview` 与 `npm run dev` 行为一致。

---

## 七、已完成的浏览器实测（本机）

- 首页 → 阅读页：封面、9 页页点、进度 0:00–1:31、上一页禁用 ✓
- 播放 2.5s：进度 2s、按钮变暂停 ✓；拖动进度条 34.8s → 第 2 页、42.4s → 第 3 页（自动翻页）✓
- 暂停 + 下一页/上一页：正确跳相邻页并保持暂停 ✓；重播归零 ✓
- 90.5s 播放至自然结束 → 自动进入卡片页 ✓
- 卡片：发音无 404；找一找点错提示、连错 3 次 👆、点中庆祝并关闭 ✓
- 测验：答错重播 + 轻提示 + 2.5s 恢复可再选；答对自动进下一题；全对 5/5 显示「太棒了！全部答对！」；首答错题正确记入错题回顾 ✓
- 结果页：正确数/鼓励/错题回顾正确；localStorage 记录保存（最多 50 条）✓
- 容错：音频路径错误 → 重试横幅 + 可翻页；图片 404 → 🖼️ 占位 ✓

---

## 八、范围与后续（第一版边界）

- 已按需求**不做**：语音评分、用户系统、数据库、AI API、任何密钥。
- 学习记录仅存本地 localStorage，换设备/清缓存会丢失（后续可接简单后端同步）。
- 动画为轻量 CSS；如需更复杂动效可再增强。
