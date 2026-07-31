# 「AIでまとめる」を有効にする手順（管理者向け）

アプリ本体（GitHub Pages）はキーを持ちません。キーは中継サーバー（Cloudflare Worker）に置きます。無料枠で十分動きます。

## 用意するもの
- Anthropic の APIキー（https://console.anthropic.com → API Keys で発行。従量課金。短い要約なら1回あたり数円未満）
- Cloudflare の無料アカウント（https://dash.cloudflare.com）

## 手順

1. **Workerを作成**
   - Cloudflare ダッシュボード → 「Workers & Pages」→「Create」→「Create Worker」
   - 名前を付けて「Deploy」（仮の内容でOK）→「Edit code」

2. **コードを貼り付け**
   - `worker.js` の中身を全部コピーして、エディタの内容と差し替え →「Deploy」

3. **APIキーを登録**
   - Worker の「Settings」→「Variables and Secrets」→「Add」
   - 種類：**Secret**、名前：`ANTHROPIC_API_KEY`、値：発行したAPIキー →「Deploy」

4. **URLを控える**
   - Worker の URL（例：`https://taiyo-ai.xxxx.workers.dev`）をコピー

5. **アプリに設定（1回だけ）**
   - ブラウザで次のURLを開く：
     `https://yukke907.github.io/syuho/?ai=https://taiyo-ai.xxxx.workers.dev`
   - これで各端末に中継URLが保存され、「AIでまとめる」が使えるようになります。
   - ※端末ごとに1回ずつ開けばOK（配布時にこのURLを共有すると楽）。
   - 解除したい時は `?ai=`（空）で開く。

## 補足
- `worker.js` の `ALLOW_ORIGIN` は公開元URL。カスタムドメインにしたら書き換える。
- モデルは `claude-haiku-4-5-20251001`（安価）。変更可。
- 使いすぎ防止のため、Anthropic 側で使用上限額を設定しておくと安心。
