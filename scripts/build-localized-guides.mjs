import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guideLastModified } from "./site-metadata.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const german = JSON.parse(
  await readFile(path.join(siteRoot, "locales", "guides-de.json"), "utf8")
);
const spanish = JSON.parse(
  await readFile(path.join(siteRoot, "locales", "guides-es.json"), "utf8")
);
const french = JSON.parse(
  await readFile(path.join(siteRoot, "locales", "guides-fr.json"), "utf8")
);
const japanese = JSON.parse(
  await readFile(path.join(siteRoot, "locales", "guides-ja.json"), "utf8")
);
const dutch = JSON.parse(
  await readFile(path.join(siteRoot, "locales", "guides-nl.json"), "utf8")
);
const guides = [
  { route: "read-selected-text-aloud-mac", schemaType: "HowTo" },
  { route: "screenshot-ocr-text-to-speech-mac", schemaType: "HowTo" },
  { route: "offline-text-to-speech-mac", schemaType: "TechArticle" },
  { route: "best-text-to-speech-app-for-mac", schemaType: "TechArticle" },
  { route: "read-pdf-aloud-mac", schemaType: "HowTo" }
];

const common = {
  "Go to LoudScript home page": { zhHant: "前往 LoudScript 首頁", zhHans: "前往 LoudScript 首页" },
  "LoudScript app icon": { zhHant: "LoudScript App 圖示", zhHans: "LoudScript App 图标" },
  "Page navigation": { zhHant: "頁面導覽", zhHans: "页面导航" },
  "Overview": { zhHant: "總覽", zhHans: "概览" },
  "Guides": { zhHant: "指南", zhHans: "指南" },
  "Support": { zhHant: "支援", zhHans: "支持" },
  "Download DMG": { zhHant: "下載 DMG", zhHans: "下载 DMG" },
  "Footer navigation": { zhHant: "頁尾導覽", zhHans: "页脚导航" },
  "Selected Text": { zhHant: "選取文字", zhHans: "所选文本" },
  "Offline Voices": { zhHant: "離線語音", zhHans: "离线语音" },
  "Screenshot OCR": { zhHant: "截圖 OCR", zhHans: "截屏 OCR" },
  "Privacy": { zhHant: "隱私權", zhHans: "隐私" },
  "Made by": { zhHant: "製作者：", zhHans: "制作：" },
  "By ": { zhHant: "作者：", zhHans: "作者：" },
  " · Updated August 20, 2026": { zhHant: " · 更新於 2026 年 8 月 20 日", zhHans: " · 更新于 2026 年 8 月 20 日" },
  " · Updated November 14, 2026": { zhHant: " · 更新於 2026 年 11 月 14 日", zhHans: " · 更新于 2026 年 11 月 14 日" },
  "Download LoudScript for Mac": { zhHant: "下載 Mac 版 LoudScript", zhHans: "下载 Mac 版 LoudScript" },
  "LoudScript for Mac": { zhHant: "LoudScript Mac 版", zhHans: "LoudScript Mac 版" },
  "privacy policy": { zhHant: "隱私權政策", zhHans: "隐私政策" },
  "Your speech text is not sent to product analytics. Apple voices and downloaded speech models synthesize speech on your Mac. If you explicitly enable optional AI formatting, the text being formatted can be sent to a third-party AI provider as described in the ": { zhHant: "你的朗讀文字不會傳送至產品分析服務。Apple 語音與已下載的語音模型都會在你的 Mac 上合成語音。如果你明確啟用選用的 AI 格式化功能，待格式化的文字可能會依隱私權政策所述傳送至第三方 AI 供應商。詳情請參閱", zhHans: "你的朗读文本不会发送至产品分析服务。Apple 语音和已下载的语音模型都会在你的 Mac 上合成语音。如果你明确启用可选的 AI 格式化功能，待格式化的文本可能会按照隐私政策所述发送至第三方 AI 提供商。详情请参阅" },
  "Speech synthesis stays on your Mac when you use Apple voices or a downloaded Supertonic, Kokoro, PocketTTS, or Phonon model. Optional AI formatting is separate: if you enable it, the text being formatted can be sent to a third-party provider. See the ": { zhHant: "使用 Apple 語音或已下載的 Supertonic、Kokoro、PocketTTS 或 Phonon 模型時，語音合成會留在你的 Mac 上。選用的 AI 格式化功能是獨立功能；若啟用，待格式化的文字可能會傳送至第三方供應商。完整說明請參閱", zhHans: "使用 Apple 语音或已下载的 Supertonic、Kokoro、PocketTTS 或 Phonon 模型时，语音合成会留在你的 Mac 上。可选的 AI 格式化功能是独立功能；如果启用，待格式化的文本可能会发送至第三方提供商。完整说明请参阅" },
  " for the complete explanation.": { zhHant: "。", zhHans: "。" },
  "Optional AI formatting is a separate feature. When enabled, it can send the text being formatted to a third-party provider before local speech begins. Leave AI formatting disabled when you want the complete text-processing path to remain on your Mac. The ": { zhHant: "選用的 AI 格式化功能是獨立功能。啟用後，它可能會在本機語音開始前，將待格式化的文字傳送至第三方供應商。如果你希望完整的文字處理流程都留在 Mac 上，請停用 AI 格式化。", zhHans: "可选的 AI 格式化功能是独立功能。启用后，它可能会在本地语音开始前，将待格式化的文本发送至第三方提供商。如果你希望完整的文本处理流程都留在 Mac 上，请禁用 AI 格式化。" },
  " documents these boundaries.": { zhHant: "說明了這些資料處理界線。", zhHans: "说明了这些数据处理边界。" }
};

const selected = {
  "Learn how to read selected text aloud on Mac with LoudScript. Use the Services menu or Option-Command-R in browsers, email, editors, and other apps.": {
    zhHant: "了解如何使用 LoudScript 在 Mac 上朗讀選取的文字。你可以在瀏覽器、郵件、編輯器與其他 App 中，透過「服務」選單或 Option-Command-R 開始朗讀。",
    zhHans: "了解如何使用 LoudScript 在 Mac 上朗读所选文本。你可以在浏览器、邮件、编辑器和其他 App 中，通过“服务”菜单或 Option-Command-R 开始朗读。"
  },
  "How to Read Selected Text Aloud on Mac | LoudScript": { zhHant: "如何在 Mac 上朗讀選取的文字｜LoudScript", zhHans: "如何在 Mac 上朗读所选文本｜LoudScript" },
  "Select text in almost any Mac app and hear it read aloud without interrupting your workflow.": { zhHant: "在幾乎任何 Mac App 中選取文字，無須中斷工作流程即可聆聽內容。", zhHans: "在几乎任何 Mac App 中选择文本，无需中断工作流程即可聆听内容。" },
  "Use the Services menu or Option-Command-R to hear selected text in Mac apps.": { zhHant: "使用「服務」選單或 Option-Command-R，朗讀 Mac App 中選取的文字。", zhHans: "使用“服务”菜单或 Option-Command-R，朗读 Mac App 中所选文本。" },
  "How to read selected text aloud on Mac": { zhHant: "如何在 Mac 上朗讀選取的文字", zhHans: "如何在 Mac 上朗读所选文本" },
  "Use LoudScript to read selected text from almost any Mac app.": { zhHant: "使用 LoudScript 朗讀幾乎任何 Mac App 中選取的文字。", zhHans: "使用 LoudScript 朗读几乎任何 Mac App 中所选文本。" },
  "Select text": { zhHant: "選取文字", zhHans: "选择文本" },
  "Highlight the words you want to hear in a Mac app.": { zhHant: "在 Mac App 中反白選取你想聆聽的文字。", zhHans: "在 Mac App 中选中你想聆听的文本。" },
  "Start LoudScript": { zhHant: "啟動 LoudScript", zhHans: "启动 LoudScript" },
  "Choose Read with LoudScript from the Services menu or press Option-Command-R.": { zhHant: "從「服務」選單選擇「Read with LoudScript」，或按下 Option-Command-R。", zhHans: "从“服务”菜单中选择“Read with LoudScript”，或按下 Option-Command-R。" },
  "Control playback": { zhHant: "控制播放", zhHans: "控制播放" },
  "Use the floating player to pause, stop, or return to the full app.": { zhHant: "使用浮動播放器暫停、停止播放，或返回完整 App。", zhHans: "使用浮动播放器暂停、停止播放，或返回完整 App。" },
  "Read selected text aloud on Mac": { zhHant: "在 Mac 上朗讀選取的文字", zhHans: "在 Mac 上朗读所选文本" },
  "Selected text guide": { zhHant: "選取文字指南", zhHans: "所选文本指南" },
  "Highlight words in a browser, editor, email, PDF viewer, or another Mac app. LoudScript reads the selection with a local voice and keeps playback controls above your other windows.": { zhHant: "在瀏覽器、編輯器、郵件、PDF 閱讀器或其他 Mac App 中選取文字。LoudScript 會以本機語音朗讀內容，並讓播放控制項保持在其他視窗上方。", zhHans: "在浏览器、编辑器、邮件、PDF 阅读器或其他 Mac App 中选择文本。LoudScript 会使用本地语音朗读内容，并让播放控件保持在其他窗口上方。" },
  "Read selected text in three steps": { zhHant: "三個步驟朗讀選取的文字", zhHans: "三个步骤朗读所选文本" },
  "Select the text": { zhHant: "選取文字", zhHans: "选择文本" },
  " you want to hear in any app that allows text selection.": { zhHant: "，在任何可選取文字的 App 中選擇你想聆聽的內容。", zhHans: "，在任何可选择文本的 App 中选中你想聆听的内容。" },
  "Start reading": { zhHant: "開始朗讀", zhHans: "开始朗读" },
  " by opening the Services menu and choosing ": { zhHant: "，開啟「服務」選單並選擇 ", zhHans: "，打开“服务”菜单并选择 " },
  ", or press ": { zhHant: "，或按下 ", zhHans: "，或按下 " },
  " from the floating player without switching away from your current app.": { zhHant: "，直接使用浮動播放器，無須切換離開目前的 App。", zhHans: "，直接使用浮动播放器，无需离开当前 App。" },
  "The Services-menu path sends the selected words directly to LoudScript. The keyboard shortcut offers a faster system-wide workflow after Selected Text access is enabled in macOS Accessibility settings.": { zhHant: "「服務」選單會把選取的文字直接傳送到 LoudScript。在 macOS「輔助使用」設定中啟用「選取文字」權限後，鍵盤快速鍵可提供更快的全系統工作流程。", zhHans: "“服务”菜单会将所选文本直接发送到 LoudScript。在 macOS“辅助功能”设置中启用“所选文本”权限后，键盘快捷键可提供更快的全系统工作流程。" },
  "Where selected-text reading works": { zhHant: "哪些地方可朗讀選取的文字", zhHans: "哪些地方可以朗读所选文本" },
  "LoudScript is designed for standard Mac applications rather than one browser or document format. Use it with web articles, notes, messages, source code comments, email drafts, and selectable passages in document viewers.": { zhHant: "LoudScript 適用於各種標準 Mac App，不限於單一瀏覽器或文件格式。你可以用它朗讀網頁文章、筆記、訊息、原始碼註解、郵件草稿，以及文件閱讀器中可選取的段落。", zhHans: "LoudScript 适用于各种标准 Mac App，不局限于某个浏览器或文档格式。你可以用它朗读网页文章、笔记、消息、源代码注释、邮件草稿，以及文档阅读器中可选择的段落。" },
  "Useful reading workflows": { zhHant: "實用的朗讀工作流程", zhHans: "实用的朗读工作流程" },
  "Proofread a draft by listening for missing words and repeated phrases.": { zhHant: "聆聽草稿，找出漏字與重複語句。", zhHans: "聆听草稿，找出漏词和重复语句。" },
  "Review study material while taking notes or resting your eyes.": { zhHant: "一邊做筆記或讓眼睛休息，一邊複習學習資料。", zhHans: "一边做笔记或让眼睛休息，一边复习学习资料。" },
  "Listen to a long article while continuing work in another window.": { zhHant: "在另一個視窗繼續工作，同時聆聽長篇文章。", zhHans: "在另一个窗口继续工作，同时聆听长篇文章。" },
  "Check how names, numbers, and technical terms sound with different voices.": { zhHant: "比較姓名、數字與技術用語在不同語音中的讀法。", zhHans: "比较姓名、数字和技术术语在不同语音中的读法。" },
  "Selected Text access and privacy": { zhHant: "選取文字權限與隱私權", zhHans: "所选文本权限与隐私" },
  "The global shortcut uses macOS Accessibility access to retrieve highlighted text across applications. LoudScript explains this permission during onboarding, and you can review it later under Settings → Permissions.": { zhHant: "全域快速鍵會使用 macOS「輔助使用」權限，取得不同 App 中反白選取的文字。LoudScript 會在初始設定時說明這項權限，你也可以稍後前往「設定」→「權限」查看。", zhHans: "全局快捷键会使用 macOS“辅助功能”权限，获取不同 App 中选中的文本。LoudScript 会在初始设置时说明此权限，你也可以稍后前往“设置”→“权限”查看。" },
  "Your speech text is not sent to product analytics. Apple voices and downloaded speech models synthesize speech on your Mac. If you explicitly enable optional AI formatting, the text being formatted can be sent to a third-party AI provider as described in the privacy policy.": { zhHant: "你的朗讀文字不會傳送至產品分析服務。Apple 語音與已下載的語音模型都會在你的 Mac 上合成語音。如果你明確啟用選用的 AI 格式化功能，待格式化的文字可能會依隱私權政策所述傳送至第三方 AI 供應商。", zhHans: "你的朗读文本不会发送至产品分析服务。Apple 语音和已下载的语音模型都会在你的 Mac 上合成语音。如果你明确启用可选的 AI 格式化功能，待格式化的文本可能会按照隐私政策所述发送至第三方 AI 提供商。" },
  "What if the text cannot be selected?": { zhHant: "如果文字無法選取怎麼辦？", zhHans: "如果文本无法选择怎么办？" },
  "Some apps render words inside images, videos, canvases, or locked interfaces. In that case, use LoudScript's screenshot OCR workflow to capture the relevant area and turn the visible words into speech.": { zhHant: "有些 App 會把文字顯示在圖片、影片、畫布或鎖定的介面中。遇到這種情況，可使用 LoudScript 的截圖 OCR 工作流程擷取相關區域，將可見文字轉為語音。", zhHans: "有些 App 会将文本显示在图片、视频、画布或锁定的界面中。遇到这种情况，可使用 LoudScript 的截屏 OCR 工作流程捕获相关区域，将可见文本转为语音。" },
  "Read the screenshot OCR guide": { zhHant: "閱讀截圖 OCR 指南", zhHans: "阅读截屏 OCR 指南" },
  "Compare local speech engines": { zhHant: "比較本機語音引擎", zhHans: "比较本地语音引擎" },
  "Start reading selected text": { zhHant: "開始朗讀選取的文字", zhHans: "开始朗读所选文本" },
  "LoudScript is a free, notarized download for macOS 15.6 or later. It supports Intel and Apple silicon Macs.": { zhHant: "LoudScript 可免費下載，已通過 Apple 公證，適用於 macOS 15.6 或以上版本，支援 Intel 與 Apple 晶片 Mac。", zhHans: "LoudScript 可免费下载，已通过 Apple 公证，适用于 macOS 15.6 或更高版本，支持 Intel 和 Apple 芯片 Mac。" }
};

const ocr = {
  "Use screenshot OCR text-to-speech on Mac with LoudScript. Capture unselectable on-screen text, extract it with macOS OCR, and hear it read aloud.": { zhHant: "使用 LoudScript 在 Mac 上透過截圖 OCR 將文字轉為語音。擷取無法選取的螢幕文字，以 macOS OCR 辨識後朗讀。", zhHans: "使用 LoudScript 在 Mac 上通过截屏 OCR 将文本转为语音。捕获无法选择的屏幕文本，使用 macOS OCR 识别后朗读。" },
  "Screenshot OCR Text-to-Speech for Mac | LoudScript": { zhHant: "Mac 截圖 OCR 文字轉語音｜LoudScript", zhHans: "Mac 截屏 OCR 文本转语音｜LoudScript" },
  "Capture text that cannot be selected, extract it with built-in macOS OCR, and listen with LoudScript.": { zhHant: "擷取無法選取的文字，以 macOS 內建 OCR 辨識，再使用 LoudScript 聆聽。", zhHans: "捕获无法选择的文本，使用 macOS 内置 OCR 识别，再用 LoudScript 聆听。" },
  "Turn unselectable text in screenshots, images, and app interfaces into speech on your Mac.": { zhHant: "在 Mac 上將截圖、圖片與 App 介面中無法選取的文字轉為語音。", zhHans: "在 Mac 上将截屏、图片和 App 界面中无法选择的文本转为语音。" },
  "How to read text from a screenshot on Mac": { zhHant: "如何在 Mac 上朗讀截圖中的文字", zhHans: "如何在 Mac 上朗读截屏中的文本" },
  "Capture unselectable text, extract it with macOS OCR, and read it aloud with LoudScript.": { zhHant: "擷取無法選取的文字，以 macOS OCR 辨識，再使用 LoudScript 朗讀。", zhHans: "捕获无法选择的文本，使用 macOS OCR 识别，再用 LoudScript 朗读。" },
  "Start screen capture": { zhHant: "開始螢幕擷取", zhHans: "开始截屏" },
  "Press Option-Command-R when no text is selected.": { zhHant: "未選取文字時，按下 Option-Command-R。", zhHans: "未选择文本时，按下 Option-Command-R。" },
  "Capture the text": { zhHant: "擷取文字", zhHans: "捕获文本" },
  "Drag over the on-screen words you want to hear.": { zhHant: "拖曳框選你想聆聽的螢幕文字。", zhHans: "拖动框选你想聆听的屏幕文本。" },
  "Listen": { zhHant: "聆聽", zhHans: "聆听" },
  "LoudScript extracts the visible words with macOS OCR and begins playback.": { zhHant: "LoudScript 會使用 macOS OCR 辨識可見文字並開始播放。", zhHans: "LoudScript 会使用 macOS OCR 识别可见文本并开始播放。" },
  "Screenshot OCR text-to-speech for Mac": { zhHant: "Mac 截圖 OCR 文字轉語音", zhHans: "Mac 截屏 OCR 文本转语音" },
  "Screenshot OCR guide": { zhHant: "截圖 OCR 指南", zhHans: "截屏 OCR 指南" },
  "Read words that are trapped inside images, videos, scanned documents, and app interfaces. LoudScript captures a screen region, extracts the visible text with macOS OCR, and starts speaking.": { zhHant: "朗讀圖片、影片、掃描文件與 App 介面中無法選取的文字。LoudScript 會擷取螢幕區域，以 macOS OCR 辨識可見文字，然後開始朗讀。", zhHans: "朗读图片、视频、扫描文档和 App 界面中无法选择的文本。LoudScript 会捕获屏幕区域，使用 macOS OCR 识别可见文本，然后开始朗读。" },
  "Turn on-screen text into speech": { zhHant: "將螢幕文字轉為語音", zhHans: "将屏幕文本转为语音" },
  "Press Option-Command-R": { zhHant: "按下 Option-Command-R", zhHans: "按下 Option-Command-R" },
  " when no text is selected.": { zhHant: "，請確保未選取任何文字。", zhHans: "，请确保未选择任何文本。" },
  "Drag over the words": { zhHant: "拖曳框選文字", zhHans: "拖动框选文本" },
  " you want LoudScript to capture.": { zhHant: "，選擇要讓 LoudScript 擷取的內容。", zhHans: "，选择要让 LoudScript 捕获的内容。" },
  " while built-in macOS OCR extracts the text and LoudScript begins playback.": { zhHant: "，macOS 內建 OCR 會辨識文字，LoudScript 隨即開始播放。", zhHans: "，macOS 内置 OCR 会识别文本，LoudScript 随即开始播放。" },
  "Screen capture requires macOS Screen Recording permission. LoudScript prompts for it when needed and links directly to the relevant System Settings page.": { zhHant: "螢幕擷取需要 macOS「螢幕錄影」權限。LoudScript 會在需要時提示你授權，並直接連結至相關的「系統設定」頁面。", zhHans: "截屏需要 macOS“录屏与系统录音”权限。LoudScript 会在需要时提示你授权，并直接链接到相关的“系统设置”页面。" },
  "When screenshot reading is useful": { zhHant: "何時適合使用截圖朗讀", zhHans: "何时适合使用截屏朗读" },
  "Text selection is the fastest route when an app exposes its content normally. Screenshot OCR covers the cases where it does not.": { zhHant: "如果 App 能正常提供內容，直接選取文字是最快的方法；無法選取時，則可使用截圖 OCR。", zhHans: "如果 App 能正常提供内容，直接选择文本是最快的方法；无法选择时，则可使用截屏 OCR。" },
  "Words embedded in screenshots, slides, diagrams, or scanned pages.": { zhHant: "截圖、投影片、圖表或掃描頁面中的文字。", zhHans: "截屏、幻灯片、图表或扫描页面中的文本。" },
  "Text inside video frames or remote-desktop sessions.": { zhHant: "影片畫面或遠端桌面工作階段中的文字。", zhHans: "视频画面或远程桌面会话中的文本。" },
  "PDF and ebook viewers that disable or limit selection.": { zhHant: "停用或限制文字選取的 PDF 與電子書閱讀器。", zhHans: "禁用或限制文本选择的 PDF 和电子书阅读器。" },
  "Labels, alerts, and custom interfaces that do not expose selectable text.": { zhHant: "無法選取文字的標籤、提示與自訂介面。", zhHans: "无法选择文本的标签、提醒和自定义界面。" },
  "How screenshot OCR handles your content": { zhHant: "截圖 OCR 如何處理你的內容", zhHans: "截屏 OCR 如何处理你的内容" },
  "LoudScript creates a temporary capture for the screen area you choose. The app deletes that temporary file after OCR finishes or fails. The extracted OCR text is not sent to product analytics.": { zhHant: "LoudScript 會為你選擇的螢幕區域建立暫時截圖。OCR 完成或失敗後，App 會刪除該暫存檔案。辨識出的 OCR 文字不會傳送至產品分析服務。", zhHans: "LoudScript 会为你选择的屏幕区域创建临时截屏。OCR 完成或失败后，App 会删除该临时文件。识别出的 OCR 文本不会发送至产品分析服务。" },
  "Get clearer OCR results": { zhHant: "取得更清晰的 OCR 結果", zhHans: "获得更清晰的 OCR 结果" },
  "Capture only the text you need instead of a full busy screen.": { zhHant: "只擷取所需文字，不要包含整個雜亂的螢幕。", zhHans: "只捕获所需文本，不要包含整个杂乱的屏幕。" },
  "Use a larger zoom level when characters are small.": { zhHant: "字元較小時，請提高縮放比例。", zhHans: "字符较小时，请提高缩放比例。" },
  "Avoid overlapping windows, cursors, and controls where possible.": { zhHant: "盡量避開重疊的視窗、游標與控制項。", zhHans: "尽量避开重叠的窗口、光标和控件。" },
  "Review names, numbers, and technical notation before relying on the spoken result.": { zhHant: "在採用朗讀結果前，請先檢查姓名、數字與技術符號。", zhHans: "在采用朗读结果前，请先检查姓名、数字和技术符号。" },
  "OCR accuracy depends on image clarity, contrast, language, and layout. LoudScript keeps the recognized text available so you can inspect or replay it from reading history.": { zhHant: "OCR 準確度取決於圖片清晰度、對比度、語言與版面配置。LoudScript 會保留辨識出的文字，方便你在朗讀記錄中檢查或重新播放。", zhHans: "OCR 准确度取决于图片清晰度、对比度、语言和版面。LoudScript 会保留识别出的文本，方便你在朗读历史中检查或重新播放。" },
  "Use the fastest reading path": { zhHant: "使用最快的朗讀方式", zhHans: "使用最快的朗读方式" },
  "If the words are selectable, skip capture and send them directly to LoudScript through the Services menu or global shortcut.": { zhHant: "如果文字可以選取，無須截圖；直接透過「服務」選單或全域快速鍵將文字傳送至 LoudScript。", zhHans: "如果文本可以选择，无需截屏；直接通过“服务”菜单或全局快捷键将文本发送至 LoudScript。" },
  "Read the selected-text guide": { zhHant: "閱讀選取文字指南", zhHans: "阅读所选文本指南" },
  "Listen to unselectable text": { zhHant: "聆聽無法選取的文字", zhHans: "聆听无法选择的文本" },
  "LoudScript is a free, notarized download for macOS 15.6 or later.": { zhHant: "LoudScript 可免費下載，已通過 Apple 公證，適用於 macOS 15.6 或以上版本。", zhHans: "LoudScript 可免费下载，已通过 Apple 公证，适用于 macOS 15.6 或更高版本。" }
};

const offline = {
  "Compare offline text-to-speech engines for Mac in LoudScript: Apple voices, Supertonic, Kokoro, PocketTTS, and Phonon, with hardware and download requirements.": { zhHant: "比較 LoudScript 的 Mac 離線文字轉語音引擎：Apple 語音、Supertonic、Kokoro、PocketTTS 與 Phonon，包括硬體與下載需求。", zhHans: "比较 LoudScript 的 Mac 离线文本转语音引擎：Apple 语音、Supertonic、Kokoro、PocketTTS 和 Phonon，包括硬件与下载要求。" },
  "Offline Text-to-Speech for Mac | LoudScript": { zhHant: "Mac 離線文字轉語音引擎比較｜LoudScript", zhHans: "Mac 离线文本转语音引擎比较｜LoudScript" },
  "Compare five on-device speech engines by Mac compatibility, language support, maturity, and download size.": { zhHant: "依 Mac 相容性、語言支援、成熟度與下載大小，比較五款裝置端語音引擎。", zhHans: "按 Mac 兼容性、语言支持、成熟度和下载大小，比较五款设备端语音引擎。" },
  "Choose between Apple, Supertonic, Kokoro, PocketTTS, and Phonon voices that run locally on your Mac.": { zhHant: "選擇可在 Mac 本機執行的 Apple、Supertonic、Kokoro、PocketTTS 與 Phonon 語音。", zhHans: "选择可在 Mac 本地运行的 Apple、Supertonic、Kokoro、PocketTTS 和 Phonon 语音。" },
  "Offline text-to-speech for Mac: compare LoudScript's local engines": { zhHant: "Mac 離線文字轉語音：比較 LoudScript 的本機引擎", zhHans: "Mac 离线文本转语音：比较 LoudScript 的本地引擎" },
  "A practical comparison of Apple, Supertonic, Kokoro, PocketTTS, and Phonon in LoudScript for Mac.": { zhHant: "實用比較 LoudScript Mac 版中的 Apple、Supertonic、Kokoro、PocketTTS 與 Phonon。", zhHans: "实用比较 LoudScript Mac 版中的 Apple、Supertonic、Kokoro、PocketTTS 和 Phonon。" },
  "Offline text-to-speech for Mac": { zhHant: "Mac 離線文字轉語音", zhHans: "Mac 离线文本转语音" },
  "Offline voices guide": { zhHant: "離線語音指南", zhHans: "离线语音指南" },
  "LoudScript offers five speech engines that synthesize text on your Mac. Compare compatibility, languages, model size, and maturity before choosing the voice technology that fits your workflow.": { zhHant: "LoudScript 提供五款可在 Mac 上合成文字的語音引擎。選擇適合工作流程的語音技術前，可先比較相容性、語言、模型大小與成熟度。", zhHans: "LoudScript 提供五款可在 Mac 上合成文本的语音引擎。选择适合工作流程的语音技术前，可先比较兼容性、语言、模型大小和成熟度。" },
  "Compare LoudScript's local speech engines": { zhHant: "比較 LoudScript 的本機語音引擎", zhHans: "比较 LoudScript 的本地语音引擎" },
  "Engine": { zhHant: "引擎", zhHans: "引擎" },
  "Mac support": { zhHant: "Mac 支援", zhHans: "Mac 支持" },
  "Language coverage": { zhHant: "語言支援", zhHans: "语言支持" },
  "Download": { zhHant: "下載大小", zhHans: "下载大小" },
  "Status": { zhHant: "狀態", zhHans: "状态" },
  "Apple System": { zhHant: "Apple 系統語音", zhHans: "Apple 系统语音" },
  "Intel and Apple silicon": { zhHant: "Intel 與 Apple 晶片", zhHans: "Intel 和 Apple 芯片" },
  "Apple silicon (macOS 15 or later)": { zhHant: "Apple 晶片（macOS 15 或以上版本）", zhHans: "Apple 芯片（macOS 15 或更高版本）" },
  "Uses voices installed in macOS": { zhHant: "使用 macOS 已安裝的語音", zhHans: "使用 macOS 已安装的语音" },
  "Built in": { zhHant: "內建", zhHans: "内置" },
  "Stable": { zhHant: "穩定版", zhHans: "稳定版" },
  "Multilingual selectable voice styles": { zhHant: "多語言，可選擇語音風格", zhHans: "多语言，可选择语音风格" },
  "About 400MB": { zhHant: "約 400 MB", zhHans: "约 400 MB" },
  "Apple silicon": { zhHant: "Apple 晶片", zhHans: "Apple 芯片" },
  "English and Mandarin": { zhHant: "英文與普通話", zhHans: "英语和普通话" },
  "About 320MB": { zhHant: "約 320 MB", zhHans: "约 320 MB" },
  "Beta": { zhHant: "測試版", zhHans: "测试版" },
  "English, German, Spanish, French, Italian, Portuguese": { zhHant: "英文、德文、西班牙文、法文、義大利文、葡萄牙文", zhHans: "英语、德语、西班牙语、法语、意大利语、葡萄牙语" },
  "About 1GB": { zhHant: "約 1 GB", zhHans: "约 1 GB" },
  "English, 25 US and UK voices": { zhHant: "英文，25 種美式與英式英文語音", zhHans: "英语，25 种美式和英式英语语音" },
  "About 175MB": { zhHant: "約 175 MB", zhHans: "约 175 MB" },
  "Download sizes are estimates and can change as model packages evolve. LoudScript shows compatibility and installation state inside the speech-model picker.": { zhHant: "下載大小為估計值，可能隨模型套件更新而變更。LoudScript 會在語音模型選擇器中顯示相容性與安裝狀態。", zhHans: "下载大小为估算值，可能随模型包更新而变化。LoudScript 会在语音模型选择器中显示兼容性和安装状态。" },
  "Which offline voice should you choose?": { zhHant: "該選擇哪款離線語音？", zhHans: "该选择哪款离线语音？" },
  "Start with Apple System for broad compatibility": { zhHant: "需要廣泛相容性，可先選 Apple 系統語音", zhHans: "需要广泛兼容性，可先选 Apple 系统语音" },
  "Apple voices are already part of macOS, require no separate model installation, and work on Intel and Apple silicon. Available languages depend on the voices installed under macOS Spoken Content settings.": { zhHant: "Apple 語音已內建於 macOS，不需要另外安裝模型，並可在 Intel 與 Apple 晶片 Mac 上運作。可用語言取決於 macOS「朗讀內容」設定中已安裝的語音。", zhHans: "Apple 语音已内置于 macOS，无需另外安装模型，并可在 Intel 和 Apple 芯片 Mac 上运行。可用语言取决于 macOS“朗读内容”设置中已安装的语音。" },
  "Choose Supertonic for a downloadable multilingual model": { zhHant: "需要可下載的多語言模型，可選 Supertonic", zhHans: "需要可下载的多语言模型，可选 Supertonic" },
  "Supertonic adds selectable voice styles, seeking support, and local multilingual synthesis. It is the downloadable model with support for both Intel and Apple silicon Macs.": { zhHant: "Supertonic 提供可選擇的語音風格、跳轉播放支援與本機多語言合成。它是同時支援 Intel 與 Apple 晶片 Mac 的可下載模型。", zhHans: "Supertonic 提供可选择的语音风格、跳转播放支持和本地多语言合成。它是同时支持 Intel 和 Apple 芯片 Mac 的可下载模型。" },
  "Set up Kokoro on your Mac without Python": { zhHant: "在 Mac 上設定 Kokoro，無需 Python（英文頁面）", zhHans: "在 Mac 上设置 Kokoro，无需 Python（英文页面）" },
  "Try Kokoro for compact English and Mandarin speech": { zhHant: "需要精簡的英文與普通話語音，可試用 Kokoro", zhHans: "需要小巧的英语和普通话语音，可试用 Kokoro" },
  "Kokoro is a beta option for Apple silicon. It provides English and Mandarin voice catalogs through a compact Core ML model.": { zhHant: "Kokoro 是適用於 Apple 晶片的測試版選項，透過精簡的 Core ML 模型提供英文與普通話語音目錄。", zhHans: "Kokoro 是适用于 Apple 芯片的测试版选项，通过小巧的 Core ML 模型提供英语和普通话语音目录。" },
  "Try PocketTTS for six-language expressive speech": { zhHant: "需要六種語言的自然表現力，可試用 PocketTTS", zhHans: "需要六种语言的自然表现力，可试用 PocketTTS" },
  "PocketTTS is a larger model for Apple silicon with voices across English, German, Spanish, French, Italian, and Portuguese.": { zhHant: "PocketTTS 是適用於 Apple 晶片的較大型模型，提供英文、德文、西班牙文、法文、義大利文與葡萄牙文語音。", zhHans: "PocketTTS 是适用于 Apple 芯片的较大模型，提供英语、德语、西班牙语、法语、意大利语和葡萄牙语语音。" },
  "Try Phonon for compact English speech": { zhHant: "需要精簡的英文語音，可試用 Phonon", zhHans: "需要小巧的英语语音，可试用 Phonon" },
  "Phonon is a compact beta model for English. It reads numbers, prices, links, and abbreviations naturally and offers 25 US and UK voices.": { zhHant: "Phonon 是精簡的英文測試版模型，能自然朗讀數字、價格、連結與縮寫，並提供 25 種美式與英式英文語音。", zhHans: "Phonon 是小巧的英语测试版模型，能自然朗读数字、价格、链接和缩写，并提供 25 种美式和英式英语语音。" },
  "What “offline” means in LoudScript": { zhHant: "LoudScript 中的「離線」代表什麼", zhHans: "LoudScript 中的“离线”代表什么" },
  "Speech synthesis runs locally after any optional model files have been downloaded. Your raw speech text is not sent to product analytics. Model installation and app updates still require a network connection.": { zhHant: "下載所需的選用模型檔案後，語音合成會在本機執行。你的原始朗讀文字不會傳送至產品分析服務。安裝模型與更新 App 仍需要網路連線。", zhHans: "下载所需的可选模型文件后，语音合成会在本地运行。你的原始朗读文本不会发送至产品分析服务。安装模型和更新 App 仍需要网络连接。" },
  "Optional AI formatting is a separate feature. When enabled, it can send the text being formatted to a third-party provider before local speech begins. Leave AI formatting disabled when you want the complete text-processing path to remain on your Mac. The privacy policy documents these boundaries.": { zhHant: "選用的 AI 格式化功能是獨立功能。啟用後，它可能會在本機語音開始前，將待格式化的文字傳送至第三方供應商。如果你希望完整的文字處理流程都留在 Mac 上，請停用 AI 格式化。隱私權政策記錄了這些界線。", zhHans: "可选的 AI 格式化功能是独立功能。启用后，它可能会在本地语音开始前，将待格式化的文本发送至第三方提供商。如果你希望完整的文本处理流程都留在 Mac 上，请禁用 AI 格式化。隐私政策记录了这些边界。" },
  "Use local voices across Mac apps": { zhHant: "在各種 Mac App 中使用本機語音", zhHans: "在各种 Mac App 中使用本地语音" },
  "Your selected speech engine works with manually entered text, selected text from other apps, screenshot OCR, reading history, and the floating playback overlay.": { zhHant: "你選擇的語音引擎可用於手動輸入的文字、其他 App 中選取的文字、截圖 OCR、朗讀記錄與浮動播放控制項。", zhHans: "你选择的语音引擎可用于手动输入的文本、其他 App 中所选文本、截屏 OCR、朗读历史和浮动播放控件。" },
  "With Apple voices or a downloaded Supertonic model, you can also export speech as a WAV audio file.": { zhHant: "使用 Apple 語音或已下載的 Supertonic 模型時，你也可以將語音匯出為 WAV 音訊檔。", zhHans: "使用 Apple 语音或已下载的 Supertonic 模型时，你还可以将语音导出为 WAV 音频文件。" },
  "Read selected text aloud": { zhHant: "朗讀選取的文字", zhHans: "朗读所选文本" },
  "Read screenshots with OCR": { zhHant: "使用 OCR 朗讀截圖", zhHans: "使用 OCR 朗读截屏" },
  "Choose a voice on your Mac": { zhHant: "在 Mac 上選擇語音", zhHans: "在 Mac 上选择语音" },
  "LoudScript is free and requires macOS 15.6 or later. Downloadable models are optional and can be removed from the app.": { zhHant: "LoudScript 免費使用，需要 macOS 15.6 或以上版本。可下載模型均為選用，並可從 App 中移除。", zhHans: "LoudScript 免费使用，需要 macOS 15.6 或更高版本。可下载模型均为可选，并可从 App 中移除。" }
};

const chooser = {
  "Compare 8 Mac text-to-speech apps, including Read &amp; Speak, LoudScript, Speechify, NaturalReader and ElevenReader, by price, offline use, PDFs and OCR.": { zhHant: "比較 8 款 Mac 文字轉語音 App，包括「閱讀與朗讀」、LoudScript、Speechify 與 ElevenReader 的價格、離線、PDF 與 OCR。", zhHans: "对比 8 款 Mac 文本转语音 App，包括“阅读与朗读”、LoudScript、Speechify 和 ElevenReader 的价格、离线、PDF 和 OCR。" },
  "Best Text-to-Speech App for Mac: 8 Apps Compared": { zhHant: "Mac 文字轉語音 App 推薦：8 款比較", zhHans: "Mac 文本转语音 App 推荐：8 款对比" },
  "A disclosed, dated comparison of eight Mac text-to-speech apps by price, offline use, selected text, PDFs, OCR and audio export.": { zhHant: "依價格、離線使用、選取文字、PDF、OCR 與音訊輸出，公開利益關係並註明日期，比較八款 Mac 文字轉語音 App。", zhHans: "按价格、离线使用、所选文本、PDF、OCR 和音频导出，公开利益关系并注明日期，对比八款 Mac 文本转语音 App。" },
  "Compare eight Mac text-to-speech apps and choose by workflow.": { zhHant: "比較八款 Mac 文字轉語音 App，依工作流程挑選。", zhHans: "对比八款 Mac 文本转语音 App，按工作流程选择。" },
  "Best text-to-speech app for Mac: 8 apps compared": { zhHant: "Mac 文字轉語音 App 推薦：8 款比較", zhHans: "Mac 文本转语音 App 推荐：8 款对比" },
  "A disclosed comparison of macOS Read & Speak, LoudScript, Speechify, NaturalReader, ElevenReader, Voice Dream Reader, Aloud and Sandbook by price, offline use, selected text, PDFs, OCR and audio export.": { zhHant: "公開利益關係的比較：依價格、離線使用、選取文字、PDF、OCR 與音訊輸出，比較 macOS「閱讀與朗讀」、LoudScript、Speechify、NaturalReader、ElevenReader、Voice Dream Reader、Aloud 與 Sandbook。", zhHans: "公开利益关系的对比：按价格、离线使用、所选文本、PDF、OCR 和音频导出，对比 macOS“阅读与朗读”、LoudScript、Speechify、NaturalReader、ElevenReader、Voice Dream Reader、Aloud 和 Sandbook。" },
  "Choose a Mac text-to-speech app": { zhHant: "挑選 Mac 文字轉語音 App", zhHans: "选择 Mac 文本转语音 App" },
  "\"Mac text-to-speech\"": { zhHant: "\"Mac 文字轉語音\"", zhHans: "\"Mac 文本转语音\"" },
  "\"Read & Speak\"": { zhHant: "\"閱讀與朗讀\"", zhHans: "\"阅读与朗读\"" },
  " / App chooser": { zhHant: " / App 挑選指南", zhHans: " / App 选择指南" },
  "What is the best text-to-speech app for Mac?": { zhHant: "Mac 上最好的文字轉語音 App 是哪一款？", zhHans: "Mac 上最好的文本转语音 App 是哪一款？" },
  "It depends on what you read. Start with macOS Read &amp; Speak for a built-in shortcut. Choose a native app such as LoudScript, Aloud or Sandbook for offline voices and PDFs. Choose Speechify, NaturalReader or ElevenReader when you want a library that follows you to your phone.": { zhHant: "取決於你要讀什麼。若只想用內建快速鍵，先從 macOS「閱讀與朗讀」開始。若需要離線語音與 PDF，選擇 LoudScript、Aloud 或 Sandbook 等原生 App。若想讓資料庫跟著你到手機上，選擇 Speechify、NaturalReader 或 ElevenReader。", zhHans: "取决于你要读什么。如果只想用内置快捷键，先从 macOS“阅读与朗读”开始。如果需要离线语音和 PDF，选择 LoudScript、Aloud 或 Sandbook 等原生 App。如果想让资料库跟着你到手机上，选择 Speechify、NaturalReader 或 ElevenReader。" },
  "Disclosure": { zhHant: "利益揭露", zhHans: "利益披露" },
  "LoudScript publishes this guide, and LoudScript’s developer wrote it. It is not an independent ranking. Every competitor fact below comes from the vendor’s own website, help center or App Store listing, checked on November 14, 2026. The sources are listed at the end. Where a vendor page does not state a fact, the table says “Not verified”.": { zhHant: "本指南由 LoudScript 發布，並由 LoudScript 的開發者撰寫，不是獨立排名。以下所有競品資訊都來自各廠商自己的網站、說明中心或 App Store 頁面，並於 2026 年 11 月 14 日查證。來源列於文末。若廠商頁面未說明某項資訊，表格會標示「未經查證」。", zhHans: "本指南由 LoudScript 发布，并由 LoudScript 的开发者撰写，不是独立排名。以下所有竞品信息都来自各厂商自己的网站、帮助中心或 App Store 页面，并于 2026 年 11 月 14 日核实。来源列于文末。如果厂商页面没有说明某项信息，表格会标注“未核实”。" },
  "Which Mac text-to-speech app should you pick?": { zhHant: "該選哪一款 Mac 文字轉語音 App？", zhHans: "该选哪一款 Mac 文本转语音 App？" },
  "No install:": { zhHant: "無需安裝：", zhHans: "无需安装：" },
  " macOS Read &amp; Speak speaks selected text with Option-Esc.": { zhHant: "macOS「閱讀與朗讀」可用 Option-Esc 朗讀選取的文字。", zhHans: "macOS“阅读与朗读”可用 Option-Esc 朗读所选文本。" },
  "Free native app for selected text, screenshots and PDFs:": { zhHant: "朗讀選取文字、截圖與 PDF 的免費原生 App：", zhHans: "朗读所选文本、截屏和 PDF 的免费原生 App：" },
  "</strong> LoudScript.</li>": { zhHant: "</strong>LoudScript。</li>", zhHans: "</strong>LoudScript。</li>" },
  "Free native app for EPUB books on Apple silicon:": { zhHant: "在 Apple 晶片 Mac 上閱讀 EPUB 書籍的免費原生 App：", zhHans: "在 Apple 芯片 Mac 上阅读 EPUB 图书的免费原生 App：" },
  "</strong> Sandbook.</li>": { zhHant: "</strong>Sandbook。</li>", zhHans: "</strong>Sandbook。</li>" },
  "One-time purchase with M4A export:": { zhHant: "一次購買並可輸出 M4A：", zhHans: "一次性购买并可导出 M4A：" },
  " Aloud, $19 per Mac.": { zhHant: "Aloud，每台 Mac 19 美元。", zhHans: "Aloud，每台 Mac 19 美元。" },
  "EPUB and PDF library with offline voices:": { zhHant: "含離線語音的 EPUB 與 PDF 資料庫：", zhHans: "带离线语音的 EPUB 和 PDF 资料库：" },
  " Voice Dream Reader, by subscription.": { zhHant: "Voice Dream Reader，需訂閱。", zhHans: "Voice Dream Reader，需订阅。" },
  "A library that syncs with iPhone and Android:": { zhHant: "可與 iPhone 和 Android 同步的資料庫：", zhHans: "可与 iPhone 和 Android 同步的资料库：" },
  " Speechify, NaturalReader or ElevenReader.": { zhHant: "Speechify、NaturalReader 或 ElevenReader。", zhHans: "Speechify、NaturalReader 或 ElevenReader。" },
  "How do Mac text-to-speech apps compare?": { zhHant: "Mac 文字轉語音 App 如何比較？", zhHans: "Mac 文本转语音 App 如何对比？" },
  "Prices are in US dollars as listed by each vendor. “Selected text” means reading a selection in another Mac app without pasting it first.": { zhHant: "價格以各廠商標示的美元計。「選取文字」指在另一個 Mac App 中直接朗讀選取範圍，不必先貼上。", zhHans: "价格以各厂商标示的美元计。“所选文本”指在另一个 Mac App 中直接朗读所选内容，无需先粘贴。" },
  "<th scope=\"col\">App</th>": { zhHant: "<th scope=\"col\">App</th>", zhHans: "<th scope=\"col\">App</th>" },
  "Native Mac app": { zhHant: "原生 Mac App", zhHans: "原生 Mac App" },
  "Price and free tier": { zhHant: "價格與免費方案", zhHans: "价格与免费方案" },
  "Works offline": { zhHant: "可離線使用", zhHans: "可离线使用" },
  "Selected text from any app": { zhHant: "朗讀任何 App 的選取文字", zhHans: "朗读任意 App 中的所选文本" },
  "Audio export": { zhHant: "音訊輸出", zhHans: "音频导出" },
  "macOS Read &amp; Speak": { zhHant: "macOS「閱讀與朗讀」", zhHans: "macOS“阅读与朗读”" },
  "Built into macOS": { zhHant: "內建於 macOS", zhHans: "内置于 macOS" },
  "Included with macOS": { zhHant: "隨 macOS 提供", zhHans: "随 macOS 提供" },
  "Not verified. Voices download to the Mac.": { zhHant: "未經查證。語音會下載到 Mac。", zhHans: "未核实。语音会下载到 Mac。" },
  "Yes, Speak selection with Option-Esc": { zhHant: "是，使用 Option-Esc 執行「朗讀所選範圍」", zhHans: "是，用 Option-Esc 执行“朗读所选内容”" },
  "Speaks selected text": { zhHant: "朗讀選取的文字", zhHans: "朗读所选文本" },
  "Not part of Read &amp; Speak": { zhHant: "不屬於「閱讀與朗讀」", zhHans: "不属于“阅读与朗读”" },
  "<td>Not verified</td>": { zhHant: "<td>未經查證</td>", zhHans: "<td>未核实</td>" },
  "Yes, notarized DMG, macOS 15.6 or later": { zhHant: "是，經過公證的 DMG，macOS 15.6 或以上版本", zhHans: "是，经过公证的 DMG，macOS 15.6 或更高版本" },
  "<td>Free</td>": { zhHant: "<td>免費</td>", zhHans: "<td>免费</td>" },
  "Yes, Apple voices and downloaded models run on the Mac": { zhHant: "是，Apple 語音與下載的模型在 Mac 上執行", zhHans: "是，Apple 语音和下载的模型在 Mac 上运行" },
  "Yes, Services menu and Option-Command-R": { zhHant: "是，「服務」選單與 Option-Command-R", zhHans: "是，“服务”菜单和 Option-Command-R" },
  "Imports up to 50 pages with synchronized highlighting": { zhHant: "可匯入最多 50 頁，並同步反白", zhHans: "可导入最多 50 页，并同步高亮标记" },
  "Yes, on-device": { zhHant: "是，在裝置上處理", zhHans: "是，在设备上处理" },
  "WAV with Apple and Supertonic voices": { zhHant: "使用 Apple 與 Supertonic 語音輸出 WAV", zhHans: "使用 Apple 和 Supertonic 语音导出 WAV" },
  "Yes, DMG download": { zhHant: "是，下載 DMG", zhHans: "是，下载 DMG" },
  "Free plan with 10 voices up to 1.5x. Premium $29 a month or $139 a year.": { zhHant: "免費方案含 10 種語音，最高 1.5 倍速。Premium 每月 29 美元或每年 139 美元。", zhHans: "免费方案含 10 种语音，最高 1.5 倍速。Premium 每月 29 美元或每年 139 美元。" },
  "Premium can download audio for offline listening. Mac app not stated.": { zhHant: "Premium 可下載音訊供離線聆聽。未說明 Mac App 是否支援。", zhHans: "Premium 可下载音频供离线收听。未说明 Mac App 是否支持。" },
  "Yes, Option-A": { zhHant: "是，Option-A", zhHans: "是，Option-A" },
  "Reads selected text in PDFs. Files go to the Web Library.": { zhHant: "朗讀 PDF 中選取的文字。檔案會存到 Web Library。", zhHans: "朗读 PDF 中的所选文本。文件会存到 Web Library。" },
  "Yes, screenshot to listen": { zhHant: "是，截圖即可聆聽", zhHans: "是，截屏即可收听" },
  "Not verified on Mac": { zhHant: "未在 Mac 上查證", zhHans: "未在 Mac 上核实" },
  "Web, iOS, Android and Chrome. A separate desktop app for Mac OS X 10.11 or later is sold once from $99.50.": { zhHant: "網頁、iOS、Android 與 Chrome。另有支援 Mac OS X 10.11 或以上版本的獨立桌面 App，一次購買 99.50 美元起。", zhHans: "网页、iOS、Android 和 Chrome。另有支持 Mac OS X 10.11 或更高版本的独立桌面 App，一次性购买 99.50 美元起。" },
  "Free plan with free voices. Paid online plans from $13.90 a month or $79 a year.": { zhHant: "免費方案提供免費語音。付費線上方案每月 13.90 美元或每年 79 美元起。", zhHans: "免费方案提供免费语音。付费在线方案每月 13.90 美元或每年 79 美元起。" },
  "Mobile offline mode. MP3 downloads on paid plans.": { zhHant: "行動版有離線模式。付費方案可下載 MP3。", zhHans: "移动版有离线模式。付费方案可下载 MP3。" },
  "Desktop app’s Miniboard reads text in other apps": { zhHant: "桌面 App 的 Miniboard 可朗讀其他 App 中的文字", zhHans: "桌面 App 的 Miniboard 可朗读其他 App 中的文本" },
  "<td>Yes</td>": { zhHant: "<td>是</td>", zhHans: "<td>是</td>" },
  "OCR on paid plans": { zhHant: "付費方案提供 OCR", zhHans: "付费方案提供 OCR" },
  "MP3 on paid plans": { zhHant: "付費方案提供 MP3", zhHans: "付费方案提供 MP3" },
  "No. Web app at elevenreader.io and an iPhone and iPad app.": { zhHant: "否。提供 elevenreader.io 網頁 App，以及 iPhone 與 iPad App。", zhHans: "否。提供 elevenreader.io 网页 App，以及 iPhone 和 iPad App。" },
  "Free with 10 hours a month. Ultra $11 a month or $99 a year.": { zhHant: "免費方案每月 10 小時。Ultra 每月 11 美元或每年 99 美元。", zhHans: "免费方案每月 10 小时。Ultra 每月 11 美元或每年 99 美元。" },
  "Ultra downloads for offline listening": { zhHant: "Ultra 可下載供離線聆聽", zhHans: "Ultra 可下载供离线收听" },
  "Yes, plus EPUB and DOCX": { zhHant: "是，也支援 EPUB 與 DOCX", zhHans: "是，也支持 EPUB 和 DOCX" },
  "Scans text from images": { zhHant: "可掃描圖片中的文字", zhHans: "可扫描图片中的文本" },
  "Not in ElevenReader": { zhHant: "ElevenReader 未提供", zhHans: "ElevenReader 不提供" },
  "Yes, Mac App Store, macOS 11 or later": { zhHant: "是，Mac App Store，macOS 11 或以上版本", zhHans: "是，Mac App Store，macOS 11 或更高版本" },
  "Subscription required after a 7-day trial. $9.99 to $14.99 a month or $49.99 to $79.99 a year.": { zhHant: "7 天試用後需要訂閱。每月 9.99 至 14.99 美元，或每年 49.99 至 79.99 美元。", zhHans: "7 天试用后需要订阅。每月 9.99 至 14.99 美元，或每年 49.99 至 79.99 美元。" },
  "Yes, all voices are offline": { zhHant: "是，所有語音皆可離線使用", zhHans: "是，所有语音都可离线使用" },
  "Yes, plus DRM-free EPUB": { zhHant: "是，也支援無 DRM 的 EPUB", zhHans: "是，也支持无 DRM 的 EPUB" },
  "Text recognition for scanned PDFs": { zhHant: "可辨識掃描 PDF 中的文字", zhHans: "可识别扫描 PDF 中的文本" },
  "Yes, saves speech to audio files": { zhHant: "是，可將語音存成音訊檔", zhHans: "是，可将语音存为音频文件" },
  "Yes, menu bar app, macOS 14 or later": { zhHant: "是，選單列 App，macOS 14 或以上版本", zhHans: "是，菜单栏 App，macOS 14 或更高版本" },
  "$19 one time per Mac. No free tier listed.": { zhHant: "每台 Mac 一次購買 19 美元。未列出免費方案。", zhHans: "每台 Mac 一次性购买 19 美元。未列出免费方案。" },
  "Yes, with Apple and Kokoro voices": { zhHant: "是，使用 Apple 與 Kokoro 語音", zhHans: "是，使用 Apple 和 Kokoro 语音" },
  "Yes, Control-Option-S and a Services item": { zhHant: "是，Control-Option-S 與「服務」項目", zhHans: "是，Control-Option-S 和“服务”项目" },
  "Yes, App Store, Apple silicon and macOS 15.2 or later": { zhHant: "是，App Store，需 Apple 晶片與 macOS 15.2 或以上版本", zhHans: "是，App Store，需 Apple 芯片和 macOS 15.2 或更高版本" },
  "Free, no in-app purchases or limits": { zhHant: "免費，沒有 App 內購買或使用限制", zhHans: "免费，没有 App 内购买或使用限制" },
  "Yes, voices run on the device": { zhHant: "是，語音在裝置上執行", zhHans: "是，语音在设备上运行" },
  "Paste or share. Services for images only.": { zhHant: "需貼上或分享。「服務」僅支援圖片。", zhHans: "需粘贴或共享。“服务”仅支持图片。" },
  "Yes, plus EPUB": { zhHant: "是，也支援 EPUB", zhHans: "是，也支持 EPUB" },
  "Reads text from screenshots and photos": { zhHant: "朗讀截圖與照片中的文字", zhHans: "朗读截屏和照片中的文本" },
  "M4A by chapter or book": { zhHant: "依章節或整本書輸出 M4A", zhHans: "按章节或整本书导出 M4A" },
  "What should you compare?": { zhHant: "應該比較哪些項目？", zhHans: "应该对比哪些方面？" },
  "Input:": { zhHant: "輸入：", zhHans: "输入：" },
  " selected text, pasted text, screenshots, PDFs or ebooks.": { zhHant: "選取文字、貼上的文字、截圖、PDF 或電子書。", zhHans: "所选文本、粘贴的文本、截屏、PDF 或电子书。" },
  "Reading experience:": { zhHant: "閱讀體驗：", zhHans: "阅读体验：" },
  " highlighting, controls, window behavior and history.": { zhHant: "反白、控制項、視窗行為與歷史紀錄。", zhHans: "高亮标记、控件、窗口行为和历史记录。" },
  "Privacy:": { zhHant: "隱私權：", zhHans: "隐私：" },
  " what stays on the Mac and what goes to a server.": { zhHant: "哪些資料留在 Mac 上，哪些會傳送到伺服器。", zhHans: "哪些数据留在 Mac 上，哪些会发送到服务器。" },
  "Compatibility:": { zhHant: "相容性：", zhHans: "兼容性：" },
  " macOS version, Intel or Apple silicon, and languages.": { zhHant: "macOS 版本、Intel 或 Apple 晶片，以及支援語言。", zhHans: "macOS 版本、Intel 或 Apple 芯片，以及支持的语言。" },
  "Cost:": { zhHant: "費用：", zhHans: "费用：" },
  " free, one-time purchase or subscription.": { zhHant: "免費、一次購買或訂閱。", zhHans: "免费、一次性购买或订阅。" },
  "Output:": { zhHant: "輸出：", zhHans: "输出：" },
  " live listening or exported audio files.": { zhHant: "即時聆聽，或輸出音訊檔。", zhHans: "实时收听，或导出音频文件。" },
  "What is each app best at?": { zhHant: "每款 App 各擅長什麼？", zhHans: "每款 App 各擅长什么？" },
  "Apple’s built-in option lives in System Settings under Accessibility. In macOS Tahoe 26 Apple names the pane Read &amp; Speak. Turn on Speak selection, select text and press Option-Esc. The controller can open Accessibility Reader, which reads text in a customizable view. It needs no extra app.": { zhHant: "Apple 的內建選項位於「系統設定」的「輔助使用」中。在 macOS Tahoe 26 中，Apple 將這個面板命名為「閱讀與朗讀」。開啟「朗讀所選範圍」，選取文字後按下 Option-Esc。控制器可開啟「輔助使用閱讀器」，以可自訂的檢視方式朗讀文字。不需要額外的 App。", zhHans: "Apple 的内置选项位于“系统设置”的“辅助功能”中。在 macOS Tahoe 26 中，Apple 将这个面板命名为“阅读与朗读”。打开“朗读所选内容”，选择文本后按下 Option-Esc。控制器可打开辅助功能阅读器，以可自定义的视图朗读文本。无需额外的 App。" },
  "LoudScript is a free native Mac app. It reads selected text from any app, text in a screenshot, and imported PDF pages, with a floating player above other windows. Voices come from Apple, Supertonic, Kokoro, PocketTTS and Phonon, and all of them run on the Mac. It keeps a searchable reading history and exports WAV audio with Apple and Supertonic voices. It does not import EPUB books or web page links.": { zhHant: "LoudScript 是免費的原生 Mac App。它可朗讀任何 App 中選取的文字、截圖中的文字與匯入的 PDF 頁面，並以浮動播放器顯示在其他視窗上方。語音來自 Apple、Supertonic、Kokoro、PocketTTS 與 Phonon，全部在 Mac 上執行。它會保留可搜尋的朗讀歷史，並可使用 Apple 與 Supertonic 語音輸出 WAV 音訊。它無法匯入 EPUB 書籍或網頁連結。", zhHans: "LoudScript 是免费的原生 Mac App。它可朗读任意 App 中的所选文本、截屏中的文本和导入的 PDF 页面，并以浮动播放器显示在其他窗口上方。语音来自 Apple、Supertonic、Kokoro、PocketTTS 和 Phonon，全部在 Mac 上运行。它会保留可搜索的朗读历史记录，并可使用 Apple 和 Supertonic 语音导出 WAV 音频。它无法导入 EPUB 图书或网页链接。" },
  "Speechify has a Mac app that reads selected text in any app with Option-A and reads screenshots aloud. Saved content opens in the Web Library. The free plan has 10 voices up to 1.5x speed. Premium adds more voices and languages. Read the ": { zhHant: "Speechify 的 Mac App 可用 Option-A 朗讀任何 App 中選取的文字，也能朗讀截圖。儲存的內容會在 Web Library 中開啟。免費方案提供 10 種語音，最高 1.5 倍速。Premium 提供更多語音與語言。如需並列比較，請參閱", zhHans: "Speechify 的 Mac App 可用 Option-A 朗读任意 App 中的所选文本，也能朗读截屏。保存的内容会在 Web Library 中打开。免费方案提供 10 种语音，最高 1.5 倍速。Premium 提供更多语音和语言。如需并排对比，请参阅" },
  "Speechify alternative comparison": { zhHant: "Speechify 替代方案比較（英文頁面）", zhHans: "Speechify 替代方案对比（英文页面）" },
  " for a side-by-side view.": { zhHant: "。", zhHans: "。" },
  "NaturalReader’s current personal app runs in the browser, on iOS and Android, and as a Chrome extension. Its free plan includes unlimited listening with free voices. Paid plans add MP3 downloads and OCR. A separate desktop app for Mac, sold once from $99.50, includes a Miniboard that reads selected text in other apps.": { zhHant: "NaturalReader 目前的個人版 App 可在瀏覽器、iOS、Android 上使用，也提供 Chrome 延伸功能。免費方案可使用免費語音無限聆聽。付費方案加入 MP3 下載與 OCR。另有獨立的 Mac 桌面 App，一次購買 99.50 美元起，內含可朗讀其他 App 中選取文字的 Miniboard。", zhHans: "NaturalReader 当前的个人版 App 可在浏览器、iOS、Android 上使用，也提供 Chrome 扩展。免费方案可使用免费语音无限收听。付费方案增加 MP3 下载和 OCR。另有独立的 Mac 桌面 App，一次性购买 99.50 美元起，内含可朗读其他 App 中所选文本的 Miniboard。" },
  "ElevenReader from ElevenLabs runs on the web, iPhone, iPad and Android. Its App Store listing covers iPhone and iPad only. It imports PDFs, EPUBs and articles and gives free accounts 10 hours of listening a month. Read ": { zhHant: "ElevenLabs 的 ElevenReader 可在網頁、iPhone、iPad 與 Android 上使用。它的 App Store 頁面僅涵蓋 iPhone 與 iPad。它可匯入 PDF、EPUB 與文章，免費帳號每月可聆聽 10 小時。想了解目前在 Mac 上能用哪些功能，請參閱", zhHans: "ElevenLabs 的 ElevenReader 可在网页、iPhone、iPad 和 Android 上使用。它的 App Store 页面仅涵盖 iPhone 和 iPad。它可导入 PDF、EPUB 和文章，免费账户每月可收听 10 小时。想了解目前在 Mac 上能用哪些功能，请参阅" },
  "ElevenReader on Mac": { zhHant: "在 Mac 上使用 ElevenReader（英文頁面）", zhHans: "在 Mac 上使用 ElevenReader（英文页面）" },
  " for what works on a Mac today.": { zhHant: "。", zhHans: "。" },
  "Voice Dream Reader has a Mac App Store app with offline voices, PDF and DRM-free EPUB support, and audio file export. The Mac app needs its own subscription, separate from the iOS app, after a 7-day trial.": { zhHant: "Voice Dream Reader 在 Mac App Store 提供 App，具備離線語音、支援 PDF 與無 DRM 的 EPUB，並可輸出音訊檔。Mac App 在 7 天試用後需要獨立訂閱，與 iOS App 分開。", zhHans: "Voice Dream Reader 在 Mac App Store 提供 App，具备离线语音、支持 PDF 和无 DRM 的 EPUB，并可导出音频文件。Mac App 在 7 天试用后需要单独订阅，与 iOS App 分开。" },
  "Aloud is a native menu bar app for macOS 14 or later. It reads selected text, PDFs and screenshots, runs Apple and Kokoro voices on the Mac, and exports M4A. It costs $19 once per Mac.": { zhHant: "Aloud 是適用於 macOS 14 或以上版本的原生選單列 App。它可朗讀選取的文字、PDF 與截圖，在 Mac 上執行 Apple 與 Kokoro 語音，並輸出 M4A。每台 Mac 一次購買 19 美元。", zhHans: "Aloud 是适用于 macOS 14 或更高版本的原生菜单栏 App。它可朗读所选文本、PDF 和截屏，在 Mac 上运行 Apple 和 Kokoro 语音，并导出 M4A。每台 Mac 一次性购买 19 美元。" },
  "Sandbook is a free reader for iPhone, iPad and Mac with Kokoro voices built in. It reads EPUB, PDF and Word files and exports M4A audiobooks with chapter markers. On Mac it needs Apple silicon and macOS 15.2 or later.": { zhHant: "Sandbook 是適用於 iPhone、iPad 與 Mac 的免費閱讀器，內建 Kokoro 語音。它可朗讀 EPUB、PDF 與 Word 檔，並輸出含章節標記的 M4A 有聲書。在 Mac 上需要 Apple 晶片與 macOS 15.2 或以上版本。", zhHans: "Sandbook 是适用于 iPhone、iPad 和 Mac 的免费阅读器，内置 Kokoro 语音。它可朗读 EPUB、PDF 和 Word 文件，并导出带章节标记的 M4A 有声书。在 Mac 上需要 Apple 芯片和 macOS 15.2 或更高版本。" },
  "When is LoudScript the right choice?": { zhHant: "什麼情況適合選擇 LoudScript？", zhHans: "什么情况适合选择 LoudScript？" },
  "You move between selected text, screenshots, pasted text and PDF pages.": { zhHant: "你會在選取文字、截圖、貼上的文字與 PDF 頁面之間切換。", zhHans: "你会在所选文本、截屏、粘贴的文本和 PDF 页面之间切换。" },
  "You want the current sentence highlighted in the original PDF.": { zhHant: "你希望在原始 PDF 中反白目前朗讀的句子。", zhHans: "你希望在原始 PDF 中高亮标记当前朗读的句子。" },
  "You want a floating player while you work in another window.": { zhHant: "你想在其他視窗工作時使用浮動播放器。", zhHans: "你想在其他窗口工作时使用浮动播放器。" },
  "You want reading history and several local voice models.": { zhHant: "你需要朗讀歷史與多種本機語音模型。", zhHans: "你需要朗读历史记录和多种本地语音模型。" },
  "You want a free app that also runs on Intel Macs. Kokoro and PocketTTS need Apple silicon.": { zhHant: "你想要也能在 Intel Mac 上執行的免費 App。Kokoro 與 PocketTTS 需要 Apple 晶片。", zhHans: "你想要也能在 Intel Mac 上运行的免费 App。Kokoro 和 PocketTTS 需要 Apple 芯片。" },
  "When should you choose something else?": { zhHant: "什麼情況該選擇其他 App？", zhHans: "什么情况该选择其他 App？" },
  "You only need an occasional shortcut. macOS Read &amp; Speak may be enough.": { zhHant: "你只是偶爾需要快速鍵。macOS「閱讀與朗讀」可能就夠用。", zhHans: "你只是偶尔需要快捷键。macOS“阅读与朗读”可能就够用。" },
  "You read EPUB books. Sandbook and Voice Dream Reader import EPUB. LoudScript does not.": { zhHant: "你要讀 EPUB 書籍。Sandbook 與 Voice Dream Reader 可匯入 EPUB，LoudScript 不行。", zhHans: "你要读 EPUB 图书。Sandbook 和 Voice Dream Reader 可导入 EPUB，LoudScript 不行。" },
  "You need MP3 or M4A files. NaturalReader exports MP3 on paid plans. Aloud and Sandbook export M4A. LoudScript exports WAV only.": { zhHant: "你需要 MP3 或 M4A 檔案。NaturalReader 的付費方案可輸出 MP3。Aloud 與 Sandbook 可輸出 M4A。LoudScript 只能輸出 WAV。", zhHans: "你需要 MP3 或 M4A 文件。NaturalReader 的付费方案可导出 MP3。Aloud 和 Sandbook 可导出 M4A。LoudScript 只能导出 WAV。" },
  "You want one library across Mac, iPhone and Android. Speechify, NaturalReader and ElevenReader sync across devices.": { zhHant: "你想在 Mac、iPhone 與 Android 之間使用同一個資料庫。Speechify、NaturalReader 與 ElevenReader 可跨裝置同步。", zhHans: "你想在 Mac、iPhone 和 Android 之间使用同一个资料库。Speechify、NaturalReader 和 ElevenReader 可跨设备同步。" },
  "You need studio narration or voice cloning.": { zhHant: "你需要錄音室等級的旁白或語音複製。", zhHans: "你需要录音棚级别的旁白或语音克隆。" },
  "Your Mac cannot run macOS 15.6 or later. Voice Dream Reader lists macOS 11 and Aloud lists macOS 14.": { zhHant: "你的 Mac 無法執行 macOS 15.6 或以上版本。Voice Dream Reader 標示 macOS 11，Aloud 標示 macOS 14。", zhHans: "你的 Mac 无法运行 macOS 15.6 或更高版本。Voice Dream Reader 标示 macOS 11，Aloud 标示 macOS 14。" },
  "You need the iPhone or iPad edition of LoudScript. Read the ": { zhHant: "你需要 iPhone 或 iPad 版 LoudScript。請參閱", zhHans: "你需要 iPhone 或 iPad 版 LoudScript。请参阅" },
  "platform comparison</a>.</li>": { zhHant: "平台比較（英文頁面）</a>。</li>", zhHans: "平台对比（英文页面）</a>。</li>" },
  "What stays on your Mac with LoudScript?": { zhHant: "使用 LoudScript 時，哪些資料留在你的 Mac 上？", zhHans: "使用 LoudScript 时，哪些数据留在你的 Mac 上？" },
  "Apple voices and LoudScript’s downloaded speech models synthesize on your Mac. Screenshot OCR uses Apple’s on-device Vision framework. LoudScript does not send raw speech text, OCR output or source-app identity to product analytics.": { zhHant: "Apple 語音與 LoudScript 下載的語音模型會在你的 Mac 上合成語音。截圖 OCR 使用 Apple 在裝置上執行的 Vision 框架。LoudScript 不會將朗讀文字、OCR 結果或來源 App 身分傳送至產品分析服務。", zhHans: "Apple 语音和 LoudScript 下载的语音模型会在你的 Mac 上合成语音。截屏 OCR 使用 Apple 在设备上运行的 Vision 框架。LoudScript 不会将朗读文本、OCR 结果或来源 App 身份发送到产品分析服务。" },
  "Optional AI formatting is the exception. It is off until you turn it on. When it is on, the text being formatted goes through LoudScript’s server to a third-party AI model provider. Read the ": { zhHant: "選用的 AI 格式化是例外。在你開啟前，它都維持關閉。開啟後，要格式化的文字會經由 LoudScript 的伺服器傳送至第三方 AI 模型供應商。啟用前，請先閱讀", zhHans: "可选的 AI 格式化是例外。在你打开之前，它始终处于关闭状态。打开后，要格式化的文本会经由 LoudScript 的服务器发送到第三方 AI 模型提供商。启用前，请先阅读" },
  " before you enable it.": { zhHant: "。", zhHans: "。" },
  "Try LoudScript on your Mac": { zhHant: "在你的 Mac 上試用 LoudScript", zhHans: "在你的 Mac 上试用 LoudScript" },
  "LoudScript is a free, signed and notarized download for macOS 15.6 or later. It supports Intel and Apple silicon Macs, although Kokoro and PocketTTS require Apple silicon, and Phonon has been tested only on Apple silicon.": { zhHant: "LoudScript 是免費、經過簽署與公證的下載項目，適用於 macOS 15.6 或以上版本。它支援 Intel 與 Apple 晶片 Mac，但 Kokoro 與 PocketTTS 需要 Apple 晶片，而 Phonon 只在 Apple 晶片上測試過。", zhHans: "LoudScript 是免费、经过签名和公证的下载项，适用于 macOS 15.6 或更高版本。它支持 Intel 和 Apple 芯片 Mac，但 Kokoro 和 PocketTTS 需要 Apple 芯片，而 Phonon 仅在 Apple 芯片上测试过。" },
  "See the workflows": { zhHant: "查看各種工作流程", zhHans: "查看各种工作流程" },
  "Read selected text": { zhHant: "朗讀選取的文字", zhHans: "朗读所选文本" },
  "Read PDFs aloud": { zhHant: "朗讀 PDF", zhHans: "朗读 PDF" },
  "Compare local voices": { zhHant: "比較本機語音", zhHans: "对比本地语音" },
  "Free Speechify alternative for Mac": { zhHant: "免費的 Mac 版 Speechify 替代方案（英文頁面）", zhHans: "免费的 Mac 版 Speechify 替代方案（英文页面）" },
  "Sources, checked November 2026": { zhHant: "來源（2026 年 11 月查證）", zhHans: "来源（2026 年 11 月核实）" },
  "Apple: Have your Mac speak text that’s on the screen": { zhHant: "Apple：讓 Mac 朗讀螢幕上的文字", zhHans: "Apple：让 Mac 朗读屏幕上的文本" },
  "Apple: Change Read &amp; Speak settings on Mac (macOS Tahoe 26)": { zhHant: "Apple：在 Mac 上更改「閱讀與朗讀」設定（macOS Tahoe 26）", zhHans: "Apple：在 Mac 上更改“阅读与朗读”设置（macOS Tahoe 26）" },
  "Apple: Change the voice your Mac uses to speak text": { zhHant: "Apple：更改 Mac 朗讀文字時使用的聲音", zhHans: "Apple：更改 Mac 朗读文本时使用的声音" },
  "Speechify pricing": { zhHant: "Speechify 價格", zhHans: "Speechify 价格" },
  "Speechify Mac app": { zhHant: "Speechify Mac App", zhHans: "Speechify Mac App" },
  "Speechify: guide to the Mac app": { zhHant: "Speechify：Mac App 指南", zhHans: "Speechify：Mac App 指南" },
  "Speechify FAQ": { zhHant: "Speechify 常見問題", zhHans: "Speechify 常见问题" },
  "NaturalReader web app and plans": { zhHant: "NaturalReader 網頁 App 與方案", zhHans: "NaturalReader 网页 App 和方案" },
  "NaturalReader: plans and pricing, personal version": { zhHant: "NaturalReader：個人版方案與價格", zhHans: "NaturalReader：个人版方案和价格" },
  "NaturalReader desktop software": { zhHant: "NaturalReader 桌面軟體", zhHans: "NaturalReader 桌面软件" },
  "NaturalReader home": { zhHant: "NaturalReader 首頁", zhHans: "NaturalReader 首页" },
  "ElevenReader home and pricing": { zhHant: "ElevenReader 首頁與價格", zhHans: "ElevenReader 首页和价格" },
  "ElevenLabs: Is ElevenReader available for desktop or web?": { zhHant: "ElevenLabs：ElevenReader 是否提供桌面版或網頁版？", zhHans: "ElevenLabs：ElevenReader 是否提供桌面版或网页版？" },
  "ElevenReader on the App Store": { zhHant: "App Store 上的 ElevenReader", zhHans: "App Store 上的 ElevenReader" },
  "Voice Dream Reader on the Mac App Store": { zhHant: "Mac App Store 上的 Voice Dream Reader", zhHans: "Mac App Store 上的 Voice Dream Reader" },
  "Sandbook on the App Store": { zhHant: "App Store 上的 Sandbook", zhHans: "App Store 上的 Sandbook" },
  ">Mac vs iOS</a>": { zhHant: ">Mac 與 iOS</a>", zhHans: ">Mac 与 iOS</a>" },
  ">Download</a>": { zhHant: ">下載</a>", zhHans: ">下载</a>" }
};

const pdf = {
  "Learn how to read a PDF aloud on Mac with LoudScript. Import up to 50 pages, listen with local voices, and follow synchronized highlighting in the document.": { zhHant: "了解如何使用 LoudScript 在 Mac 上朗讀 PDF。一次可匯入最多 50 頁，以本機語音聆聽，並在原始文件中跟隨同步反白的句子。", zhHans: "了解如何使用 LoudScript 在 Mac 上朗读 PDF。一次可导入最多 50 页，用本地语音收听，并在原始文档中跟随同步高亮标记的句子。" },
  "How to Read a PDF Aloud on Mac | LoudScript": { zhHant: "如何在 Mac 上朗讀 PDF｜LoudScript", zhHans: "如何在 Mac 上朗读 PDF｜LoudScript" },
  "Import selected PDF pages, listen on your Mac, and follow the current sentence in the original document.": { zhHant: "匯入選取的 PDF 頁面，在 Mac 上聆聽，並在原始文件中跟隨目前朗讀的句子。", zhHans: "导入所选 PDF 页面，在 Mac 上收听，并在原始文档中跟随当前朗读的句子。" },
  "A step-by-step guide to PDF text-to-speech with synchronized highlighting.": { zhHant: "使用同步反白朗讀 PDF 的逐步指南。", zhHans: "使用同步高亮标记朗读 PDF 的分步指南。" },
  "How to read a PDF aloud on Mac": { zhHant: "如何在 Mac 上朗讀 PDF", zhHans: "如何在 Mac 上朗读 PDF" },
  "Import PDF pages into LoudScript and follow synchronized highlighting while listening.": { zhHant: "將 PDF 頁面匯入 LoudScript，聆聽時跟隨同步反白。", zhHans: "将 PDF 页面导入 LoudScript，收听时跟随同步高亮标记。" },
  "Open a PDF": { zhHant: "開啟 PDF", zhHans: "打开 PDF" },
  "Open LoudScript and choose the PDF you want to hear.": { zhHant: "開啟 LoudScript，選擇你想聆聽的 PDF。", zhHans: "打开 LoudScript，选择你想收听的 PDF。" },
  "Choose pages": { zhHant: "選擇頁面", zhHans: "选择页面" },
  "Select up to 50 consecutive pages to import.": { zhHant: "選擇最多 50 個連續頁面進行匯入。", zhHans: "选择最多 50 个连续页面进行导入。" },
  "Start playback": { zhHant: "開始播放", zhHans: "开始播放" },
  "Choose a voice and press Play to hear the extracted text.": { zhHant: "選擇語音並按下 Play，聆聽擷取的文字。", zhHans: "选择语音并按下 Play，收听提取的文本。" },
  "Follow the document": { zhHant: "跟隨文件", zhHans: "跟随文档" },
  "Use synchronized highlighting to follow the current sentence in the original PDF and extracted text.": { zhHant: "使用同步反白，在原始 PDF 與擷取的文字中跟隨目前朗讀的句子。", zhHans: "使用同步高亮标记，在原始 PDF 和提取的文本中跟随当前朗读的句子。" },
  "Read a PDF aloud on Mac": { zhHant: "在 Mac 上朗讀 PDF", zhHans: "在 Mac 上朗读 PDF" },
  " / PDF reading guide": { zhHant: " / PDF 朗讀指南", zhHans: " / PDF 朗读指南" },
  "Import the pages you need, listen with a local voice, and follow the current sentence in the original PDF and extracted text.": { zhHant: "匯入你需要的頁面，以本機語音聆聽，並在原始 PDF 與擷取的文字中跟隨目前朗讀的句子。", zhHans: "导入你需要的页面，用本地语音收听，并在原始 PDF 和提取的文本中跟随当前朗读的句子。" },
  "Read a PDF in four steps": { zhHant: "四個步驟朗讀 PDF", zhHans: "四个步骤朗读 PDF" },
  "Open the PDF": { zhHant: "開啟 PDF", zhHans: "打开 PDF" },
  " from LoudScript.": { zhHant: "：從 LoudScript 開啟。", zhHans: "：从 LoudScript 打开。" },
  "Choose a page range.": { zhHant: "選擇頁面範圍。", zhHans: "选择页面范围。" },
  " Each import can contain up to 50 consecutive pages.": { zhHant: "每次匯入最多可包含 50 個連續頁面。", zhHans: "每次导入最多可包含 50 个连续页面。" },
  "Select a voice and press Play.": { zhHant: "選擇語音並按下 Play。", zhHans: "选择语音并按下 Play。" },
  " Apple voices and downloaded speech models synthesize on your Mac.": { zhHant: "Apple 語音與下載的語音模型會在你的 Mac 上合成語音。", zhHans: "Apple 语音和下载的语音模型会在你的 Mac 上合成语音。" },
  "Follow the highlighting.": { zhHant: "跟隨反白。", zhHans: "跟随高亮标记。" },
  " LoudScript marks the current sentence in both the document and extracted-text views.": { zhHant: "LoudScript 會在文件檢視與擷取文字檢視中同時標示目前朗讀的句子。", zhHans: "LoudScript 会在文档视图和提取文本视图中同时标记当前朗读的句子。" },
  "What kind of PDFs work?": { zhHant: "哪些 PDF 可以使用？", zhHans: "哪些 PDF 可以使用？" },
  "LoudScript extracts text from the pages you choose. It can also recognize words on image-based pages with Apple’s on-device Vision text recognition, so scanned reading material is supported when the print is clear enough.": { zhHant: "LoudScript 會從你選擇的頁面擷取文字。對於以圖片構成的頁面，它也能透過 Apple 在裝置上執行的 Vision 文字辨識來辨識文字，因此只要印刷夠清晰，也支援掃描的閱讀資料。", zhHans: "LoudScript 会从你选择的页面提取文本。对于由图片构成的页面，它也能通过 Apple 在设备上运行的 Vision 文本识别来识别文字，因此只要印刷足够清晰，也支持扫描的阅读材料。" },
  "Recognition accuracy depends on scan quality, language, layout, and handwriting. Password-protected or damaged files may need to be unlocked or repaired first.": { zhHant: "辨識準確度取決於掃描品質、語言、版面與手寫內容。受密碼保護或損毀的檔案，可能需要先解鎖或修復。", zhHans: "识别准确度取决于扫描质量、语言、版面和手写内容。受密码保护或损坏的文件，可能需要先解锁或修复。" },
  "PDF privacy and processing": { zhHant: "PDF 隱私權與處理方式", zhHans: "PDF 隐私与处理方式" },
  "PDF text extraction, OCR, and speech synthesis use local macOS frameworks or speech models downloaded to your Mac. LoudScript does not send raw PDF text to product analytics.": { zhHant: "PDF 文字擷取、OCR 與語音合成皆使用本機 macOS 框架，或已下載到你 Mac 上的語音模型。LoudScript 不會將 PDF 原始文字傳送至產品分析服務。", zhHans: "PDF 文本提取、OCR 和语音合成都使用本地 macOS 框架，或已下载到你 Mac 上的语音模型。LoudScript 不会将 PDF 原始文本发送到产品分析服务。" },
  "Optional AI formatting is separate. If you enable it, the text being formatted goes through LoudScript's server to an AI model provider. See the ": { zhHant: "選用的 AI 格式化功能是獨立的。如果你啟用它，要格式化的文字會經由 LoudScript 的伺服器傳送至 AI 模型供應商。確切的界線請參閱", zhHans: "可选的 AI 格式化功能是独立的。如果你启用它，要格式化的文本会经由 LoudScript 的服务器发送到 AI 模型提供商。确切的边界请参阅" },
  " for the exact boundary.": { zhHant: "。", zhHans: "。" },
  "When LoudScript is a good PDF reader": { zhHant: "LoudScript 適合當 PDF 閱讀器的情況", zhHans: "LoudScript 适合用作 PDF 阅读器的情况" },
  "You want to keep the original page visible while listening.": { zhHant: "你想在聆聽時保持原始頁面可見。", zhHans: "你想在收听时保持原始页面可见。" },
  "You need a focused page range instead of importing a whole book.": { zhHant: "你只需要特定頁面範圍，而不是匯入整本書。", zhHans: "你只需要特定页面范围，而不是导入整本书。" },
  "You want local speech and reading history in a native Mac app.": { zhHant: "你想在原生 Mac App 中使用本機語音與朗讀歷史。", zhHans: "你想在原生 Mac App 中使用本地语音和朗读历史记录。" },
  "You need highlighting that follows playback across pages.": { zhHant: "你需要能跨頁跟隨播放的反白。", zhHans: "你需要能跨页跟随播放的高亮标记。" },
  "It is not an audiobook editor and does not currently position itself as a studio tool for exporting narrated audio files.": { zhHant: "它不是有聲書編輯器，目前也不定位為輸出旁白音訊檔的錄音室工具。", zhHans: "它不是有声书编辑器，目前也不定位为导出旁白音频文件的录音棚工具。" },
  "Try PDF text-to-speech on Mac": { zhHant: "在 Mac 上試用 PDF 文字轉語音", zhHans: "在 Mac 上试用 PDF 文本转语音" },
  "LoudScript is free for macOS 15.6 or later and supports Intel and Apple silicon Macs.": { zhHant: "LoudScript 免費提供，適用於 macOS 15.6 或以上版本，並支援 Intel 與 Apple 晶片 Mac。", zhHans: "LoudScript 免费提供，适用于 macOS 15.6 或更高版本，并支持 Intel 和 Apple 芯片 Mac。" },
  "Related Mac reading guides": { zhHant: "相關的 Mac 朗讀指南", zhHans: "相关的 Mac 朗读指南" },
  "Read on-screen text with OCR": { zhHant: "使用 OCR 朗讀螢幕上的文字", zhHans: "使用 OCR 朗读屏幕上的文本" },
  "Compare offline voices": { zhHant: "比較離線語音", zhHans: "对比离线语音" },
  "Choose a Mac TTS app": { zhHant: "挑選 Mac 文字轉語音 App", zhHans: "选择 Mac 文本转语音 App" },
  "Save text as an audio file": { zhHant: "將文字儲存為音訊檔（英文頁面）", zhHans: "将文本存储为音频文件（英文页面）" },
  "Use Kokoro without Python": { zhHant: "不用 Python 使用 Kokoro（英文頁面）", zhHans: "无需 Python 使用 Kokoro（英文页面）" }
};

const locales = [
  { id: "zh-Hant", key: "zhHant", prefix: "/zh-hant", ogLocale: "zh_TW", ogAlternates: ["en_US", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"], languageAria: "語言選擇" },
  { id: "zh-Hans", key: "zhHans", prefix: "/zh-hans", ogLocale: "zh_CN", ogAlternates: ["en_US", "zh_TW", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"], languageAria: "语言选择" },
  { id: "de", key: "de", prefix: "/de", ogLocale: "de_DE", ogAlternates: ["en_US", "zh_TW", "zh_CN", "es_ES", "fr_FR", "ja_JP", "nl_NL"], languageAria: "Sprachauswahl" },
  { id: "es", key: "es", prefix: "/es", ogLocale: "es_ES", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "fr_FR", "ja_JP", "nl_NL"], languageAria: "Selección de idioma" },
  { id: "fr", key: "fr", prefix: "/fr", ogLocale: "fr_FR", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "ja_JP", "nl_NL"], languageAria: "Sélection de la langue" },
  { id: "ja", key: "ja", prefix: "/ja", ogLocale: "ja_JP", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "nl_NL"], languageAria: "言語を選択" },
  { id: "nl", key: "nl", prefix: "/nl", ogLocale: "nl_NL", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP"], languageAria: "Taalkeuze" }
];

const translations = { ...common, ...selected, ...ocr, ...offline, ...chooser, ...pdf };
const sourceKeys = Object.keys(translations).sort();
const externalTranslations = { de: german, es: spanish, fr: french, ja: japanese, nl: dutch };
for (const [localeId, localized] of Object.entries(externalTranslations)) {
  const localizedKeys = Object.keys(localized).sort();
  if (JSON.stringify(localizedKeys) !== JSON.stringify(sourceKeys)) {
    const missing = sourceKeys.filter((key) => !Object.hasOwn(localized, key));
    const extra = localizedKeys.filter((key) => !Object.hasOwn(translations, key));
    throw new Error(`${localeId} guide translations differ from the English source keys. Missing: ${missing.join(" | ") || "none"}. Extra: ${extra.join(" | ") || "none"}.`);
  }
}

const englishOnlyLink = /href="\/(?:speechify-alternative-mac\/|elevenreader-mac\/|kokoro-tts-mac\/|text-to-audio-file-mac\/|loudscript-mac-vs-ios\/|support\.html|privacy\.html)"(?! hreflang=)/g;

function replaceAllLiteral(source, search, replacement) {
  return source.split(search).join(replacement);
}

function alternateLinks(route) {
  return [
    `<link rel="alternate" hreflang="en" href="https://loudscript.app/${route}/">`,
    `<link rel="alternate" hreflang="zh-Hant" href="https://loudscript.app/zh-hant/${route}/">`,
    `<link rel="alternate" hreflang="zh-Hans" href="https://loudscript.app/zh-hans/${route}/">`,
    `<link rel="alternate" hreflang="de" href="https://loudscript.app/de/${route}/">`,
    `<link rel="alternate" hreflang="es" href="https://loudscript.app/es/${route}/">`,
    `<link rel="alternate" hreflang="fr" href="https://loudscript.app/fr/${route}/">`,
    `<link rel="alternate" hreflang="ja" href="https://loudscript.app/ja/${route}/">`,
    `<link rel="alternate" hreflang="nl" href="https://loudscript.app/nl/${route}/">`,
    `<link rel="alternate" hreflang="x-default" href="https://loudscript.app/${route}/">`
  ].map((line) => `    ${line}`).join("\n");
}

function languageNavigation(route, current, ariaLabel) {
  const options = [
    { id: "en", href: `/${route}/`, lang: "en", label: "English" },
    { id: "zh-Hant", href: `/zh-hant/${route}/`, lang: "zh-Hant", label: "繁體中文" },
    { id: "zh-Hans", href: `/zh-hans/${route}/`, lang: "zh-Hans", label: "简体中文" },
    { id: "de", href: `/de/${route}/`, lang: "de", label: "Deutsch" },
    { id: "es", href: `/es/${route}/`, lang: "es", label: "Español" },
    { id: "fr", href: `/fr/${route}/`, lang: "fr", label: "Français" },
    { id: "ja", href: `/ja/${route}/`, lang: "ja", label: "日本語" },
    { id: "nl", href: `/nl/${route}/`, lang: "nl", label: "Nederlands" }
  ];
  const currentOption = options.find((option) => option.id === current);
  const links = options.map((option) => {
    const currentAttribute = option.id === current ? ' aria-current="page"' : "";
    return [
      `                    <a href="${option.href}" lang="${option.lang}" hreflang="${option.lang}"${currentAttribute}>`,
      `                        <span>${option.label}</span>`,
      '                        <svg class="mac-language-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg>',
      "                    </a>"
    ].join("\n");
  }).join("\n");
  return [
    "            <!-- GUIDE_LANGUAGE_NAV_START -->",
    `            <nav class="mac-language-menu" aria-label="${ariaLabel}">`,
    "                <details>",
    `                    <summary aria-label="${ariaLabel}: ${currentOption.label}">`,
    '                        <svg class="mac-language-globe" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M2.8 10h14.4M10 2.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5c-2-2.1-3-4.6-3-7.5s1-5.4 3-7.5Z"/></svg>',
    `                        <span>${currentOption.label}</span>`,
    '                        <svg class="mac-language-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
    "                    </summary>",
    '                    <div class="mac-language-options">',
    links,
    "                    </div>",
    "                </details>",
    "            </nav>",
    "            <!-- GUIDE_LANGUAGE_NAV_END -->"
  ].join("\n");
}

function enhanceEnglish(html, guide) {
  if (!html.includes('/js/language-menu.js')) {
    html = html.replace(
      '    <script defer data-domain="loudscript.app" src="https://plausible.io/js/script.outbound-links.js"></script>',
      '    <script defer data-domain="loudscript.app" src="https://plausible.io/js/script.outbound-links.js"></script>\n    <script defer src="/js/language-menu.js"></script>'
    );
  }
  const lastModified = guideLastModified[guide.route];
  const lastModifiedDisplay = new Date(`${lastModified}T00:00:00Z`)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  html = html
    .replace(/("dateModified":\s*)"\d{4}-\d{2}-\d{2}"/, `$1"${lastModified}"`)
    .replace(/Updated [A-Z][a-z]+ \d{1,2}, \d{4}/, `Updated ${lastModifiedDisplay}`);
  html = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  html = html.replace(
    `    <link rel="canonical" href="https://loudscript.app/${guide.route}/">`,
    `    <link rel="canonical" href="https://loudscript.app/${guide.route}/">\n${alternateLinks(guide.route)}`
  );
  html = html.replace(/\n\s*<meta property="og:locale:alternate" content="[^"]+">/g, "");
  html = html.replace(
    '    <meta property="og:locale" content="en_US">',
    '    <meta property="og:locale" content="en_US">\n    <meta property="og:locale:alternate" content="zh_TW">\n    <meta property="og:locale:alternate" content="zh_CN">\n    <meta property="og:locale:alternate" content="de_DE">\n    <meta property="og:locale:alternate" content="es_ES">\n    <meta property="og:locale:alternate" content="fr_FR">\n    <meta property="og:locale:alternate" content="ja_JP">\n    <meta property="og:locale:alternate" content="nl_NL">'
  );
  if (!/"inLanguage":\s*"en"/.test(html)) {
    html = html.replace(`          "@type": "${guide.schemaType}",`, `          "@type": "${guide.schemaType}",\n          "inLanguage": "en",`);
  }
  const nav = languageNavigation(guide.route, "en", "Language selection");
  if (/\s*<!-- GUIDE_LANGUAGE_NAV_START -->[\s\S]*?<!-- GUIDE_LANGUAGE_NAV_END -->/.test(html)) {
    html = html.replace(/\s*<!-- GUIDE_LANGUAGE_NAV_START -->[\s\S]*?<!-- GUIDE_LANGUAGE_NAV_END -->/, `\n${nav}`);
  } else {
    html = html.replace(/(<nav class="mac-nav-links"[\s\S]*?<\/nav>)/, `$1\n${nav}`);
  }
  return html;
}

function localize(base, guide, locale) {
  let html = base
    .replace('<html lang="en">', `<html lang="${locale.id}">`)
    .replace(/("inLanguage":\s*)"en"/, `$1"${locale.id}"`)
    .replace('    <meta property="og:locale" content="en_US">\n    <meta property="og:locale:alternate" content="zh_TW">\n    <meta property="og:locale:alternate" content="zh_CN">\n    <meta property="og:locale:alternate" content="de_DE">\n    <meta property="og:locale:alternate" content="es_ES">\n    <meta property="og:locale:alternate" content="fr_FR">\n    <meta property="og:locale:alternate" content="ja_JP">\n    <meta property="og:locale:alternate" content="nl_NL">', `    <meta property="og:locale" content="${locale.ogLocale}">\n${locale.ogAlternates.map((value) => `    <meta property="og:locale:alternate" content="${value}">`).join("\n")}`)
    .replace(/\s*<!-- GUIDE_LANGUAGE_NAV_START -->[\s\S]*?<!-- GUIDE_LANGUAGE_NAV_END -->/, `\n${languageNavigation(guide.route, locale.id, locale.languageAria)}`);

  for (const [source, targets] of Object.entries(translations).sort((a, b) => b[0].length - a[0].length)) {
    html = replaceAllLiteral(html, source, externalTranslations[locale.id]?.[source] ?? targets[locale.key]);
  }

  const canonical = `https://loudscript.app/${guide.route}/`;
  html = replaceAllLiteral(html, canonical, `https://loudscript.app${locale.prefix}/${guide.route}/`);
  html = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, "");
  html = html.replace(
    `    <link rel="canonical" href="https://loudscript.app${locale.prefix}/${guide.route}/">`,
    `    <link rel="canonical" href="https://loudscript.app${locale.prefix}/${guide.route}/">\n${alternateLinks(guide.route)}`
  );
  html = html
    .replaceAll('href="/"', `href="${locale.prefix}/"`)
    .replaceAll('href="/#guides"', `href="${locale.prefix}/#guides"`)
    .replaceAll('"item": "https://loudscript.app/"', `"item": "https://loudscript.app${locale.prefix}/"`);
  for (const related of guides) {
    html = html.replaceAll(`href="/${related.route}/"`, `href="${locale.prefix}/${related.route}/"`);
  }
  html = html.replace(englishOnlyLink, '$& hreflang="en"');
  if (locale.id === "ja") {
    html = html
      .replaceAll('<strong>Option-Command-R</strong>.</li>', '<strong>Option-Command-R</strong>を押します。</li>')
      .replaceAll('<a href="/privacy.html" hreflang="en">プライバシーポリシー</a>.</p>', '<a href="/privacy.html" hreflang="en">プライバシーポリシー</a>をご覧ください。</p>');
  }
  if (locale.id.startsWith("zh-") || locale.id === "ja") {
    html = html
      .replaceAll('</strong>.</li>', '</strong>。</li>')
      .replaceAll('</a>.</p>', '</a>。</p>');
  }
  html = html.replace(/\s*<!-- GUIDE_LANGUAGE_NAV_START -->[\s\S]*?<!-- GUIDE_LANGUAGE_NAV_END -->/, `\n${languageNavigation(guide.route, locale.id, locale.languageAria)}`);
  return html;
}

for (const guide of guides) {
  const sourcePath = path.join(siteRoot, guide.route, "index.html");
  const english = enhanceEnglish(await readFile(sourcePath, "utf8"), guide);
  await writeFile(sourcePath, english, "utf8");
  console.log(`Built ${guide.route}/index.html`);

  for (const locale of locales) {
    const outputPath = path.join(siteRoot, locale.prefix.slice(1), guide.route, "index.html");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, localize(english, guide, locale), "utf8");
    console.log(`Built ${path.relative(siteRoot, outputPath)}`);
  }
}
