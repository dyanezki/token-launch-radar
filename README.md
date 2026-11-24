# Token Launch Radar

Dashboard offline untuk membandingkan valuasi hipotetis protokol yang belum mencatat token dalam snapshot DefiLlama dari bounty make.fun. Arsip proyek menyertakan `Token-Launch-Radar.html`, yang dapat dibuka langsung setelah diekstrak.

## Membangun ulang

Gunakan Node.js 22.18 atau lebih baru. Dari folder proyek, jalankan:

```sh
node main.ts --input input --output out --preview
```

Buka `out/dashboard/index.html`. Folder `out` juga memuat papan peringkat `board.json` dan dataset halaman `data.js`.

## Cara membaca papan

Watchlist berasal dari snapshot resmi. Bagian Early menambahkan kandidat di bawah ambang TVL yang lolos pemeriksaan simbol, ID CoinGecko, kapitalisasi, kategori, dan nama. Data untuk menyimpulkan hubungan induk setiap protokol tambahan terbatas. Tab Live token menampilkan pembanding yang sudah mencatat token.

Nilai dasar menggunakan TVL dikali rasio kapitalisasi pasar terhadap TVL protokol pembanding. Rasio individu dibatasi antara 0,03 dan 3. Median kategori dan median global digabung secara geometris, dengan bobot kategori sebesar `n / (n + 8)`. Penyesuaian berikutnya menggunakan perubahan TVL tujuh hari dan waktu sejak pencatatan. Jendela detail menunjukkan jumlah pembanding, bobot kategori, dan nilai yang dihitung ulang. Rencana farming meminta pemeriksaan syarat kampanye dan biaya aktual sebelum tindakan apa pun.

## Tangkapan layar dan dossier

Untuk menyiapkan lingkungan pengambilan gambar, jalankan dari folder proyek:

```sh
npm install
npx playwright-core install chromium
npm run capture
node main.ts --input input --output out
```

Skrip capture menguji jumlah baris, detail protokol dan filter Lending, lalu menyimpan tiga gambar asli ke `screenshots/`. Setelah ketiga gambar tersedia, build standar menghasilkan `out/dossier.json` dengan pustaka resmi. Lingkungan penilaian dapat langsung menjalankan `node main.ts` dengan snapshot di `/input` dan direktori hasil di `/output`.
