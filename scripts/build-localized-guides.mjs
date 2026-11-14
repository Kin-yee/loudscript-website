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
  { route: "offline-text-to-speech-mac", schemaType: "TechArticle" }
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

const locales = [
  { id: "zh-Hant", key: "zhHant", prefix: "/zh-hant", ogLocale: "zh_TW", ogAlternates: ["en_US", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"], languageAria: "語言選擇" },
  { id: "zh-Hans", key: "zhHans", prefix: "/zh-hans", ogLocale: "zh_CN", ogAlternates: ["en_US", "zh_TW", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"], languageAria: "语言选择" },
  { id: "de", key: "de", prefix: "/de", ogLocale: "de_DE", ogAlternates: ["en_US", "zh_TW", "zh_CN", "es_ES", "fr_FR", "ja_JP", "nl_NL"], languageAria: "Sprachauswahl" },
  { id: "es", key: "es", prefix: "/es", ogLocale: "es_ES", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "fr_FR", "ja_JP", "nl_NL"], languageAria: "Selección de idioma" },
  { id: "fr", key: "fr", prefix: "/fr", ogLocale: "fr_FR", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "ja_JP", "nl_NL"], languageAria: "Sélection de la langue" },
  { id: "ja", key: "ja", prefix: "/ja", ogLocale: "ja_JP", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "nl_NL"], languageAria: "言語を選択" },
  { id: "nl", key: "nl", prefix: "/nl", ogLocale: "nl_NL", ogAlternates: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP"], languageAria: "Taalkeuze" }
];

const translations = { ...common, ...selected, ...ocr, ...offline };
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
    .replace(/"dateModified": "\d{4}-\d{2}-\d{2}"/, `"dateModified": "${lastModified}"`)
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
  if (!html.includes('"inLanguage": "en"')) {
    html = html.replace(`          "@type": "${guide.schemaType}",`, `          "@type": "${guide.schemaType}",\n          "inLanguage": "en",`);
  }
  const nav = languageNavigation(guide.route, "en", "Language selection");
  if (/\s*<!-- GUIDE_LANGUAGE_NAV_START -->[\s\S]*?<!-- GUIDE_LANGUAGE_NAV_END -->/.test(html)) {
    html = html.replace(/\s*<!-- GUIDE_LANGUAGE_NAV_START -->[\s\S]*?<!-- GUIDE_LANGUAGE_NAV_END -->/, `\n${nav}`);
  } else {
    html = html.replace(/(            <nav class="mac-nav-links"[\s\S]*?            <\/nav>)/, `$1\n${nav}`);
  }
  return html;
}

function localize(base, guide, locale) {
  let html = base
    .replace('<html lang="en">', `<html lang="${locale.id}">`)
    .replace('"inLanguage": "en"', `"inLanguage": "${locale.id}"`)
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
  html = html
    .replaceAll('href="/support.html"', 'href="/support.html" hreflang="en"')
    .replaceAll('href="/privacy.html"', 'href="/privacy.html" hreflang="en"');
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
