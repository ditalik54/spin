# iamSanna giveaway — Cloudflare export

## Завантаження через Cloudflare Pages
1. Відкрий Cloudflare Dashboard → Workers & Pages → Create application → Pages → Use direct upload.
2. Вкажи назву проєкту.
3. Завантаж `iamSanna-cloudflare-pages.zip` і натисни Deploy site.

У ZIP файл `index.html` лежить одразу в корені. ZIP не треба збирати через npm. Це готовий статичний сайт: без build-команди, бекенда та ключів API.
Якщо інтерфейс просить build output directory, вибирай `site` при роботі з цією папкою; для Direct Upload просто використовуй ZIP або перетягни папку `site`.

Офіційна інструкція: https://developers.cloudflare.com/pages/get-started/direct-upload/

## Що всередині
- `iamSanna-cloudflare-pages.zip` — готовий файл для Direct Upload.
- `site/` — ті самі файли у розпакованому вигляді для редагування.
- `SHA256.txt` — контрольна сума ZIP.

## Редагування
- `site/index.html`: тексти, YouTube/Discord-посилання, верстка.
- `site/style.css`: оформлення, мобільні стилі й анімації.
- `site/app.js`: підготовка, три оберти, конфеті, мішечок і таймер.
- `site/state.mjs`: список вихованців, сценарій і математика колеса.
- `site/assets/`: усі зображення локально; сторонній Sites-хостинг не потрібен.
- `site/_headers`: тип JavaScript для .mjs та базові HTTP-заголовки.

Для локального перегляду: `python3 -m http.server 8080 --directory site`, потім відкрий http://localhost:8080 . Не відкривай index.html через file:// — JavaScript використовує модулі.

## Поточні можливості
Це позначений попередній перегляд із заданою послідовністю: Kangaroo → No prize → Shadow Dragon. Реальні предмети не видаються.
YouTube веде на @iamSanna; Discord і приватний Roblox-сервер ще не налаштовані. Підписка/членство фактично не перевіряються.
6.62M підписників — знімок перевірки від 30 жовтня 2026 року, без автооновлення.
Прогрес, призи й час завершення зберігаються лише в localStorage браузера. Спільної бази даних і захисту від скидання немає.
На новому домені прогрес із попереднього домену не переноситься. Авторизація Sites не переноситься — доступ на Cloudflare налаштовується окремо.

За бажанням через CLI: `npx wrangler pages deploy site` (потрібні Cloudflare-вхід і вибір проєкту).
