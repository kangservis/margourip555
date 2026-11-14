import { muatStruktur } from './data.js';
import { urlFoto, srcsetFoto } from './foto.js';
import { judulTingkat } from './format.js';

const slot = (akar, nama) => akar.querySelector(`[data-slot="${nama}"]`);

function wajibTemplate(pemilih, nama) {
	const template = document.querySelector(pemilih);
	if (!(template instanceof HTMLTemplateElement)) {
		throw new Error(`Template ${nama} tidak ditemukan.`);
	}
	return template;
}

function buatKartu(anggota, besar) {
	const pemilih = besar ? '#tpl-anggota-kartu-besar' : '#tpl-anggota-kartu';
	const template = wajibTemplate(pemilih, 'kartu anggota');
	const kartu = template.content.firstElementChild?.cloneNode(true);
	if (!(kartu instanceof HTMLLIElement)) throw new Error('Isi template kartu anggota tidak valid.');

	const jabatan = slot(kartu, 'jabatan');
	const nama = slot(kartu, 'nama');
	if (!jabatan || !nama) throw new Error('Slot teks kartu anggota tidak lengkap.');
	jabatan.textContent = anggota.jabatan;
	nama.textContent = anggota.nama;

	if (anggota.foto) {
		const tautan = slot(kartu, 'foto-tautan');
		const gambar = slot(kartu, 'foto-gambar');
		if (!(tautan instanceof HTMLAnchorElement) || !(gambar instanceof HTMLImageElement)) {
			throw new Error('Slot foto kartu anggota tidak lengkap.');
		}
		const alt = `Foto ${anggota.jabatan} ${anggota.nama}`;
		tautan.href = urlFoto(anggota.foto, 1000);
		tautan.dataset.fotoJabatan = anggota.jabatan;
		tautan.dataset.fotoNama = anggota.nama;
		tautan.dataset.fotoAlt = alt;
		tautan.setAttribute('aria-label', `Lihat foto ${anggota.jabatan} lebih besar`);
		gambar.src = urlFoto(anggota.foto, besar ? 384 : 336);
		gambar.srcset = srcsetFoto(anggota.foto, besar ? [256, 384, 512] : [224, 336, 448]);
		gambar.alt = alt;
		slot(kartu, 'foto-kosong')?.remove();
	} else {
		slot(kartu, 'foto-tautan')?.remove();
		const kosong = slot(kartu, 'foto-kosong');
		if (!kosong) throw new Error('Slot placeholder foto anggota tidak ditemukan.');
		kosong.setAttribute('aria-label', `Placeholder foto ${anggota.jabatan}`);
		kosong.textContent = `[ISI NANTI: foto ${anggota.jabatan}]`;
	}

	return kartu;
}

function buatKelompok(tingkat, anggota) {
	const template = wajibTemplate('#tpl-tingkat', 'tingkat anggota');
	const kelompok = template.content.firstElementChild?.cloneNode(true);
	if (!(kelompok instanceof HTMLElement)) throw new Error('Isi template tingkat tidak valid.');
	const id = `tingkat-${tingkat}`;
	const judul = slot(kelompok, 'judul');
	const daftarTunggal = slot(kelompok, 'daftar-tunggal');
	const daftarBanyak = slot(kelompok, 'daftar-banyak');
	if (!(judul instanceof HTMLHeadingElement) || !(daftarTunggal instanceof HTMLUListElement) || !(daftarBanyak instanceof HTMLUListElement)) {
		throw new Error('Slot template tingkat tidak lengkap.');
	}

	kelompok.setAttribute('aria-labelledby', id);
	judul.id = id;
	judul.textContent = judulTingkat[tingkat] ?? `Tingkat ${tingkat}`;
	if (anggota.length === 1) {
		daftarBanyak.remove();
		daftarTunggal.appendChild(buatKartu(anggota[0], true));
	} else {
		daftarTunggal.remove();
		daftarBanyak.replaceChildren(...anggota.map((item) => buatKartu(item, false)));
	}
	return kelompok;
}

export function tampilkanStruktur(wadah) {
	const isi = wadah.querySelector('[data-struktur-isi]');
	const pesan = wadah.querySelector('[data-struktur-pesan]');
	const ulang = wadah.querySelector('[data-struktur-ulang]');
	if (!isi || !pesan || !ulang) throw new Error('Elemen struktur tidak lengkap.');

	const penunggu = [...isi.childNodes].map((simpul) => simpul.cloneNode(true));

	async function muat() {
		pesan.hidden = true;
		ulang.hidden = true;
		isi.setAttribute('aria-busy', 'true');
		isi.replaceChildren(...penunggu.map((simpul) => simpul.cloneNode(true)));

		let anggota;
		try {
			anggota = await muatStruktur();
		} catch (galat) {
			console.error('Gagal memuat struktur:', galat instanceof Error ? galat.message : galat);
			isi.replaceChildren();
			pesan.textContent = 'Struktur organisasi belum dapat dimuat. Periksa koneksi lalu coba lagi.';
			pesan.hidden = false;
			ulang.hidden = false;
			isi.setAttribute('aria-busy', 'false');
			return;
		}

		if (anggota.length === 0) {
			isi.replaceChildren();
			pesan.textContent = '[ISI NANTI: belum ada data pengurus]';
			pesan.hidden = false;
		} else {
			const kelompokkan = new Map();
			anggota.forEach((item) => {
				if (!kelompokkan.has(item.tingkat)) kelompokkan.set(item.tingkat, []);
				kelompokkan.get(item.tingkat).push(item);
			});
			const templatePenghubung = wajibTemplate('#tpl-penghubung', 'penghubung tingkat');
			const isiKelompok = [...kelompokkan.entries()].flatMap(([tingkat, anggotaTingkat], index) => {
				const kelompok = buatKelompok(tingkat, anggotaTingkat);
				if (index === 0) return [kelompok];
				const penghubung = templatePenghubung.content.firstElementChild?.cloneNode(true);
				if (!(penghubung instanceof HTMLElement)) throw new Error('Isi template penghubung tidak valid.');
				return [penghubung, kelompok];
			});
			isi.replaceChildren(...isiKelompok);
		}

		isi.setAttribute('aria-busy', 'false');
	}

	ulang.addEventListener('click', () => void muat());
	void muat();
}
