/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 画像最適化API（Vercelの画像変換）を使わず、そのままのURLで表示する設定。
  // 外部サイト（アソビシステム系のCDN）の画像をimgタグで安全に使えるようにする。
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
