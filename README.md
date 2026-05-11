# おおきに KOK！

> 関西旅遊互動地圖 — 用大阪手繪風走遍京都・大阪・神戶・奈良・關西機場・北大阪

純前端 SPA，部署於 GitHub Pages，無後端、無 API key、無第三方追蹤。

**Live demo**: https://masonzeng702550.github.io/ookini-kok/

---

## 特色

- 🗾 **真實地理底圖** — 自繪海岸線、大阪灣、山脈、河川、人工島（USJ/Sakurajima、Tempozan、Sakishima、Maishima、Yumeshima、大阪沖埋立処分場、Port Island、Kobe Airport、Rokko Island、Meriken Park）皆採實際輪廓的不規則多邊形，比照 Google Maps
- 🌐 **2025 大阪・関西万博會場** — Yumeshima 萬博 pin 標示
- 🏛️ **大阪文化插畫** — 大阪城、鳥居、港塔、鹿、飛機等手繪城市 icon；Glico 跑者、章魚燒、通天閣等 motif 點綴 UI
- 🚆 **25 條主要鐵路** — JR 西日本、阪急、阪神、京阪、近鐵、南海、大阪 Metro、京都/神戶地下鐵、Port Liner、嵐電、叡電 等；依各家官方代表色
- 🚉 **46 個重要轉乘站與端點站可點擊** — 點站後地圖飛去 + 側欄顯示**轉乘路線清單**，每條線著色（取自該路線官方色）且可點擊進入詳情
- ⛴️ **Bay Shuttle 渡輪虛線** — KIX ↔ 神戶機場海上航線
- 🗺️ **府縣行政區** — 京都府/兵庫縣/大阪府/奈良縣/和歌山縣/滋賀縣 淺色標籤 + 虛線府界
- 🎵 **真實機場 / 鐵路鐘聲** — Web Audio 即時合成、不需音檔下載：
  - **關西機場 + 神戶機場**：E5–C#5–E5–A5 純 sine bell 4 音
  - **伊丹機場**：G4–B4–G4–D5–G5 ⏸ D6–D6（透過 onset detection + FFT 從官方 mp3 反推 7 音 G 大調琶音）
  - **大阪 Metro 御堂筋線**（含其他 Metro 線）：DX7 e-piano 上行琶音
- 📱 **RWD** — 桌機左側抽屜、手機底部 sheet 上滑
- 🌆 **道頓堀霓虹夜間配色 + 紙質地圖風** 雙視覺結合（霓虹用於頂部 brand，地圖採柔和米色 + 海藍）

---

## 技術堆疊

| 層級 | 工具 |
|---|---|
| 建置 | Vite 6 |
| 框架 | Vue 3 + TypeScript |
| 樣式 | TailwindCSS 3 |
| 狀態 | Pinia |
| 地圖 | MapLibre GL JS 4 |
| 音訊 | Web Audio API（純合成，無音檔） |
| Icon | Material Symbols + 自製 SVG |
| 字體 | Epilogue / Be Vietnam Pro / Space Grotesk |

## 開發

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 輸出 dist/
npm run preview      # 預覽 build 結果
```

## 部署

推到 `main` 分支即觸發 `.github/workflows/deploy.yml` 自動 build 並 publish 到 GitHub Pages。

需在 repo 設定中：**Settings → Pages → Source: GitHub Actions**。

`vite.config.ts` 的 `base` 設為 `/ookini-kok/`；若 fork 後 repo 名不同需同步調整。所有 public 資源透過 `src/utils/asset.ts` 的 `assetPath()` 解析子路徑。

## 三層級縮放

| Zoom | 等級 | 顯示 |
|---|---|---|
| ≤ 9 | overview | 5 城市徽章 + 主幹鐵路 + 6 府縣淺色標籤 |
| 10–11 | district | 加上分區 polygon + 46 個轉乘站/端點站標示 |
| ≥ 12 | detail | 加上 ~90 個景點 pin |

## 互動

| 點擊對象 | 行為 |
|---|---|
| 城市徽章（OSAKA / KYOTO / KOBE / NARA / KIX） | 飛去並 zoom 進該城；KIX 額外播 4-note chime |
| 分區 polygon | 飛去並切到「分區資訊」抽屜 |
| 鐵路線 | 切到 Railways tab 顯示路線詳情（停靠站列、車種、官方時刻表連結）；點 Osaka Metro 任一線會播電鋼琴 chime |
| **轉乘站 marker** | **飛去並切到 Railways tab，顯示該站所有轉乘路線**（每條線有色條 + 可再點擊進入該路線詳情） |
| 景點 pin | 飛去並切到 Attractions tab 顯示景點卡片；KIX / 神戶機場景點播 KIX chime；伊丹機場景點播獨家伊丹 chime |
| 右下 Reset 按鈕 | 飛回 Kansai 全景 |

## 資料結構

```
src/data/
├── cities.ts          # 5 大城市
├── districts.ts       # 23 個分區（含北大阪、須磨/垂水、吉野/櫻井）
├── attractions.ts     # ~90 個景點，含 2025 萬博 + 3 機場 + 池田泡麵博物館
├── stations.ts        # 46 個轉乘樞紐 / 端點站
├── railways.ts        # 25 條主要鐵路（含 Shinkansen、各家私鐵與地下鐵）
└── geo.ts             # GeoJSON 生成器（rails + districts）

public/tiles/kansai-base.json  # 海岸線、人工島、山脈、河川、府界、ferry 路線
```

## 替換實景照流程

1. 將原圖放到 `public/photos/{city-id}/{attraction-id}.jpg`
2. 編輯 `src/data/attractions.ts`，將該景點的 `photo` 從 `PLACEHOLDER` 改為自己的圖

## 音訊合成

機場 / Metro chimes 用 `src/audio/chime.ts` 即時合成：

```ts
playKixChime();        // 4 純 sine 音（神戶機場共用）
playItamiChime();      // 7 音 G 大調，從官方 mp3 反推得出
playMidosujiChime();   // Osaka Metro 御堂筋風格 e.piano 旋律
```

伊丹 chime 旋律推出過程：用 `librosa.onset.onset_detect` 找出 7 個音的時間點，再對每個音的前 300ms 做 FFT 並挑強峰當基頻 / 泛音，最後對照其音名（G3 ↔ G4↔ G5↔ G6 等泛音系列）反推實際 melody 為 G 大調上行琶音。

## 授權

程式碼：MIT  
照片：見 `src/data/attractions.ts` 各 `photo.credit` 欄位
