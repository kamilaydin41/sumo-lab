# Vercel Güncelleme Rehberi — SUMO LAB v0.5.0

1. `sumo-lab-v0.5.0.zip` dosyasını bilgisayarına indir ve klasöre çıkart.
2. GitHub deposunu aç.
3. Yeni sürümdeki proje dosyalarını depodaki eski dosyalarla değiştir.
4. Değişiklikleri kaydetmek için şu commit mesajını kullan:

   `SUMO LAB v0.5.0: Gövde ağırlığı ayarı ve ağırlığa bağlı itiş`

5. Değişiklikleri Vercel projesine bağlı GitHub dalına gönder.
6. Vercel otomatik dağıtımı başlatır. Dağıtım tamamlandığında siteyi açıp Robot tasarımı sekmesindeki gövde ağırlığı kaydırıcısını kontrol et.

## Yerel kontrol

```bash
npm install
npm run build
```

Derleme başarılı olursa `dist` klasörü üretilecektir.
