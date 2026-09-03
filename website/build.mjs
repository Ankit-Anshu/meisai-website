import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Builds the static site into `_site/` at the repository root by copying
// this folder, stripping conditional <!--IF_X--> blocks for browsers that
// aren't actually live, and replacing __TOKEN__ placeholders with real
// values. Per website.md: never imply support for a store that isn't live —
// so an unconfigured browser's markup is removed entirely, not shown as a
// disabled "coming soon" button.
// `_site` must match the `path:` the pages.yml workflow passes to
// actions/upload-pages-artifact, or the deploy step has nothing to upload.
const source = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(source, "..");
const destination = path.join(projectRoot, "_site");
const normalizeUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const siteUrl = normalizeUrl(process.env.SITE_URL) || "http://localhost:4174";
const repositoryUrl = normalizeUrl(
  process.env.REPOSITORY_URL ||
    (process.env.GITHUB_REPOSITORY
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}`
      : "https://github.com"),
);
const hasGitHubRepository = /^https:\/\/github\.com\/[^/]+\/[^/]+$/i.test(repositoryUrl);
const issuesUrl = hasGitHubRepository ? `${repositoryUrl}/issues/new` : repositoryUrl;
const chromeStoreUrl = normalizeUrl(process.env.CHROME_WEB_STORE_URL);
const firefoxStoreUrl =
  normalizeUrl(process.env.FIREFOX_ADDONS_URL) ||
  "https://addons.mozilla.org/en-US/firefox/addon/meisai-workspace";
// Edge is confirmed live (like Firefox), so it gets the same
// env-override-with-hardcoded-fallback treatment and is shown unconditionally
// in markup rather than gated behind an <!--IF_EDGE--> block.
const edgeStoreUrl =
  normalizeUrl(process.env.EDGE_ADDONS_URL) ||
  "https://microsoftedge.microsoft.com/addons/detail/hhfeegdajopjadmjnlbaengafbphcaoa";
const braveStoreUrl = normalizeUrl(process.env.BRAVE_EXTENSION_URL) || chromeStoreUrl;
const feedbackUrl =
  normalizeUrl(process.env.FEEDBACK_URL) || "https://forms.gle/sGxecwiz6z5R2UNB6";

// Ordered so the availability note and JSON-LD operatingSystem list read
// naturally: browsers confirmed live (Firefox, Edge) first, then whichever
// optional ones (Chrome, Brave) happen to be configured for this build.
const liveBrowsers = [
  "Firefox",
  "Edge",
  ...(chromeStoreUrl ? ["Chrome"] : []),
  ...(braveStoreUrl ? ["Brave"] : []),
];
const listJoin = (items) =>
  items.length <= 2
    ? items.join(" and ")
    : `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
const availabilityNote = `Available on ${listJoin(liveBrowsers)}.`;
const operatingSystems = liveBrowsers.join(", ");

const replacements = new Map([
  ["__SITE_URL__", siteUrl],
  ["__REPOSITORY_URL__", repositoryUrl],
  ["__ISSUES_URL__", issuesUrl],
  ["__CHROME_STORE_URL__", chromeStoreUrl],
  ["__FIREFOX_STORE_URL__", firefoxStoreUrl],
  ["__EDGE_STORE_URL__", edgeStoreUrl],
  ["__BRAVE_STORE_URL__", braveStoreUrl],
  ["__AVAILABILITY_NOTE__", availabilityNote],
  ["__OPERATING_SYSTEMS__", operatingSystems],
  ["__FEEDBACK_URL__", feedbackUrl],
]);

// Strips <!--IF_CHROME-->...<!--/IF_CHROME--> (keeping the inner content,
// markers removed) when the condition is true; removes the whole block
// (markers and content) when false.
const applyConditionalBlocks = (html, conditions) => {
  let output = html;
  for (const [name, isTrue] of Object.entries(conditions)) {
    const pattern = new RegExp(`<!--IF_${name}-->([\\s\\S]*?)<!--\\/IF_${name}-->`, "g");
    output = output.replace(pattern, isTrue ? "$1" : "");
  }
  return output;
};

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
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
];

for (const relative of textFiles) {
  const file = path.join(destination, relative);
  let content = await readFile(file, "utf8");
  content = applyConditionalBlocks(content, {
    CHROME: Boolean(chromeStoreUrl),
    BRAVE: Boolean(braveStoreUrl),
    MULTI_BROWSER: liveBrowsers.length > 1,
  });
  for (const [token, value] of replacements) content = content.replaceAll(token, value);
  await writeFile(file, content, "utf8");
}

console.log(`Built Meisai website at ${destination}`);
console.log(`Canonical URL: ${siteUrl}`);
console.log(`Firefox Add-ons: ${firefoxStoreUrl}`);
console.log(`Edge Add-ons: ${edgeStoreUrl}`);
console.log(`Chrome Web Store: ${chromeStoreUrl || "not live, hidden from site"}`);
console.log(`Brave: ${braveStoreUrl || "not live, hidden from site"}`);
