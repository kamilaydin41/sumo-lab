## v1.0.1
- Start/Durdur/Devam et düğmesi.
- SAT teması için boşluk toleransı kaldırıldı.
- Aşırı kama kaldırma ve eğim sınırlandı.

## PARS SUMOLAB v1.0.1

- Simülasyon duraklatıldığında fizik ve robot hareketi dondurulur; Devam et ile kaldığı yerden sürer.
- Duraklatma, robot yerleşimini ayarlara göre yeniden eşitleyip konumları sıçratmaz.

## PARS SUMOLAB v0.22.11
- Temas noktasına bağlı yaklaşık yaw momenti ve tork etkisi eklendi.
- Yandan/kama köşesi temasları moment koluyla yön değişimine etki eder.
- Robot Ayarlarından bıçak tipi seçimi kaldırıldı; tek tip dar hassas bıçak sabitlendi.

## v0.22.11
IR ışınları artık simülasyon durumu bağımsız olarak açılıp kapatılabilir; koniler başlangıçta ve toggle sırasında oluşturulup güncellenir.

## v0.22.11
- IR ışınları kontrolü simülasyon toolbarına taşındı; simülasyon öncesi ve esnasında erişilebilir.

## v0.22.11 güncellemesi
Temas sürtünmesi ve burun-burun temasında kör pivot dönüş azaltma eklendi.

# PARS SUMOLAB v0.22.11 update
IR ray toggle fix and approximately 30-degree detection cone.

## v0.22.11 update
- Deploy this package to publish the IR sensor cone visualization.
- Update version number in the app and release notes for every future release.


## v0.22.11 update
IR sensor ray visualization and toggle are included.

# Vercel güncelleme rehberi – PARS SUMOLAB v0.22.11

Bu sürümde kafa kafaya itişte temasın korunması için ayırıcı bağıl hız sınırlandırıldı.

# Vercel güncelleme rehberi – PARS SUMOLAB v0.22.11

1. ZIP arşivini bilgisayarına indirip çıkar.
2. Proje dosyalarını GitHub deposundaki mevcut dosyalarla değiştir.
3. Aşağıdaki Türkçe commit mesajını kullan:

```text
PARS SUMOLAB v0.22.11: Ön sensör saldırı davranışını düzelt Oyuncu ve rakip ağırlık özetlerini eşitle
```

4. Değişiklikleri bağlı dala gönder. Vercel otomatik dağıtımı başlatır.
5. Dağıtım tamamlandığında oyuncu ve rakip ayar panellerindeki ağırlık özetlerinin aynı konumda göründüğünü; toplam kütle ve sınıf limitinin bileşen seçimleriyle güncellendiğini kontrol et.

Yerel kontrol için `npm install` ve `npm run build` komutlarını çalıştır.


## v0.22.11

Bu sürüm v0.21.5 tabanını korur ve yalnızca v0.21.8 motor çıkış devri düzeltmesini içerir.
