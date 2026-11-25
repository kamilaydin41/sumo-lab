## v0.22.18
Reset butonu için Arena remount/resetKey mekanizması güncellendi.

v0.22.18 update: reset positions/heading are explicitly reapplied to simulation state; reset clears motion, tilt, counters, and match status.

# v0.22.18 güncellemesi
Sıfırlama tüm durumları temizler ve başlangıç yerleşimini uygular.

## v0.22.18
Pause hard-freeze: `running=false` iken fizik/temas/tilt/damping entegrasyonu atlanır, sahne render edilmeye devam eder. Başlatınca simülasyon devam eder.

## v0.22.18
Durdur düğmesi artık running değişimi nedeniyle robotların başlangıç konumuna snap etmesine yol açan yerleşim senkronizasyonunu tetiklemez.

## v0.22.18 güncellemesi
- Duraklatma sırasında robotların eğim/yaw fizik güncellemeleri de durur; duruş korunur.

## PARS SUMOLAB v0.22.18
- Temas noktasına bağlı yaklaşık yaw momenti ve tork etkisi eklendi.
- Yandan/kama köşesi temasları moment koluyla yön değişimine etki eder.
- Robot Ayarlarından bıçak tipi seçimi kaldırıldı; tek tip dar hassas bıçak sabitlendi.

## v0.22.18
IR ışınları artık simülasyon durumu bağımsız olarak açılıp kapatılabilir; koniler başlangıçta ve toggle sırasında oluşturulup güncellenir.

## v0.22.18
- IR ışınları kontrolü simülasyon toolbarına taşındı; simülasyon öncesi ve esnasında erişilebilir.

## v0.22.18 güncellemesi
Temas sürtünmesi ve burun-burun temasında kör pivot dönüş azaltma eklendi.

# PARS SUMOLAB v0.22.18 update
IR ray toggle fix and approximately 30-degree detection cone.

## v0.22.18 update
- Deploy this package to publish the IR sensor cone visualization.
- Update version number in the app and release notes for every future release.


## v0.22.18 update
IR sensor ray visualization and toggle are included.

# Vercel güncelleme rehberi – PARS SUMOLAB v0.22.18

Bu sürümde kafa kafaya itişte temasın korunması için ayırıcı bağıl hız sınırlandırıldı.

# Vercel güncelleme rehberi – PARS SUMOLAB v0.22.18

1. ZIP arşivini bilgisayarına indirip çıkar.
2. Proje dosyalarını GitHub deposundaki mevcut dosyalarla değiştir.
3. Aşağıdaki Türkçe commit mesajını kullan:

```text
PARS SUMOLAB v0.22.18: Ön sensör saldırı davranışını düzelt Oyuncu ve rakip ağırlık özetlerini eşitle
```

4. Değişiklikleri bağlı dala gönder. Vercel otomatik dağıtımı başlatır.
5. Dağıtım tamamlandığında oyuncu ve rakip ayar panellerindeki ağırlık özetlerinin aynı konumda göründüğünü; toplam kütle ve sınıf limitinin bileşen seçimleriyle güncellendiğini kontrol et.

Yerel kontrol için `npm install` ve `npm run build` komutlarını çalıştır.


## v0.22.18

Bu sürüm v0.21.5 tabanını korur ve yalnızca v0.21.8 motor çıkış devri düzeltmesini içerir.
