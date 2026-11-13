// Pages Function: POST /api/upload
// Alur: admin login -> foto diperkecil di browser -> dikirim ke sini bersama tiket login (ID token).
// Fungsi memeriksa bahwa pemanggil adalah admin (membaca dokumen admin/ping lewat Firestore REST memakai tiket itu;
// dokumen itu hanya boleh dibaca admin menurut Firestore Rules), lalu meneruskan foto ke ImgBB memakai kunci rahasia.

const MAKS_BYTE = 2 * 1024 * 1024; // batas keras 2 MB (browser sudah memperkecil foto)
const TIPE_BOLEH = ['image/webp', 'image/jpeg', 'image/png'];

function balas(isi, status = 200) {
	return new Response(JSON.stringify(isi), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	});
}

async function adalahAdmin(tiket, env) {
	if (!tiket || !env.FIREBASE_PROJECT_ID) return false;
	const kunci = env.FIREBASE_API_KEY || env.PUBLIC_FIREBASE_API_KEY;
	const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/admin/ping${kunci ? `?key=${kunci}` : ''}`;
	try {
		const respons = await fetch(url, { headers: { Authorization: `Bearer ${tiket}` } });
		return respons.ok;
	} catch {
		return false;
	}
}

export async function onRequestPost({ request, env }) {
	if (!env.IMGBB_API_KEY || !env.FIREBASE_PROJECT_ID) {
		return balas({ galat: 'Layanan unggah belum dikonfigurasi.' }, 500);
	}

	const header = request.headers.get('Authorization') ?? '';
	const tiket = header.startsWith('Bearer ') ? header.slice(7) : '';
	if (!(await adalahAdmin(tiket, env))) return balas({ galat: 'Akses ditolak.' }, 403);

	const panjang = Number(request.headers.get('Content-Length') ?? 0);
	if (panjang > MAKS_BYTE + 100 * 1024) return balas({ galat: 'Foto terlalu besar.' }, 413);

	let form;
	try {
		form = await request.formData();
	} catch {
		return balas({ galat: 'Permintaan tidak valid.' }, 400);
	}
	const berkas = form.get('file');
	if (!(berkas instanceof File)) return balas({ galat: 'Berkas foto tidak ditemukan.' }, 400);
	if (!TIPE_BOLEH.includes(berkas.type)) return balas({ galat: 'Tipe berkas harus JPEG, PNG, atau WebP.' }, 415);
	if (berkas.size > MAKS_BYTE) return balas({ galat: 'Foto terlalu besar.' }, 413);

	const ekstensi = berkas.type === 'image/png' ? 'png' : berkas.type === 'image/jpeg' ? 'jpg' : 'webp';
	const nama = `margourip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const kirim = new FormData();
	kirim.append('image', berkas, `${nama}.${ekstensi}`);
	kirim.append('name', nama);

	try {
		const respons = await fetch(`https://api.imgbb.com/1/upload?key=${env.IMGBB_API_KEY}`, { method: 'POST', body: kirim });
		const hasil = await respons.json();
		if (!respons.ok || !hasil?.data?.url) return balas({ galat: 'Gagal mengunggah ke penyimpanan foto.' }, 502);
		// URL dan ukuran foto boleh dikembalikan; delete_url sengaja tidak diteruskan ke browser.
		return balas({ url: hasil.data.url, lebar: Number(hasil.data.width) || null, tinggi: Number(hasil.data.height) || null });
	} catch {
		return balas({ galat: 'Gagal menghubungi penyimpanan foto.' }, 502);
	}
}
