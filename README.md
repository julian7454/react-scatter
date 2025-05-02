# React Scatter

選取到一半的形狀可按滑鼠右鍵取消選取，選取後下方產生對應細胞群的 label 可編輯名稱，刪除及點選顏色來隱藏/顯示對應的群組。

## 線上網址

https://react-scatter.vercel.app/

## 使用技術

- React.js
- React Konva
- TypeScript
- HTML5 Canvas
- papaparse

## 安裝與本地運行

- 建議使用 Node.js v22
- 步驟

1. install
   npm i

2. start
   npm run dev

## Docker

- 建立 Docker image
  docker build -t react-scatter .
- 運行 container
  docker run -p 8080:80 react-scatter
- 瀏覽網址
  http://localhost:8080
