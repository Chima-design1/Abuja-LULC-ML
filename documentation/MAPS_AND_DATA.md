# Maps and Data Products

## Raster products

The project produces five principal GeoTIFF raster products.

| Product | Intended location | Description |
|---|---|---|
| 2023 LULC classification | maps/LULC_2023/ | Five-class Random Forest LULC map for 2023 |
| 2024 LULC classification | maps/LULC_2024/ | Five-class Random Forest LULC map for 2024 |
| 2023–2024 change map | maps/change_detection/ | Binary/simple change product derived from annual classifications |
| 2023–2024 transition map | maps/transition_analysis/ | 25-state transition coding derived from origin and destination classes |
| 2026 baseline prediction | maps/prediction_2026/ | Exploratory five-class baseline projection |

## Raster specifications checked for the exported files

The exported raster set uses:

- CRS: EPSG:4326
- Dimensions: 6680 × 5568 pixels
- 2023 and 2024 LULC class values: 0–4
- Change map values: 0–1
- Transition map values: 0–24
- 2026 prediction class values: 0–4

## Class legend

| Code | LULC class |
|---:|---|
| 0 | Built-up |
| 1 | Vegetation |
| 2 | Bare land |
| 3 | Water |
| 4 | Cropland |

## Transition coding

The transition raster uses:

transition_code = old_class × 5 + new_class

Therefore:

- 0–4 correspond to transitions originating from class 0.
- 5–9 correspond to transitions originating from class 1.
- 10–14 correspond to transitions originating from class 2.
- 15–19 correspond to transitions originating from class 3.
- 20–24 correspond to transitions originating from class 4.

The exact transition matrix and transition probabilities are provided as CSV files in results/transition_matrix/.

## Data handling note

The GeoTIFF files are analysis outputs rather than original Sentinel-2 source data. The original satellite imagery is accessed through Google Earth Engine by the GEE workflow.

The repository should therefore be treated as a reproducible analysis and results package, not as a mirror of the complete source-data archive.
