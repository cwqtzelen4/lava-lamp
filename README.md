# LAVA LAMP

LAVA LAMP is an independent student magazine from the American University in Bulgaria (AUBG) — stories, culture, and the print archive, published online.

## Pages

- `index.html` — home page, featuring the latest story and recent stories
- `stories.html` — full list of stories
- `article.html` — single article template
- `print.html` — print issue archive
- `issue.html` — single issue detail page
- `about.html` — about the magazine and the team

## Running locally

This is a static site with no build step. Open `index.html` directly in a browser, or serve the folder with any static file server, e.g.:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure

- `styles.css` — site-wide styles
- `nav.js` — mobile navigation toggle
- `assets/` — images and other static assets
