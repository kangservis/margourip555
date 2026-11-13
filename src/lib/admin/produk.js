import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	where,
	writeBatch,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { buatGaleri } from './galeri.js';
import { tampilkanToast, konfirmasi } from './ui.js';
import { buatSlug, formatHarga, statusProduk } from '../format.js';
import { urlAman, urlFoto } from '../foto.js';

let daftar = [];
let galeri = null;
let idEdit = null;
let kotor = false;
let sedangSimpan = false;
let sudahMulai = false;
let pemuatanDaftar = 0;
let sesiProduk = 0;
const sedangHapus = new Set();

let cariEl;
let filterEl;
let tambahEl;
let jumlahEl;
let daftarEl;
let pesanEl;
let ulangEl;
let dialogEl;
let formEl;
let judulFormEl;
let statusFormEl;
let simpanEl;
let batalEl;
let tutupEl;
let wadahGaleriEl;
let datalistEl;

function teks(nilai) {
	return typeof nilai === 'string' ? nilai : '';
}

function petakanData(id, data) {
	const nama = teks(data.nama).trim();
	if (!nama) return null;
	const status = Object.prototype.hasOwnProperty.call(statusProduk, data.status)
		? data.status
		: 'tersedia';
	return {
		id,
		nama,
		slug: teks(data.slug) || buatSlug(nama) || 'produk',
		kategori: teks(data.kategori),
		ringkasan: teks(data.ringkasan),
		deskripsi: teks(data.deskripsi),
		harga: typeof data.harga === 'number' && Number.isFinite(data.harga) ? data.harga : null,
		satuan: teks(data.satuan),
		minimalPesan: teks(data.minimalPesan),
		produsen: teks(data.produsen),
		status,
		unggulan: Boolean(data.unggulan),
		urutan: typeof data.urutan === 'number' && Number.isFinite(data.urutan) ? data.urutan : 9999,
		foto: Array.isArray(data.foto) ? data.foto.map(urlAman).filter(Boolean).slice(0, 5) : [],
	};
}

function petakan(snapshotDoc) {
	return petakanData(snapshotDoc.id, snapshotDoc.data());
}

function urut() {
	daftar.sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama));
}

function ambilInput(nama) {
	const elemen = formEl?.querySelector(`[name="${nama}"]`);
	if (elemen instanceof HTMLInputElement || elemen instanceof HTMLTextAreaElement || elemen instanceof HTMLSelectElement) {
		return elemen;
	}
	return null;
}

function tampilkanPesan(pesan) {
	pesanEl.textContent = pesan;
	pesanEl.hidden = false;
}

function isiFilter() {
	if (!filterEl || !datalistEl) return;
	const pilihanSebelumnya = filterEl.value;
	const kategori = [...new Set(daftar.map((produk) => produk.kategori.trim()).filter(Boolean))]
		.sort((a, b) => a.localeCompare(b, 'id'));
	const opsiFilter = [document.createElement('option'), ...kategori.map(() => document.createElement('option'))];
	opsiFilter[0].value = '';
	opsiFilter[0].textContent = 'Semua kategori';
	kategori.forEach((nama, indeks) => {
		opsiFilter[indeks + 1].value = nama;
		opsiFilter[indeks + 1].textContent = nama;
	});
	filterEl.replaceChildren(...opsiFilter);
	if (kategori.includes(pilihanSebelumnya)) filterEl.value = pilihanSebelumnya;

	const opsiDatalist = kategori.map((nama) => {
		const opsi = document.createElement('option');
		opsi.value = nama;
		return opsi;
	});
	datalistEl.replaceChildren(...opsiDatalist);
}

function render() {
	if (!daftarEl || !pesanEl || !jumlahEl || !cariEl || !filterEl) return;
	const kataKunci = cariEl.value.trim().toLocaleLowerCase('id');
	const kategoriAktif = filterEl.value;
	const hasil = daftar.filter((produk) => {
		const cocokCari = !kataKunci
			|| [produk.nama, produk.kategori, produk.produsen]
				.some((nilai) => nilai.toLocaleLowerCase('id').includes(kataKunci));
		return cocokCari && (!kategoriAktif || produk.kategori === kategoriAktif);
	});

	const template = document.querySelector('#tpl-produk-baris');
	if (!(template instanceof HTMLTemplateElement)) throw new Error('Template baris produk tidak ditemukan.');
	const baris = hasil.map((produk) => {
		const elemen = template.content.firstElementChild?.cloneNode(true);
		if (!(elemen instanceof HTMLLIElement)) throw new Error('Template baris produk tidak valid.');
		elemen.dataset.id = produk.id;
		const nama = elemen.querySelector('[data-slot="nama"]');
		const meta = elemen.querySelector('[data-slot="meta"]');
		const gambar = elemen.querySelector('[data-slot="foto"]');
		if (!nama || !meta || !(gambar instanceof HTMLImageElement)) throw new Error('Slot baris produk tidak lengkap.');
		nama.textContent = produk.nama;
		meta.textContent = `${produk.kategori || 'Tanpa kategori'} · ${produk.harga != null ? `${formatHarga(produk.harga)}${produk.satuan ? ` / ${produk.satuan}` : ''}` : 'Hubungi admin'} · Urutan ${produk.urutan === 9999 ? '-' : produk.urutan}`;
		if (produk.foto[0]) {
			gambar.src = urlFoto(produk.foto[0], 160);
			gambar.alt = `Foto ${produk.nama}`;
			elemen.querySelector('[data-slot="foto-kosong"]')?.remove();
		} else {
			gambar.remove();
		}
		if (!produk.unggulan) elemen.querySelector('[data-slot="badge-unggulan"]')?.remove();
		if (produk.status !== 'pre-order') elemen.querySelector('[data-slot="badge-preorder"]')?.remove();
		if (produk.status !== 'habis') elemen.querySelector('[data-slot="badge-habis"]')?.remove();
		const tombolUbah = elemen.querySelector('[data-aksi="ubah"]');
		const tombolHapus = elemen.querySelector('[data-aksi="hapus"]');
		if (tombolUbah instanceof HTMLButtonElement) tombolUbah.disabled = sedangHapus.has(produk.id);
		if (tombolHapus instanceof HTMLButtonElement) tombolHapus.disabled = sedangHapus.has(produk.id);
		return elemen;
	});
	daftarEl.replaceChildren(...baris);

	if (daftar.length === 0) {
		jumlahEl.textContent = '';
		tampilkanPesan('[ISI NANTI: belum ada produk. Tekan Tambah produk.]');
		ulangEl.hidden = true;
		return;
	}
	pesanEl.hidden = hasil.length > 0;
	pesanEl.textContent = hasil.length === 0 ? 'Tidak ada produk yang cocok.' : '';
	jumlahEl.textContent = hasil.length === daftar.length
		? `${daftar.length} produk`
		: `${hasil.length} dari ${daftar.length} produk`;
	ulangEl.hidden = true;
}

async function muatDaftar() {
	const nomorPemuatan = ++pemuatanDaftar;
	pesanEl.hidden = true;
	pesanEl.textContent = '';
	ulangEl.hidden = true;
	jumlahEl.textContent = 'Memuat produk...';
	tambahEl.disabled = true;
	try {
		const snap = await getDocs(collection(db, 'produk'));
		if (nomorPemuatan !== pemuatanDaftar) return;
		daftar = snap.docs.map(petakan).filter(Boolean);
		urut();
		isiFilter();
		render();
		tambahEl.disabled = false;
	} catch (galat) {
		if (nomorPemuatan !== pemuatanDaftar) return;
		console.error('Gagal memuat produk:', galat.code ?? galat.message);
		daftar = [];
		daftarEl.replaceChildren();
		jumlahEl.textContent = '';
		tampilkanPesan('Produk belum dapat dimuat. Periksa koneksi lalu coba lagi.');
		ulangEl.hidden = false;
		tambahEl.disabled = true;
		tampilkanToast('Gagal memuat produk.', 'galat');
	}
}

function urutanBerikutnya() {
	const terbesar = daftar.reduce((maks, produk) => (
		Number.isInteger(produk.urutan) && produk.urutan >= 1 && produk.urutan < 9999
			? Math.max(maks, produk.urutan)
			: maks
	), 0);
	return terbesar + 1;
}

function slugUnik(nama, idKecuali = null) {
	const dasar = buatSlug(nama) || 'produk';
	let slug = dasar;
	let akhiran = 2;
	while (daftar.some((produk) => produk.id !== idKecuali && produk.slug === slug)) {
		slug = `${dasar}-${akhiran++}`;
	}
	return slug;
}

function bukaForm(produk = null) {
	idEdit = produk?.id ?? null;
	formEl.reset();
	judulFormEl.textContent = produk ? 'Ubah produk' : 'Tambah produk';
	ambilInput('nama').value = produk?.nama ?? '';
	ambilInput('kategori').value = produk?.kategori ?? '';
	ambilInput('status').value = produk?.status ?? 'tersedia';
	ambilInput('harga').value = produk?.harga ?? '';
	ambilInput('satuan').value = produk?.satuan ?? '';
	ambilInput('minimalPesan').value = produk?.minimalPesan ?? '';
	ambilInput('produsen').value = produk?.produsen ?? '';
	ambilInput('ringkasan').value = produk?.ringkasan ?? '';
	ambilInput('deskripsi').value = produk?.deskripsi ?? '';
	ambilInput('urutan').value = produk && Number.isInteger(produk.urutan) && produk.urutan >= 1 && produk.urutan < 9999
		? produk.urutan
		: urutanBerikutnya();
	ambilInput('unggulan').checked = Boolean(produk?.unggulan);
	galeri.setFoto((produk?.foto ?? []).map((url) => ({ url, alt: '', rasio: null })));
	kotor = false;
	statusFormEl.textContent = '';
	dialogEl.showModal();
	ambilInput('nama').focus();
}

async function mintaTutup() {
	if (sedangSimpan) return;
	if (kotor || galeri.adaBelumTersimpan()) {
		const ya = await konfirmasi({
			judul: 'Buang perubahan?',
			pesan: 'Perubahan yang belum disimpan akan hilang.',
			tombol: 'Ya, buang',
		});
		if (!ya) return;
	}
	dialogEl.close();
}

function bacaForm() {
	const nama = ambilInput('nama').value.trim();
	const hargaMentah = ambilInput('harga').value.trim();
	const urutanMentah = ambilInput('urutan').value.trim();
	const hargaAngka = hargaMentah === '' ? null : Number(hargaMentah);
	if (!nama) return { galat: 'Nama produk wajib diisi.', fokus: 'nama' };
	if (nama.length > 200) return { galat: 'Nama produk maksimal 200 karakter.', fokus: 'nama' };
	if (hargaMentah !== '' && (!Number.isInteger(hargaAngka) || hargaAngka < 0)) {
		return { galat: 'Harga harus berupa angka bulat tanpa titik atau koma.', fokus: 'harga' };
	}
	const urutanAngka = urutanMentah === '' ? urutanBerikutnya() : Number(urutanMentah);
	if (!Number.isInteger(urutanAngka) || urutanAngka < 1) {
		return { galat: 'Urutan harus berupa angka bulat minimal 1.', fokus: 'urutan' };
	}
	const status = ambilInput('status').value;
	if (!Object.prototype.hasOwnProperty.call(statusProduk, status)) {
		return { galat: 'Pilih status produk yang tersedia.', fokus: 'status' };
	}
	return {
		data: {
			nama,
			kategori: ambilInput('kategori').value.trim(),
			status,
			harga: hargaAngka,
			satuan: ambilInput('satuan').value.trim(),
			minimalPesan: ambilInput('minimalPesan').value.trim(),
			produsen: ambilInput('produsen').value.trim(),
			ringkasan: ambilInput('ringkasan').value.trim(),
			deskripsi: ambilInput('deskripsi').value.trim(),
			urutan: urutanAngka,
			unggulan: ambilInput('unggulan').checked,
		},
	};
}

async function simpan(event) {
	event.preventDefault();
	if (sedangSimpan) return;
	const hasilForm = bacaForm();
	if (hasilForm.galat) {
		statusFormEl.textContent = hasilForm.galat;
		tampilkanToast(hasilForm.galat, 'galat');
		ambilInput(hasilForm.fokus).focus();
		return;
	}

	sedangSimpan = true;
	simpanEl.disabled = true;
	batalEl.disabled = true;
	tutupEl.disabled = true;
	simpanEl.textContent = 'Menyimpan...';
	const sesiSaatSimpan = sesiProduk;
	const galeriSaatSimpan = galeri;
	const idSaatSimpan = idEdit;
	const produkLama = daftar.find((produk) => produk.id === idSaatSimpan);
	try {
		const fotoBaru = await galeriSaatSimpan.unggahSemua((ke, total) => {
			statusFormEl.textContent = `Mengunggah foto ${ke} dari ${total}...`;
		});
		if (sesiSaatSimpan !== sesiProduk) return;
		const foto = fotoBaru.map((item) => item.url);
		statusFormEl.textContent = 'Menyimpan...';
		const referensi = idSaatSimpan
			? doc(db, 'produk', idSaatSimpan)
			: doc(collection(db, 'produk'));
		const slug = idSaatSimpan
			? produkLama?.slug || slugUnik(hasilForm.data.nama, idSaatSimpan)
			: slugUnik(hasilForm.data.nama);
		const data = { ...hasilForm.data, slug, foto };
		const batch = writeBatch(db);
		batch.set(referensi, data);
		if (data.unggulan) {
			const unggulanLain = await getDocs(query(collection(db, 'produk'), where('unggulan', '==', true)));
			unggulanLain.docs.forEach((dok) => {
				if (dok.id !== referensi.id) batch.update(dok.ref, { unggulan: false });
			});
		}
		if (sesiSaatSimpan !== sesiProduk) return;
		await batch.commit();
		if (sesiSaatSimpan !== sesiProduk) return;

		const tersimpan = petakanData(referensi.id, data);
		if (produkLama) {
			daftar = daftar.map((produk) => (
				produk.id === tersimpan.id
					? tersimpan
					: data.unggulan && produk.unggulan
						? { ...produk, unggulan: false }
						: produk
			));
		} else {
			daftar.push(tersimpan);
			if (data.unggulan) daftar = daftar.map((produk) => (
				produk.id !== tersimpan.id && produk.unggulan ? { ...produk, unggulan: false } : produk
			));
		}
		urut();
		isiFilter();
		render();
		kotor = false;
		galeriSaatSimpan.tandaiBersih();
		dialogEl.close();
		tampilkanToast('Produk disimpan. Perubahan langsung tampil di website.');
	} catch (galat) {
		if (sesiSaatSimpan !== sesiProduk) return;
		console.error('Gagal menyimpan produk:', galat.code ?? galat.message);
		const pesan = galat.ramah
			? galat.message
			: galat.code === 'permission-denied'
				? 'Penyimpanan ditolak oleh aturan akses (Rules). Periksa Rules.'
				: 'Gagal menyimpan. Coba lagi.';
		statusFormEl.textContent = pesan;
		tampilkanToast(pesan, 'galat');
	} finally {
		sedangSimpan = false;
		simpanEl.disabled = false;
		batalEl.disabled = false;
		tutupEl.disabled = false;
		simpanEl.textContent = 'Simpan';
	}
}

async function hapus(produk) {
	if (sedangHapus.has(produk.id)) return;
	const ya = await konfirmasi({
		judul: 'Hapus produk?',
		pesan: `"${produk.nama}" akan dihapus dari website. Tindakan ini tidak bisa dibatalkan.`,
		tombol: 'Ya, hapus',
	});
	if (!ya) return;

	sedangHapus.add(produk.id);
	render();
	try {
		await deleteDoc(doc(db, 'produk', produk.id));
		daftar = daftar.filter((item) => item.id !== produk.id);
		isiFilter();
		render();
		tampilkanToast('Produk dihapus.');
	} catch (galat) {
		console.error('Gagal menghapus produk:', galat.code ?? galat.message);
		tampilkanToast(
			galat.code === 'permission-denied'
				? 'Penghapusan ditolak oleh aturan akses (Rules).'
				: 'Gagal menghapus. Coba lagi.',
			'galat',
		);
	} finally {
		sedangHapus.delete(produk.id);
		render();
	}
}

function pasangElemen() {
	cariEl = document.querySelector('[data-produk-cari]');
	filterEl = document.querySelector('[data-produk-filter-kategori]');
	tambahEl = document.querySelector('[data-produk-tambah]');
	jumlahEl = document.querySelector('[data-produk-jumlah]');
	daftarEl = document.querySelector('[data-produk-daftar]');
	pesanEl = document.querySelector('[data-produk-pesan]');
	ulangEl = document.querySelector('[data-produk-ulang]');
	dialogEl = document.querySelector('#produk-form-dialog');
	formEl = document.querySelector('[data-produk-form]');
	judulFormEl = document.querySelector('[data-form-judul]');
	statusFormEl = document.querySelector('[data-form-status]');
	simpanEl = document.querySelector('[data-form-simpan]');
	batalEl = document.querySelector('[data-form-batal]');
	tutupEl = document.querySelector('[data-form-tutup]');
	wadahGaleriEl = document.querySelector('[data-produk-galeri]');
	datalistEl = document.querySelector('#daftar-kategori-produk');
	return Boolean(
		cariEl && filterEl && tambahEl && jumlahEl && daftarEl && pesanEl && ulangEl
		&& dialogEl instanceof HTMLDialogElement
		&& formEl instanceof HTMLFormElement
		&& judulFormEl && statusFormEl
		&& simpanEl instanceof HTMLButtonElement
		&& batalEl instanceof HTMLButtonElement
		&& tutupEl instanceof HTMLButtonElement
		&& wadahGaleriEl && datalistEl instanceof HTMLDataListElement
		&& ['nama', 'kategori', 'status', 'harga', 'satuan', 'minimalPesan', 'produsen', 'ringkasan', 'deskripsi', 'urutan', 'unggulan']
			.every((nama) => Boolean(ambilInput(nama))),
	);
}

export async function mulaiTabProduk() {
	if (!pasangElemen()) return;
	if (sudahMulai) {
		await muatDaftar();
		return;
	}
	galeri = buatGaleri(wadahGaleriEl, {
		maks: 5,
		denganKeterangan: false,
		tandaiSampul: true,
		saatUbah: () => {
			kotor = true;
		},
	});

	cariEl.addEventListener('input', render);
	filterEl.addEventListener('change', render);
	tambahEl.addEventListener('click', () => bukaForm());
	ulangEl.addEventListener('click', muatDaftar);
	daftarEl.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const tombol = target.closest('button[data-aksi]');
		const baris = tombol?.closest('[data-baris]');
		const produk = daftar.find((item) => item.id === baris?.dataset.id);
		if (!produk || !tombol) return;
		if (tombol.dataset.aksi === 'ubah') bukaForm(produk);
		if (tombol.dataset.aksi === 'hapus') void hapus(produk);
	});
	formEl.addEventListener('submit', simpan);
	tutupEl.addEventListener('click', () => void mintaTutup());
	batalEl.addEventListener('click', () => void mintaTutup());
	dialogEl.addEventListener('cancel', (event) => {
		event.preventDefault();
		void mintaTutup();
	});
	formEl.addEventListener('input', () => {
		kotor = true;
	});
	formEl.addEventListener('change', () => {
		kotor = true;
	});
	dialogEl.addEventListener('close', () => {
		galeri.bersihkan();
		kotor = false;
		idEdit = null;
		statusFormEl.textContent = '';
	});
	globalThis.addEventListener('beforeunload', (event) => {
		if (dialogEl.open && (kotor || galeri.adaBelumTersimpan())) {
			event.preventDefault();
			event.returnValue = '';
		}
	});
	sudahMulai = true;
	await muatDaftar();
}

export function resetTabProduk() {
	pemuatanDaftar++;
	sesiProduk++;
	if (dialogEl?.open) dialogEl.close();
	galeri?.bersihkan();
	daftar = [];
	daftarEl?.replaceChildren();
	if (jumlahEl) jumlahEl.textContent = '';
	if (tambahEl) tambahEl.disabled = true;
	if (pesanEl) {
		pesanEl.hidden = true;
		pesanEl.textContent = '';
	}
	if (ulangEl) ulangEl.hidden = true;
	kotor = false;
	idEdit = null;
}
