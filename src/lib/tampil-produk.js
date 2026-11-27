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

		// Galeri mini kartu: hanya aktifkan jika lebih dari 1 foto
		if (foto.length > 1) {
			const galeriWadah = kartu.querySelector('[data-kartu-galeri]');
			if (galeriWadah) {
				const daftarUrl = foto.map((url) => ({
					src: urlFoto(url, 640),
					srcset: srcsetFoto(url),
				}));
				galeriWadah.dataset.fotos = JSON.stringify(daftarUrl);
				galeriWadah.dataset.index = '0';
				galeriWadah.dataset.total = String(foto.length);

				const dotsWadah = galeriWadah.querySelector('[data-kartu-dots]');
				if (dotsWadah instanceof HTMLElement) {
					dotsWadah.classList.remove('hidden');
					dotsWadah.classList.add('flex');
					for (let i = 0; i < foto.length; i++) {
						const titik = document.createElement('span');
						titik.className = `size-1.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-ink/30'}`;
						titik.dataset.kartuDot = String(i);
						dotsWadah.appendChild(titik);
					}
				}
			}
		} else {
			// Jika hanya 1 foto, hapus elemen navigasi galeri kartu agar tidak muncul saat hover
			kartu.querySelectorAll('[data-kartu-prev], [data-kartu-next], [data-kartu-dots]').forEach((el) => el.remove());
		}
	} else {
		hapus(kartu, 'foto');
		wajibSlot(kartu, 'foto-kosong').setAttribute('aria-label', `Placeholder foto ${produk.nama}`);
		kartu.querySelectorAll('[data-kartu-prev], [data-kartu-next], [data-kartu-dots]').forEach((el) => el.remove());
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

// Galeri mini pada kartu produk: navigasi klik (panah), klik foto, dan sentuh (geser/swipe)
function pasangGaleriKartu(akar) {
	let touchStartX = null;
	let touchStartY = null;
	let touchTarget = null;
	let abaikanKlikSetelahGeser = false;
	let timerKlikGeser = 0;

	akar.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const galeriTarget = target.closest('[data-kartu-galeri]');
		if (abaikanKlikSetelahGeser && galeriTarget) {
			abaikanKlikSetelahGeser = false;
			clearTimeout(timerKlikGeser);
			event.stopPropagation();
			event.preventDefault();
			return;
		}

		const panahPrev = target.closest('[data-kartu-prev]');
		const panahNext = target.closest('[data-kartu-next]');
		if (panahPrev || panahNext) {
			event.stopPropagation();
			event.preventDefault();

			const wadah = (panahPrev || panahNext)?.closest('[data-kartu-galeri]');
			if (!(wadah instanceof HTMLElement)) return;
			const fotos = JSON.parse(wadah.dataset.fotos || '[]');
			const total = fotos.length;
			if (total < 2) return;

			let idx = Number(wadah.dataset.index) || 0;
			if (panahPrev) idx = (idx - 1 + total) % total;
			else idx = (idx + 1) % total;

			perbaruiGaleriKartu(wadah, fotos, idx);
			return;
		}

		// Klik foto biasa tetap membuka detail produk.
		if (galeriTarget) {
			const kartu = galeriTarget.closest('[data-produk-kartu]');
			const pemicuDetail = kartu?.querySelector('[data-produk-buka]');
			if (pemicuDetail instanceof HTMLElement) pemicuDetail.click();
		}
	});

	akar.addEventListener('touchstart', (event) => {
		abaikanKlikSetelahGeser = false;
		clearTimeout(timerKlikGeser);
		const galeri = event.target?.closest?.('[data-kartu-galeri]');
		if (!(galeri instanceof HTMLElement) || !galeri.dataset.fotos) return;
		if (event.touches.length !== 1) {
			touchStartX = null;
			touchStartY = null;
			touchTarget = null;
			return;
		}
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
		touchTarget = galeri;
	}, { passive: true });

	akar.addEventListener('touchend', (event) => {
		const touch = event.changedTouches[0];
		if (!touch || touchStartX === null || touchStartY === null || !(touchTarget instanceof HTMLElement)) return;
		const deltaX = touch.clientX - touchStartX;
		const deltaY = touch.clientY - touchStartY;
		const galeri = touchTarget;
		touchStartX = null;
		touchStartY = null;
		touchTarget = null;

		// Ambang batas geser horizontal 35px
		if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
			const fotos = JSON.parse(galeri.dataset.fotos || '[]');
			const total = fotos.length;
			if (total < 2) return;

			let idx = Number(galeri.dataset.index) || 0;
			idx = deltaX < 0 ? (idx + 1) % total : (idx - 1 + total) % total;
			perbaruiGaleriKartu(galeri, fotos, idx);
			abaikanKlikSetelahGeser = true;
			clearTimeout(timerKlikGeser);
			timerKlikGeser = setTimeout(() => {
				abaikanKlikSetelahGeser = false;
			}, 500);
		}
	}, { passive: true });

	akar.addEventListener('touchcancel', () => {
		touchStartX = null;
		touchStartY = null;
		touchTarget = null;
	});
}

function perbaruiGaleriKartu(wadah, fotos, idx) {
	wadah.dataset.index = String(idx);
	const gambar = wadah.querySelector('[data-slot="foto"]');
	if (gambar instanceof HTMLImageElement) {
		gambar.src = fotos[idx].src;
		gambar.srcset = fotos[idx].srcset || '';
	}

	wadah.querySelectorAll('[data-kartu-dot]').forEach((titik) => {
		const aktif = titik.dataset.kartuDot === String(idx);
		titik.classList.toggle('bg-primary', aktif);
		titik.classList.toggle('bg-ink/30', !aktif);
	});
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
			// Foto kartu pertama di daftar dimuat prioritas (kandidat LCP); sisanya tetap lazy.
			const fotoPertama = item[0]?.querySelector('img[data-slot="foto"]');
			if (fotoPertama) {
				fotoPertama.loading = 'eager';
				fotoPertama.fetchPriority = 'high';
			}
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
	pasangGaleriKartu(wadah);
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
	pasangGaleriKartu(wadah);
}
