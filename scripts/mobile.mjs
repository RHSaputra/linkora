import os from 'os';

const port = process.env.PORT || 3000;
const nets = os.networkInterfaces();
const ips = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
      ips.push({ name, ip: net.address });
    }
  }
}

console.log('\n======================================================');
console.log('   LINKORA - AKSES LANGSUNG DARI SMARTPHONE / HP');
console.log('======================================================\n');

if (ips.length === 0) {
  console.log('Tidak ditemukan IP jaringan aktif. Pastikan laptop/PC terhubung ke Wi-Fi / Hotspot.');
} else {
  console.log('Pastikan HP terhubung ke Wi-Fi atau Hotspot yang sama dengan laptop ini.\n');
  console.log('Buka browser di HP (Chrome/Safari) dan kunjungi URL berikut:\n');
  ips.forEach(({ name, ip }) => {
    console.log(`  👉  http://${ip}:${port}  (${name})`);
  });
  console.log('\n------------------------------------------------------');
  console.log(' Fitur:');
  console.log('  - Live Reload: Setiap kali edit kode, HP otomatis update.');
  console.log('  - Tanpa Commit & Push: Tidak perlu deploy ke cloud.');
  console.log('  - Jika HP pakai data seluler (beda Wi-Fi), jalankan:');
  console.log('      pnpm tunnel');
  console.log('======================================================\n');
}
