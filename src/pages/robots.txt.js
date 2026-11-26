// robots.txt dibuat dari alamat situs. Halaman admin TIDAK disebut di sini (alamatnya tidak perlu diumumkan; halaman itu sudah noindex).
export function GET({ site }) {
	if (!site) throw new Error('Properti `site` di astro.config.mjs belum diisi.');
	const teks = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;
	return new Response(teks, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
