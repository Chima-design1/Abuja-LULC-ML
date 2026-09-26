# Methodology

## 1. Study area

The project uses Abuja, Nigeria, as the study area. The analysis is performed over the Abuja study polygon defined in the Google Earth Engine workflow.

## 2. Satellite data

The classification workflow uses **Sentinel-2 Surface Reflectance Harmonized** imagery.

For both 2023 and 2024, the workflow uses imagery from **1 January to 1 May**, applies a cloud-filter threshold of 40, and creates a median composite.

Reflectance bands are scaled by dividing the Sentinel-2 surface-reflectance values by 10,000.

## 3. Predictor variables

The classification feature set contains B2, B3, B4, B8, B11 and B12, plus NDVI, NDWI, NDBI, BSI and SAVI.

This produces an 11-band predictor stack.

## 4. Training data

Training polygons represent five LULC classes:

0. Built-up
1. Vegetation
2. Bare land
3. Water
4. Cropland

The workflow samples up to 300 pixels per class for the annual classification process.

## 5. Random Forest classification

A Random Forest classifier with 150 trees is trained separately for 2023 and 2024.

The resulting classified rasters contain the five integer class codes defined above.

## 6. Accuracy assessment

Two validation approaches are implemented in the GEE workflow: an initial random-split assessment and a separate holdout assessment.

Reported holdout results are:

- 2023: 1,271 samples, 1,035 training samples and 236 validation samples; overall accuracy 97.03%; Kappa 0.962.
- 2024: 1,271 samples, 1,004 training samples and 267 validation samples; overall accuracy 98.13%; Kappa 0.976.

## 7. Area estimation

Pixel counts are converted to area using pixel-area calculations in Google Earth Engine.

The resulting statistics are exported in square metres, hectares and square kilometres, together with percentages of the mapped study extent.

## 8. Change detection

A simple 2023–2024 change product is derived by comparing the annual classified maps.

The transition product provides more detailed information by encoding the origin and destination classes.

## 9. Transition modelling

Each transition is encoded using the formula:

old_class × 5 + new_class

With five classes, this creates 25 possible transition states ranging from 0 to 24.

A transition probability matrix is then calculated from the observed 2023–2024 transitions.

A separate Random Forest transition model uses 2023 predictor variables to model the 2024 class as the target.

The transition model used 1,982 training samples and 518 validation samples, with 70.27% validation overall accuracy and 0.628 validation Kappa.

## 10. 2026 baseline projection

The workflow generates the 2026 baseline prediction from the transition analysis and transition modelling approach.

The resulting 2026 map should be described as an **exploratory baseline projection** because it is not independently validated against observed 2026 reference data.

## 11. Reproducibility

The complete GEE implementation is stored at:

gee/Abuja_LULC_Classification.js

Numerical results are stored in:

results/accuracy/
results/area_statistics/
results/transition_matrix/

The corresponding raster products are intended for:

maps/
