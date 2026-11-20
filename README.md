# SUMO LAB v0.5.0

React, Vite ve Three.js kullanılarak geliştirilen 3B sumo robot simülasyonu ve eğitim ortamı.

## Özellikler
- 3B dohyo ve iki robotla antrenman simülasyonu
- Ekran üzerindeki çift sanal kumanda koluyla RC / manuel kontrol
- WASD ve yön tuşlarıyla klavye kontrolü
- Tarayıcı Gamepad API üzerinden USB / Bluetooth oyun kumandası desteği
- Rakip arama, yaklaşma ve dohyo sınırından kaçınma özellikli otonom mod
- Her robot için beş adet simüle çizgi sensörü
- Robot sınıfı, ön kama tipi, renk ve donanım bileşeni seçimi
- Ayarlanabilir gövde / şasi ağırlığı
- Gövde ve bileşen ağırlıklarını birleştiren toplam ağırlık hesabı ve sınıf limiti uyarısı
- Robotun toplam ağırlığını itiş fiziği hesabına yansıtma
- JavaScript ve Arduino C++ başlangıç kodu alanları
- Robot ayarlarını tarayıcıda yerel olarak kaydetme

## Yerel ortamda çalıştırma

```bash
npm install
npm run dev
```

## Üretim sürümünü oluşturma

```bash
npm run build
npm run preview
```

## Kontroller
- RC / Manuel: Sol sanal kol ileri-geri, sağ sanal kol sağ-sol yön kontrolü sağlar.
- Klavye: W / S ileri-geri, A / D dönüş kontrolü sağlar.
- Oyun kumandası: Sol analog kolun Y ekseni gaz, X ekseni yön kontrolüdür.
- Otonom: Robot rakibi arar, yaklaşır ve saldırır; dohyo sınır sensörlerine öncelik verir.

## Ağırlık ayarı
Robot tasarımı sekmesindeki **Gövde ağırlığı** kaydırıcısı şasi, üst kapak ve bağlantı elemanlarının toplamını temsil eder. Donanım bileşenleri sekmesinde seçilen parçaların ağırlıkları bu değere eklenir. Toplam ağırlık, seçilen robot sınıfının limitine göre kontrol edilir.

Ağırlık ve itiş davranışı eğitim amaçlı yaklaşık bir modeldir. Gerçek robotun kütle dağılımı, sürtünmesi, motor torku ve yarışma teknik şartnamesi farklı sonuçlar doğurabilir.

## GitHub açıklama dili
Bu depodaki README, sürüm notları, değişiklik kayıtları ve güncelleme yönergeleri Türkçe tutulur.
