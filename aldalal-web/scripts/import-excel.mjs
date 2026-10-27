#!/usr/bin/env node
/**
 * Imports the ALDALAL price list (.xlsx) into the website.
 *
 *   npm run import                       -> reads data/price-list.xlsx
 *   npm run import -- path/to/file.xlsx  -> reads another file
 *
 * Expected sheet layout (first worksheet):
 *   - a header row with "#", "Photo", "Product", "Price ($)"
 *   - category rows like "SHAMPOO  (148 items)" in column A
 *   - product rows: A = number, B = photo (floating image on that row), C = name, D = price
 *   - blank price => shown as "Ask for price" on the site
 *
 * Better photos:
 *   put a file in data/photos/ named after the product id (for example
 *   data/photos/colgate-advanced-white-toothpaste-75ml.jpg) and it is used
 *   instead of the photo from the sheet.
 *
 * Output:
 *   - src/data/products.json
 *   - public/products/<id>-<hash>.webp  (resized, max 400px)
 *   - public/logo.png                   (image anchored in the top-left, if any)
 */
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const input = path.resolve(process.argv[2] ?? path.join(ROOT, "data/price-list.xlsx"));
const OUT_JSON = path.join(ROOT, "src/data/products.json");
const OUT_IMG_DIR = path.join(ROOT, "public/products");
const OUT_LOGO = path.join(ROOT, "public/logo.png");
const IMG_SIZE = 480; // card photo
const LARGE_SCALE = 2; // product page / zoom photo, upscaled and sharpened for retina screens
const LARGE_MAX = 1200;
const CATEGORY_FILE = path.join(ROOT, "data/categories.json"); // categories, for sheets that have no category rows
const PHOTO_OVERRIDES = path.join(ROOT, "data/photos"); // drop better photos here, named <product-id>.jpg|png|webp
const BRAND_BG = { r: 255, g: 255, b: 255, alpha: 1 }; // white, used behind the app icons

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: false,
  isArray: (name) =>
    ["row", "c", "si", "r", "Relationship", "oneCellAnchor", "twoCellAnchor", "sheet"].includes(name),
});

// Categories saved from an earlier import (used when the sheet has no category rows)
let savedCategories = { order: [], products: {} };
try {
  savedCategories = JSON.parse(await readFile(CATEGORY_FILE, "utf8"));
} catch {
  // no data/categories.json yet
}

// Higher-resolution replacements, by product id
const overrides = new Map();
try {
  for (const file of await readdir(PHOTO_OVERRIDES)) {
    const ext = path.extname(file).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext)) {
      overrides.set(path.basename(file, ext).toLowerCase(), path.join(PHOTO_OVERRIDES, file));
    }
  }
} catch {
  // no data/photos folder, that is fine
}

const zip = await JSZip.loadAsync(await readFile(input));
const readXml = async (p) => {
  const file = zip.file(p);
  if (!file) return null;
  return parser.parse(await file.async("string"));
};
const relsPath = (p) => path.posix.join(path.posix.dirname(p), "_rels", path.posix.basename(p) + ".rels");
const readRels = async (p) => {
  const xml = await readXml(relsPath(p));
  const map = {};
  for (const r of xml?.Relationships?.Relationship ?? []) {
    map[r["@Id"]] = path.posix.normalize(path.posix.join(path.posix.dirname(p), r["@Target"]));
  }
  return map;
};

// ---- locate first worksheet -------------------------------------------------
const workbook = await readXml("xl/workbook.xml");
const firstSheet = workbook.workbook.sheets.sheet[0];
const wbRels = await readRels("xl/workbook.xml");
const sheetPath = wbRels[firstSheet["@id"]].replace(/^\//, "");

// ---- shared strings ---------------------------------------------------------
const textOf = (node) => {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "object" && "#text" in node) return String(node["#text"]);
  return "";
};
const sst = await readXml("xl/sharedStrings.xml");
const shared = (sst?.sst?.si ?? []).map((si) =>
  si.t !== undefined ? textOf(si.t) : (si.r ?? []).map((run) => textOf(run.t)).join(""),
);

// ---- cells ------------------------------------------------------------------
const sheet = await readXml(sheetPath);
const rows = new Map(); // rowNumber -> { A, B, C, D }
for (const row of sheet.worksheet.sheetData?.row ?? []) {
  const cells = {};
  for (const c of row.c ?? []) {
    const col = c["@r"].replace(/\d+/g, "");
    let value = null;
    const t = c["@t"];
    if (t === "s") value = shared[Number(c.v)];
    else if (t === "inlineStr") value = c.is?.t !== undefined ? textOf(c.is.t) : (c.is?.r ?? []).map((x) => textOf(x.t)).join("");
    else if (t === "str" || t === "e") value = c.v !== undefined ? textOf(c.v) : null;
    else if (t === "b") value = c.v === "1";
    else if (c.v !== undefined) value = Number(c.v);
    if (c.f !== undefined) cells[col + "_formula"] = true;
    cells[col] = value;
  }
  rows.set(Number(row["@r"]), cells);
}

// ---- floating images, keyed by the row they are anchored on ------------------
const sheetRels = await readRels(sheetPath);
const drawingRelId = sheet.worksheet.drawing?.["@id"];
const imagesByRow = new Map(); // rowNumber -> [{ col, file }]
if (drawingRelId) {
  const drawingPath = sheetRels[drawingRelId];
  const drawing = await readXml(drawingPath);
  const drawingRels = await readRels(drawingPath);
  const anchors = [...(drawing.wsDr.oneCellAnchor ?? []), ...(drawing.wsDr.twoCellAnchor ?? [])];
  for (const a of anchors) {
    const embed = a.pic?.blipFill?.blip?.["@embed"];
    if (!embed) continue;
    const rowNum = Number(a.from.row) + 1; // xdr rows are 0-based
    const col = Number(a.from.col);
    const list = imagesByRow.get(rowNum) ?? [];
    list.push({ col, file: drawingRels[embed] });
    imagesByRow.set(rowNum, list);
  }
}

// ---- helpers ----------------------------------------------------------------
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s(\-/])([a-z])/g, (_, p, ch) => p + ch.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

// ---- walk rows ----------------------------------------------------------------
const rowNumbers = [...rows.keys()].sort((a, b) => a - b);
const headerRow = rowNumbers.find((n) => /product/i.test(String(rows.get(n).C ?? "")));
if (!headerRow) throw new Error('Could not find the header row (a "Product" cell in column C).');

// A category row has text in column A and nothing in column C. When the sheet has
// them, the sheet is the source of truth for both the grouping and the order.
const isCategoryRow = (r) => typeof r.A === "string" && r.A.trim() !== "" && !clean(r.C);
const sheetHasCategories = rowNumbers.some((n) => n > headerRow && isCategoryRow(rows.get(n)));

const categories = [];
const products = [];
const usedIds = new Set();
let current = null;
const warnings = [];
let overridesUsed = 0;

await rm(OUT_IMG_DIR, { recursive: true, force: true });
await mkdir(OUT_IMG_DIR, { recursive: true });
await mkdir(path.dirname(OUT_JSON), { recursive: true });

for (const n of rowNumbers) {
  if (n <= headerRow) continue;
  const r = rows.get(n);
  const a = r.A;
  const name = clean(r.C);

  // Category row: text in column A, nothing in column C
  if (isCategoryRow(r)) {
    const label = clean(a.replace(/\(\s*\d+\s*items?\s*\)/i, ""));
    current = { id: slugify(label), name: titleCase(label), count: 0 };
    categories.push(current);
    continue;
  }
  if (!name) {
    if (typeof a === "number" || imagesByRow.has(n)) warnings.push(`Row ${n}: skipped (#${a ?? "?"} has no product name)`);
    continue;
  }
  if (r.D_formula || /^total$/i.test(name)) continue; // totals row

  // The sheet may be a flat list. Fall back to the categories saved in data/categories.json.
  const savedName = sheetHasCategories ? null : savedCategories.products?.[name];
  if (savedName) {
    if (current?.name !== savedName) {
      current = categories.find((c) => c.name === savedName);
      if (!current) {
        current = { id: slugify(savedName), name: savedName, count: 0 };
        categories.push(current);
      }
    }
  } else if (!current) {
    current = { id: "other", name: "Other", count: 0 };
    categories.push(current);
  }

  let price = null;
  if (typeof r.D === "number" && Number.isFinite(r.D)) price = Math.round(r.D * 100) / 100;
  else if (typeof r.D === "string" && r.D.trim()) {
    const parsed = Number(r.D.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) price = Math.round(parsed * 100) / 100;
  }

  let id = slugify(name) || `item-${n}`;
  if (usedIds.has(id)) {
    let i = 2;
    while (usedIds.has(`${id}-${i}`)) i++;
    id = `${id}-${i}`;
  }
  usedIds.add(id);

  let image = null;
  const imgs = (imagesByRow.get(n) ?? []).sort((x, y) => Math.abs(x.col - 1) - Math.abs(y.col - 1));
  const override = overrides.get(id);
  if (override || imgs.length) {
    const buf = override ? await readFile(override) : await zip.file(imgs[0].file).async("nodebuffer");
    const source = sharp(buf).rotate().flatten({ background: "#ffffff" });
    const meta = await source.metadata();
    const native = Math.max(meta.width ?? IMG_SIZE, meta.height ?? IMG_SIZE);

    // Card photo: the original size (never upscaled), at high quality
    const card = await source
      .clone()
      .resize({ width: IMG_SIZE, height: IMG_SIZE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    const hash = createHash("sha1").update(card.data).digest("hex").slice(0, 8);
    const fileName = `${id}-${hash}.webp`;
    await writeFile(path.join(OUT_IMG_DIR, fileName), card.data);

    // Big photo for the product page and the zoom view: twice the size, sharpened,
    // so it still looks crisp on phone and retina screens
    const largeSide = Math.min(LARGE_MAX, Math.round(native * LARGE_SCALE));
    const large = await source
      .clone()
      .resize({ width: largeSide, height: largeSide, fit: "inside", kernel: "lanczos3" })
      .sharpen({ sigma: 0.8, m1: 0.6, m2: 0.4 })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
    const largeName = `${id}-${hash}@2x.webp`;
    await writeFile(path.join(OUT_IMG_DIR, largeName), large.data);

    image = {
      src: `/products/${fileName}`,
      width: card.info.width,
      height: card.info.height,
      large: { src: `/products/${largeName}`, width: large.info.width, height: large.info.height },
    };
    if (override) overridesUsed++;
  } else {
    warnings.push(`Row ${n}: no photo for "${name}"`);
  }

  current.count++;
  products.push({ id, name, price, category: current.id, image });
}

// Logo = image anchored above the header row. It also becomes the app icons.
const logoRow = [...imagesByRow.keys()].filter((n) => n <= headerRow).sort((a, b) => a - b)[0];
if (logoRow) {
  const buf = await zip.file(imagesByRow.get(logoRow)[0].file).async("nodebuffer");
  await sharp(buf).png().toFile(OUT_LOGO);

  // App icons for "add to home screen"
  const icon = async (size, padding) =>
    sharp({
      create: { width: size, height: size, channels: 4, background: BRAND_BG },
    })
      .composite([
        {
          input: await sharp(buf)
            .resize(Math.round(size * (1 - padding * 2)), Math.round(size * (1 - padding * 2)), { fit: "contain", background: BRAND_BG })
            .png()
            .toBuffer(),
          gravity: "centre",
        },
      ])
      .png();

  await (await icon(192, 0.06)).toFile(path.join(ROOT, "public/icon-192.png"));
  await (await icon(512, 0.06)).toFile(path.join(ROOT, "public/icon-512.png"));
  await (await icon(512, 0.18)).toFile(path.join(ROOT, "public/icon-maskable-512.png"));
  await (await icon(180, 0.06)).toFile(path.join(ROOT, "public/apple-touch-icon.png"));

  // favicon.ico (a 32px PNG inside an ICO container) so browsers stop asking for one
  const favPng = await (await icon(32, 0.04)).toBuffer();
  const header = Buffer.from([0, 0, 1, 0, 1, 0]);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(favPng.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  await writeFile(path.join(ROOT, "public/favicon.ico"), Buffer.concat([header, entry, favPng]));
  await sharp(buf).png().toFile(path.join(ROOT, "src/app/icon.png"));
}

// A flat sheet keeps the category order from data/categories.json; a sheet with
// category rows keeps its own order
if (!sheetHasCategories && savedCategories.order?.length) {
  const rank = new Map(savedCategories.order.map((name, i) => [name, i]));
  categories.sort((a, b) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999));
}

// Remember the categories so a flat sheet keeps working next time
await writeFile(
  CATEGORY_FILE,
  JSON.stringify(
    {
      note: "Categories for products, kept here because the price list sheet may not have category rows. Product name -> category name.",
      order: categories.filter((c) => c.count > 0).map((c) => c.name),
      products: Object.fromEntries(products.map((p) => [p.name, categories.find((c) => c.id === p.category)?.name ?? "Other"])),
    },
    null,
    1,
  ) + "\n",
);

const data = {
  generatedAt: new Date().toISOString(),
  source: path.basename(input),
  categories: categories.filter((c) => c.count > 0),
  products,
};
await writeFile(OUT_JSON, JSON.stringify(data, null, 1) + "\n");

const noPrice = products.filter((p) => p.price === null).length;
console.log(`Imported ${products.length} products in ${data.categories.length} categories from ${data.source}`);
console.log(`  ${noPrice} without a price (shown as "Ask for price")`);
if (overridesUsed) console.log(`  ${overridesUsed} used a better photo from data/photos/`);
for (const c of data.categories) console.log(`  - ${c.name}: ${c.count}`);
if (warnings.length) console.warn(warnings.map((w) => "  ! " + w).join("\n"));
