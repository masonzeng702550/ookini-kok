# おおきに KOK！

> 関西旅遊互動地圖 — 用大阪手繪風走遍京都・大阪・神戶・奈良・關西機場

純前端 SPA，部署於 GitHub Pages，無後端、無 API key、無第三方追蹤。

**Live demo**: https://masonzeng702550.github.io/ookini-kok/

---

## 特色

- 🗾 **真實地理底圖** — 自繪海岸線 + 大阪灣 + 山脈 + 河川，比照 Google Maps
- 🏛️ **大阪文化插畫** — 大阪城、鳥居、港塔、鹿、飛機等手繪城市 icon；Glico 跑者、章魚燒、通天閣等 motif 點綴 UI
- 🚆 **25 條主要鐵路** — JR 西日本、阪急、阪神、京阪、近鐵、南海、Metro、京都/神戶地下鐵等，依各家官方代表色
- 🚉 **38 個重要轉乘站與端點站** — 大阪/梅田、新大阪、難波、京都、三宮等樞紐 + USJ、鞍馬、嵐山、高野山、關空等終點
- 🗺️ **府縣行政區** — 京都府/兵庫縣/大阪府/奈良縣/和歌山縣/滋賀縣 淺色標籤 + 虛線府界
- 📱 **RWD** — 桌機左側抽屜、手機底部 sheet 上滑

---

## 技術堆疊

| 層級 | 工具 |
|---|---|
| 建置 | Vite 6 |
| 框架 | Vue 3 + TypeScript |
| 樣式 | TailwindCSS 3 |
| 狀態 | Pinia |
| 地圖 | MapLibre GL JS 4 |
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

`vite.config.ts` 的 `base` 設為 `/ookini-kok/`；若 fork 後 repo 名不同需同步調整。

## 三層級縮放

| Zoom | 等級 | 顯示 |
|---|---|---|
| ≤ 9 | overview | 5 城市霓虹徽章 + 主幹鐵路 + 6 府縣淺色標籤 |
| 10–11 | district | 加上分區 polygon + 轉乘站/端點站標示 |
| ≥ 12 | detail | 加上景點 pin |

## 替換實景照流程

1. 將原圖放到 `public/photos/{city-id}/{attraction-id}.jpg`
2. 編輯 `src/data/attractions.ts`，將該景點的 `photo` 從 `PLACEHOLDER` 改為自己的圖

## 授權

程式碼：MIT
照片：見 `src/data/attractions.ts` 各 `photo.credit` 欄位
