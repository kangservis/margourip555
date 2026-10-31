export const siteConfig = {
	name: 'Desa Margourip',
	description: 'Profil dan katalog produk unggulan Desa Margourip.',
	tagline: '[ISI NANTI]',
	address: '[ISI NANTI]',
	whatsapp: '',
	email: '',
};

export const navigationItems = [
	{ label: 'Beranda', href: '/' },
	{ label: 'Produk', href: '/produk' },
	{ label: 'Berita', href: '/berita' },
	{ label: 'Struktur', href: '/struktur' },
	{ label: 'Kontak', href: '/kontak' },
];

function normalizePath(path) {
	const normalizedPath = path.replace(/\/+$/, '');
	return normalizedPath || '/';
}

export function isActive(currentPath, href) {
	const current = normalizePath(currentPath);
	const target = normalizePath(href);

	if (target === '/') {
		return current === '/';
	}

	return current === target || current.startsWith(`${target}/`);
}

export function getWhatsAppLink(message = '') {
	if (!siteConfig.whatsapp) {
		return '';
	}

	// Nomor harus memakai format internasional tanpa "+" dan tanpa 0 di depan, misalnya 62812xxxxxxx.
	const query = message ? `?text=${encodeURIComponent(message)}` : '';
	return `https://wa.me/${siteConfig.whatsapp}${query}`;
}

export function getContactLink(message = '') {
	return getWhatsAppLink(message) || '/kontak';
}
