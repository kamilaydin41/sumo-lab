# Sürüm Notları

## v0.9.0 - PARS SUMOLAB adı, robot boyutları ve DIP taktikleri

- Simülasyon arayüzündeki marka adı ve tarayıcı sekmesi başlığı PARS SUMOLAB olarak değiştirildi.
- Robot sınıflarına göre fiziksel ölçü profilleri güncellendi.
- Micro Sumo 50 × 50 mm, Mini Sumo 100 × 100 mm referans taban ölçülerine getirildi.
- Diğer robot sınıflarının gövde, tekerlek, sensör ve kama geometrileri kendi ölçülerine göre ölçeklendi.
- Üçlü DIP-switch için sekiz seçilebilir taktik profili eklendi.
- DIP kombinasyonları Otonom mod davranışına bağlandı.
- Arduino C++ örnek kodunda 000-111 arasındaki sekiz taktik için eşleme yapıldı.

## Önceki sürümler

Önceki sürüm değişiklikleri için Git geçmişine bakın.


## v0.10.0 — Robot yerleşim yönü
- Oyuncu ve rakip robot için bağımsız başlangıç yönü kontrolü eklendi.
- 0–359 derece yön kaydırıcıları ve dört yön kısayolu eklendi.
- Başlangıç yönleri proje kaydetme/yükleme verisine eklendi.
- Simülasyon çalışırken yerleşim yönü kontrolleri devre dışı bırakıldı.
