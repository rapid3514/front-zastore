# Zastore Shop Mini App

Telegram orqali ishlaydigan do‘kon frontend ilovasi. Katalog, mahsulotlar, buyurtmalar, ish vaqti va admin hisoboti backend API ma’lumotlari bilan ishlaydi.

## Development

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:3001/api/v1` (developmentda Vite `/api/v1` va `/health` so‘rovlarini shu manzilga yo‘naltiradi)

Vite development server faqat `127.0.0.1`da tinglaydi. Quick Cloudflare tunnel va Vite’ni birga xavfsiz ishga tushirish uchun:

```bash
node scripts/start-tunnel.js
```

Script tunnel yaratgach uning aniq `*.trycloudflare.com` hostini `VITE_DEV_ALLOWED_HOST` orqali Vite’ga uzatadi. Mavjud doimiy tunnelni alohida ishga tushirsangiz, `.env`da wildcard emas, faqat aniq hostni yozing va tunnelni frontend portiga ulang:

```env
VITE_DEV_ALLOWED_HOST=abc.trycloudflare.com
```

```bash
cloudflared tunnel --url http://127.0.0.1:5173
```

Productionda `vite` yoki `vite preview` serveridan foydalanmang; `npm run build` natijasidagi statik fayllarni production web server orqali tarqating.

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Admin va super admin profilidagi **Bot orqa foni** bo‘limidan rasm tanlab,
**Saqlash** tugmasini bosing. Rasm ImageKit orqali yuklanadi, sozlama backendda
saqlanadi va barcha foydalanuvchilarga qo‘llanadi. **Standart fonga qaytarish**
avvalgi fonni tiklaydi. Ochiq ilovalar fonni har 60 soniyada yangilaydi.
Backendda `/api/v1/appearance` endpointi va `BotAppearance` migratsiyasi bo‘lishi kerak.

Real Telegram `initData` olish uchun frontendni public HTTPS URL orqali oching va URL’ni bot Mini App sozlamalariga ulang. Lokal ishga tushirishda API va health so‘rovlari Vite proxy orqali `localhost:3001` backendga yetadi; alohida API tunnel kerak emas. Production hostingda `/api/v1` va `/health` so‘rovlarini backendga yo‘naltiring. Admin va mijoz bo‘limlari Telegram autentifikatsiyasi hamda backend rollari bilan himoyalangan. Fake login yoki auth bypass mavjud emas.
