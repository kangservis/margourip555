// Inisialisasi Firebase khusus halaman admin. Halaman publik TIDAK boleh mengimpor file ini (SDK hanya untuk /admin).
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const konfigurasi = {
	apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
	authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
};

export function adminSiap() {
	return Object.values(konfigurasi).every(Boolean);
}

const app = adminSiap() ? initializeApp(konfigurasi) : null;
// Sesi login hanya disimpan di memori halaman: menutup halaman, memuat ulang, atau meninggalkan halaman lalu kembali = harus login lagi.
// Untuk tetap login saat tab dimuat ulang, ganti ke browserSessionPersistence.
function buatAuth(aplikasi) {
	try {
		return initializeAuth(aplikasi, { persistence: inMemoryPersistence });
	} catch {
		// Cadangan saat modul dimuat ulang oleh HMR (pengembangan): pakai instance yang sudah ada
		return getAuth(aplikasi);
	}
}

export const auth = app ? buatAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Memeriksa apakah akun yang login adalah admin: dokumen admin/ping hanya boleh dibaca admin (lihat Firestore Rules).
// Melempar galat dengan code 'permission-denied' bila bukan admin.
export async function periksaAdmin() {
	await getDoc(doc(db, 'admin', 'ping'));
}
