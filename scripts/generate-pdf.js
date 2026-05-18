const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..');
const mdPath = path.join(root, 'DOCUMENTATION.md');
const htmlPath = path.join(root, 'DOCUMENTATION.html');
const pdfPath = path.join(root, 'DOCUMENTATION.pdf');

const markdown = fs.readFileSync(mdPath, 'utf8');

function mermaidBlocksToHtml(md) {
  return md.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_, diagram) => {
    return '\n<div class="mermaid">\n' + diagram.trim() + '\n</' + 'motion-div>\n'.replace('motion-', '');
  });
}

const processed = mermaidBlocksToHtml(markdown);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ApexForge Gym Platform — System Documentation</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    @page { margin: 18mm 16mm; size: A4; }
    body {
      font-family: "Segoe UI", Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 12mm 10mm 16mm;
    }
    h1 { font-size: 22pt; border-bottom: 2px solid #c41e3a; padding-bottom: 8px; }
    h2 { font-size: 15pt; color: #c41e3a; margin-top: 28px; page-break-after: avoid; }
    h3 { font-size: 12pt; page-break-after: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 10pt; page-break-inside: avoid; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; }
    code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; }
    pre { background: #f4f4f4; padding: 10px; font-size: 9pt; page-break-inside: avoid; }
    pre code { background: none; padding: 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
    .mermaid { margin: 16px 0 24px; page-break-inside: avoid; text-align: center; }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    const source = ${JSON.stringify(processed)};
    document.getElementById('content').innerHTML = marked.parse(source);
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  </script>
</body>
</html>`;

async function main() {
  fs.writeFileSync(htmlPath, html, 'utf8');

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 120000 });

  await page.evaluate(async () => {
    await mermaid.run({ querySelector: '.mermaid' });
  });
  await new Promise((r) => setTimeout(r, 2000));

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' }
  });

  await browser.close();
  console.log('PDF written to:', pdfPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
