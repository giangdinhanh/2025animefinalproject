<<<<<<< HEAD
# AniBomb Anime Analytics

Static GitHub Pages website.

## Time-series forecast
The Predictor page uses exact values from `timeseriesforecast.xlsx`:
- Historical Favorites: 2004–2024
- Forecast Favorites: 2025–2034
- Seasonality: 3 years
- Interactive Chart.js hover/tap tooltips

The forecast values are bundled into `static/forecast-data.js`, so no Python backend is required.
=======
# AniBomb Anime Success Predictor

Static four-page GitHub Pages website.

## Pages
- `index.html` — Home
- `predictor.html` — Favorites Predictor
- `insight.html` — Market & Genre Insights
- `info.html` — Model & Project Info

## Static assets
- `static/logo.png`
- `static/styles.css`
- `static/app.js`

## Prediction
The prediction runs in the browser using the regression equation stored in `static/app.js`. GitHub Pages cannot execute Python or load a scikit-learn `.pkl` server-side.

## Deploy
1. Upload all files to the root of a GitHub repository.
2. Open Settings → Pages.
3. Choose Deploy from a branch.
4. Select `main` and `/ (root)`.

## Workbook-synchronized Insights

The Insights page uses `static/insight-data.json`, generated from the project workbook. Genre, season, and source filters are combined with AND logic. The matching-title KPIs, average-favorites chart, top genre combinations, and 2004–2024 members trend all update from the same filtered cohort.

Because the page loads JSON with `fetch()`, preview it through GitHub Pages or a local web server rather than opening `insight.html` directly with a `file://` URL.


## Insights data
The Insights page uses `static/insight-data.js`, generated from the project Excel workbook. It is bundled into the site so filters work when opened locally and on GitHub Pages without a fetch request. The JSON export is also retained for reference.
>>>>>>> eb3d34213c6638779acdd03aeafb35ac4b16f163
