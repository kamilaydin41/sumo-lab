# Vercel / GitHub Güncelleme Rehberi — v0.7.0

1. `sumo-lab-v0.7.0.zip` dosyasını bilgisayarına indir ve klasöre çıkar.
2. GitHub'daki SUMO LAB deposunu aç.
3. Yeni sürümdeki proje dosyalarını depodaki eski dosyalarla değiştir.
4. Aşağıdaki commit mesajıyla kaydet:

```text
SUMO LAB v0.7.0: Arduino C++ çalışma alanı ve 3'lü DIP-switch
```

5. Değişiklikleri Vercel'e bağlı ana dala gönder.
6. Vercel dağıtımının tamamlanmasını bekle ve uygulamada Kod Laboratuvarı sekmesini aç.
7. `Arduino C++` dilini seç, DIP anahtarlarını ayarla ve `Arduino kodunu çalıştır` düğmesine bas.

## Deneme için pin bağlantıları
- Çizgi sensörleri: A0–A4
- Rakip sensörleri: D2, D3, D11
- DIP anahtarları: D12, D13, A5
- TB6612FNG: PWMA D5, AIN1 D7, AIN2 D8, PWMB D6, BIN1 D9, BIN2 D10, STBY D4

Not: Bu sürümün Arduino çalışma alanı temel API uyumluluğu sağlar; tam Arduino IDE derleyicisi değildir. Üretim derlemesini dağıtımdan önce `npm install` ve `npm run build` komutlarıyla doğrula.
