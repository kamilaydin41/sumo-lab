# SUMO LAB v0.2.1 — Vercel güncelleme

1. Bu ZIP arşivinin içindeki `sumo-lab` klasörünün **içeriğini** mevcut GitHub `sumo-lab` deposunun kök dizinine yükleyin.
2. Var olan dosyaları yeni sürümle değiştirin; `package.json` ve `index.html` depo kökünde olmalı.
3. Commit mesajı: `SUMO LAB v0.2.1 - front wedge blade`
4. GitHub'a commit gönderildiğinde Vercel otomatik deploy başlatır.
5. Vercel proje ayarları: Framework `Vite`, Build Command `npm run build`, Output Directory `dist`.

Yerel doğrulama için Node.js 20.19+ veya 22.12+ önerilir:

```bash
npm install
npm run build
npm run dev
```

Not: Bu çalışma ortamında npm paket indirme işlemi zaman aşımına uğradığı için production build burada doğrulanamadı.
