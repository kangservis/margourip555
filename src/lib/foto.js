// Satu-satunya tempat membungkus URL foto dengan proxy wsrv.nl (agar foto ImgBB tetap terbuka walau akses langsung ke ImgBB terblokir). Jika proxy diganti, ubah di sini saja.
export function urlAman(url) {
	return typeof url === 'string' && url.startsWith('https://') ? url : '';
}

export function urlFoto(url, lebar = 640) {
	const asli = urlAman(url);
	if (!asli) return '';
	return `https://wsrv.nl/?url=${encodeURIComponent(asli)}&w=${lebar}&we&output=webp&q=75`;
}

export function srcsetFoto(url, daftarLebar = [320, 480, 640]) {
	if (!urlAman(url)) return '';
	return daftarLebar.map((lebar) => `${urlFoto(url, lebar)} ${lebar}w`).join(', ');
}
