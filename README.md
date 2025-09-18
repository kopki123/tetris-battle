### Tetris Battle

一個使用 Vue 3 + TypeScript + Vite（前端）與 Express + Socket.IO（後端）打造的俄羅斯方塊對戰遊戲，支援單人與多人模式。

---

## 技術棧
- **前端**: 
   * Vue 3
   * TypeScript
   * Vite
   * Pinia
   * Vue Router
   * Vuetify
   * Tailwind CSS
   * Socket.IO Client

- **後端**: 
   * Node.js
   * Express
   * Socket.IO

## 環境需求

- Node.js 18+（建議 20+）

### 安裝相依套件

在專案根目錄執行：

```bash
npm install
```

```bash
cd client && npm install
```

### 開發（前後端分開啟動）

- 啟動後端（在專案根目錄）：
```bash
npm run dev
```
預設埠：`3000`

- 啟動前端（在 `client/`）：
```bash
npm run dev
```

預設埠：`5173`

## 建置與部署

此後端在 `NODE_ENV=production` 時會把 `public/` 當作靜態目錄並套用 `history` 路由回退。部署步驟建議：

1) 建置前端（在 `client/`）：

```bash
npm run build
```

Vite 預設會輸出到 `client/dist/`。請將 `client/dist/` 內的內容拷貝到專案根目錄的 `public/`（確保 `public/index.html` 與 `public/assets/*` 存在且對應）。

2) 建置與啟動後端（在專案根目錄）：
```bash
npm run build
npm start
```
預設監聽 `PORT`（未設置則為 `3000`）。
