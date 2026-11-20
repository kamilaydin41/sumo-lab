# PARS SUMO LAB v0.8.0

PARS SUMO LAB; sumo robotlarını tasarlamak, programlamak ve 3B dohyo üzerinde eğitim amaçlı mücadele ettirmek için geliştirilen tarayıcı tabanlı simülatördür.

## Bu sürümde
- Uygulama adı PARS SUMO LAB olarak güncellendi.
- Yönelimli dikdörtgen gövde çarpışması (OBB/SAT) ile robotların birbirinin içinden geçmesi önlendi.
- Çarpışma sonrası konum düzeltmesi, kütleye bağlı itiş ve momentum aktarımı eklendi.
- Ön kama teması rakibin altına girme ve itiş avantajı oluşturur.
- Çarpışma şiddeti ve yönüne bağlı pitch/roll hareketleriyle devrilme/takla görselleştirmesi eklendi.
- Dohyo dışına itilen robot merkez konumu sınırı geçtiğinde maç sona erer.
- Pico, Micro, Mini, 1 Kg, Klasik 1 Kg, Mega, Açık, LEGO ve RC sınıfları için boyut, kütle, hız ve donanım profilleri eklendi.
- Sınıf seçimi gövde ağırlığını, önerilen bileşenleri ve dohyo profilini otomatik değiştirir.
- RC, otonom, Arduino C++ ve 3'lü DIP-switch özellikleri korunmuştur.

## Fizik modelinin kapsamı
Bu sürüm 2B düzlemde yönelimli gövde çarpışması ve 3B görsel devrilme yaklaşımı kullanır. Kama ile altına girme, itme ve takla davranışları eğitim amaçlı yaklaşık modellerdir; gerçek rijit cisim fiziği, esnek deformasyon, gerçek tekerlek sürtünmesi ve tam temas geometrisi henüz modellenmemektedir. Yarışma kuralları ve ölçüler organizasyonun güncel teknik şartnamesinden doğrulanmalıdır.

## Geliştirme
```bash
npm install
npm run dev
```

Üretim derlemesi: `npm run build`
