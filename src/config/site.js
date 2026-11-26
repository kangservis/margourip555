export const siteConfig = {
	name: 'Desa Margourip',
	description: 'Profil dan katalog produk unggulan Desa Margourip, disponsori oleh Ikatan Persaudaraan 555.',
	tagline: 'Pusat Komoditas Pertanian Unggulan dan Hasil Bumi Alami dari Jantung Kecamatan Ngancar.',
	address: 'Dsn.Sumberlumbu, Ds.Margourip, Kec.Ngancar',
	whatsapp: '6285158233200',
	mapUrl: 'https://maps.app.goo.gl/oBWQuXdJeL276LLb7',
	mapEmbedUrl: 'https://maps.google.com/maps?q=-7.9625863%2C112.1609056&z=14&output=embed',
	email: '',
	// Kredit desain opsional untuk footer, mis. 'Design by ...'. Kosong = baris kredit tidak ditampilkan.
	credit: 'Design by. BINDOETT',
	// Gambar pratinjau tautan (Open Graph), jalur dari folder public, mis. '/og-default.jpg' (disarankan 1200x630, ringan). Kosong = tag og:image tidak dipasang.
	ogImage: '',
	// Sponsor (organisasi di balik website ini). Satu sumber untuk header, footer, bagian komunitas di Beranda, dan halaman admin.
	sponsor: {
		nama: 'Ikatan Persaudaraan 555',
		label: 'Disponsori oleh',
		catatan: 'Website ini bukan situs resmi pemerintah desa.',
		pengantar: 'Website ini dikelola secara swasta dan disponsori oleh Ikatan Persaudaraan 555, organisasi yang mengangkat potensi sumber daya alam dan sumber daya manusia desa agar ekonomi desa berputar.',
		visi: {
			awal: 'Menjadi organisasi yang solid, kompak dan bermartabat serta berperan aktif dalam',
			kunci: 'membangun kebersamaan, kesejahteraan dan keadilan sosial bagi seluruh masyarakat',
			akhir: 'menuju Indonesia maju dan bermartabat.',
		},
		misi: [
			'Mempererat tali persaudaraan dan membangun solidaritas tanpa memandang perbedaan suku, agama, ras dan golongan.',
			'Menjunjung tinggi nilai-nilai Pancasila, UUD 1945 dan semangat Bhinneka Tunggal Ika.',
			'Berperan aktif dalam kegiatan sosial, kemanusiaan dan pemberdayaan masyarakat.',
			'Meningkatkan kesejahteraan anggota dan keluarga melalui kebersamaan, gotong royong dan kegiatan ekonomi yang bermanfaat.',
			'Menjadi mitra strategis pemerintah dan stakeholder dalam mendukung pembangunan daerah dan kemaslahatan bangsa.',
		],
		slogan: ['Solid', 'Kompak', 'Bermartabat'],
	},
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

// Cloudflare Pages menyajikan halaman Astro berbentuk folder (produk/index.html) dengan garis miring di akhir (/produk/). Jika kenyataannya tanpa garis miring, ubah menjadi false.
export const garisMiringAkhir = true;

// Bentuk alamat halaman yang dipakai untuk canonical dan sitemap.
export function jalurKanonik(jalur) {
	const bersih = jalur.replace(/\/+$/, '');
	if (!bersih) return '/';
	return garisMiringAkhir ? `${bersih}/` : bersih;
}
