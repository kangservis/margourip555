export function tampilkanToast(pesan, jenis = 'info') {
	const wadah = document.querySelector('[data-toast-wadah]');
	const template = document.querySelector('#tpl-toast');
	if (!wadah || !(template instanceof HTMLTemplateElement)) return;

	const toast = template.content.firstElementChild?.cloneNode(true);
	if (!(toast instanceof HTMLElement)) return;

	toast.dataset.jenis = jenis;
	const teks = toast.querySelector('[data-toast-teks]');
	if (!teks) return;

	teks.textContent = pesan;
	wadah.appendChild(toast);
	setTimeout(() => toast.remove(), 4000);
}

const dialogKonfirmasi = document.querySelector('[data-konfirmasi]');

dialogKonfirmasi?.addEventListener('click', (event) => {
	if (event.target === dialogKonfirmasi) dialogKonfirmasi.close('batal');
});

export function konfirmasi({ judul, pesan, tombol = 'Ya' }) {
	const dialog = dialogKonfirmasi;
	const judulElemen = dialog?.querySelector('[data-konfirmasi-judul]');
	const pesanElemen = dialog?.querySelector('[data-konfirmasi-pesan]');
	const tombolOk = dialog?.querySelector('[data-konfirmasi-ok]');
	if (
		!(dialog instanceof HTMLDialogElement)
		|| !judulElemen
		|| !pesanElemen
		|| !(tombolOk instanceof HTMLButtonElement)
	) {
		return Promise.resolve(false);
	}

	judulElemen.textContent = judul;
	pesanElemen.textContent = pesan;
	tombolOk.textContent = tombol;
	dialog.returnValue = '';

	return new Promise((resolve) => {
		dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true });
		dialog.showModal();
	});
}
