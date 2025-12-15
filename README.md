# 呪術廻戦 — 領域展開（Domain Expansion）

這是一個以「領域展開」為主題的互動網頁小遊戲，使用前端攝影機與 AI 分析手勢（或姿勢）來觸發視覺效果。整個專案為前端靜態應用，使用者的 API Key 會儲存在本機瀏覽器（localStorage），不會上傳到任何伺服器。

**主要功能**
- 即時攝影機擷取手勢或姿勢
- 呼叫後端/第三方 AI 分析影像（需提供 API Key）
- 根據分析結果顯示角色專屬特效與領域畫面

## 本機執行

**需求**: Node.js、npm

1. 安裝相依套件：

```bash
npm install
```

2. 啟動開發伺服器：

```bash
npm run dev
```

3. 開啟瀏覽器並前往 `http://localhost:5173`（或終端顯示的 URL），在啟動時會提示輸入 API Key；或在瀏覽器開發工具中執行：

```js
localStorage.setItem('gemini_api_key', 'YOUR_API_KEY')
```

> 安全提醒：請勿把實際的 API Key、金鑰檔或敏感資訊提交到版本控制系統（如 GitHub）。在 README、程式碼或公開設定檔中不要包含任何密鑰。

## 部署

此專案可以部署為靜態站點（例如 GitHub Pages 或其他靜態託管服務）。常見流程：

```bash
npm run build
# 將 build 輸出部署到 gh-pages 或你選擇的靜態主機
```

如果需要，我可以協助新增 GitHub Action 自動部署的範例 workflow。

## 貢獻

歡迎提出 issue 或 PR：修正錯誤、改進 UI 或新增角色/特效。

## 授權

本專案採用 MIT License（請見 `LICENSE`）。
