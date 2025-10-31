import { FormState } from '../types';

export const generateRpmPrompt = (formData: FormState): string => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const praktikPedagogisText = formData.praktikPedagogis
        .map((praktek, index) => `Pertemuan ${index + 1}: ${praktek}`)
        .join('; ');

    const dimensiLulusanText = formData.dimensiLulusan.join(', ');

    const pengalamanBelajarSections = formData.praktikPedagogis.map((praktek, index) => `
        <h4 class="sub-heading">Pertemuan Ke-${index + 1}</h4>
        <p><strong>Praktik Pedagogis:</strong> ${praktek}</p>
        <p class="list-item"><strong>a. Memahami (Kegiatan Awal):</strong> (Generate langkah pembuka yang detail: apersepsi, motivasi, penyampaian tujuan. Wajib mencerminkan prinsip "Berkesadaran, Bermakna, Menggembirakan")</p>
        <p class="list-item"><strong>b. Mengaplikasi (Kegiatan Inti):</strong> (Generate langkah pembelajaran rinci yang MENCERMINKAN SINTAKS dari praktik pedagogis '${praktek}' yang dipilih untuk pertemuan ini)</p>
        <p class="list-item"><strong>c. Refleksi (Kegiatan Penutup):</strong> (Generate langkah refleksi, umpan balik, kesimpulan, dan tindak lanjut)</p>
    `).join('');

    return `
    Anda adalah seorang ahli desainer pembelajaran dan pakar kurikulum di Indonesia.
    Tugas Anda adalah membuat Rencana Pengajaran Modul (RPM) dan Draf Presentasi yang sangat profesional, lengkap, dan siap pakai berdasarkan data yang diberikan.
    
    Data Input dari Pengguna:
    - Nama Satuan Pendidikan: ${formData.namaSatuanPendidikan}
    - Nama Guru: ${formData.namaGuru}
    - NIP Guru: ${formData.nipGuru}
    - Nama Kepala Sekolah: ${formData.namaKepalaSekolah}
    - NIP Kepala Sekolah: ${formData.nipKepalaSekolah}
    - Jenjang: ${formData.jenjang}
    - Kelas/Semester: ${formData.kelas} / ${formData.semester}
    - Mata Pelajaran: ${formData.mataPelajaran}
    - Materi Pelajaran: ${formData.materiPelajaran}
    - Capaian Pembelajaran (CP): ${formData.capaianPembelajaran}
    - Tujuan Pembelajaran: ${formData.tujuanPembelajaran}
    - Jumlah Pertemuan: ${formData.jumlahPertemuan}
    - Durasi Setiap Pertemuan: ${formData.durasiPertemuan}
    - Praktik Pedagogis per Pertemuan: ${praktikPedagogisText}
    - Dimensi Lulusan: ${dimensiLulusanText}

    Tugas: Hasilkan sebuah JSON object dengan dua kunci utama: "rpmHtml" dan "presentationJson".

    ATURAN KETAT UNTUK "rpmHtml":
    1.  Gunakan format HTML dengan DOCTYPE dan tag head berisi style yang meniru format penulisan ilmiah/skripsi (rata kanan-kiri, inden paragraf).
    2.  Ikuti struktur dan kelas CSS yang telah ditentukan dalam template di bawah ini dengan TEPAT. Ganti konten dalam kurung (...) dengan konten yang Anda hasilkan.
    3.  BAGIAN LKPD (WAJIB): Di bagian "Kegiatan / Soal-Soal", buat 3-5 soal/aktivitas relevan. Di dalam soal atau materinya, Anda HARUS MENYEMATKAN GAMBAR VISUAL SUNGGUHAN menggunakan tag <img>.
        -   CARI gambar yang relevan dari sumber bebas lisensi seperti Pexels, Unsplash, atau Pixabay.
        -   Gunakan URL gambar yang direct-link (hotlink) dalam atribut 'src'.
        -   WAJIB sertakan sumber gambar di bawahnya.
        -   Contoh Penyematan Gambar:
            <div class="image-wrapper">
                <img src="https://images.pexels.com/photos/12345/sample-image.jpeg" alt="Deskripsi gambar yang relevan dan kontekstual" style="max-width: 80%; height: auto; display: block; margin-left: auto; margin-right: auto; border: 1px solid #ccc; padding: 5px; margin-top: 10px; margin-bottom: 5px;" />
                <p class="image-source"><em>Sumber: Pexels.com</em></p>
            </div>
    4.  BLOK TANDA TANGAN (WAJIB): Buat blok tanda tangan di akhir dokumen persis seperti format yang diminta. Untuk [Lokasi Otomatis], tentukan kota yang relevan berdasarkan konteks sekolah di Indonesia, default ke 'Jakarta' jika tidak ada konteks.

    Struktur dan Isi untuk "rpmHtml":

    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Rencana Pengajaran Modul</title>
        <style>
            body {
                font-family: 'Times New Roman', Times, serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #333;
            }
            .container {
                padding: 0 1cm;
            }
            .main-title {
                text-align: center;
                font-weight: bold;
                font-size: 14pt;
                margin-bottom: 25px;
                text-transform: uppercase;
            }
            .section-title {
                font-weight: bold;
                font-size: 13pt;
                margin-top: 28px;
                margin-bottom: 14px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 4px;
            }
            .sub-heading {
                font-weight: bold;
                font-size: 12pt;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            p {
                text-align: justify;
                margin: 0 0 12px 0;
                text-indent: 2.5em;
            }
            /* Paragraf pertama dalam sebuah bagian tidak boleh menjorok ke dalam. */
            p:first-of-type,
            h2 + p,
            h3 + p,
            h4 + p {
                 text-indent: 0;
            }
            .list-item {
                padding-left: 2.5em;
                text-indent: -2.5em;
                text-align: justify;
                margin-bottom: 8px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
                font-size: 11pt;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
                vertical-align: top;
                overflow-wrap: break-word;
                word-break: break-word;
            }
            th {
                background-color: #f7f7f7;
                font-weight: bold;
                text-align: center;
            }
            .identity-table td:first-child {
                width: 30%;
                font-weight: bold;
                background-color: #f7f7f7;
            }
            .assessment-table {
                table-layout: fixed;
            }
            .assessment-table tbody tr:nth-child(even) {
                background-color: #fcfcfc;
            }
            .assessment-table th:nth-child(1), .assessment-table td:nth-child(1) { width: 45%; }
            .assessment-table th:nth-child(2), .assessment-table td:nth-child(2) { width: 15%; }
            .assessment-table th:nth-child(3), .assessment-table td:nth-child(3) { width: 40%; }
            .signature-block {
                margin-top: 60px;
                overflow: auto;
                width: 100%;
                page-break-inside: avoid;
            }
            .signature-left {
                float: left;
                width: 45%;
                text-align: center;
            }
            .signature-right {
                float: right;
                width: 45%;
                text-align: center;
            }
            .signature-name {
                font-weight: bold;
                text-decoration: underline;
                margin-top: 70px;
            }
            .image-wrapper {
                page-break-inside: avoid;
                text-align: center;
                margin: 20px 0;
            }
            .image-source {
                font-size: 10pt;
                font-style: italic;
                margin-top: 5px;
                text-align: center;
                text-indent: 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 class="main-title">RENCANA PENGAJARAN MODUL (RPM)</h2>
            
            <h3 class="section-title">1. Identitas</h3>
            <table class="identity-table">
                <tr>
                    <td>Nama Satuan Pendidikan</td>
                    <td>: ${formData.namaSatuanPendidikan}</td>
                </tr>
                <tr>
                    <td>Mata Pelajaran</td>
                    <td>: ${formData.mataPelajaran}</td>
                </tr>
                <tr>
                    <td>Kelas/Semester</td>
                    <td>: ${formData.kelas} / ${formData.semester}</td>
                </tr>
                <tr>
                    <td>Durasi Pertemuan</td>
                    <td>: ${formData.jumlahPertemuan} Pertemuan (${formData.durasiPertemuan} per pertemuan)</td>
                </tr>
            </table>

            <h3 class="section-title">2. Identifikasi</h3>
            <p class="list-item"><strong>a. Siswa:</strong> (Generate deskripsi singkat karakteristik umum siswa berdasarkan jenjang '${formData.jenjang}' dan kelas '${formData.kelas}')</p>
            <p class="list-item"><strong>b. Materi Pelajaran:</strong> ${formData.materiPelajaran}</p>
            <p class="list-item"><strong>c. Capaian Dimensi Lulusan:</strong> ${dimensiLulusanText}</p>

            <h3 class="section-title">3. Desain Pembelajaran</h3>
            <p class="list-item"><strong>a. Capaian Pembelajaran:</strong> ${formData.capaianPembelajaran}</p>
            <p class="list-item"><strong>b. Lintas Disiplin Ilmu:</strong> (Generate saran 2-3 mapel lain yang relevan secara logis)</p>
            <p class="list-item"><strong>c. Tujuan Pembelajaran:</strong> ${formData.tujuanPembelajaran}</p>
            <p class="list-item"><strong>d. Topik Pembelajaran:</strong> (Generate rincian/pemecahan topik dari Materi Pelajaran)</p>
            <p class="list-item"><strong>e. Praktik Pedagogis per Pertemuan:</strong> ${praktikPedagogisText}</p>
            <p class="list-item"><strong>f. Kemitraan Pembelajaran:</strong> (Generate saran kontekstual, misal: "Orang tua sebagai narasumber profesi", "Kunjungan virtual ke museum")</p>
            <p class="list-item"><strong>g. Lingkungan Pembelajaran:</strong> (Generate saran lingkungan fisik/non-fisik yang mendukung praktik pedagogis)</p>
            <p class="list-item"><strong>h. Pemanfaatan Digital:</strong> (Generate referensi tools online spesifik dengan tautan, misal: "Padlet (padlet.com) untuk kolaborasi", "Phet Simulations (phet.colorado.edu) untuk inkuiri")</p>

            <h3 class="section-title">4. Pengalaman Belajar (Per Pertemuan)</h3>
            ${pengalamanBelajarSections}

            <h3 class="section-title">5. Asesmen Pembelajaran</h3>
            <p class="list-item"><strong>a. Asesmen Awal (Diagnostik/Apersepsi):</strong> (Generate contoh spesifik: "Pertanyaan pemantik lisan...", "Kuis singkat 3 soal via Google Form...")</p>
            <p class="list-item"><strong>b. Asesmen Proses (Formatif):</strong> (Generate contoh spesifik: "Rubrik observasi diskusi kelompok", "Lembar ceklis presentasi...")</p>
            <p class="list-item"><strong>c. Asesmen Akhir (Sumatif):</strong> (Generate contoh spesifik: "Produk proyek akhir", "Presentasi portolio digital...")</p>
            
            <div id="lkpd-section" style="page-break-before: always;">
                <h3 class="section-title">6. Lampiran: Lembar Kerja Peserta Didik (LKPD)</h3>
                <h4 class="sub-heading" style="text-align: center;">LEMBAR KERJA PESERTA DIDIK (LKPD)</h4>
                <p><strong>Judul LKPD:</strong> (Generate judul yang relevan dengan materi)</p>
                <p><strong>Petunjuk Pengerjaan:</strong> (Generate petunjuk yang jelas)</p>
                <p><strong>Tabel Kisi-Kisi Asesmen:</strong></p>
                <table class="assessment-table">
                    <thead>
                        <tr>
                            <th>Indikator</th>
                            <th>Bentuk Soal</th>
                            <th>Kunci/Rubrik</th>
                        </tr>
                    </thead>
                    <tbody>
                        (Generate 2-3 baris untuk kisi-kisi asesmen, isi dalam tag <tr><td>...</td><td>...</td><td>...</td></tr>)
                    </tbody>
                </table>
                <p><strong>Kegiatan / Soal-Soal:</strong></p>
                (Generate 3-5 soal/aktivitas. WAJIB sisipkan gambar visual nyata dengan tag <img> dan sumbernya di sini.)
            </div>

            <div class="signature-block">
                <div class="signature-left">
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <p class="signature-name">${formData.namaKepalaSekolah}</p>
                    <p>NIP. ${formData.nipKepalaSekolah}</p>
                </div>
                <div class="signature-right">
                    <p>[Lokasi Otomatis], ${today}</p>
                    <p>Guru Mata Pelajaran</p>
                    <p class="signature-name">${formData.namaGuru}</p>
                    <p>NIP. ${formData.nipGuru}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};