# Little Sky — 星座アトラス

宇宙船の中で世界地図から場所を選び、**その場所・その時刻に実際に見える星座・恒星・惑星**を、
『星の王子さま』のような公園（または全天・宇宙空間）から眺めて学べる Web アプリです。

- 国 → 地域を選ぶだけで、緯度・経度・タイムゾーンが決まる
- 星・太陽・月（満ち欠け）・惑星の位置を天文計算で表示（昼は星が見えない／「太陽を隠す」で昼の星座・惑星も確認）
- ホバーで名前と星座線、クリックでポラロイド写真つきの詳細カード
- 手帳で星座・恒星・惑星・星雲を検索し、「いつ・どこの空に見えるか」を確認
- 3 つのモード：公園／全天／宇宙（地平線・キャラクターなし、自由に回転・ズーム）

> UI と解説文は英語です。

## 技術スタック

| 区分 | 使用技術 |
| --- | --- |
| フレームワーク | React 18 + TypeScript + Vite |
| アニメーション | GSAP（タイムライン）／react-spring（モーダル・手帳）／framer-motion（HUD） |
| 状態管理 | zustand |
| 天文計算 | [Astronomy Engine](https://github.com/cosinekitty/astronomy)（太陽・月・惑星、恒星時、歳差・章動） |
| 星データ | [d3-celestial](https://github.com/ofrohn/d3-celestial)（Hipparcos 由来、6 等星まで約 5,000 個ほか） |
| 地図 | d3-geo + topojson-client + world-atlas、タイムゾーンは tz-lookup |
| 描画 | Canvas 2D（立体射影による自前の天球レンダラー） |

## 開発

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # 型チェック
npm run build      # dist/ に本番ビルド
```

要件：Node.js 22 以上。

> 社内ネットワークで `UNABLE_TO_VERIFY_LEAF_SIGNATURE` が出る場合（TLS 検査）は、
> `NODE_OPTIONS=--use-system-ca` を付けて実行してください（Windows の証明書ストアを使います）。
> TLS 検証の無効化（`strict-ssl=false` 等）は推奨しません。

## 公開（GitHub Pages）

`main` へ push すると、`.github/workflows/deploy.yml` が自動でビルドして GitHub Pages へ公開します。
初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にしてください。
`vite.config.ts` は `base: './'` のため、リポジトリ名に関係なくサブパスで動作します。
詳細は [docs/05_運用・デプロイ手順書.md](docs/05_運用・デプロイ手順書.md) を参照。

## ドキュメント

| 文書 | 内容 |
| --- | --- |
| [docs/01_要件定義書.md](docs/01_要件定義書.md) | 目的・スコープ・機能／非機能要件・実装状況 |
| [docs/02_基本設計書.md](docs/02_基本設計書.md) | アーキテクチャ・画面設計・データ設計・天文計算方式 |
| [docs/03_詳細設計書.md](docs/03_詳細設計書.md) | モジュール別の詳細仕様・アルゴリズム |
| [docs/04_テスト仕様・結果書.md](docs/04_テスト仕様・結果書.md) | 検証項目と実施結果 |
| [docs/05_運用・デプロイ手順書.md](docs/05_運用・デプロイ手順書.md) | ビルド・公開・保守手順 |

## ディレクトリ構成

```
src/
  astro/      座標変換・立体射影・太陽/月/惑星・可視性計算・空の色
  data/       星表の読み込み、星座/恒星/惑星/星雲の解説、都市、Wikipedia 取得
  sky/        Canvas レンダラー、操作（ドラッグ/ズーム/当たり判定）、太陽を隠す演出
  scenes/     船内、世界地図、着陸、空
  ui/         HUD、情報モーダル、手帳、星図
  characters/ キャラクター（SVG）
  store/      アプリ状態
public/data/  星表・星座線・天の川・星雲・国境の JSON
```

## 注意事項

- 解説文（神話・豆知識・恒星の距離や年齢など）は概数を含み、一次資料での**校正前**です。公開前に確認してください。
- 写真と要約は実行時に Wikipedia から取得します（オフライン時は自作星図にフォールバック）。各画像のライセンスに従ってください。
- 星データは d3-celestial（BSD-3-Clause）、計算は Astronomy Engine（MIT）、地図は Natural Earth（パブリックドメイン）を利用しています。
