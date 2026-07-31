// ─────────────────────────────────────────────────────────────
// 週報メーカー用 AI中継サーバー（Cloudflare Worker）
//
// 役割：APIキーをこのサーバーだけに置き、アプリからのリクエストを
//        Anthropic(Claude) に転送して要約結果を返す。
//        キーがアプリ（ブラウザ）に出ないので安全。
//
// 使い方（詳細は同梱の手順を参照）：
//   1. Cloudflare で Worker を作成し、このコードを貼り付け
//   2. 環境変数(Secret) に ANTHROPIC_API_KEY を設定
//   3. デプロイして URL を控える
//   4. アプリを  https://yukke907.github.io/syuho/?ai=<WorkerのURL>  で一度開く
// ─────────────────────────────────────────────────────────────

// このアプリを許可する公開元（GitHub Pages のURL）。カスタムドメインにしたら変更。
const ALLOW_ORIGIN = "https://yukke907.github.io";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response("Method Not Allowed", { status: 405, headers: cors });

    try {
      const { text } = await request.json();
      const prompt =
`あなたは週報づくりの補助です。次の入力を、週報に載せる簡潔な箇条書きに要約してください。
【厳守】
・各行を「・」で始める短い箇条書きにする（3〜6行程度、1行は短く）。
・要点だけを残し、冗長な言い回し・口語・言い淀み（えー、あの等）は省く。
・書かれている事実だけを使い、憶測で足さない。
・挨拶・前置き・感想・説明文は書かない。質問もしない。
・出力は箇条書きの本文のみ。
=== 入力 ===
${(text || "").trim() || "（入力なし）"}`;

      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", // 安価で十分。変更可
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await r.json();
      const summary = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();

      return new Response(JSON.stringify({ summary }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
