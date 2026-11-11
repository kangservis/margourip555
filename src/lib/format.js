export function buatSlug(teks) {
	return teks.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function formatHarga(harga) {
	return harga == null ? '' : `Rp ${new Intl.NumberFormat('id-ID').format(harga)}`;
}

export const statusProduk = {
	tersedia: { label: 'Tersedia', tombol: 'Konsultasi via WhatsApp' },
	'pre-order': { label: 'Pre-order', tombol: 'Konsultasi pre-order' },
	habis: { label: 'Habis', tombol: 'Tanya ketersediaan' },
};

export function formatTanggal(iso) {
	const d = new Date(`${iso}T00:00:00Z`);
	if (Number.isNaN(d.getTime())) return '';
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(d);
}
