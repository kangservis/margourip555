export const siteConfig = {
	name: 'Desa Margourip',
	description: 'Profil dan katalog produk unggulan Desa Margourip.',
	tagline: '[ISI NANTI]',
	address: '[ISI NANTI]',
	whatsapp: '628518233200',
	mapUrl: 'https://maps.app.goo.gl/oBWQuXdJeL276LLb7',
	mapEmbedUrl: 'https://maps.google.com/maps?q=-7.9625863%2C112.1609056&z=14&output=embed',
	email: '',
};

export const navigationItems = [
	{ label: 'Beranda', href: '/', icon: 'home' },
	{ label: 'Produk', href: '/produk', icon: 'product' },
	{ label: 'Berita', href: '/berita', icon: 'news' },
	{ label: 'Struktur', href: '/struktur', icon: 'structure' },
	{ label: 'Kontak', href: '/kontak', icon: 'contact' },
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
