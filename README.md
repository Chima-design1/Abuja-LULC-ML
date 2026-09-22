
# Abuja-LULC-ML

## Spatiotemporal Analysis and Machine Learning-Based Prediction of Land Use/Land Cover Change in Abuja, Nigeria Using Sentinel-2 Data

## Project Overview

This project investigates land use and land cover (LULC) patterns and changes in Abuja, Nigeria, using Sentinel-2 satellite imagery, Geographic Information Systems (GIS), remote sensing, and machine learning.

The study analyzes land cover classifications for 2023 and 2024, identifies spatial changes between the two periods, and develops an exploratory baseline approach for estimating future land cover patterns.

The project demonstrates the application of geospatial data science and machine learning to environmental monitoring, urban expansion analysis, and land management.

## Research Objectives

The main objectives of this project are to:

1. Classify land use and land cover in Abuja using Sentinel-2 satellite imagery.
2. Analyze land cover changes between 2023 and 2024.
3. Develop land cover area statistics and a transition matrix.
4. Investigate machine learning approaches for modeling land cover transitions.
5. Produce an exploratory baseline projection of land cover patterns.
6. Demonstrate a reproducible geospatial workflow using Google Earth Engine.

## Study Area

The study focuses on Abuja, Federal Capital Territory, Nigeria.

The area is investigated using satellite imagery and geospatial processing techniques to examine the distribution and transformation of different land cover classes.

## Land Cover Classes

The project uses the following land cover classes:

| Class | Land Cover |
|---|---|
| 0 | Built-up |
| 1 | Vegetation |
| 2 | Bare land |
| 3 | Water |
| 4 | Cropland |

## Data Sources

The project uses geospatial data and satellite imagery obtained through online platforms and cloud-based processing tools.

Primary data and tools include:

- Sentinel-2 satellite imagery
- Google Earth Engine
- Geographic Information Systems (GIS)
- Remote sensing indices and spectral information
- Machine learning algorithms
- Land cover training and validation samples

## Methodology

The general workflow consists of the following stages:

1. Define the study area.
2. Acquire and filter Sentinel-2 imagery.
3. Prepare satellite imagery for classification.
4. Create land cover training samples.
5. Perform supervised land cover classification.
6. Assess classification accuracy.
7. Calculate land cover area statistics.
8. Generate change detection outputs.
9. Develop a land cover transition matrix.
10. Explore machine learning-based transition modeling.
11. Produce an exploratory baseline projection.

## Classification Accuracy

Internal validation was performed using a random training and validation split.

The observed classification results were:

| Year | Overall Accuracy | Kappa |
|---|---:|---:|
| 2023 | 97.07% | 0.963 |
| 2024 | 98.80% | 0.985 |

These results represent the internal validation procedure used in the project. They should not be interpreted as independent spatial validation because the validation samples were drawn from the same general study and sampling framework.

## Change Detection

The project includes a comparison of land cover classifications between 2023 and 2024.

The change detection analysis identifies areas that remained unchanged and areas where land cover classes changed between the two periods.

The transition matrix provides information about conversions between land cover categories, including transitions involving built-up areas, bare land, cropland, and vegetation.

## Exploratory Projection

An exploratory baseline projection was developed using land cover transition information and a machine learning-based transition modeling experiment.

The projection is intended as a preliminary analytical baseline rather than a fully validated prediction of future land cover.

The approach has limitations related to transition assumptions, spatial allocation, temporal validation, and the availability of independent future reference data.

## Technologies Used

- Google Earth Engine
- JavaScript
- Remote Sensing
- Geographic Information Systems (GIS)
- Machine Learning
- Spatial Analysis
- Sentinel-2 Satellite Imagery
- Land Use/Land Cover Classification
- Change Detection
- Transition Matrix Analysis

## Repository Structure

```text
Abuja-LULC-ML/
├── README.md
├── gee/
│   └── Abuja_LULC_Classification.js
├── results/
│   ├── accuracy/
│   ├── area_statistics/
│   └── transition_matrix/
├── maps/
│   ├── LULC_2023/
│   ├── LULC_2024/
│   ├── change_detection/
│   └── prediction/
├── report/
│   └── Abuja_LULC_Research_Report.pdf
└── presentation/
    └── Abuja_LULC_Project_Presentation.pptx
```

The folders listed above represent the intended organization of the project deliverables.

## Limitations

The current project has several limitations:

- Validation was based on a random pixel holdout rather than fully independent spatial validation.
- The projection is an exploratory baseline and has not been validated against future observed land cover data.
- Land cover classification accuracy may be affected by training sample quality, spectral similarity, and image acquisition conditions.
- Additional temporal datasets would be required for a more robust long-term forecasting model.
- Further work could incorporate spatially explicit modeling, improved validation, and additional environmental and socioeconomic variables.

## Future Work

Potential future improvements include:

- Incorporating additional years of Sentinel-2 imagery.
- Applying independent spatial and temporal validation.
- Testing advanced machine learning and deep learning models.
- Including road networks, elevation, population, and other explanatory variables.
- Developing a spatially explicit land cover prediction model.
- Creating an interactive web-based visualization dashboard.
- Comparing model performance using multiple evaluation metrics.

## Project Significance

This project demonstrates the use of remote sensing, GIS, and machine learning for monitoring land cover dynamics in a rapidly developing urban region.

The workflow provides a foundation for further research in:

- GeoAI
- Environmental monitoring
- Urban growth analysis
- Spatial data science
- Remote sensing
- Land management
- Geospatial machine learning

## Author

**Chima Okwandu**

GitHub: [Chima-design1](https://github.com/Chima-design1)
