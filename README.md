<div align="center">

# ✏️ OmniSketch

**Modern, minimalist ve kullanımı kolay bir çizim uygulaması**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[Demo](#demo) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Kullanım](#-kullanım) • [Teknolojiler](#-teknolojiler)

</div>

---

## 🎨 Özellikler

### 🖊️ Çizim Araçları
- **Kalem (Pen)** - Basınca duyarlı, doğal görünümlü serbest çizim
- **Dikdörtgen (Rectangle)** - Hassas dikdörtgen şekilleri
- **Daire (Circle)** - Mükemmel daireler ve elipsler
- **Çizgi (Line)** - Düz çizgiler
- **Ok (Arrow)** - Yönlü ok işaretleri
- **Silgi (Eraser)** - Seçici silme aracı

### 🎨 Renk Paleti
- **32 Önceden Tanımlı Renk** - Gökkuşağı tonlarında hazır renk seçenekleri
- **Özel Renk Seçici** - Sınırsız renk seçeneği için native color picker
- **Hızlı Erişim** - Tek tıkla renk değiştirme

### 📐 Canvas Kontrolleri
- **Yakınlaştır / Uzaklaştır** - %10 ile %500 arası zoom
- **Geri Al (Undo)** - Son işlemi geri al
- **Yinele (Redo)** - Geri alınan işlemi tekrarla
- **Temizle** - Canvas'ı tamamen temizle

### 💾 Dışa Aktarma
Çalışmalarınızı farklı formatlarda kaydedin:
- **PNG** - Şeffaf arka planlı yüksek kaliteli görüntü
- **JPG / JPEG** - Beyaz arka planlı sıkıştırılmış görüntü
- **SVG** - Vektör formatında ölçeklenebilir grafik

### 🔔 Bildirim Sistemi
- **Animasyonlu Toast Bildirimleri** - Yumuşak giriş/çıkış animasyonları
- **4 Farklı Bildirim Tipi** - Success, Error, Warning, Info
- **Otomatik Kapanma** - 3 saniye sonra otomatik kaybolma
- **Manuel Kapatma** - Tek tıkla kapatma seçeneği

### ✨ Kullanıcı Deneyimi
- **Minimalist Arayüz** - Temiz ve sade tasarım
- **Animasyonlu Paneller** - Akıcı açılış/kapanış efektleri
- **Responsive Tasarım** - Her ekran boyutuna uyumlu
- **Hover Efektleri** - İnteraktif geri bildirimler

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ veya Bun
- npm, yarn, pnpm veya bun paket yöneticisi

### Adımlar

1. **Repoyu klonlayın**
```bash
git clone https://github.com/username/omni-sketch.git
cd omni-sketch
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
bun install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
# veya
bun dev
```

4. **Tarayıcıda açın**
```
http://localhost:3000
```

---

## 📖 Kullanım

### Temel İşlemler

| İşlem | Nasıl Yapılır |
|-------|---------------|
| Çizim yapmak | Sol araç çubuğundan araç seçin ve canvas üzerinde sürükleyin |
| Renk değiştirmek | Araç çubuğundaki renk paletine tıklayın |
| Yakınlaştırma | Sağ üst köşedeki +/- butonlarını kullanın |
| Geri alma | Ctrl+Z veya geri al butonuna tıklayın |
| Dışa aktarma | "Çizimi İndir" butonuna tıklayıp format seçin |
| Silme | Silgi aracını seçip silmek istediğiniz elemana tıklayın |

### Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Ctrl + Z` | Geri Al |
| `Ctrl + Y` | Yinele |

---

## 🛠️ Teknolojiler

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| **Next.js 16** | React framework, App Router |
| **TypeScript** | Tip güvenliği |
| **Zustand** | Global state yönetimi |
| **perfect-freehand** | Doğal kalem çizgileri |
| **nanoid** | Benzersiz ID üretimi |
| **CSS Modules** | Scoped styling |

---

## 📁 Proje Yapısı

```
omni-sketch/
├── app/
│   ├── components/        # React bileşenleri
│   │   ├── Canvas.tsx     # Ana çizim alanı
│   │   ├── Toolbar.tsx    # Araç çubuğu
│   │   ├── Controls.tsx   # Zoom ve kontroller
│   │   ├── ColorPicker.tsx # Renk seçici
│   │   ├── ExportPanel.tsx # Dışa aktarma paneli
│   │   └── Toast.tsx      # Bildirim sistemi
│   ├── store/             # Zustand store'ları
│   │   ├── canvasStore.ts # Canvas state
│   │   └── toastStore.ts  # Toast state
│   ├── types/             # TypeScript tipleri
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── page.tsx           # Ana sayfa
│   └── globals.css        # Global stiller
├── public/                # Statik dosyalar
└── package.json
```

---

## 🎯 Gelecek Özellikler

- [ ] Gerçek zamanlı işbirlikçi çizim (Session sistemi)
- [ ] Katman desteği
- [ ] Metin aracı
- [ ] Şekil doldurma
- [ ] Görüntü içe aktarma
- [ ] Çizim geçmişi kaydetme

---

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<div align="center">

**OmniSketch** ile yaratıcılığınızı serbest bırakın! ✨

Made with ❤️ using Next.js

</div>
