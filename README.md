# DataViz Studio — Interactive Chart & Graph Builder

A responsive, browser-based chart builder created for the beginner Data Analytics internship task **“Create Charts & Graphs.”** It uses HTML5, CSS3, vanilla JavaScript, and Chart.js 4.

## Files

- `index.html` — application structure and Chart.js CDN import
- `style.css` — responsive layout, colourful theme, and component styling
- `script.js` — sample data, CSV parsing, filtering, analytics, charts, and exports
- `sample-data.csv` — 30 fictional sales records across seven fields
- `README.md` — this guide

## Run the application

1. Extract the project folder.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, or Safari).
3. For the Chart.js library, keep an internet connection available because it is loaded from jsDelivr CDN.
4. The sample dataset loads automatically. No server, database, account, or build process is required.

You can also serve the folder with a simple local static server if preferred, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to use

### Explore the sample data
The sample sales dataset contains 30 fictional records with Month, Product, Category, Sales, Profit, Quantity, and Region. The overview cards and automatic insights are calculated from the currently visible records.

### Upload a CSV
Select **Upload CSV** or **Import data** and choose a `.csv` file. Files are parsed locally in your browser. The importer supports quoted fields, commas inside quoted values, escaped quotes, and line breaks inside quoted values. It checks for a header row, unique column names, a data row, and a 5 MB file-size limit. Empty cells remain blank; numeric-looking values are converted to numbers. Non-numeric values in a selected Y-axis field are skipped during aggregation.

### Build charts
1. Enter a chart title.
2. Choose an X-axis/category column.
3. Choose a numeric Y-axis/value column.
4. Select Bar, Line, Pie, Doughnut, Radar, or Polar area.
5. Click **Generate chart**. The preview updates and a new chart is added to the gallery.

For category charts, values are summed for each distinct X-axis category. Pie, doughnut, and polar-area charts show up to 18 categories to keep the visual legible.

### Search, filter, and sort
Use the dataset search to match text across any column. The column filter narrows records to a selected value. Click a table heading to sort ascending or descending. Analytics, insights, and all existing charts refresh from the filtered records.

### Export
- Each gallery chart has a download icon to save a PNG image.
- **Filtered dataset** downloads the visible records as CSV.
- **Chart summary** downloads a text report with dataset details, insights, and gallery chart definitions.

## Technical notes and limitations

- All dataset processing takes place in the browser; the application does not connect to an external database or upload data to a server.
- Chart.js is loaded from a public CDN, so chart rendering requires internet access unless you change the script tag to point to a locally hosted Chart.js file.
- The application is intentionally a lightweight front-end project. Uploaded data is held in page memory and is not persisted after refreshing or closing the tab.
- The “Average value” card uses the `Sales` column when present. The maximum card displays the maximum sales value; its title attribute includes the minimum.
- Existing charts respond to the current filters and use their saved column/type selections. The preview reflects the current builder settings.
- Very large datasets may be slower because the table and charts run on the client.

## Sample data

`sample-data.csv` is fictional and intended for learning and demonstration only. Currency figures are illustrative INR amounts; no real company or customer information is included.

## Troubleshooting

- If charts do not render, check the internet connection and confirm the Chart.js CDN can be reached.
- If a CSV is rejected, make sure it is comma-separated, has a single unique header row, and includes at least one record.
- For best results, use clear column names and numeric values in the field intended for the chart Y-axis.
