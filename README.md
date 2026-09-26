# Abuja-LULC-ML

## Spatiotemporal Analysis and Machine Learning-Based Prediction of Land Use/Land Cover Change in Abuja, Nigeria Using Sentinel-2 Data

## Project Overview

This project investigates land use and land cover (LULC) patterns and changes in Abuja, Nigeria, using Sentinel-2 satellite imagery, Geographic Information Systems (GIS), remote sensing, and machine learning.

The study classifies land cover for 2023 and 2024, assesses classification accuracy, quantifies class areas, analyzes LULC transitions, and develops exploratory approaches for modeling future land-cover patterns.

## Research Objectives

1. Classify land use and land cover in Abuja using Sentinel-2 satellite imagery.
2. Analyze land cover changes between 2023 and 2024.
3. Produce land cover area statistics and a transition matrix.
4. Investigate machine learning approaches for modeling land cover transitions.
5. Produce an exploratory baseline projection for 2026.
6. Maintain a reproducible geospatial workflow using Google Earth Engine.

## Study Area

The study focuses on Abuja, Federal Capital Territory, Nigeria.

## Land Cover Classes

| Class | Land Cover |
|---|---|
| 0 | Built-up |
| 1 | Vegetation |
| 2 | Bare land |
| 3 | Water |
| 4 | Cropland |

## Data and Tools

- Sentinel-2 Surface Reflectance Harmonized imagery
- Google Earth Engine
- JavaScript
- QGIS / GIS
- Remote sensing indices: NDVI, NDWI, NDBI, BSI, SAVI
- Random Forest machine learning
- Land-cover training and validation samples

## Methodology

The workflow is:

1. Define the Abuja study area.
2. Acquire and filter Sentinel-2 imagery for comparable seasonal periods.
3. Prepare spectral bands and remote-sensing indices.
4. Create land-cover training polygons.
5. Train Random Forest classifiers for 2023 and 2024.
6. Assess classification accuracy.
7. Calculate LULC area statistics.
8. Generate change-detection and transition outputs.
9. Calculate transition probabilities.
10. Train and evaluate a transition Random Forest model.
11. Produce an exploratory 2026 baseline projection.

## Classification Accuracy

Two internal validation approaches were implemented.

### Initial random-split validation

| Year | Overall Accuracy | Kappa |
|---|---:|---:|
| 2023 | 97.07% | 0.963 |
| 2024 | 98.80% | 0.985 |

### Holdout validation

| Year | Samples | Training | Validation | Overall Accuracy | Kappa |
|---|---:|---:|---:|---:|---:|
| 2023 | 1271 | 1035 | 236 | 97.03% | 0.962 |
| 2024 | 1271 | 1004 | 267 | 98.13% | 0.976 |

These are internal pixel-based validation results. They should not be interpreted as fully independent spatial or field validation because the samples were derived from the same general training-polygon framework.

## Area Statistics

| Year | Class | Area (km²) | Percentage |
|---|---|---:|---:|
| 2023 | Built-up | 380.5670 | 10.4323% |
| 2023 | Vegetation | 15.1942 | 0.4165% |
| 2023 | Bare land | 2990.8557 | 81.9868% |
| 2023 | Water | 15.1457 | 0.4152% |
| 2023 | Cropland | 246.2086 | 6.7492% |
| 2024 | Built-up | 1928.6668 | 52.8696% |
| 2024 | Vegetation | 122.8571 | 3.3678% |
| 2024 | Bare land | 760.1422 | 20.8374% |
| 2024 | Water | 15.2096 | 0.4169% |
| 2024 | Cropland | 821.0955 | 22.5083% |

The mapped LULC composition changes substantially between the two classified years. These results describe classification outputs and should not by themselves be interpreted as confirmed physical land conversion.

## Transition Analysis

The transition matrix contains all 25 possible class-to-class transitions between 2023 and 2024.

The largest mapped transition is **Bare land → Built-up**, with approximately **1,592.82 km²**. The next largest is **Bare land → Cropland**, with approximately **633.73 km²**.

The transition probability matrix is provided alongside the transition-area matrix.

## Transition Machine Learning

A Random Forest transition model was trained using 2023 predictor information and 2024 observed LULC as the target.

- Training samples: 1,982
- Validation samples: 518
- Overall accuracy: 70.27%
- Kappa: 0.628

The transition model is less accurate than the individual-year LULC classifiers and is therefore treated as an exploratory modeling experiment rather than a definitive forecasting model.

## 2026 Baseline Projection

A Markov-style baseline projection was generated from the observed 2023→2024 transition probabilities and spatial allocation.

This is an **exploratory baseline scenario**, not a validated forecast. It should be interpreted as a continuation-of-transition-patterns experiment rather than a guaranteed representation of future land cover.

## Repository Structure

```text
Abuja-LULC-ML/
├── README.md
├── gee/
│   └── Abuja_LULC_Classification.js
└── results/
    ├── accuracy/
    │   ├── README.md
    │   └── LULC_Accuracy_Assessment.csv
    ├── area_statistics/
    │   ├── README.md
    │   └── LULC_Area_Statistics.csv
    └── transition_matrix/
        ├── README.md
        ├── LULC_Transition_Matrix_2023_2024.csv
        └── LULC_Transition_Probabilities_2023_2024.csv
```

## Limitations

- Validation is based on pixel samples derived from the training-polygon framework rather than independent field observations.
- The 2026 projection is exploratory and has not been validated against future observed land cover.
- Classification results can be affected by training-sample quality, spectral similarity, seasonal differences, and image conditions.
- A longer time series would provide a stronger basis for temporal modeling.
- Future work can incorporate independent spatial validation and additional explanatory variables such as roads, elevation, population, and protected areas.

## Future Work

- Add additional Sentinel-2 years to strengthen temporal analysis.
- Perform independent spatial and temporal validation.
- Test additional machine-learning and deep-learning models.
- Incorporate explanatory variables such as roads, elevation, population, and accessibility.
- Develop a more spatially explicit prediction framework.
- Prepare publication-quality maps and research documentation.
- Develop an interactive visualization dashboard.

## Project Significance

The project demonstrates an end-to-end GeoAI workflow combining remote sensing, GIS, machine learning, change detection, and transition analysis for land-cover monitoring in Abuja.

## Author

**Chima Okwandu**

GitHub: [Chima-design1](https://github.com/Chima-design1)
