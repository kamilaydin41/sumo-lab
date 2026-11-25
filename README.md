## PARS SUMOLAB v0.22.11
- Temas noktasına bağlı yaklaşık yaw momenti ve tork etkisi eklendi.
- Yandan/kama köşesi temasları moment koluyla yön değişimine etki eder.
- Robot Ayarlarından bıçak tipi seçimi kaldırıldı; tek tip dar hassas bıçak sabitlendi.

## v0.22.11
- IR ışınları kontrolü, simülasyon başlamadan önce ve çalışırken anında uygulanır; koniler ilk renderda oluşturulur.

## v0.22.11
- IR ışın görünürlüğü simülasyon başlamadan ve çalışma sırasında ana simülasyon araç çubuğundan değiştirilebilir.

## v0.22.11 — Temas sürtünmesi ve kör dönüş azaltma

- Temas sırasında yanal bağıl kayma azaltıldı (lastik tutunmasına göre).
- Burun-burun temasında sürekli pivot dönüşün bir kısmı dengeleniyor; saldırı/manevra tamamen kilitlenmiyor.
- IR ışın görünürlük ref temizliği.

## v0.22.11
IR sensor ray visibility toggle fixed; sensor cones and detection angle aligned to an approximate 30-degree physical field of view.

## v0.22.11
- IR sensors visualize their field as translucent angular cones, not single lines.
- Range setting controls cone length; detected targets tint cones amber.


## v0.22.11
IR opponent-sensor rays are visualized for both robots with detection color and toggle control.

## v0.22.11 – Temaslı itiş düzeltmesi
Karşılıklı burun buruna itişte robotların birbirinden uzaklaşmasına neden olan bağıl normal hız giderildi.

## v0.22.11 düzeltmesi

- Temel alınan sürüm v0.21.5'tir; v0.21.6–v0.21.8 arasındaki diğer değişiklikler taşınmamıştır.
- v0.21.8'deki ileri hareket düzeltmesi uygulandı: motor RPM değeri redüktör çıkış devri kabul edilir ve hız hesabında tekrar redüksiyon oranına bölünmez.
- Oyuncu ve rakip motor ayarlarında alan adı “Redüktör çıkış devri” olarak netleştirildi.

# PARS SUMOLAB

## v0.21.5 yenilikleri
- Ön sensör algısı merkez sensör üzerinden doğru sınıflandırılır.
- Ön sensör hedefinde ileri saldırı gücü tam, direksiyon düzeltmesi sınırlıdır.

# PARS SUMOLAB

## v0.21.5 yenilikleri

- Ayrı alttaki ağırlık kontrol kartı kaldırıldı.
- Oyuncu ve rakip robotun toplam ağırlığı, sınıf limiti, gövde ağırlığı ve seçili bileşen ağırlığı kendi ayar panelinde aynı biçimde gösterilir.
- Uygulama sürüm etiketleri ve paket sürümü v0.21.5 olarak eşitlendi.

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
