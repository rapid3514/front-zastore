# Zastore Customer Mini App

Telegram food ordering Mini App frontend. Today va Menu sahifalari public mock ma’lumotlar bilan ishlaydi; History va Profile mavjud Telegram autentifikatsiyasi orqali himoyalangan.

## Development

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:3001/api/v1` (Vite `/api/v1` so‘rovlarini shu manzilga yo‘naltiradi)

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

Real Telegram `initData` olish uchun frontendni public HTTPS URL orqali oching va URL’ni bot Mini App sozlamalariga ulang. Lokal ishga tushirishda API so‘rovlari shu HTTPS manzil orqali Vite proxy yordamida `localhost:3001` backendga yetadi; alohida API tunnel kerak emas. Production hostingda ham `/api/v1` backendga yo‘naltirilishi kerak. Oddiy brauzerda Today va Menu public UI ko‘rinadi; protected bo‘limlar Telegram orqali kirishni so‘raydi. Fake login yoki auth bypass mavjud emas.
