# Vercel Güncelleme Rehberi - PARS SUMOLAB v0.11.0

1. `pars-sumo-lab-v0.11.0.zip` arşivini bilgisayarınıza indirin.
2. Arşivi açın ve proje dosyalarını GitHub deponuzdaki mevcut dosyalarla değiştirin.
3. `package.json` sürümünün `0.9.0` olduğunu kontrol edin.
4. GitHub commit mesajı olarak aşağıdaki Türkçe açıklamayı kullanabilirsiniz:

   `PARS SUMOLAB v0.11.0: Robot boyut profilleri ve DIP taktik seçimi`

5. Değişiklikleri Vercel projenizin bağlı olduğu dala gönderin. Otomatik dağıtım açıksa Vercel yeni sürümü oluşturur.
6. Yayınlandıktan sonra tarayıcı önbelleğini yenileyin ve sekme başlığında **PARS SUMOLAB** yazdığını kontrol edin.

## Kontrol listesi

- [ ] Sekme başlığı PARS SUMOLAB
- [ ] Micro Sumo boyutu 50 × 50 mm
- [ ] Mini Sumo boyutu 100 × 100 mm
- [ ] Diğer robot sınıflarında gövde ve tekerlek boyutları değişiyor
- [ ] DIP profil seçimi üç anahtarı güncelliyor
- [ ] DIP anahtarlarını tek tek değiştirmek taktik kodunu güncelliyor
- [ ] Otonom modda DIP taktiği davranışı değiştiriyor
- [ ] Arduino C++ kodunda D12, D13 ve A5 girişleri okunuyor


### v0.11.0 yenilikleri
Oyuncu ve rakip robotun başlangıç yönlerini simülasyon panelindeki “Robot yerleşimi ve yönü” bölümünden ayrı ayrı ayarlayabilirsiniz.


## v0.11.0 yeniliği

Simülasyon duraklatılmışken 3B dohyo üzerindeki oyuncu veya rakip robotun gövdesini fareyle ya da dokunmatik ekranda sürükleyerek başlangıç konumunu belirleyebilirsin. Açı ayarları ayrı panelden yapılır. Projeyi kaydettiğinde konum ve yön bilgileri birlikte saklanır.


## v0.12.0 güncellemesi

GitHub deposuna yeni ZIP içeriğini yükleyin ve şu commit mesajını kullanın:

`PARS SUMOLAB v0.12.0: Gerçekçi itiş ve devrilme fiziği`

Vercel dağıtımı tamamlandıktan sonra özellikle düz kafa kafaya temas, kama altına girme, yanal çarpışma ve dohyo dışına itme senaryolarını ayrı ayrı deneyin.
