import { muatProduk, muatProdukUnggulan } from './data.js';
import { urlFoto, srcsetFoto } from './foto.js';
import { getContactLink, siteConfig } from '../config/site.js';

const slot = (akar, nama) => akar.querySelector(`[data-slot="${nama}"]`);

function hapus(akar, ...nama) {
	nama.forEach((item) => {
		akar.querySelectorAll(`[data-slot="${item}"]`).forEach((elemen) => elemen.remove());
	});
}

function wajibSlot(akar, nama) {
	const elemen = slot(akar, nama);
	if (!elemen) throw new Error(`Slot produk "${nama}" tidak ditemukan.`);
	return elemen;
}

function isiWa(tombol, produk) {
	tombol.href = getContactLink(produk.pesanWa);
	if (siteConfig.whatsapp) {
		tombol.target = '_blank';
		tombol.rel = 'noopener noreferrer';
	} else {
		tombol.removeAttribute('target');
		tombol.removeAttribute('rel');
	}
	wajibSlot(tombol, 'wa-label').textContent = produk.statusInfo.tombol;
}

function isiHarga(akar, produk) {
	if (produk.hargaTampil) {
		wajibSlot(akar, 'harga-angka').textContent = produk.hargaTampil;
		if (produk.satuan) {
			wajibSlot(akar, 'harga-satuan').textContent = `/ ${produk.satuan}`;
		} else {
			hapus(akar, 'harga-satuan');
		}
		hapus(akar, 'harga-kosong');
	} else {
		hapus(akar, 'harga');
	}
}

function buatDetail(produk) {
	const template = document.querySelector('#tpl-produk-detail');
	if (!(template instanceof HTMLTemplateElement)) {
		throw new Error('Template detail produk tidak ditemukan.');
	}

	const fragmen = template.content.cloneNode(true);
	wajibSlot(fragmen, 'kategori').textContent = produk.kategori;
	wajibSlot(fragmen, 'nama').textContent = produk.nama;

	if (!produk.unggulan) hapus(fragmen, 'badge-unggulan');
	const badgeStatus = {
		tersedia: 'badge-tersedia',
		'pre-order': 'badge-preorder',
		habis: 'badge-habis',
	}[produk.status];
	for (const badge of ['badge-tersedia', 'badge-preorder', 'badge-habis']) {
		if (badge !== badgeStatus) hapus(fragmen, badge);
	}

	isiHarga(fragmen, produk);

	if (produk.ringkasan) {
		wajibSlot(fragmen, 'ringkasan').textContent = produk.ringkasan;
	} else {
		hapus(fragmen, 'ringkasan');
	}
	if (produk.deskripsi) {
		wajibSlot(fragmen, 'deskripsi').textContent = produk.deskripsi;
	} else {
		hapus(fragmen, 'deskripsi');
	}

	const rincian = [
		['rincian-satuan', produk.satuan],
		['rincian-minimal', produk.minimalPesan],
		['rincian-produsen', produk.produsen],
	];
	for (const [nama, nilai] of rincian) {
		if (nilai) {
			const baris = slot(fragmen, nama);
			if (!baris) throw new Error(`Baris rincian produk "${nama}" tidak ditemukan.`);
			wajibSlot(baris, 'nilai').textContent = nilai;
		} else {
			hapus(fragmen, nama);
		}
	}
	if (rincian.every(([, nilai]) => !nilai)) hapus(fragmen, 'rincian');

	const foto = Array.isArray(produk.foto) ? produk.foto : [];
	if (foto.length === 0) {
		hapus(fragmen, 'galeri');
		wajibSlot(fragmen, 'foto-kosong').setAttribute('aria-label', `Placeholder foto ${produk.nama}`);
	} else {
		hapus(fragmen, 'foto-kosong');
		const daftar = foto.map((url, index) => ({
			besar: urlFoto(url, 1000),
			alt: foto.length > 1
				? `Foto ${produk.nama} (${index + 1} dari ${foto.length})`
				: `Foto ${produk.nama}`,
		}));
		const galeri = wajibSlot(fragmen, 'galeri');
		galeri.dataset.fotos = JSON.stringify(daftar);
		galeri.dataset.index = '0';

		const gambar = wajibSlot(fragmen, 'gambar');
		gambar.src = daftar[0].besar;
		gambar.alt = daftar[0].alt;

		const pemicuLightbox = fragmen.querySelector('[data-lightbox-buka]');
		if (!pemicuLightbox) throw new Error('Pemicu lightbox produk tidak ditemukan.');
		pemicuLightbox.dataset.besar = daftar[0].besar;
		pemicuLightbox.dataset.alt = daftar[0].alt;
		pemicuLightbox.dataset.nama = produk.nama;

		if (foto.length <= 1) hapus(fragmen, 'panah');
	}

	isiWa(wajibSlot(fragmen, 'wa'), produk);
	return fragmen;
}

function buatKartu(produk) {
	const template = document.querySelector('#tpl-produk-kartu');
	if (!(template instanceof HTMLTemplateElement)) {
		throw new Error('Template kartu produk tidak ditemukan.');
	}

	const kartu = template.content.firstElementChild?.cloneNode(true);
	if (!(kartu instanceof HTMLElement)) throw new Error('Isi template kartu produk tidak ditemukan.');

	wajibSlot(kartu, 'kategori').textContent = produk.kategori;
	wajibSlot(kartu, 'nama').textContent = produk.nama;
	if (!produk.unggulan) hapus(kartu, 'badge-unggulan');
	if (produk.status !== 'pre-order') hapus(kartu, 'badge-preorder');
	if (produk.status !== 'habis') hapus(kartu, 'badge-habis');
	isiHarga(kartu, produk);

	const foto = Array.isArray(produk.foto) ? produk.foto : [];
	if (foto.length > 0) {
		hapus(kartu, 'foto-kosong');
		const gambar = wajibSlot(kartu, 'foto');
		gambar.src = urlFoto(foto[0], 640);
		gambar.srcset = srcsetFoto(foto[0]);
		gambar.alt = `Foto ${produk.nama}`;
	} else {
		hapus(kartu, 'foto');
		wajibSlot(kartu, 'foto-kosong').setAttribute('aria-label', `Placeholder foto ${produk.nama}`);
	}

	isiWa(wajibSlot(kartu, 'wa'), produk);
	const templateDetail = kartu.querySelector('template[data-produk-detail]');
	if (!(templateDetail instanceof HTMLTemplateElement)) {
		throw new Error('Slot template detail produk tidak ditemukan.');
	}
	templateDetail.content.appendChild(buatDetail(produk));
	return kartu;
}

function buatChip(teks, kategori, aktif) {
	const template = document.querySelector('#tpl-produk-chip');
	if (!(template instanceof HTMLTemplateElement)) throw new Error('Template filter kategori tidak ditemukan.');

	const chip = template.content.firstElementChild?.cloneNode(true);
	if (!(chip instanceof HTMLButtonElement)) throw new Error('Isi template filter kategori tidak ditemukan.');
	chip.dataset.kategori = kategori;
	chip.setAttribute('aria-pressed', String(aktif));
	chip.textContent = teks;
	return chip;
}

export function tampilkanDaftarProduk(wadah) {
	const daftar = wadah.querySelector('[data-produk-daftar]');
	const filterWadah = wadah.querySelector('[data-produk-filter-wadah]');
	const filter = wadah.querySelector('[data-produk-filter]');
	const pesan = wadah.querySelector('[data-produk-pesan]');
	const ulang = wadah.querySelector('[data-produk-ulang]');
	if (!daftar || !filterWadah || !filter || !pesan || !ulang) {
		throw new Error('Elemen katalog produk tidak lengkap.');
	}

	const penunggu = [...daftar.children].map((anak) => anak.cloneNode(true));

	async function muat() {
		daftar.setAttribute('aria-busy', 'true');
		pesan.hidden = true;
		ulang.hidden = true;
		filter.replaceChildren();
		filterWadah.hidden = true;
		daftar.replaceChildren(...penunggu.map((anak) => anak.cloneNode(true)));

		let produk;
		try {
			produk = await muatProduk();
		} catch (galat) {
			console.error('Gagal memuat produk:', galat instanceof Error ? galat.message : galat);
			daftar.replaceChildren();
			pesan.textContent = 'Produk belum dapat dimuat. Periksa koneksi lalu coba lagi.';
			pesan.hidden = false;
			ulang.hidden = false;
			daftar.setAttribute('aria-busy', 'false');
			return;
		}

		if (produk.length === 0) {
			daftar.replaceChildren();
			pesan.textContent = '[ISI NANTI: produk belum tersedia]';
			pesan.hidden = false;
		} else {
			const item = produk.map((p) => {
				const li = document.createElement('li');
				li.dataset.produkItem = '';
				li.dataset.kategori = p.kategori;
				li.appendChild(buatKartu(p));
				return li;
			});
			daftar.replaceChildren(...item);

			const kategori = [...new Set(produk.map((p) => p.kategori).filter(Boolean))];
			if (kategori.length >= 2) {
				filter.append(buatChip('Semua', '', true));
				kategori.forEach((nama) => filter.append(buatChip(nama, nama, false)));
				filterWadah.hidden = false;
			}
		}

		daftar.setAttribute('aria-busy', 'false');
	}

	filter.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const chip = target.closest('[data-filter-chip]');
		if (!chip || !filter.contains(chip)) return;

		const kategoriAktif = chip.dataset.kategori ?? '';
		filter.querySelectorAll('[data-filter-chip]').forEach((item) => {
			item.setAttribute('aria-pressed', String(item === chip));
		});
		daftar.querySelectorAll('li[data-produk-item]').forEach((item) => {
			item.hidden = kategoriAktif !== '' && item.dataset.kategori !== kategoriAktif;
		});
	});

	ulang.addEventListener('click', () => void muat());
	void muat();
}

export function tampilkanProdukUnggulan(wadah) {
	const isi = wadah.querySelector('[data-produk-isi]');
	const pesan = wadah.querySelector('[data-produk-pesan]');
	const ulang = wadah.querySelector('[data-produk-ulang]');
	if (!isi || !pesan || !ulang) throw new Error('Elemen produk unggulan tidak lengkap.');

	const penunggu = [...isi.childNodes].map((simpul) => simpul.cloneNode(true));

	async function muat() {
		pesan.hidden = true;
		ulang.hidden = true;
		isi.replaceChildren(...penunggu.map((simpul) => simpul.cloneNode(true)));

		let produk;
		try {
			produk = await muatProdukUnggulan();
		} catch (galat) {
			console.error('Gagal memuat produk unggulan:', galat instanceof Error ? galat.message : galat);
			isi.replaceChildren();
			pesan.textContent = 'Produk belum dapat dimuat. Periksa koneksi lalu coba lagi.';
			pesan.hidden = false;
			ulang.hidden = false;
			return;
		}

		if (!produk) {
			isi.replaceChildren();
			pesan.textContent = '[ISI NANTI: belum ada produk]';
			pesan.hidden = false;
			return;
		}

		isi.replaceChildren(buatKartu(produk));
	}

	ulang.addEventListener('click', () => void muat());
	void muat();
}
