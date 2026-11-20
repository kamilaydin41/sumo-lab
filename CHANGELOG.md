# Sürüm Notları

## v0.7.0 — Arduino C++ çalışma alanı ve 3'lü DIP-switch

- Üç konumlu DIP-switch paneli eklendi. SW1, SW2 ve SW3; Arduino D12, D13 ve A5 girişlerine bağlandı.
- DIP-switch kombinasyonları proje ayarlarıyla birlikte kaydedilir. Üç anahtar sekiz taktik seçeneği sağlar.
- Arduino C++ sketch'leri için izole iframe içinde çalışan temel uyumluluk katmanı eklendi.
- `setup()`, `loop()`, temel GPIO, analog giriş/çıkış, `millis()`, `constrain()`, `map()` ve temel Serial çağrıları eşlendi.
- Varsayılan TB6612FNG motor pin eşlemesi sanal sol/sağ motor komutlarına bağlandı.
- Sanal beş çizgi sensörü ve üç rakip algılama girişi Arduino pinlerine aktarıldı.
- Örnek Arduino sketch'ine DIP-switch ile taktik seçimi eklendi.
- Kod çalıştırma ve durdurma kontrolleri eklendi.

### Uyumluluk notu
Bu sürüm tam Arduino derleyicisi değildir. Harici kütüphaneler ve tüm kartlara özgü API'ler desteklenmez. Kod yalnızca tarayıcıdaki sanal sensör ve motorlarla çalışır; fiziksel karta yükleme yapmaz.
