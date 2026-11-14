# Website localization

## State

The landing page and five SEO guides (selected text, screenshot OCR, offline voices, the app comparison, and PDF reading) support English, Traditional Chinese under `/zh-hant/`, Simplified Chinese under `/zh-hans/`, German under `/de/`, Spanish under `/es/`, French under `/fr/`, Japanese under `/ja/`, and Dutch under `/nl/`. Changelog, support, terms, and privacy pages remain English and are marked with `EN` on localized landing pages. The other guides also remain English. Localized guides mark links to them with `hreflang="en"` and name the language in the link text.

## Edit and build

1. Edit shared markup in `templates/landing.html`.
2. Edit source copy in `locales/en.json`.
3. Add the same keys to every translated locale file.
4. Edit Chinese guide translations in `scripts/build-localized-guides.mjs`, German guide translations in `locales/guides-de.json`, Spanish guide translations in `locales/guides-es.json`, French guide translations in `locales/guides-fr.json`, Japanese guide translations in `locales/guides-ja.json`, and Dutch guide translations in `locales/guides-nl.json` when guide source copy changes.
5. Run `npm run build` to generate deployable HTML.
6. Run `npm test` to validate translation parity, links, metadata, structured data, accessibility references, and sitemap coverage.

Generated files are committed because the site deploys as static files:

- `index.html`
- `zh-hant/index.html`
- `zh-hans/index.html`
- `de/index.html`
- `es/index.html`
- `fr/index.html`
- `ja/index.html`
- `nl/index.html`
- `read-selected-text-aloud-mac/index.html` and all seven localized variants
- `screenshot-ocr-text-to-speech-mac/index.html` and all seven localized variants
- `offline-text-to-speech-mac/index.html` and all seven localized variants
- `best-text-to-speech-app-for-mac/index.html` and all seven localized variants
- `read-pdf-aloud-mac/index.html` and all seven localized variants

## Traditional Chinese glossary

Use Apple Taiwan terminology consistently. Preserve literal product commands, such as `Read with LoudScript`, when the app does not provide a localized command name.

| English | Traditional Chinese |
| --- | --- |
| Selected Text | 選取文字 |
| Screen OCR | 截圖 OCR |
| PDF Reading | PDF 朗讀 |
| Reading History | 朗讀歷史 |
| Voice & Playback | 語音與播放 |
| Background Playback | 背景播放 |
| Local voices | 本機語音 |
| Apple silicon | Apple 晶片 |
| AI formatting | AI 格式化 |
| Privacy | 隱私權 |
| Email | 電子郵件 |
| Details | 詳細資訊 |

Product and engine names remain unchanged: LoudScript, macOS, Apple, Supertonic, Kokoro, and PocketTTS.

## German glossary

Use Apple Germany terminology consistently and address readers informally with `du`. Preserve literal product commands, such as `Read with LoudScript`, because the Mac app does not provide a localized command name.

| English | German |
| --- | --- |
| Selected Text | Ausgewählter Text |
| Screen OCR | Bildschirm-OCR |
| PDF Reading | PDF vorlesen |
| Reading History | Leseverlauf |
| Voice & Playback | Stimme & Wiedergabe |
| Background Playback | Wiedergabe im Hintergrund |
| Local voices | Lokale Stimmen |
| Apple silicon | Apple-Chip |
| AI formatting | KI-Formatierung |
| Accessibility | Bedienungshilfen |
| Screen Recording | Bildschirmaufnahme |
| System Settings | Systemeinstellungen |
| Spoken Content | Lesen & Sprechen |
| Text to Speech | Text-to-Speech / Text vorlesen |
| Highlight | Hervorheben |
| Privacy | Datenschutz |

## Simplified Chinese glossary

Use Apple China terminology consistently. Preserve literal product commands, such as `Read with LoudScript`, when the app does not provide a localized command name.

| English | Simplified Chinese |
| --- | --- |
| Selected Text | 所选文本 |
| Screen OCR | 截屏 OCR |
| PDF Reading | PDF 朗读 |
| Reading History | 朗读历史记录 |
| Voice & Playback | 语音与播放 |
| Background Playback | 后台播放 |
| Local voices | 本地语音 |
| Apple silicon | Apple 芯片 |
| Intel-based Mac | 基于 Intel 的 Mac |
| AI formatting | AI 格式化 |
| Accessibility | 辅助功能 |
| Screen Recording & System Audio | 录屏与系统录音 |
| Text to Speech | 文本转语音 |
| Highlight | 高亮标记 |
| Privacy | 隐私 |
| Email | 电子邮件 |
| Details | 详细信息 |

## Spanish glossary

Use Apple Spain terminology consistently and address readers informally with `tú`. Preserve literal product commands, such as `Read with LoudScript`, because the Mac app does not provide a localized command name.

| English | Spanish |
| --- | --- |
| Selected Text | Texto seleccionado |
| Screen OCR | OCR de capturas |
| PDF Reading | Lectura de PDF |
| Reading History | Historial de lectura |
| Voice & Playback | Voz y reproducción |
| Background Playback | Reproducción en segundo plano |
| Speech engine | Motor de voz |
| Local voices | Voces locales |
| Apple silicon | Chip de Apple |
| AI formatting | Formato con IA |
| Accessibility | Accesibilidad |
| Screen Recording & System Audio | Grabación de pantalla y del audio del sistema |
| System Settings | Ajustes del Sistema |
| Spoken Content | Lectura y voz |
| Text to Speech | Texto a voz |
| Privacy | Privacidad |

## French glossary

Use Apple France terminology consistently and address readers formally with `vous`. Preserve literal product commands, such as `Read with LoudScript`, because the Mac app does not provide a localized command name.

| English | French |
| --- | --- |
| Selected Text | Texte sélectionné |
| Screen OCR | OCR de capture d’écran |
| PDF Reading | Lecture de PDF |
| Reading History | Historique de lecture |
| Voice & Playback | Voix et lecture |
| Background Playback | Lecture en arrière-plan |
| Speech engine | Moteur vocal |
| Local voices | Voix locales |
| Apple silicon | Puce Apple |
| AI formatting | Mise en forme par IA |
| Accessibility | Accessibilité |
| Screen Recording & System Audio | Enregistrement de l’écran et des sons du système |
| System Settings | Réglages Système |
| Spoken Content | Lire et énoncer |
| Speak Selection | Énoncer la sélection |
| Text to Speech | Synthèse vocale |
| Privacy | Confidentialité |

## Japanese glossary

Use current Apple Japan terminology consistently and use polite, concise Japanese. Preserve literal product commands, such as `Read with LoudScript`, because the Mac app does not provide a localized command name.

| English | Japanese |
| --- | --- |
| Selected Text | 選択したテキスト |
| Screen OCR | 画面OCR / スクリーンショットOCR |
| PDF Reading | PDF読み上げ |
| Reading History | 読み上げ履歴 |
| Voice & Playback | 音声と再生 |
| Background Playback | バックグラウンド再生 |
| Speech engine | 音声エンジン |
| Local voices | ローカル音声 |
| Apple silicon | Appleシリコン |
| AI formatting | AI整形 |
| Accessibility | アクセシビリティ |
| Screen Recording & System Audio | 画面収録とシステムオーディオ録音 |
| System Settings | システム設定 |
| Spoken Content | リーダーと読み上げ |
| Speak Selection | 選択項目を読み上げる |
| System Voice | システムの声 |
| Text to Speech | テキスト読み上げ / 音声読み上げ |
| Privacy | プライバシー |

## Dutch glossary

Use current Apple Netherlands terminology consistently and address readers informally with `je`. Preserve literal product commands, such as `Read with LoudScript`, because the Mac app does not provide a localized command name.

| English | Dutch |
| --- | --- |
| Selected Text | Geselecteerde tekst |
| Screen OCR | Scherm-OCR / OCR van schermafbeeldingen |
| PDF Reading | Pdf’s voorlezen |
| Reading History | Leesgeschiedenis |
| Voice & Playback | Stem en afspelen |
| Background Playback | Afspelen op de achtergrond |
| Speech engine | Spraakengine |
| Local voices | Lokale stemmen |
| Apple silicon | Apple silicon |
| AI formatting | AI-opmaak |
| Accessibility | Toegankelijkheid |
| Screen Recording & System Audio | Scherm- en systeemaudio-opname |
| System Settings | Systeeminstellingen |
| Spoken Content | Lezen en spreken |
| Speak Selection | Spreek selectie uit |
| Text to Speech | Tekst-naar-spraak |
| Privacy | Privacy |

## Adding a locale

1. Copy `locales/en.json` to a correctly cased BCP 47 locale filename.
2. Translate every value without changing keys or product names.
3. Add locale metadata and the output path in `scripts/build-localized-landing.mjs`.
4. Add the locale to the language navigation and reciprocal `hreflang` links.
5. Add its canonical URL and alternates to `sitemap.xml`.
6. Add the locale specification to `scripts/validate-localized-site.mjs`.
7. Build, validate, review at desktop/mobile widths, and obtain native-speaker approval before deployment.

## SEO launch checklist

1. Deploy every generated locale page before, or atomically with, the sitemap that references it.
2. Confirm `https://loudscript.app/zh-hans/`, `https://loudscript.app/zh-hant/`, `https://loudscript.app/de/`, `https://loudscript.app/es/`, `https://loudscript.app/fr/`, `https://loudscript.app/ja/`, and `https://loudscript.app/nl/` return HTTP 200 in production.
3. Confirm the live pages retain their self-referencing canonicals and the complete reciprocal `en`, `zh-Hans`, `zh-Hant`, `de`, `es`, `fr`, `ja`, `nl`, and `x-default` hreflang set.
4. Confirm the live sitemap contains the same alternate set for each localized URL, then submit it in Google Search Console and Bing Webmaster Tools.
5. Inspect all localized URLs in Search Console after deployment and request indexing if discovery is delayed.
6. Monitor impressions for `tekst-naar-spraak voor Mac`, `geselecteerde tekst voorlezen op Mac`, `schermafbeelding OCR Mac`, `offline tekst-naar-spraak voor Mac`, `Mac テキスト読み上げ`, `Mac 選択したテキスト 読み上げ`, `Mac スクリーンショット OCR`, `Mac オフライン 音声読み上げ`, `synthèse vocale pour Mac`, `lire du texte sélectionné sur Mac`, `OCR de capture d’écran sur Mac`, `synthèse vocale hors ligne sur Mac`, `texto a voz para Mac`, `leer texto seleccionado en Mac`, `OCR de capturas en Mac`, `texto a voz sin conexión para Mac`, `Text auf dem Mac vorlesen`, `Offline Text-to-Speech Mac`, `Mac 文本转语音`, `Mac 文字转语音`, `Mac 文字轉語音`, and related PDF/OCR queries before changing keyword targeting.
7. Keep every guide's complete main content, metadata, schema, internal links, and reciprocal language annotations synchronized across all eight locales.
