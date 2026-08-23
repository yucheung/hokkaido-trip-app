# 交接：北海道 App「掃 QR 即可運作」（Expo Go / iOS）

> 執行者：Claude Sonnet worker。請先完整讀完本文件再動手。
> 參考文件（必讀）：`/root/.hermes/cache/documents/doc_90e9a26b5e29_Expo_+_iOS_Expo_Go_+_GitHub_快速實機測試機制與操作說明.md`
> ——使用者親寫的機制文件。本任務 = 該文件 §12「模式 A：Expo Go 即時開發」。

## 目標

讓使用者的 iPhone（iOS Expo Go）掃 QR code 即可載入北海道旅遊 App，
且流程**可重複、可靠**。CX23 只在預覽時跑 dev server，平時不佔資源。

## 專案環境

- 專案：`/root/work/hokkaido-app`（Expo SDK 54 + expo-router，git repo）
- 主機：CX23 VPS，Linux，RAM 3.7GB（吃緊，注意不要留多個 Metro）
- node v22；`eas-cli` 22.2.0 已全域安裝
- EXPO_TOKEN 存於 `/root/.expo-env`（`source /root/.expo-env` 後可用 `eas whoami` 驗證 = yucheung0408）
- expo.dev 專案已建立：@yucheung0408/hokkaido-app（projectId df5a3973-8ffa-4998-9313-7e40a2e8840f）

## 第一步：還原實驗殘留（必做）

`app.json` 目前殘留今天的 EAS Update 實驗設定：

```json
"updates": { "url": "https://u.expo.dev/df5a3973-..." },
"runtimeVersion": "exposdk:54.0.0",
```

**結論已實測證實：自訂 runtimeVersion 的 EAS Update 無法載入 Expo Go**
（manifest 可抓但 asset 被 CDN 擋授權 → "Failed to load all assets"）。
此路已死，不要再嘗試任何 u.expo.dev 的 QR。

請將 `runtimeVersion` 還原為 `{"policy": "appVersion"}`；
`updates.url` 可保留（未來走 Development Build 才用得到）。
改完跑 `npx tsc --noEmit` 確認零錯誤，並 git commit（訊息見文末）。

## 第二步：啟動 Tunnel 模式（模式 A）

CX23 與手機不同網段 → 必須 `--tunnel`。

1. **清理殘留行程**（今天多次實驗可能留下卡住的 node）：
   ```bash
   ps -eo pid,args | grep "expo/cli" | grep -v grep | awk '{print $1}' | while read p; do kill "$p"; done
   sleep 2
   ss -ltn | awk '{print $4}' | grep -E ":80(8[0-9]|9[0-9])" || echo PORTS_FREED
   ```
   ⚠️ 禁用 `pkill -f "expo start"` / `pgrep -f "node.*expo start"`——會匹配到自己的 shell 被 SIGTERM 自殺（今天實際踩到兩次）。
2. **背景啟動**（你的 bash 內可用 script 包裝防 pipe hang）：
   ```bash
   cd /root/work/hokkaido-app
   script -q -c "npx expo start --go --tunnel --port 8088" /dev/null > /tmp/expo_handoff.log 2>&1 &
   ```
   ⚠️ 不要用 rtk 包裝（會吞 stdout）；不要 timeout | head（URL 行出現慢，會被切斷）。
3. **輪詢抓 URL**（Tunnel ready 後再等 10–20 秒才印）：
   ```bash
   grep -aoiE "exp://[a-zA-Z0-9.-]+(:[0-9]+)?[^ ]*" /tmp/expo_handoff.log | head -3
   ```
   重複直到抓到 `exp://…exp.direct…` 格式的 URL（最多等 120 秒）。
   若 port 8088 被佔 → 換 8089/8090。
4. **產生 QR**：
   ```bash
   python3 -c "import qrcode; qr=qrcode.QRCode(box_size=12,border=4); qr.add_data('EXP_URL'); qr.make(); qr.make_image().save('/root/work/hokkaido-app/qr-code.png')"
   ```
   （把 EXP_URL 換成實際 URL）

## 已知坑速查（全部今日實測）

| 坑 | 解法 |
|---|---|
| rtk 包裝吞 stdout，抓不到 URL | 直接 npx，script -q -c 包 |
| pkill/pgrep -f "expo start" 自殺 | ps+grep expo/cli 精準 kill |
| timeout N | head 截斷，URL 還沒印 | 背景跑+輪詢 log |
| 舊程序佔 port，卡 "Use port X instead?" | 先清理，換新空 port |
| tunnel 偶發 "Premature close" | 清掉重啟即可 |
| EAS Update(u.expo.dev) 進 Expo Go | ❌ 不可能，別試 |

## 第三步：驗證（全過才算完成）

```bash
ss -ltn | grep 8088                      # LISTEN
curl -s http://localhost:8088/status     # packager-status:running
grep -a "Tunnel ready" /tmp/expo_handoff.log
ls -la /root/work/hokkaido-app/qr-code.png   # >500 bytes
```

## 第四步：產出報告（最終訊息務必包含）

1. 完整 `exp://` tunnel URL（純文字一行）
2. QR 檔絕對路徑 `/root/work/hokkaido-app/qr-code.png`
3. 四項驗證的實際輸出
4. dev server 必須保持運行——**絕對不要 kill 它**

## Git commit（第一步完成後）

```
fix(config): 還原 runtimeVersion 為 appVersion policy（EAS Update 不相容 Expo Go，實測確認）
```

（eas.json 為新增檔案，一併 commit。）
