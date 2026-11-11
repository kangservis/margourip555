// Pembaca Firestore lewat REST (tanpa SDK). Hanya untuk data publik; aturan akses ada di Firestore Rules.
const API_KEY = import.meta.env.PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
const WAKTU_HABIS_MS = 10000;

export function firestoreSiap() {
	return Boolean(API_KEY && PROJECT_ID);
}

// Mengubah nilai Firestore (berformat { stringValue: ... }) menjadi nilai JavaScript biasa
function bacaNilai(nilai) {
	if (!nilai || typeof nilai !== 'object') return null;
	if ('stringValue' in nilai) return nilai.stringValue;
	if ('integerValue' in nilai) return Number(nilai.integerValue);
	if ('doubleValue' in nilai) return Number(nilai.doubleValue);
	if ('booleanValue' in nilai) return nilai.booleanValue;
	if ('timestampValue' in nilai) return nilai.timestampValue;
	if ('arrayValue' in nilai) return (nilai.arrayValue.values ?? []).map(bacaNilai);
	if ('mapValue' in nilai) return bacaBidang(nilai.mapValue.fields ?? {});
	return null; // nullValue dan tipe lain
}

function bacaBidang(bidang) {
	return Object.fromEntries(Object.entries(bidang).map(([kunci, nilai]) => [kunci, bacaNilai(nilai)]));
}

// Mengubah nilai JavaScript menjadi nilai Firestore (untuk filter)
function tulisNilai(nilai) {
	if (typeof nilai === 'boolean') return { booleanValue: nilai };
	if (typeof nilai === 'number') {
		return Number.isInteger(nilai) ? { integerValue: String(nilai) } : { doubleValue: nilai };
	}
	return { stringValue: String(nilai) };
}

// koleksi: nama koleksi. filter: [{ bidang, nilai }] (semua sama-dengan, digabung AND). urutan: { bidang, turun }. batas: jumlah maksimal dokumen.
// Mengembalikan daftar objek { id, ...bidang }. Melempar Error bila gagal (jaringan, aturan akses, indeks belum dibuat, atau .env belum diisi).
export async function queryKoleksi({ koleksi, filter = [], urutan, batas }) {
	if (!firestoreSiap()) throw new Error('Konfigurasi Firebase belum diisi (.env).');

	const query = { from: [{ collectionId: koleksi }] };
	const filterBidang = filter.map((f) => ({
		fieldFilter: { field: { fieldPath: f.bidang }, op: 'EQUAL', value: tulisNilai(f.nilai) },
	}));
	if (filterBidang.length === 1) query.where = filterBidang[0];
	if (filterBidang.length > 1) query.where = { compositeFilter: { op: 'AND', filters: filterBidang } };
	if (urutan) {
		query.orderBy = [{ field: { fieldPath: urutan.bidang }, direction: urutan.turun ? 'DESCENDING' : 'ASCENDING' }];
	}
	if (batas) query.limit = batas;

	const pengendali = new AbortController();
	const timer = setTimeout(() => pengendali.abort(), WAKTU_HABIS_MS);
	try {
		const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
		const respons = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ structuredQuery: query }),
			signal: pengendali.signal,
		});
		if (!respons.ok) {
			let rincian = '';
			try {
				rincian = (await respons.json())?.error?.message ?? '';
			} catch {
				// abaikan: isi galat tidak berupa JSON
			}
			throw new Error(`Firestore ${respons.status}: ${rincian}`);
		}
		const baris = await respons.json();
		return baris
			.filter((b) => b.document)
			.map((b) => ({ id: b.document.name.split('/').pop(), ...bacaBidang(b.document.fields ?? {}) }));
	} finally {
		clearTimeout(timer);
	}
}
