# KAWAII LAB Event Tracker

KAWAII LAB. 関連グループ（KAWAII LAB. / FRUITS ZIPPER / CANDY TUNE / SWEET STEADY / CUTIE STREET / MORE STAR）の
イベント情報を各公式サイトから自動収集し、検索・絞り込み・並び替えができる一覧ページとして表示するWebサイトです。

- フロントエンド: Next.js（App Router） + TypeScript + Tailwind CSS
- データ保存: `data/events.json`（データベース不要）
- 自動更新: GitHub Actions（12時間ごとにスクレイピングを実行し、JSONを自動コミット）
- ホスティング: Vercel

---

## 1. フォルダ構成

```
kawaii-lab-event-tracker/
├─ .github/
│   └─ workflows/
│       └─ scrape.yml         # GitHub Actions: 12時間ごとの自動スクレイピング設定
├─ app/
│   ├─ globals.css            # Tailwindの読み込み・全体スタイル
│   ├─ layout.tsx             # 全ページ共通のレイアウト（<html><body>など）
│   └─ page.tsx                # トップページ（唯一のページ）
├─ components/
│   ├─ EventCard.tsx           # イベント1件分のカードUI
│   ├─ EventList.tsx           # 検索・絞り込み・並び替えのロジックとカード一覧
│   └─ FilterBar.tsx           # 検索ボックス・グループ選択・並び替え選択のUI
├─ data/
│   └─ events.json             # スクレイピング結果（イベント一覧データ）
├─ lib/
│   ├─ extractor.ts            # タイトル/本文から日時・会場を推測抽出するロジック
│   ├─ sources.ts               # 監視対象サイトの一覧・URL設定
│   ├─ storage.ts               # JSON保存・読み込み・重複除外・並び替え処理
│   └─ types.ts                  # 型定義（EventItemなど）
├─ scripts/
│   └─ scrape.ts                # スクレイパー本体（npm run scrape で実行）
├─ public/                       # 画像など静的ファイル置き場（今回は未使用）
├─ .gitignore
├─ next-env.d.ts
├─ next.config.js
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ tsconfig.json
```

---

## 2. 必要なもの（事前準備）

- [Node.js](https://nodejs.org/) バージョン 20 以上
  - インストール後、ターミナルで `node -v` と打って `v20.x.x` のように表示されればOK
- [Git](https://git-scm.com/)
- [GitHub](https://github.com/) アカウント
- [Vercel](https://vercel.com/) アカウント（GitHubアカウントでログイン可能）

---

## 3. 初心者向け導入手順（ローカルで動かす）

### 手順1: プロジェクトファイルを用意する

このチャットで出力されたファイル一式を、すべて同じフォルダ構成で
`kawaii-lab-event-tracker` という名前のフォルダにまとめてください。

### 手順2: ターミナルでフォルダに移動する

```bash
cd kawaii-lab-event-tracker
```

### 手順3: 依存パッケージをインストールする

```bash
npm install
```

これでpackage.jsonに書かれているNext.jsやTailwindなどのライブラリが
`node_modules` フォルダにダウンロードされます。

### 手順4: スクレイピングを1回実行してデータを作る

```bash
npm run scrape
```

成功すると `data/events.json` にイベント情報が書き込まれます。
（実行結果はターミナルにログとして表示されます）

### 手順5: 開発サーバーを起動する

```bash
npm run dev
```

ターミナルに `http://localhost:3000` と表示されるので、
ブラウザでそのURLを開くとサイトが確認できます。

---

## 4. GitHub公開手順

### 手順1: GitHubで新しいリポジトリを作る

1. GitHubにログインし、右上の「+」→「New repository」をクリック
2. リポジトリ名（例: `kawaii-lab-event-tracker`）を入力
3. 「Public」または「Private」を選択（どちらでも可）
4. 「Create repository」をクリック
5. 作成後に表示される `https://github.com/あなたの名前/kawaii-lab-event-tracker.git` のURLをコピー

### 手順2: ローカルのプロジェクトをGitリポジトリにする

プロジェクトのフォルダ内で以下を順番に実行してください。

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/あなたの名前/kawaii-lab-event-tracker.git
git push -u origin main
```

これでGitHub上にコードが公開されます。

### 手順3: GitHub Actionsが動くことを確認する

GitHubのリポジトリページ上部の「Actions」タブを開くと、
`Scrape KAWAII LAB Events` というワークフローが表示されます。
12時間ごとに自動実行されますが、今すぐ試したい場合は
「Run workflow」ボタンから手動実行できます。

> 補足: GitHub Actionsが `data/events.json` を更新してリポジトリにプッシュするためには、
> リポジトリの Settings → Actions → General →
> 「Workflow permissions」を **「Read and write permissions」** に設定してください
> （デフォルトで書き込み不可になっている場合があります）。

---

## 5. Vercelデプロイ手順

1. [Vercel](https://vercel.com/) にアクセスし、GitHubアカウントでログインする
2. ダッシュボードの「Add New...」→「Project」をクリック
3. 先ほどGitHubに公開したリポジトリ（`kawaii-lab-event-tracker`）を選択し「Import」
4. Framework Preset は自動的に「Next.js」と判定されるはずなので、そのまま
   「Deploy」ボタンをクリック
5. 数分待つとデプロイが完了し、`https://プロジェクト名.vercel.app` のようなURLが発行される

以降は、GitHub Actionsが `data/events.json` を更新してリポジトリにpushするたびに、
Vercelが自動的に再デプロイしてサイトの内容も更新されます（特別な追加設定は不要です）。

---

## 6. 必要コマンド一覧

| コマンド | 説明 |
|---|---|
| `npm install` | 依存パッケージをインストールする |
| `npm run dev` | ローカル開発サーバーを起動する（`http://localhost:3000`） |
| `npm run build` | 本番用にビルドする（Vercelが自動で実行する） |
| `npm run start` | ビルド済みのアプリを起動する（`npm run build` の後に使う） |
| `npm run scrape` | スクレイパーを実行し `data/events.json` を更新する |
| `npm run lint` | コードの簡易チェックを行う |

---

## 7. 環境変数一覧

このプロジェクトは **環境変数を必要としません**。

- データベースを使わずJSONファイルで管理しているため、接続情報（DB URLなど）は不要
- スクレイピング対象のサイトはログイン不要で公開されている情報のみを取得するため、APIキーや認証情報も不要

そのため `.env` ファイルの作成や、Vercel側での環境変数設定は行わなくてOKです。
（将来的に何か追加したくなった場合は、Vercelダッシュボードの
「Settings」→「Environment Variables」から設定できます。）

---

## 8. エラー発生時の対処法

### `npm install` でエラーが出る

- Node.jsのバージョンが古い可能性があります。`node -v` で確認し、20以上でなければ
  [Node.jsの公式サイト](https://nodejs.org/) から最新版（LTS）をインストールしてください。

### `npm run scrape` を実行しても `data/events.json` が空のまま

- ネットワーク接続を確認してください。
- 対象サイトが一時的にアクセスできない、またはサイトの構造が変わってリンクの形式
  （`/live_information/detail/...` など）が変化した可能性があります。
  `lib/sources.ts` の `scheduleListUrl` を、実際のサイトのEVENT/NEWSページURLに
  書き換えて再実行してみてください。
- ターミナルに `[warn] fetch failed` や `HTTP 403/404` のようなログが出ていれば、
  そのサイトへのアクセスが何らかの理由でブロックされています。しばらく時間を置いて
  再実行するか、`scripts/scrape.ts` 内の `USER_AGENT` の値を変更してみてください。

### サイトを開くと「イベントが見つかりませんでした」と表示される

- `data/events.json` の中身が空（`"events": []`）になっている可能性があります。
  `npm run scrape` を実行してデータを作成してください。
- GitHub Actionsで自動運用している場合は、Actionsタブで直近の実行が失敗していないか
  確認してください。

### 日時や会場が「未定」と表示されるイベントが多い

- これは仕様です。本サイトは公式サイトの記事タイトル・本文から
  正規表現で日時・会場を**推測**しているため、表記が独特な記事は抽出に失敗することがあります。
  抽出精度を上げたい場合は `lib/extractor.ts` の `DATE_PATTERNS` /
  `VENUE_PATTERNS` にパターンを追加してください。

### Vercelへのデプロイでビルドエラーが出る

- Vercelのビルドログを確認し、エラーメッセージに表示されているファイル名・行番号を確認してください。
- ローカルで `npm run build` を実行し、同じエラーが再現するか確認すると原因を特定しやすくなります。

### GitHub Actionsが「Permission denied」で失敗する

- リポジトリの Settings → Actions → General →
  「Workflow permissions」が「Read and write permissions」になっているか確認してください
  （デフォルトでは読み取り専用になっている場合があります）。

### サイトのデザインが崩れる・スマホで見づらい

- ブラウザのキャッシュを一度クリアしてから再読み込みしてみてください。
- それでも直らない場合は `app/globals.css` や各コンポーネントの
  Tailwindクラス（`className` の中身）を調整してください。

---

## 重要な注意事項（スクレイピングについて）

- 本プロジェクトは各公式サイトの **公開されている情報のみ** を取得します
  （ログインが必要なファンクラブ限定コンテンツなどは対象外です）。
- 各サイトのHTML構造は公式に文書化されたものではないため、サイト側のリニューアルなどで
  突然動かなくなる可能性があります。その際は `lib/sources.ts` や `scripts/scrape.ts` の
  調整が必要になります。
- アクセス頻度は12時間に1回程度に抑えており、サイトに過度な負荷をかけない設計にしています。
  この間隔を変更する場合も、対象サイトに配慮した範囲で調整してください。
