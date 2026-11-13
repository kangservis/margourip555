// Inisialisasi Firebase khusus halaman admin. Halaman publik TIDAK boleh mengimpor file ini (SDK hanya untuk /admin).
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Memeriksa apakah akun yang login adalah admin: dokumen admin/ping hanya boleh dibaca admin (lihat Firestore Rules).
// Melempar galat dengan code 'permission-denied' bila bukan admin.
export async function periksaAdmin() {
	await getDoc(doc(db, 'admin', 'ping'));
}
