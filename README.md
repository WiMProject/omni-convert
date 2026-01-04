
# 🚀 OmniConvert AI - Universal Document Intelligence

**OmniConvert AI** adalah aplikasi konverter dokumen berbasis kecerdasan buatan (AI) generasi terbaru yang memanfaatkan kekuatan **Google Gemini 3 API**. Aplikasi ini tidak sekadar mengubah ekstensi file, tetapi melakukan analisis struktural mendalam menggunakan Neural OCR untuk mempertahankan tata letak, tabel, dan format dokumen asli dengan akurasi tinggi.

![Version](https://img.shields.io/badge/version-5.0.1_Stable-blue?style=for-the-badge)
![Tech](https://img.shields.io/badge/Powered_By-Gemini_3_Flash/Pro-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Fitur Unggulan

- **📂 Konversi Multi-Format:** Mendukung PDF, DOCX, RTF, HTML, TXT, JSON, CSV, dan Markdown.
- **⚡ Turbo Mode (Gemini Flash):** Konversi super cepat untuk dokumen standar dalam hitungan detik.
- **🎯 Precision Mode (Gemini Pro):** Analisis mendalam untuk dokumen kompleks, tabel berlapis, dan tulisan tangan.
- **🌐 AI Translation:** Terjemahkan dokumen langsung ke berbagai bahasa (Inggris, Indonesia, Jepang, dll.) tanpa merusak format.
- **📝 Executive Summary:** Fitur unik untuk meringkas dokumen panjang secara otomatis menjadi poin-poin penting.
- **🎨 Premium UI/UX:** Antarmuka modern dengan *Glassmorphism design*, responsif, dan mendukung mode cetak (Print-to-PDF).
- **🔒 Privacy First:** Pemrosesan dokumen dilakukan secara aman melalui enkripsi end-to-end API.

---

## 🛠️ Arsitektur Teknologi

Aplikasi ini dibangun dengan *stack* modern untuk performa maksimal:

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom UI Components)
- **AI Engine:** [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini SDK)
- **Icons:** Custom SVG Logic (Lightweight)
- **Fonts:** Plus Jakarta Sans (Premium Typography)

---

## 🚀 Cara Menjalankan (Local Development)

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/omniconvert-ai.git
   cd omniconvert-ai
   ```

2. **Setup API Key**
   Pastikan kamu memiliki API Key dari [Google AI Studio](https://aistudio.google.com/).
   Aplikasi ini membaca key dari environment variable `process.env.API_KEY`.

3. **Install Dependencies & Run**
   ```bash
   npm install
   npm start
   ```

---

## 💡 Cara Kerja AI Engine

Aplikasi menggunakan alur kerja berikut:
1. **Extraction:** File dikonversi ke Base64.
2. **Analysis:** AI melakukan OCR dan identifikasi elemen (Header, Table, List).
3. **Synthesis:** Dokumen disusun ulang ke bahasa target dan format target (misal: menyusun string RTF valid atau HTML semantik).
4. **Delivery:** Hasil ditampilkan dalam preview interaktif dan siap diunduh.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---

## 👨‍💻 Kontribusi

Kontribusi selalu terbuka! Silakan fork repository ini dan buat pull request jika ingin menambahkan fitur baru atau memperbaiki bug.

---

**Copyright © 2026 OmniConvert Intelligence Labs.**  
*Powered by Neural Synthesis Technology.*
