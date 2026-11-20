# SUMO LAB v0.2.0 — Vercel güncelleme

Bu arşiv, mevcut `sumo-lab` projesinin yeni kaynak kodudur.

## GitHub Desktop ile (önerilen)
1. Mevcut GitHub `sumo-lab` deposunu bilgisayarına clone et.
2. Bu ZIP arşivini ayrı bir klasöre çıkar.
3. Arşivin içindeki `sumo-lab` klasörünün TÜM içeriğini (gizli `.gitignore` dahil) depo klasörüne kopyala ve eski dosyaların üzerine yaz.
4. `node_modules` klasörünü kopyalama.
5. GitHub Desktop'ta değişiklikleri kontrol et.
6. Commit message: `Upgrade SUMO LAB to v0.2.0`.
7. **Commit to main** ve ardından **Push origin** seç.
8. Vercel, GitHub bağlantısı üzerinden yeni sürümü otomatik yayınlar.

## Komut satırıyla
Mevcut depo klasöründe arşiv içeriğini dosyaların üzerine kopyaladıktan sonra:

```bash
git add .
git commit -m "Upgrade SUMO LAB to v0.2.0"
git push origin main
```

## Yerelde test
```bash
npm install
npm run dev
```

Üretim derlemesi:
```bash
npm run build
```
Vercel ayarları: Framework `Vite`, Build Command `npm run build`, Output Directory `dist`.
