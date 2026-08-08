import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(source, "..");
const destination = path.join(projectRoot, "_site");
const normalizeUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const siteUrl = normalizeUrl(process.env.SITE_URL) || "http://localhost:4173";
const repositoryUrl = normalizeUrl(
  process.env.REPOSITORY_URL ||
    (process.env.GITHUB_REPOSITORY
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}`
      : "https://github.com"),
);
const hasGitHubRepository =
  /^https:\/\/github\.com\/[^/]+\/[^/]+$/i.test(repositoryUrl);
const issuesUrl =
  hasGitHubRepository
    ? `${repositoryUrl}/issues/new`
    : repositoryUrl;
const chromeStoreUrl = normalizeUrl(process.env.CHROME_WEB_STORE_URL);
const firefoxStoreUrl =
  normalizeUrl(process.env.FIREFOX_ADDONS_URL) ||
  "https://addons.mozilla.org/en-US/firefox/addon/meisai-workspace";
const braveStoreUrl = normalizeUrl(process.env.BRAVE_EXTENSION_URL) || chromeStoreUrl;
const feedbackUrl =
  normalizeUrl(process.env.FEEDBACK_URL) ||
  "https://forms.gle/sGxecwiz6z5R2UNB6";

const replacements = new Map([
  ["__SITE_URL__", siteUrl],
  ["__REPOSITORY_URL__", repositoryUrl],
  ["__ISSUES_URL__", issuesUrl],
  ["__CHROME_STORE_URL__", chromeStoreUrl || "#availability"],
  ["__FIREFOX_STORE_URL__", firefoxStoreUrl],
  ["__BRAVE_STORE_URL__", braveStoreUrl || "#availability"],
  ["__CHROME_CTA__", chromeStoreUrl ? "Add to Chrome" : "Chrome: Coming soon"],
  ["__FIREFOX_CTA__", "Add to Firefox"],
  ["__BRAVE_CTA__", braveStoreUrl ? "Add to Brave" : "Brave: Coming soon"],
  ["__STORE_AVAILABLE__", "true"],
  [
    "__AVAILABILITY_NOTE__",
    chromeStoreUrl
      ? "Available for Firefox, Google Chrome, and Brave."
      : "Available now for Firefox. Chrome and Brave listings are coming soon.",
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
console.log(`Firefox Add-ons CTA: ${firefoxStoreUrl}`);
console.log(`Brave CTA: ${braveStoreUrl || "uses Chrome Web Store when available"}`);
