# PARS SUMOLAB v0.21.9

## v0.21.9
- v0.21.5 kod tabanı korundu.
- v0.21.8'deki motor çıkış devri / ileri hareket düzeltmesi bu tabana uygulandı.
- Motor RPM değeri tekerlek tarafındaki redüktör çıkış devri olarak kullanılıyor; hız hesabında ikinci kez redüksiyon oranına bölünmüyor.
- Oyuncu ve rakip ayarlarında devir alanı yeniden adlandırıldı.

# PARS SUMOLAB v0.21.5

## v0.21.5
- Ön sensör merkez algısı artık gerçek ön algı olarak sınıflandırılıyor; dar açı eşiği nedeniyle yavaş yan arama moduna düşmesi engellendi.
- Ön algıda oyuncu ve rakip robot tam ileri saldırı gücü kullanıyor; yön düzeltmesi küçük tutuluyor.
- Sayfa, paket ve kod şablonu sürüm bilgileri v0.21.5 olarak eşitlendi.

- Büyük ağırlık kontrol kartları kaldırıldı. Oyuncu ve rakip robotun toplam ağırlığı, sınıf limiti ve gövde/bileşen dağılımı ayarlar panelinde gövde ağırlığı kaydırıcısının hemen üstüne taşındı.

## v0.21.5
- Oyuncu robotunun ayrı alt bölümdeki ağırlık kontrol kartı kaldırıldı.
- Toplam ağırlık, sınıf limiti, gövde ve bileşen ağırlıkları oyuncu robotu ayar paneline taşındı.
- Oyuncu ve rakip robot için aynı tasarım ve aynı sırada ağırlık özeti gösteriliyor.
- Sayfa içindeki sürüm etiketleri, paket sürümü ve dağıtım notları v0.21.5 olarak güncellendi.

## v0.21.1
- Rakip robot ayar paneli, oyuncu robotu paneliyle aynı alanları ve aynı sıralamayı kullanacak şekilde düzenlendi.
- Rakip paneline aynı sırada dohyo sınıfı ve çapı kontrolleri eklendi; arena ölçüsü iki panelden de ortak yönetilir.

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


## v0.20.7
- Rakip robotun motor gücü, torku, RPM, redüksiyon, tekerlek, lastik, sınıf, bıçak, sensör ve ağırlık ayarları bağımsız fizik parametrelerine bağlandı.
- Rakip otonom algoritması DIP anahtarlarından bağımsız çalışır; kendi sensör sayısı ve görüş mesafesini kullanır.
- Çarpışma sırasında sürekli itme kuvveti motor torku, redüksiyon, tekerlek yarıçapı, lastik tutuşu ve iki robotun kütlesine göre hesaplanır.
- Robotların başlangıç konum ve yönleri tam ayna simetrisi olmayacak şekilde değiştirildi.
- Tüm robot ayarlarını kaydetmek için tek ana kayıt düğmesi bırakıldı.

## 0.20.8
- Fixed the source tree so the root Vite entrypoint loads the latest App, Arena, and styles files.
- Removed duplicated nested source directories.
- Restored the latest Arena implementation as the canonical application source.


## v0.21.0
- Oyuncu ve rakip için aynı ayar grupları aynı sıraya alındı: sensör sayısı/menzili, motor gücü, tork, redüksiyon, RPM, tekerlek çapı ve lastik tutuşu.
- Oyuncu motor gücü parametresi eklendi; iki robotun motor gücü simülasyondaki hız ve çekiş kuvvetine uygulanıyor.
- Motor torku ve redüksiyon ayarlarının etkisi daha görünür olacak şekilde motor-kuvvet/lastik tutuş dengesi yeniden ölçeklendi.
- Varsayılan başlangıç yerleşimi tam simetrik: robotlar aynı merkez çizgisinde, eşit uzaklıkta ve birbirlerine dönük başlar (90° / 270°). Sıfırlama da aynı konuma döner.
