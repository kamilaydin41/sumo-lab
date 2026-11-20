# SUMO LAB v0.7.0

SUMO LAB; mini, micro ve mega sumo robotları için tarayıcı tabanlı eğitim ve prototipleme simülatörüdür.

## Özellikler
- Three.js ile 3B dohyo ve robot simülasyonu
- Micro, Mini ve Mega dohyo profilleri; çap ayarı
- Pico, Micro, Mini, Klasik 1 Kg, 1 Kg, Mega ve diğer robot sınıfları
- Gövde ve bileşen ağırlığı hesabı
- RC sürüş: sanal çift joystick, klavye ve USB/Bluetooth gamepad
- Yerleşik otonom rakip arama ve dohyo sınırından kaçış
- Arduino C++ için tarayıcı içinde temel uyumluluk çalışma alanı
- Üçlü DIP-switch ile 8 farklı taktik kombinasyonu
- Proje ayarlarını tarayıcıda kaydetme

## Arduino C++ çalışma alanı
Kod laboratuvarında `Arduino C++` seçilip `Arduino kodunu çalıştır` düğmesine basıldığında sketch, izole bir tarayıcı iframe'i içinde çalıştırılır. Simülatör aşağıdaki temel Arduino işlevlerini eşler:

- `setup()` ve `loop()`
- `pinMode()`, `digitalRead()`, `analogRead()`
- `digitalWrite()`, `analogWrite()`
- `delay()`, `millis()`, `constrain()`, `map()`, `Serial.print/println()` için temel karşılıklar

### Simülatör pin eşlemesi
| Arduino pini | Simülatördeki karşılığı |
|---|---|
| A0–A4 | Ön-sol, ön-orta, ön-sağ, arka-sol, arka-sağ çizgi sensörleri |
| D2 | Sol rakip IR sensörü |
| D3 | Ön rakip IR sensörü |
| D11 | Sağ rakip IR sensörü |
| D12 | DIP switch 1 |
| D13 | DIP switch 2 |
| A5 | DIP switch 3 |
| D5 / D7 / D8 | Sol motor PWM / yön |
| D6 / D9 / D10 | Sağ motor PWM / yön |
| D4 | TB6612FNG STBY |

Motor sürücü eşlemesi varsayılan TB6612FNG örneğine göredir. Kodun farklı pin kullanıyorsa eşlemeyi bu sürücü pinlerine göre düzenle.

### DIP-switch kullanımı
Üç anahtarın her biri `digitalRead(12)`, `digitalRead(13)` ve `digitalRead(A5)` ile okunabilir. Üç anahtar toplam sekiz kombinasyon sağlar. Anahtar durumları proje ayarlarıyla birlikte saklanır.

## Önemli uyumluluk sınırı
Bu özellik tam bir Arduino IDE derleyicisi değildir. Yaygın Arduino dil yapıları ve temel pin API'leri için hafif bir uyumluluk katmanıdır. `#include` ile eklenen harici kütüphaneler, `Wire`, `SPI`, `Servo`, `QTRSensors`, `SoftwareSerial`, gerçek zamanlı kesmeler, donanıma özel kayıtlar, ESP32/Pico'ya özgü API'ler ve bütün C++ dil özellikleri desteklenmez. `delay()` simülasyon döngüsünü bloke etmemesi için bekleme yapmaz. Karmaşık veya kütüphane kullanan gerçek robot sketch'leri doğrudan çalışmayabilir; desteklenmeyen kodlar için simülatöre özel uyarlama gerekir.

Bu çalışma alanı fiziksel Arduino kartına kod yüklemez ve gerçek donanımı kontrol etmez. Kod, yalnızca SUMO LAB içindeki sanal sensör ve motorlarla çalışır.

## Geliştirme
```bash
npm install
npm run dev
```

Üretim derlemesi:
```bash
npm run build
```

## Dağıtım
Projeyi GitHub deposuna gönderdiğinde Vercel bağlantısı varsa yeni commit otomatik dağıtımı başlatır.
