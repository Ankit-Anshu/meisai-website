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
const storeUrl = normalizeUrl(process.env.CHROME_WEB_STORE_URL);
const feedbackUrl =
  normalizeUrl(process.env.FEEDBACK_URL) ||
  "https://docs.google.com/forms/d/e/1FAIpQLSc6N-8Iol-X6HRtiHRKYc14SRGvKaun4Kpl-UzhpuqxrYNgMw/viewform?usp=publish-editor";

const replacements = new Map([
  ["__SITE_URL__", siteUrl],
  ["__REPOSITORY_URL__", repositoryUrl],
  ["__STORE_URL__", storeUrl || "#availability"],
  ["__STORE_CTA__", storeUrl ? "Add to Chrome" : "Chrome Web Store — Coming soon"],
  ["__STORE_AVAILABLE__", storeUrl ? "true" : "false"],
  [
    "__AVAILABILITY_NOTE__",
    storeUrl
      ? "Available for Google Chrome 114 and later."
      : "The public Chrome Web Store listing link will appear here when publishing is complete.",
  ],
  ["__FEEDBACK_URL__", feedbackUrl],
]);

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, {
  recursive: true,
  filter: (entry) => !["build.mjs", "README.md"].includes(path.basename(entry)),
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
console.log(`Chrome Web Store CTA: ${storeUrl || "coming soon"}`);
