# SUMO LAB v0.6.0

React, Vite ve Three.js ile geliştirilen 3B sumo robot simülasyonu ve eğitim ortamı.

## Özellikler
- 3B dairesel dohyo ve iki robotla antrenman simülasyonu
- Varsayılan Mini Sumo dohyo çapı: **80 cm**
- Micro Sumo, Mini Sumo ve Mega Sumo dohyo profilleri
- Dohyo çapını 30–200 cm arasında ayarlama
- RC / manuel kontrol: çift sanal kumanda kolu, klavye ve USB / Bluetooth gamepad
- Otonom rakip arama, yaklaşma, saldırı ve sınırdan kaçınma
- Her robot için beş simüle çizgi sensörü
- Pico, Micro, Mini, 1 kg, Klasik 1 kg, Mega, Açık Sınıf, LEGO ve RC robot profilleri
- Robot rengi, ön kama tipi, donanım bileşenleri ve gövde ağırlığı ayarı
- Toplam ağırlık hesabı ve sınıf limiti uyarısı
- Robot ağırlığını itiş fiziği hesabına yansıtma
- JavaScript ve Arduino C++ örnek kod alanları
- Proje ayarlarını tarayıcıda yerel olarak kaydetme

## Dohyo ayarları
Robot tasarımı sekmesinden dohyo profili seçilebilir:

| Profil | Varsayılan çap |
|---|---:|
| Micro Sumo | 38 cm |
| Mini Sumo | 80 cm |
| Mega Sumo | 154 cm |

Seçilen profil başlangıç çapını belirler. Çap ayrıca 30–200 cm aralığında kaydırıcıyla değiştirilebilir. Simülatör dairesel dohyo kullanır; gerçek yarışmalarda organizasyonun teknik şartnamesindeki ölçüler esas alınmalıdır.

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
- Gamepad: Sol analog kolun Y ekseni gaz, X ekseni yön kontrolüdür.
- Otonom: Robot rakibi arar, yaklaşır ve saldırır; sınır sensörlerine öncelik verir.

## Ağırlık ayarı
Gövde ağırlığı şasi, üst kapak ve bağlantı elemanlarının toplamını temsil eder. Seçilen elektronik ve mekanik parçaların ağırlığı bu değere eklenir. Toplam ağırlık robot sınıfı limitiyle karşılaştırılır.

Fizik modeli eğitim amaçlı yaklaşık bir modeldir. Gerçek robotun kütle dağılımı, sürtünmesi, motor torku ve yarışma şartnamesi farklı sonuçlar doğurabilir. Kod editöründeki özel kodlar henüz simülasyon motorunda çalıştırılmaz.

## GitHub açıklama dili
README, sürüm notları, değişiklik kayıtları, commit önerileri ve güncelleme yönergeleri Türkçe hazırlanır.
