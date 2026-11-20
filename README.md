# PARS SUMOLAB

## v0.15.1 ring-out düzeltmesi

- Robotun kenara yaklaşması veya beyaz sınır bandına girmesi artık otomatik galibiyet oluşturmaz.
- Maç, robotun merkezi dohyonun fiziksel dış kenarını geçtiğinde biter.
- İki robot aynı anda dışarı çıkarsa beraberlik gösterilir.


PARS SUMOLAB, sumo robotlarını tasarlamak, programlamak ve sanal dohyo üzerinde karşılaştırmak için hazırlanmış React + Vite + Three.js tabanlı eğitim simülatörüdür.

## v0.14.0 yenilikleri

- Dohyo yüzeyi gerçek sumo düzenine uygun olarak siyah yapıldı; çevresine beyaz sınır bandı eklendi.
- Kırmızı sınır halkası kaldırıldı. Çizgi sensörleri siyah yüzeyden beyaz banda geçişte uyarı verir.
- Ring-out kontrolü platformun dış kenarına göre çalışır; beyaz bantta bulunmak tek başına ring-out değildir.
- Beyaz sınır bandı, platform payı ve başlangıç çizgileri dohyo çapına göre orantılı ölçeklenir.
- Başlangıç çizgileri robot ölçülerine ve dohyo çapına göre ayarlanır.
- Robot tekerlekleri ve kama çarpışma uzantısı fiziksel gövde ölçülerine daha yakın hale getirildi.
- Micro, Mini, Mega ve diğer sınıflarda robot/dohyo oranı fiziksel ölçü profillerine göre korunur.

## v0.13.0 yenilikleri

- Robotu sol fare tuşuyla sürüklerken fare tekerleğini çevirerek aynı anda döndürebilirsin. Her tekerlek adımı 6° yön değiştirir.
- Sürükleme devam ederken `Q` ve `E` tuşları da seçili robotun yönünü değiştirir.
- Fare tekerleğiyle döndürme sırasında kamera yakınlaştırması geçici olarak engellenir.
- Konum ve yön değişiklikleri yerleşim paneline anında aktarılır. Dokunmatik cihazlarda sürükleme ve açı kaydırıcısı kullanılabilir.

## v0.11.0 yenilikleri

- Oyuncu ve rakip robot, simülasyon duraklatılmışken 3B dohyo üzerinde fareyle veya dokunmatik ekranda sürüklenerek istenen başlangıç noktasına taşınabilir.
- Robotlar dohyo sınırları içinde kalacak şekilde konum kısıtlaması uygulanır.
- Başlangıç konumları ve yönleri birlikte proje kaydına yazılır; sayfa yeniden açıldığında geri yüklenir.
- Yerleşim sıfırlama düğmesi iki robotu varsayılan karşılıklı başlangıç noktalarına taşır.

## Önceki v0.10.0 yenilikleri

- Uygulama adı ve tarayıcı sekmesi başlığı **PARS SUMOLAB** olarak güncellendi.
- Robot sınıflarına göre ayrı 3B boyut profilleri eklendi. Mini Sumo başlangıç ölçüsü 100 × 100 × 30 mm, Micro Sumo 50 × 50 × 22 mm olarak tanımlandı.
- Pico, 1 Kg, Klasik 1 Kg, Mega, Açık Sınıf, LEGO ve RC profillerinin gövde, tekerlek, sensör ve kama ölçekleri sınıfa göre ayarlanır.
- Üçlü DIP-switch için sekiz hazır taktik profili eklendi. SW1 en düşük anlamlı bittir; D12, D13 ve A5 girişleri kullanılır.
- DIP anahtarları hem simülasyon kontrol panelinden hem Kod Laboratuvarı'ndan değiştirilebilir.
- Otonom mod, seçilen DIP kombinasyonuna göre arama ve saldırı davranışını değiştirir.
- Arduino C++ örnek programında sekiz DIP kombinasyonunun tamamı için taktik eşlemesi bulunur.

## Robot ölçü profilleri

| Sınıf | Simülatör referans ölçüsü |
|---|---:|
| Pico Sumo | 40 × 40 × 20 mm |
| Micro Sumo | 50 × 50 × 22 mm |
| Mini Sumo | 100 × 100 × 30 mm |
| 1 Kg / Klasik 1 Kg | 150 × 150 × 40 mm |
| Mega Sumo | 200 × 200 × 50 mm |
| Açık Sınıf | 250 × 250 × 60 mm |
| LEGO Sumo | 150 × 150 × 45 mm |
| RC Sumo | 100 × 100 × 35 mm |

Bu ölçüler simülatörün başlangıç tasarım profilleridir; her yarışmanın resmi teknik şartnamesi olarak kabul edilmemelidir. Gerçek etkinlik kurallarına göre güncellenmelidir.

## DIP-switch taktikleri

| SW3 SW2 SW1 | Decimal | Taktik |
|---|---:|---|
| 000 | 0 | Dengeli başlangıç |
| 001 | 1 | Agresif saldırı |
| 010 | 2 | Hızlı tarama |
| 011 | 3 | Tam hücum |
| 100 | 4 | Kenar güvenliği |
| 101 | 5 | Çevresel tarama |
| 110 | 6 | Kontrollü hücum |
| 111 | 7 | Maksimum saldırı |

SW1 = D12, SW2 = D13, SW3 = A5. Arduino çalışma ortamında `digitalRead()` ile okunur. Otonom modda da seçilen kombinasyon robotun arama ve saldırı davranışını değiştirir. RC/Manuel modda DIP konumu ayarlanabilir; sürüşü kullanıcı kumandası belirler.

## Kurulum

```bash
npm install
npm run dev
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## Yayınlama

Projeyi GitHub deposuna yükleyip bağlı Vercel projesinde ilgili dalı dağıtabilirsiniz. Ayrıntılar için `VERCEL_UPDATE.md` dosyasına bakın.

## Sınırlamalar

Simülasyon eğitim amaçlı yaklaşık bir fizik modelidir. Robot ölçüleri ve ağırlık limitleri organizasyon kurallarıyla doğrulanmalıdır. Arduino çalışma alanı temel API uyumluluğuna sahiptir; bütün Arduino kütüphanelerini veya gerçek donanım sürücülerini çalıştırmaz.


## v0.10.0 — Robot başlangıç yönü
- Simülasyon öncesinde oyuncu ve rakip robotun yönü ayrı ayrı 0–359 derece arasında ayarlanabilir.
- Dört hızlı yön seçeneği (0°, 90°, 180°, 270°) eklendi.
- Başlangıç yönleri proje kaydına dahil edildi.
- Simülasyon çalışırken yön ayarları kilitlenir; durdurulduğunda değişiklikler anında uygulanır.


## v0.12.0 – Daha gerçekçi sumo mücadele fiziği

- Düz kafa kafaya temas artık otomatik takla üretmez.
- Çarpışma esnekliği düşürülerek sekme yerine itiş önceliklendirildi.
- Kama altına girme; hücum yönü, ilerleme hızı ve kama tipine bağlı hale getirildi.
- Devrilme; ağırlık merkezi, destek izi, kama kaldırması ve yanal yükün zamana yayılan etkisiyle hesaplanır.
- Küçük yalpalamalar toparlanır; güçlü ve sürekli kama kaldırması devrilmeye yol açabilir.
- Dohyo üzerinde devrilmek tek başına maç kaybı değildir; robot ring-out olursa kaybeder.
- Ring-out kontrolü robot merkezinden değil, gövde/kama dış sınırından yapılır.

**Model notu:** Bu, eğitim amaçlı basitleştirilmiş 2B itiş ve açısal denge modelidir; gerçek motor tork eğrileri, lastik sürtünme haritaları, temas deformasyonu ve tam 3B rijit-cisim dinamiği içermez. Resmî kurallar organizasyona göre değişebilir.


## v0.15.0 yenilikleri
- Kazanan robotun adı maç bittiğinde doğrudan dohyo üzerinde gösterilir.
- Rakip robotun adı, sınıfı, şasi ağırlığı, rengi, kama tipi ve bileşenleri bağımsız düzenlenebilir.
- İki robotun sınıf ve kütle değerleri simülasyon fiziğinde ayrı kullanılır.

### v0.17.0 – Gerçekçi sumo robot gövdeleri ve sivri bıçak

- Yuvarlatılmış alçak şasi, üst elektronik kapağı, motor yuvaları ve tekerlek detayları.
- Zemine yakın, düz alt yüzeyli ve sivri uçlu metal sumo bıçağı.
- Sivri bıçak ucuna uygun ayrı çarpışma hacimleri.

### v0.16.1 – Temas fiziği hassasiyeti
- Görünür tekerlek, şasi ve kama geometrileriyle eşleşen çarpışma hacimleri kullanılır.
- En derin SAT teması doğrulanmadan itme, momentum aktarımı veya kama kaldırması uygulanmaz.
- Rakip sensörlerinin algılama mesafesi fiziksel kuvvet üretmez.
- Her iki robot için 2–7 adet rakip IR sensörü seçilebilir.
- Sensörler ön ve yan görüş alanını kapsar; otonom arama, hedefe dönme ve Arduino sensör verisi bu algılamayı kullanır.
