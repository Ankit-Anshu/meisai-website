import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(source, "..");
const destination = path.join(projectRoot, "_site");
const normalizeUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const siteUrl = normalizeUrl(process.env.SITE_URL) || "http://localhost:4173";
const repositoryUrl =
  normalizeUrl(process.env.REPOSITORY_URL) ||
  (process.env.GITHUB_REPOSITORY
    ? `https://github.com/${process.env.GITHUB_REPOSITORY}`
    : "https://github.com/");
const chromeStoreUrl = normalizeUrl(process.env.CHROME_WEB_STORE_URL);
const edgeStoreUrl = normalizeUrl(process.env.EDGE_ADDONS_URL);
const braveStoreUrl = normalizeUrl(process.env.BRAVE_EXTENSION_URL) || chromeStoreUrl;
const feedbackUrl =
  normalizeUrl(process.env.FEEDBACK_URL) ||
  "https://forms.gle/sGxecwiz6z5R2UNB6";

const replacements = new Map([
  ["__SITE_URL__", siteUrl],
  ["__REPOSITORY_URL__", repositoryUrl],
  ["__CHROME_STORE_URL__", chromeStoreUrl || "#availability"],
  ["__EDGE_STORE_URL__", edgeStoreUrl || "#availability"],
  ["__BRAVE_STORE_URL__", braveStoreUrl || "#availability"],
  ["__CHROME_CTA__", chromeStoreUrl ? "Add to Chrome" : "Chrome: Coming soon"],
  ["__EDGE_CTA__", edgeStoreUrl ? "Add to Edge" : "Edge: Coming soon"],
  ["__BRAVE_CTA__", braveStoreUrl ? "Add to Brave" : "Brave: Coming soon"],
  ["__STORE_AVAILABLE__", chromeStoreUrl || edgeStoreUrl ? "true" : "false"],
  [
    "__AVAILABILITY_NOTE__",
    chromeStoreUrl && edgeStoreUrl
      ? "Available for Google Chrome, Microsoft Edge, and Brave."
      : "Chrome Web Store and Microsoft Edge Add-ons links will appear here as each listing is published. Brave installs through the Chrome Web Store.",
  ],
  ["__FEEDBACK_URL__", feedbackUrl],
]);

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, {
  recursive: true,
  filter: (entry) =>
    !["build.mjs", "optimize-videos.mjs", "README.md"].includes(path.basename(entry)),
});

const textFiles = [
  "index.html",
  "privacy.html",
  "support.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
];

for (const relative of textFiles) {
  const file = path.join(destination, relative);
  let content = await readFile(file, "utf8");
  for (const [token, value] of replacements) content = content.replaceAll(token, value);
  await writeFile(file, content, "utf8");
}

console.log(`Built Meisai website at ${destination}`);
console.log(`Canonical URL: ${siteUrl}`);
console.log(`Chrome Web Store CTA: ${chromeStoreUrl || "coming soon"}`);
console.log(`Microsoft Edge Add-ons CTA: ${edgeStoreUrl || "coming soon"}`);
console.log(`Brave CTA: ${braveStoreUrl || "uses Chrome Web Store when available"}`);
