# Abuja LULC GeoAI/ML Project — Project Overview

## Project title

**Spatiotemporal Analysis and Machine Learning-Based Prediction of Land Use/Land Cover Change in Abuja, Nigeria Using Sentinel-2 Data**

## Overview

This project develops a reproducible remote-sensing and machine-learning workflow for mapping land use/land cover (LULC) in Abuja, Nigeria, assessing change between 2023 and 2024, modelling class-to-class transitions, and generating an exploratory 2026 baseline projection.

The workflow is implemented primarily in Google Earth Engine (GEE) using Sentinel-2 Surface Reflectance Harmonized imagery and Random Forest classification. Supporting outputs are organized as CSV results, GeoTIFF maps, and documentation.

## LULC classes

| Code | Class |
|---:|---|
| 0 | Built-up |
| 1 | Vegetation |
| 2 | Bare land |
| 3 | Water |
| 4 | Cropland |

## Main workflow

1. Acquire and preprocess Sentinel-2 imagery for Abuja.
2. Construct seasonal median composites for 2023 and 2024.
3. Calculate spectral indices including NDVI, NDWI, NDBI, BSI and SAVI.
4. Train Random Forest LULC classifiers.
5. Assess classification accuracy using random-split and holdout validation.
6. Quantify mapped LULC areas.
7. Derive a 2023–2024 change map.
8. Construct a 25-state transition matrix and transition-probability matrix.
9. Train a transition Random Forest model using 2023 predictors and 2024 target classes.
10. Generate an exploratory 2026 baseline prediction.

## Validation results

| Year | Validation samples | Overall accuracy | Kappa |
|---:|---:|---:|---:|
| 2023 | 236 | 97.03% | 0.962 |
| 2024 | 267 | 98.13% | 0.976 |

The transition Random Forest used 1,982 training samples and 518 validation samples. Its validation overall accuracy was **70.27%** with a **Kappa of 0.628**.

## Important interpretation note

The 2026 output is an **exploratory baseline projection**, not a guaranteed or independently validated forecast. The projection is derived from observed 2023–2024 transition tendencies and the transition modelling workflow.

Changes in mapped class area should likewise be interpreted as changes in classification results. They should not automatically be interpreted as measured physical expansion or loss without considering classification uncertainty, training data, imagery conditions, and methodological limitations.

## Reproducibility

The main Google Earth Engine workflow is stored in:

gee/Abuja_LULC_Classification.js

Numerical outputs are stored under:

results/

Exported raster products belong under:

maps/

Further methodological and data documentation is provided in this documentation directory.
