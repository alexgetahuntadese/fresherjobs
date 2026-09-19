const fs = require('fs');
const files = ['app/page.tsx', 'app/admin/dashboard/page.tsx', 'app/admin/login/page.tsx'];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replaceAll('bg-[#0d0b16]', 'bg-white');
  fs.writeFileSync(file, text);
}
fs.unlinkSync('.codex_white_main_background.js');
