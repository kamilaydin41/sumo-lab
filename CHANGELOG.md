## v0.20.3 – Motor devri aralığı ve parlak çelik bıçak

- Oyuncu ve rakip robot motor devri ayarları 200–1000 RPM aralığına alındı; varsayılan değer 600 RPM.
- Önceden kaydedilmiş proje ayarlarında eski motor devri değerleri güvenli aralığa sınırlandırılır.
- Rakip robot için bağımsız motor devri kaydırıcısı eklendi.
- Ön bıçak parlak gri çelik görünümü için daha açık metalik malzeme ve parlak kesici ağız ile güncellendi.

# Changelog

## v0.20.1 – Düz ön ağızlı, zemine sıfır bıçak
- Geliştirme tabanı v0.20.0 olarak korundu; sonraki sürümlerdeki robot gövde/üçgen burun değişiklikleri alınmadı.
- Sivri üçgen planlı kama kaldırıldı; yerine robotun önünde tam genişlikte, düz kesici ağızlı metal bıçak eklendi.
- Bıçak üst yüzeyi gövdeden ön ağza doğru eğimli, alt yüzeyi düzdür.
- Bıçağın alt kotu siyah dohyo yüzeyinin üst kotuna (.0955 Three.js birimi) eşitlendi.
- Çarpışma geometrisi görsel bıçakla aynı dikdörtgen plan şekline getirildi; ön ağız boyunca temas algılanır.

## v0.20.0 – Motor ve lastik temelli sürüş fiziği
- Oyuncu ve rakip robot için motor torku (mNm), redüksiyon oranı, motor devri, tekerlek çapı ve lastik sürtünme katsayısı bağımsız ayarlanabilir.
- İvmelenme, iki motorun redüksiyon sonrası tekerlek torkundan hesaplanan çekiş kuvveti ile lastik tutuşunun izin verdiği kuvvetin küçüğüne göre hesaplanır.
- Azami hız, motor devri / redüksiyon oranı / tekerlek çevresinden hesaplanır.
- Fiziksel temas doğrulandığında motor torku ve lastik tutuşuna bağlı sürekli itme kuvveti uygulanır.
- Tekerlek çapı görsel tekerlek ve çarpışma geometrisine de yansıtılır.
- Proje kaydına iki robotun ayrı tahrik sistemi parametreleri eklenir.

## v0.19.0
- Robot kütlesi sürüş ivmesine ve tekerlek tutuşuna dahil edildi.
- Oyuncu ve rakip robotun gerçek toplam ağırlıkları bağımsız fizik parametresi olarak kullanılıyor.
- Çarpışma impulsu kütleye göre hesaplanıyor; ağır robot aynı darbede daha az hız değiştiriyor.
- Kama ile kaldırma ve yandan devrilme etkileri hedef/saldırgan kütle oranına göre ölçekleniyor.

## v0.18.0
- Realistic low-profile sumo chassis with exposed drive wheels and motor pods.
- Rebuilt wedge as a full-width triangular blade with an exact pointed nose and near-zero ground clearance.
- Collision polygons now match the visible chassis, wheels, and triangular blade.

## v0.17.0 – Gerçekçi sumo robot gövdeleri ve sivri, zemine yakın bıçak

- Robot şasileri yuvarlatılmış, alçak profilli metal gövde görünümüne geçirildi.
- Üst elektronik kapağı, kontrol kartı, bağlantı vidaları, motor yuvaları ve detaylı tekerlek göbekleri eklendi.
- Bıçak geometrisi düz alt yüzeyli, üstten incelen ve ön ucu sivrilen metal kama olarak yeniden modellendi.
- Bıçağın ön kesici ağzı dohyo yüzeyine yaklaşık 0,3 mm boşlukla konumlandırıldı.
- Bıçak çarpışma alanı geniş taban ve dar sivri uç olarak ayrıldı.

## v0.16.1
- Görünür tekerleklerin dış sınırları çarpışma modeline eklendi; şasi temas ölçüleri 3B modelle eşleştirildi.
- Kama çarpışma hacminin uzunluk ve genişliği 3B modeldeki gerçek ölçek katsayılarıyla eşitlendi.
- Temas tespiti, bileşik şekiller arasındaki en derin doğrulanmış SAT örtüşmesini kullanır; sensör algılama menzili kuvvet üretmez.
- İtme, momentum aktarımı, kama kaldırması ve çarpışma sayacı yalnızca fiziksel temas doğrulandıktan sonra çalışır.

## v0.16.0
- Şasi ve kama için ayrı OBB/SAT temas hacimleri.
- Oyuncu ve rakip robot için bağımsız 2–7 IR rakip sensörü seçimi.
- Sensörler 3B modelde görünür; yan görüş algısı, otonom hedef takibi ve Arduino sensör köprüsüne bağlandı.

# Değişiklik günlüğü

## v0.15.1 — 20 Kasım 2026
- Hatalı erken ring-out kontrolü düzeltildi: robotun gövde/kama yarıçapı artık merkez konumuna eklenerek erken galibiyet oluşturmaz.
- Galibiyet için robotun merkezi dohyonun fiziksel dış kenarını güvenlik payıyla geçmelidir.
- Beyaz sınır bandına yaklaşmak veya temas etmek tek başına maç bitirmez.
- İki robot aynı anda dohyo dışına çıkarsa sonuç beraberlik olur.


## v0.15.0 — 20 Kasım 2026
- Maç sonucu ve kazanan robotun adı dohyo üzerinde görünür bir etiket olarak gösterilir.
- Rakip robot için bağımsız ad, sınıf, gövde ağırlığı, renk, kama tipi ve donanım bileşeni ayarları eklendi.
- Rakip robotun sınıfına ve tahmini ağırlığına göre 3B gövde ölçüsü, kütle ve hareket hızı ayrı hesaplanır.
- Rakip ayarları yerel proje kaydına dahil edildi.

# Sürüm notları

## v0.11.0 — Sürükle-bırak robot yerleşimi

- Simülasyon duruyorken oyuncu ve rakip robot dohyo üzerinde sürüklenebilir.
- Fare ve dokunmatik ekran pointer olayları desteklenir.
- Robot konumları dohyo sınırları içinde sınırlandırılır.
- Başlangıç konumları proje ayarlarıyla birlikte kaydedilir ve yüklenir.
- Yerleşim sıfırlama kontrolü eklendi.
- Kamera kontrolü, robot sürüklenirken geçici olarak devre dışı bırakılır.

## v0.10.0 — Başlangıç yönü ayarı

- Oyuncu ve rakip için bağımsız başlangıç yönü ayarı eklendi.
- 0–359 derece açı seçimi ve dört yön hızlı seçimleri eklendi.
- Başlangıç yönleri proje kaydına eklendi.


## v0.12.0 – Gerçekçi mücadele davranışı

- Normal çarpışmalarda otomatik takla davranışı kaldırıldı.
- Düşük sekme katsayısı ve daha kontrollü momentum aktarımı eklendi.
- Kama altına girme koşulları ve kama tipine göre kaldırma etkisi düzenlendi.
- Ağırlık merkezi ve destek genişliğine bağlı devrilme eşiği eklendi.
- Yalpalama sönümleme ve kendini toparlama davranışı eklendi.
- Yanal çarpışmalarda devrilme daha nadir ve kademeli hale getirildi.
- Gövde/kama dış sınırına dayalı ring-out kontrolü eklendi.
- Dohyo üzerinde devrilme tek başına yenilgi sayılmıyor.

## v0.13.0 — Sürüklerken döndürme

- Robot dohyo üzerinde fareyle sürüklenirken fare tekerleğiyle aynı anda döndürülebilir.
- Fare tekerleği her adımda 6 derece yön değiştirir; döndürme sırasında kamera yakınlaştırması engellenir.
- Sürükleme devam ederken Q ve E tuşlarıyla seçili robot saat yönünün tersine / saat yönünde döndürülebilir.
- Konum ve yön değişiklikleri ana yerleşim paneline anında aktarılır ve proje kaydına dahil edilir.
- Dokunmatik cihazlarda sürükleme ve açı kaydırıcısı birlikte kullanılabilir.


## v0.14.0 – Gerçekçi dohyo renkleri ve orantılı ölçüler

- Dohyo'nun mücadele yüzeyi siyah, çevre sınır bandı beyaz olarak yenilendi.
- Önceki kırmızı sınır halkası kaldırıldı.
- Çizgi sensörleri beyaz sınır bandının iç kenarını algılar; ring-out platformun dış kenarına göre hesaplanır.
- Beyaz sınır bandı ve platform çevresi dohyo çapına göre orantılıdır.
- Başlangıç çizgilerinin konumu ve boyu dohyo/robot ölçülerine göre ölçeklenir.
- Robot tekerleklerinin dışa taşması ve kama çarpışma uzantısı fiziksel ölçülere yaklaştırıldı.

**Ölçek:** Simülasyonda 1 Three.js birimi 20 cm'dir. Robot ölçüleri milimetre profillerinden, dohyo çapı santimetre cinsinden dönüştürülür.

## v0.20.2
- Varsayılan kontrol modu Otonom olarak ayarlandı.
- Arka çizgi sensörleri kaldırıldı; üç ön çizgi sensörü bırakıldı.
- Kenar algılama ve kaçış algoritması, Arduino örnek kodu dahil, ön sensörlerle sınırlandı.

## v0.20.4
- Added independent opponent-sensor detection distance controls for player and rival robots (10–100 cm, 5 cm steps; default 40 cm).
- Applied each robot's configured range directly to opponent detection in the simulation; range changes affect sensing only, not pushing or collision forces.
- Persisted both range settings in saved projects and restored/clamped them when loading older or edited configurations.
