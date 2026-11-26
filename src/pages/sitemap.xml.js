import { navigationItems, jalurKanonik } from '../config/site.js';

// Sitemap dibuat dari daftar menu (halaman publik). Halaman admin dan 404 tidak dimasukkan.
export function GET({ site }) {
	if (!site) throw new Error('Properti `site` di astro.config.mjs belum diisi.');
	const dasar = site.href.replace(/\/$/, '');
	const alamat = navigationItems.map((item) => `${dasar}${jalurKanonik(item.href)}`);
	const isi = alamat.map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${isi}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
