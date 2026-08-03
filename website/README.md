# Meisai official website
<!--
This folder contains the static, responsive landing site deployed through
GitHub Pages. It presents Meisai's problems, workflows, features, support,
and current privacy policy.

## Local preview

Build the site with production-style token replacement:

```powershell
$env:SITE_URL="http://localhost:4173"
node website/build.mjs
python -m http.server 4173 --directory _site
```

Open `http://localhost:4173`.

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions**.
4. Push to `main` or run the **Deploy Meisai website** workflow manually.

The workflow uses the URL returned by GitHub Pages to generate canonical URLs,
Open Graph URLs, structured data, `robots.txt`, and `sitemap.xml`.

## Chrome Web Store URL

After the extension is published, add this GitHub repository variable:

- Name: `CHROME_WEB_STORE_URL`
- Value: the public Meisai Chrome Web Store listing URL

Until it is configured, install buttons clearly show **Chrome Web Store —
Coming soon** and do not point to an unrelated listing.

## Optional deployment variables

- `FEEDBACK_URL`: overrides the published Google feedback form.
- A custom domain can be configured through GitHub Pages settings. The Pages
  action will provide the final base URL to the build.

## Search discovery checklist

After deployment:

1. Verify `/robots.txt` and `/sitemap.xml` use the production URL.
2. Add the site to Google Search Console.
3. Submit `/sitemap.xml`.
4. Test the homepage with Google's Rich Results Test.
5. Request indexing for the homepage, support page, and privacy page.
6. Add the website and privacy-policy URLs to the Chrome Web Store listing.
-->
