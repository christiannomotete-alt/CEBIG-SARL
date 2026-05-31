#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const fetch = require('node-fetch');
const sharp = require('sharp');

const outDir = path.resolve(__dirname, '..', 'images');
const originalsDir = path.join(outDir, 'originals');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(originalsDir)) fs.mkdirSync(originalsDir, { recursive: true });

const images = [
  { name: 'hero', query: 'construction,panoramic' },
  { name: 'expertise-construction', query: 'construction,workers' },
  { name: 'expertise-renovation', query: 'renovation,tools' },
  { name: 'expertise-hydraulique', query: 'plumbing,water' },
  { name: 'project-1', query: 'residential,building' },
  { name: 'project-2', query: 'industrial,facility' },
  { name: 'project-3', query: 'shopping,mall' },
  { name: 'project-4', query: 'urban,development' },
  { name: 'project-5', query: 'rehabilitation,building' }
];

const sizes = [
  { w: 400, h: 300 },
  { w: 800, h: 600 },
  { w: 1600, h: 900 }
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  await pipeline(res.body, fs.createWriteStream(dest));
}

async function processImage(item) {
  const manifestEntry = { name: item.name };
  for (const s of sizes) {
    const url = `https://source.unsplash.com/${s.w}x${s.h}/?${item.query}`;
    const origPath = path.join(originalsDir, `${item.name}-${s.w}x${s.h}.jpg`);
    console.log(`Downloading ${url} -> ${origPath}`);
    await download(url, origPath);

    // Re-encode jpeg optimized and webp
    const outJpg = path.join(outDir, `${item.name}-${s.w}.jpg`);
    const outWebp = path.join(outDir, `${item.name}-${s.w}.webp`);

    await sharp(origPath)
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outJpg);

    await sharp(origPath)
      .webp({ quality: 78 })
      .toFile(outWebp);

    manifestEntry[`jpg${s.w}`] = path.relative(process.cwd(), outJpg).replace(/\\/g, '/');
    manifestEntry[`webp${s.w}`] = path.relative(process.cwd(), outWebp).replace(/\\/g, '/');
  }
  return manifestEntry;
}

(async function main() {
  try {
    const manifest = {};
    for (const img of images) {
      const entry = await processImage(img);
      manifest[entry.name] = entry;
    }
    const manifestPath = path.join(outDir, 'images-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Manifest written to ${manifestPath}`);

    // Update local files: replace hotlinks in css/index/js where possible
    const cssPath = path.join(process.cwd(), 'css', 'style.css');
    const indexPath = path.join(process.cwd(), 'index.html');
    const jsPath = path.join(process.cwd(), 'js', 'script.js');

    // Backup
    fs.copyFileSync(cssPath, cssPath + '.bak');
    fs.copyFileSync(indexPath, indexPath + '.bak');
    fs.copyFileSync(jsPath, jsPath + '.bak');

    // CSS: hero background replacement
    let css = fs.readFileSync(cssPath, 'utf8');
    css = css.replace(/https:\/\/source\.unsplash\.com\/1600x900\/\?construction,panoramic/g, manifest.hero.jpg1600);
    fs.writeFileSync(cssPath, css, 'utf8');

    // HTML: replace picture/source/img hotlinks for expertises
    let html = fs.readFileSync(indexPath, 'utf8');
    const replacePicture = (name, alt) => {
      const m = manifest[name];
      if (!m) return;
      const pic = `\n<picture>\n  <source type="image/webp" srcset="${m.webp1600} 1600w, ${m.webp800} 800w, ${m.webp400} 400w" sizes="(max-width:600px) 400px, (max-width:1000px) 800px, 1600px">\n  <img src="${m.jpg800}" srcset="${m.jpg400} 400w, ${m.jpg800} 800w, ${m.jpg1600} 1600w" sizes="(max-width:600px) 400px, (max-width:1000px) 800px, 1600px" alt="${alt}" loading="lazy">\n</picture>\n`;
      return pic;
    };

    // Replace specific Unsplash srcset blocks we added earlier by searching for the query strings
    html = html.replace(/<picture>\s*<source media="\(min-width:1000px\)" srcset="https:\/\/source\.unsplash\.com\/1600x900\/\?construction,workers">[\s\S]*?<img src="https:\/\/source\.unsplash\.com\/800x600\/\?construction,workers" alt="Construction" loading="lazy">\s*<\/picture>/g, replacePicture('expertise-construction','Construction'));
    html = html.replace(/<picture>\s*<source media="\(min-width:1000px\)" srcset="https:\/\/source\.unsplash\.com\/1600x900\/\?renovation,tools">[\s\S]*?<img src="https:\/\/source\.unsplash\.com\/800x600\/\?renovation,tools" alt="Rénovation" loading="lazy">\s*<\/picture>/g, replacePicture('expertise-renovation','Rénovation'));
    html = html.replace(/<picture>\s*<source media="\(min-width:1000px\)" srcset="https:\/\/source\.unsplash\.com\/1600x900\/\?plumbing,water">[\s\S]*?<img src="https:\/\/source\.unsplash\.com\/800x600\/\?plumbing,water" alt="Hydraulique" loading="lazy">\s*<\/picture>/g, replacePicture('expertise-hydraulique','Hydraulique'));

    fs.writeFileSync(indexPath, html, 'utf8');

    // JS: replace project image hotlinks with local medium jpg
    let js = fs.readFileSync(jsPath, 'utf8');
    const mapping = {
      'https://source.unsplash.com/800x600/?residential,building': manifest['project-1'] ? manifest['project-1'].jpg800 : null,
      'https://source.unsplash.com/800x600/?industrial,facility': manifest['project-2'] ? manifest['project-2'].jpg800 : null,
      'https://source.unsplash.com/800x600/?water,system': manifest['project-3'] ? manifest['project-3'].jpg800 : null,
      'https://source.unsplash.com/800x600/?school,building': manifest['project-4'] ? manifest['project-4'].jpg800 : null,
      'https://source.unsplash.com/800x600/?bridge,rehabilitation': manifest['project-5'] ? manifest['project-5'].jpg800 : null
    };
    for (const [k,v] of Object.entries(mapping)) {
      if (v) js = js.replace(new RegExp(k.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&'),'g'), v);
    }
    fs.writeFileSync(jsPath, js, 'utf8');

    console.log('Références locales mises à jour (sauvegardes .bak créées).');
    console.log('Terminé. Vérifiez `images/images-manifest.json` et ouvrez le site en local pour valider.');
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
})();
