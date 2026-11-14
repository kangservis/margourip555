import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth';
import { adminSiap, auth, periksaAdmin } from './firebase.js';
import { konfirmasi, tampilkanToast } from './ui.js';
import { mulaiTabSlider, resetTabSlider } from './slider.js';
import { mulaiTabProduk, resetTabProduk } from './produk.js';
import { mulaiTabBerita, resetTabBerita } from './berita.js';
import { mulaiTabStruktur, resetTabStruktur } from './struktur.js';

// Username diubah menjadi email dengan domain tetap. Domain ini harus sama dengan akun di Firebase Authentication.
const DOMAIN_ADMIN = 'sayasendiri.com';
const POLA_USERNAME = /^[a-z0-9._-]{1,64}$/;

function usernameKeEmail(username) {
	return `${username}@${DOMAIN_ADMIN}`;
}

function emailKeUsername(email) {
	return String(email ?? '').split('@')[0];
}

export function mulaiAdmin() {
	const tampilanMemuat = document.querySelector('[data-view="memuat"]');
	const tampilanLogin = document.querySelector('[data-view="login"]');
	const tampilanDashboard = document.querySelector('[data-view="dashboard"]');
	const formLogin = document.querySelector('[data-login-form]');
	const pesanLogin = document.querySelector('[data-login-pesan]');
	const usernameInput = document.querySelector('#login-username');
	const sandiInput = document.querySelector('#login-sandi');
	const tombolMasuk = document.querySelector('[data-login-kirim]');
	const emailAdmin = document.querySelector('[data-admin-email]');
	const tombolKeluar = document.querySelector('[data-keluar]');
	const tablist = document.querySelector('[role="tablist"]');
	const tabs = [...document.querySelectorAll('[role="tab"][data-tab]')];
	const panels = [...document.querySelectorAll('[role="tabpanel"][data-panel]')];

	if (
		!tampilanMemuat || !tampilanLogin || !tampilanDashboard
		|| !(formLogin instanceof HTMLFormElement)
		|| !pesanLogin
		|| !(usernameInput instanceof HTMLInputElement)
		|| !(sandiInput instanceof HTMLInputElement)
		|| !(tombolMasuk instanceof HTMLButtonElement)
		|| !emailAdmin
		|| !(tombolKeluar instanceof HTMLButtonElement)
		|| !tablist
		|| tabs.length === 0
		|| panels.length === 0
	) {
		return;
	}

	function tampilView(nama) {
		document.querySelectorAll('[data-view]').forEach((view) => {
			view.hidden = true;
		});
		const view = document.querySelector(`[data-view="${nama}"]`);
		if (view) view.hidden = false;
	}

	function kosongkanFormLogin() {
		usernameInput.value = '';
		sandiInput.value = '';
	}

	if (!adminSiap() || !auth) {
		kosongkanFormLogin();
		tampilView('login');
		pesanLogin.textContent = 'Konfigurasi Firebase belum diisi (.env).';
		pesanLogin.hidden = false;
		tombolMasuk.disabled = true;
		return;
	}

	let pesanLoginTertunda = '';

	// Halaman yang dipulihkan dari cache tombol kembali tetap membawa status lamanya; paksa keluar agar login diminta lagi.
	globalThis.addEventListener('pageshow', (event) => {
		if (!event.persisted) return;
		kosongkanFormLogin();
		if (auth.currentUser) void signOut(auth);
	});

	function pilihTab(nama, { fokus = false } = {}) {
		const tabTerpilih = tabs.find((tab) => tab.dataset.tab === nama);
		if (!tabTerpilih) return;

		tabs.forEach((tab) => {
			const aktif = tab === tabTerpilih;
			tab.setAttribute('aria-selected', String(aktif));
			tab.tabIndex = aktif ? 0 : -1;
		});
		panels.forEach((panel) => {
			panel.hidden = panel.dataset.panel !== nama;
		});
		history.replaceState(null, '', `#${nama}`);
		if (fokus) tabTerpilih.focus();
	}

	formLogin.addEventListener('submit', async (event) => {
		event.preventDefault();
		pesanLogin.hidden = true;
		pesanLogin.textContent = '';

		const username = usernameInput.value.trim().toLowerCase();
		const sandi = sandiInput.value;
		if (!username || !sandi) {
			pesanLogin.textContent = 'Isi username dan kata sandi.';
			pesanLogin.hidden = false;
			return;
		}
		if (username.includes('@')) {
			pesanLogin.textContent = 'Isi username saja, tanpa tanda @ dan domain.';
			pesanLogin.hidden = false;
			return;
		}
		if (!POLA_USERNAME.test(username)) {
			pesanLogin.textContent = 'Username hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung.';
			pesanLogin.hidden = false;
			return;
		}

		tombolMasuk.disabled = true;
		tombolMasuk.textContent = 'Memproses...';
		try {
			await signInWithEmailAndPassword(auth, usernameKeEmail(username), sandi);
		} catch (galat) {
			const kode = typeof galat?.code === 'string' ? galat.code : '';
			console.error(kode || 'auth/unknown');
			const pesan = {
				'auth/invalid-credential': 'Username atau kata sandi salah.',
				'auth/wrong-password': 'Username atau kata sandi salah.',
				'auth/user-not-found': 'Username atau kata sandi salah.',
				'auth/invalid-email': 'Username atau kata sandi salah.',
				'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
				'auth/network-request-failed': 'Tidak ada koneksi internet. Periksa koneksi lalu coba lagi.',
			}[kode] ?? 'Gagal masuk. Coba lagi.';
			pesanLogin.textContent = pesan;
			pesanLogin.hidden = false;
			sandiInput.value = '';
		} finally {
			tombolMasuk.disabled = false;
			tombolMasuk.textContent = 'Masuk';
		}
	});

	onAuthStateChanged(auth, async (user) => {
		if (!user) {
			resetTabSlider();
			resetTabProduk();
			resetTabBerita();
			resetTabStruktur();
			kosongkanFormLogin();
			tampilView('login');
			if (pesanLoginTertunda) {
				pesanLogin.textContent = pesanLoginTertunda;
				pesanLogin.hidden = false;
				pesanLoginTertunda = '';
			}
			return;
		}

		tampilView('memuat');
		try {
			await periksaAdmin();
		} catch (galat) {
			const kode = typeof galat?.code === 'string' ? galat.code : '';
			pesanLoginTertunda = kode === 'permission-denied'
				? 'Akun ini tidak memiliki akses admin.'
				: 'Gagal memeriksa akses admin. Periksa koneksi lalu masuk lagi.';
			console.error('Pemeriksaan admin gagal:', kode || 'unknown');
			try {
				await signOut(auth);
			} catch (galatKeluar) {
				const kodeKeluar = typeof galatKeluar?.code === 'string' ? galatKeluar.code : '';
				console.error('Gagal mengeluarkan akun:', kodeKeluar || 'auth/unknown');
				kosongkanFormLogin();
				tampilView('login');
				pesanLogin.textContent = pesanLoginTertunda;
				pesanLogin.hidden = false;
				pesanLoginTertunda = '';
			}
			return;
		}

		emailAdmin.textContent = emailKeUsername(user.email);
		const hashAwal = location.hash.slice(1);
		const tabAwal = tabs.some((tab) => tab.dataset.tab === hashAwal) ? hashAwal : 'produk';
		pilihTab(tabAwal);
		tampilView('dashboard');
		void mulaiTabSlider();
		void mulaiTabProduk();
		void mulaiTabBerita();
		void mulaiTabStruktur();
	});

	tombolKeluar.addEventListener('click', async () => {
		const ya = await konfirmasi({
			judul: 'Keluar dari admin?',
			pesan: 'Anda harus masuk lagi untuk mengubah konten.',
			tombol: 'Ya, keluar',
		});
		if (!ya) return;

		try {
			await signOut(auth);
			tampilkanToast('Anda sudah keluar.');
		} catch (galat) {
			const kode = typeof galat?.code === 'string' ? galat.code : '';
			console.error('Gagal keluar:', kode || 'auth/unknown');
			tampilkanToast('Gagal keluar. Coba lagi.', 'galat');
		}
	});

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => pilihTab(tab.dataset.tab));
	});

	tablist.addEventListener('keydown', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const tabAktif = target.closest('[role="tab"][data-tab]');
		const index = tabs.indexOf(tabAktif);
		if (index < 0) return;

		let indexBerikut = index;
		if (event.key === 'ArrowRight') indexBerikut = (index + 1) % tabs.length;
		else if (event.key === 'ArrowLeft') indexBerikut = (index - 1 + tabs.length) % tabs.length;
		else if (event.key === 'Home') indexBerikut = 0;
		else if (event.key === 'End') indexBerikut = tabs.length - 1;
		else return;

		event.preventDefault();
		pilihTab(tabs[indexBerikut].dataset.tab, { fokus: true });
	});
}
