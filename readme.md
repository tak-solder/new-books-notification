# new-books-notification

## 概要
品川区立図書館の新着図書をクロールして、特定のカテゴリの新着資料のみをチャットワークに通知するツールです。
pupeteerの練習も兼ねているので、エラーハンドリングなど安定運用には不向きな点も多い点をご理解の上でご利用ください。

## 使い方
Dockerイメージを作成し、コンテナ上での利用を想定しています。

`# docker build -t new-books-notification .`でイメージを作成し、  
`# docker run --rm -e API_TOKEN=[YOUR_API_TOKEN] -e ROOM_ID=[ROOM_ID] new-books-notification`で実行できます。

## 取得するカテゴリの変更
NDC(日本十進分類法)の区分に基づき、整数部の3桁で絞りこめます。

app.jsの下記部分を変更してください。
```
const categories = [
    {
        id: '5',
        ndc: [7]
    },
    {
        id: '9',
        ndc: [507, 548,]
    },
];
```

## TODO
* 新着資料一覧のページングに対応
* 未通知の資料のみ通知する (DB等連携)
