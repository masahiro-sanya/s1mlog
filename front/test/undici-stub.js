// cheerio が fromURL 用に undici を読み込むが、jsdom には Web Streams 等がなく初期化に失敗する。
// テストでは fromURL を使わないため空実装で差し替える。
module.exports = {};
