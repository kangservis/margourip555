import { urlFoto } from '../foto.js';
import { tampilkanToast } from './ui.js';
import { unggahFoto } from './foto.js';

function buatObjectUrl(berkas) {
	return URL.createObjectURL(berkas);
}

export function buatGaleri(wadah, { maks = 5, denganKeterangan = false, tandaiSampul = false, saatUbah = () => {} } = {}) {
	const template = document.querySelector('#tpl-galeri');
	const templateItem = document.querySelector('#tpl-galeri-item');
	if (!(template instanceof HTMLTemplateElement) || !(templateItem instanceof HTMLTemplateElement)) {
		throw new Error('Template galeri foto tidak ditemukan.');
	}

	wadah.replaceChildren(template.content.cloneNode(true));
	const input = wadah.querySelector('[data-slot="input"]');
	const daftar = wadah.querySelector('[data-slot="daftar"]');
	const batas = wadah.querySelector('[data-slot="batas"]');
	if (!(input instanceof HTMLInputElement) || !(daftar instanceof HTMLUListElement) || !batas) {
		throw new Error('Elemen template galeri foto tidak lengkap.');
	}

	input.multiple = maks > 1;
	batas.textContent = maks === 1
		? 'Satu foto. Memilih foto baru menggantikan yang lama. Foto diperkecil otomatis.'
		: `Maksimal ${maks} foto. Foto diperkecil otomatis.`;

	let item = [];
	let idBerikut = 0;
	let kotor = false;

	function bebaskan(itemFoto) {
		if (itemFoto.jenis === 'baru' && itemFoto.pratinjau) URL.revokeObjectURL(itemFoto.pratinjau);
	}

	function bebaskanSemua() {
		item.forEach(bebaskan);
	}

	function render() {
		const baris = item.map((foto, indeks) => {
			const elemen = templateItem.content.firstElementChild?.cloneNode(true);
			if (!(elemen instanceof HTMLLIElement)) throw new Error('Template item galeri tidak valid.');
			elemen.dataset.index = String(indeks);
			elemen.dataset.id = String(foto.id);
			const gambar = elemen.querySelector('[data-slot="gambar"]');
			const nomor = elemen.querySelector('[data-slot="nomor"]');
			const tombolKiri = elemen.querySelector('[data-aksi="kiri"]');
			const tombolKanan = elemen.querySelector('[data-aksi="kanan"]');
			if (!(gambar instanceof HTMLImageElement) || !nomor || !(tombolKiri instanceof HTMLButtonElement) || !(tombolKanan instanceof HTMLButtonElement)) {
				throw new Error('Slot item galeri tidak lengkap.');
			}
			gambar.src = foto.pratinjau;
			gambar.alt = `Foto ${indeks + 1}`;
			nomor.textContent = String(indeks + 1);
			if (foto.jenis !== 'baru') elemen.querySelector('[data-slot="baru"]')?.remove();
			if (!tandaiSampul || indeks !== 0) elemen.querySelector('[data-slot="sampul"]')?.remove();
			const keteranganWadah = elemen.querySelector('[data-slot="keterangan-wadah"]');
			if (!denganKeterangan) {
				keteranganWadah?.remove();
			} else {
				const keterangan = elemen.querySelector('[data-slot="keterangan"]');
				if (keterangan instanceof HTMLInputElement) keterangan.value = foto.alt;
			}
			tombolKiri.disabled = indeks === 0;
			tombolKanan.disabled = indeks === item.length - 1;
			return elemen;
		});
		daftar.replaceChildren(...baris);
	}

	function setFoto(daftarFoto) {
		bebaskanSemua();
		item = daftarFoto.map((foto) => ({
			id: idBerikut++,
			jenis: 'lama',
			url: foto.url,
			berkas: null,
			pratinjau: urlFoto(foto.url, 480),
			alt: foto.alt ?? '',
			rasio: foto.rasio ?? null,
		}));
		kotor = false;
		render();
	}

	input.addEventListener('change', () => {
		const berkasDipilih = [...(input.files ?? [])].filter((berkas) => berkas.type.startsWith('image/'));
		if (berkasDipilih.length === 0) {
			input.value = '';
			return;
		}
		if (maks === 1) {
			bebaskanSemua();
			const berkas = berkasDipilih[0];
			item = [{
				id: idBerikut++,
				jenis: 'baru',
				url: '',
				berkas,
				pratinjau: buatObjectUrl(berkas),
				alt: '',
				rasio: null,
			}];
		} else {
			const sisa = maks - item.length;
			if (sisa <= 0) {
				tampilkanToast(`Maksimal ${maks} foto.`, 'galat');
				input.value = '';
				return;
			}
			const yangDitambahkan = berkasDipilih.slice(0, sisa);
			if (berkasDipilih.length > sisa) {
				tampilkanToast(`Hanya ${sisa} foto yang ditambahkan (maksimal ${maks}).`, 'galat');
			}
			yangDitambahkan.forEach((berkas) => {
				item.push({
					id: idBerikut++,
					jenis: 'baru',
					url: '',
					berkas,
					pratinjau: buatObjectUrl(berkas),
					alt: '',
					rasio: null,
				});
			});
		}
		input.value = '';
		kotor = true;
		render();
		saatUbah();
	});

	daftar.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const tombol = target.closest('button[data-aksi]');
		const baris = tombol?.closest('[data-item]');
		const indeks = Number(baris?.dataset.index);
		const aksi = tombol?.dataset.aksi;
		if (!tombol || !baris || !Number.isInteger(indeks) || indeks < 0 || indeks >= item.length) return;

		if (aksi === 'kiri' && indeks > 0) {
			[item[indeks - 1], item[indeks]] = [item[indeks], item[indeks - 1]];
		} else if (aksi === 'kanan' && indeks < item.length - 1) {
			[item[indeks], item[indeks + 1]] = [item[indeks + 1], item[indeks]];
		} else if (aksi === 'hapus') {
			bebaskan(item[indeks]);
			item.splice(indeks, 1);
		} else {
			return;
		}

		kotor = true;
		saatUbah();
		render();
		if (aksi !== 'hapus') {
			const indeksBaru = item.findIndex((foto) => foto.id === Number(baris.dataset.id));
			const tujuan = indeksBaru;
			const tombolFokus = daftar.querySelector(`[data-item][data-index="${tujuan}"] [data-aksi="${aksi}"]`);
			const tombolAlternatif = daftar.querySelector(`[data-item][data-index="${indeksBaru}"] [data-aksi="${aksi === 'kiri' ? 'kanan' : 'kiri'}"]`);
			(tombolFokus instanceof HTMLButtonElement && !tombolFokus.disabled ? tombolFokus : tombolAlternatif)?.focus();
		}
	});

	daftar.addEventListener('input', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || !target.matches('[data-slot="keterangan"]')) return;
		const baris = target.closest('[data-item]');
		const indeks = Number(baris?.dataset.index);
		if (!Number.isInteger(indeks) || indeks < 0 || indeks >= item.length) return;
		item[indeks].alt = target.value;
		kotor = true;
		saatUbah();
	});

	function tandaiBersih() {
		kotor = false;
		render();
	}

	async function unggahSemua(saatProgres = () => {}) {
		const total = item.filter((foto) => foto.jenis === 'baru').length;
		let ke = 0;
		for (const foto of item) {
			if (foto.jenis !== 'baru') continue;
			ke++;
			saatProgres(ke, total);
			const { url, rasio } = await unggahFoto(foto.berkas);
			bebaskan(foto);
			foto.jenis = 'lama';
			foto.url = url;
			foto.pratinjau = urlFoto(url, 480);
			foto.rasio = rasio;
			foto.berkas = null;
			render();
		}
		return item.map(({ url, alt, rasio }) => ({ url, alt: alt.trim(), rasio }));
	}

	function bersihkan() {
		bebaskanSemua();
		item = [];
		kotor = false;
		render();
	}

	render();
	return {
		setFoto,
		ambilFoto: () => item.map((foto) => ({ ...foto })),
		jumlah: () => item.length,
		adaBelumTersimpan: () => kotor,
		tandaiBersih,
		unggahSemua,
		bersihkan,
	};
}
