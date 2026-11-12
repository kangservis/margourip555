import { muatBerita, muatBeritaTerbaru } from './data.js';
import { urlFoto, srcsetFoto } from './foto.js';

const slot = (akar, nama) => akar.querySelector(`[data-slot="${nama}"]`);

function wajibSlot(akar, nama) {
	const elemen = slot(akar, nama);
	if (!elemen) throw new Error(`Slot berita "${nama}" tidak ditemukan.`);
	return elemen;
}

function wajibTemplate(pemilih, nama) {
	const template = document.querySelector(pemilih);
	if (!(template instanceof HTMLTemplateElement)) {
		throw new Error(`Template ${nama} tidak ditemukan.`);
	}
	return template;
}

function buatDetail(berita) {
	const fragmen = wajibTemplate('#tpl-berita-detail', 'detail berita').content.cloneNode(true);
	const tanggal = wajibSlot(fragmen, 'tanggal');
	tanggal.textContent = berita.tanggalTampil;
	tanggal.setAttribute('datetime', berita.tanggalISO);
	wajibSlot(fragmen, 'judul').textContent = berita.judul;

	if (berita.foto) {
		const gambar = wajibSlot(fragmen, 'gambar');
		gambar.src = urlFoto(berita.foto, 1000);
		gambar.alt = `Foto ${berita.judul}`;

		const lightbox = wajibSlot(fragmen, 'lightbox');
		lightbox.dataset.besar = urlFoto(berita.foto, 1000);
		lightbox.dataset.alt = gambar.alt;
		lightbox.dataset.nama = berita.judul;
	} else {
		wajibSlot(fragmen, 'lightbox').remove();
	}

	if (berita.paragraf.length > 0) {
		const isi = wajibSlot(fragmen, 'isi');
		berita.paragraf.forEach((paragraf) => {
			const elemen = document.createElement('p');
			elemen.textContent = paragraf;
			isi.appendChild(elemen);
		});
	} else {
		wajibSlot(fragmen, 'isi').remove();
	}

	return fragmen;
}

function buatKartu(berita) {
	const kartu = wajibTemplate('#tpl-berita-kartu', 'kartu berita')
		.content.firstElementChild?.cloneNode(true);
	if (!(kartu instanceof HTMLElement)) throw new Error('Isi template kartu berita tidak ditemukan.');

	const tanggal = wajibSlot(kartu, 'tanggal');
	tanggal.textContent = berita.tanggalTampil;
	tanggal.setAttribute('datetime', berita.tanggalISO);
	wajibSlot(kartu, 'judul').textContent = berita.judul;

	if (berita.ringkasan) {
		wajibSlot(kartu, 'ringkasan').textContent = berita.ringkasan;
	} else {
		wajibSlot(kartu, 'ringkasan').remove();
	}

	if (berita.foto) {
		wajibSlot(kartu, 'foto-kosong').remove();
		const gambar = wajibSlot(kartu, 'foto');
		gambar.src = urlFoto(berita.foto, 640);
		gambar.srcset = srcsetFoto(berita.foto);
		gambar.alt = `Foto ${berita.judul}`;
	} else {
		wajibSlot(kartu, 'foto').remove();
		wajibSlot(kartu, 'foto-kosong').setAttribute('aria-label', `Placeholder foto ${berita.judul}`);
	}

	const templateDetail = kartu.querySelector('template[data-berita-detail]');
	if (!(templateDetail instanceof HTMLTemplateElement)) {
		throw new Error('Slot template detail berita tidak ditemukan.');
	}
	templateDetail.content.appendChild(buatDetail(berita));
	return kartu;
}

export function tampilkanDaftarBerita(wadah) {
	const daftar = wadah.querySelector('[data-berita-daftar]');
	const pesan = wadah.querySelector('[data-berita-pesan]');
	const ulang = wadah.querySelector('[data-berita-ulang]');
	if (!daftar || !pesan || !ulang) throw new Error('Elemen daftar berita tidak lengkap.');

	const penunggu = [...daftar.children].map((anak) => anak.cloneNode(true));

	async function muat() {
		daftar.setAttribute('aria-busy', 'true');
		pesan.hidden = true;
		ulang.hidden = true;
		daftar.replaceChildren(...penunggu.map((anak) => anak.cloneNode(true)));

		let berita;
		try {
			berita = await muatBerita();
		} catch (galat) {
			console.error('Gagal memuat berita:', galat instanceof Error ? galat.message : galat);
			daftar.replaceChildren();
			pesan.textContent = 'Berita belum dapat dimuat. Periksa koneksi lalu coba lagi.';
			pesan.hidden = false;
			ulang.hidden = false;
			daftar.setAttribute('aria-busy', 'false');
			return;
		}

		if (berita.length === 0) {
			daftar.replaceChildren();
			pesan.textContent = '[ISI NANTI: belum ada berita]';
			pesan.hidden = false;
		} else {
			const item = berita.map((b) => {
				const li = document.createElement('li');
				li.appendChild(buatKartu(b));
				return li;
			});
			daftar.replaceChildren(...item);
		}

		daftar.setAttribute('aria-busy', 'false');
	}

	ulang.addEventListener('click', () => void muat());
	void muat();
}

export function tampilkanBeritaTerbaru(wadah) {
	const isi = wadah.querySelector('[data-berita-isi]');
	const pesan = wadah.querySelector('[data-berita-pesan]');
	const ulang = wadah.querySelector('[data-berita-ulang]');
	if (!isi || !pesan || !ulang) throw new Error('Elemen berita terbaru tidak lengkap.');

	const penunggu = [...isi.childNodes].map((simpul) => simpul.cloneNode(true));

	async function muat() {
		pesan.hidden = true;
		ulang.hidden = true;
		isi.replaceChildren(...penunggu.map((simpul) => simpul.cloneNode(true)));

		let berita;
		try {
			berita = await muatBeritaTerbaru();
		} catch (galat) {
			console.error('Gagal memuat berita terbaru:', galat instanceof Error ? galat.message : galat);
			isi.replaceChildren();
			pesan.textContent = 'Berita belum dapat dimuat. Periksa koneksi lalu coba lagi.';
			pesan.hidden = false;
			ulang.hidden = false;
			return;
		}

		if (!berita) {
			isi.replaceChildren();
			pesan.textContent = '[ISI NANTI: belum ada berita]';
			pesan.hidden = false;
			return;
		}

		isi.replaceChildren(buatKartu(berita));
	}

	ulang.addEventListener('click', () => void muat());
	void muat();
}
