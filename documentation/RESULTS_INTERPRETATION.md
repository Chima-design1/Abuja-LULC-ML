# Results Interpretation Guide

## 2023–2024 mapped LULC composition

The classified area statistics show a substantial change in the mapped composition between 2023 and 2024.

### 2023

- Built-up: 380.5670 km² (10.4323%)
- Vegetation: 15.1942 km² (0.4165%)
- Bare land: 2990.8557 km² (81.9868%)
- Water: 15.1457 km² (0.4152%)
- Cropland: 246.2086 km² (6.7492%)

### 2024

- Built-up: 1928.6668 km² (52.8696%)
- Vegetation: 122.8571 km² (3.3678%)
- Bare land: 760.1422 km² (20.8374%)
- Water: 15.2096 km² (0.4169%)
- Cropland: 821.0955 km² (22.5083%)

The total mapped extent is approximately 3,647.97 km² in both years.

These are **classification-derived mapped areas**. Large differences should therefore be interpreted together with the validation results and methodological limitations.

## Major mapped transitions

The largest transition in the exported transition matrix is:

**Bare land → Built-up: 1,592.8239 km²**

The second-largest is:

**Bare land → Cropland: 633.7321 km²**

Other transition quantities are documented in:

results/transition_matrix/LULC_Transition_Matrix_2023_2024.csv

## Transition probabilities

Selected observed transition probabilities include:

- Built-up remaining Built-up: 83.95%
- Vegetation remaining Vegetation: 73.08%
- Bare land transitioning to Built-up: 53.26%
- Water remaining Water: 95.41%
- Cropland remaining Cropland: 67.00%

These values describe the observed transition structure encoded by the project workflow for 2023–2024. They should not be interpreted as universal future probabilities outside the modelling assumptions.

## 2026 projection

The 2026 raster is a baseline projection derived from the project's transition workflow.

Because the transition model has a validation accuracy of 70.27% and Kappa of 0.628, and because an independently observed 2026 reference map is not available in this workflow, the 2026 output should be presented as an **exploratory scenario/baseline**, not as a confirmed land-cover forecast.

## Recommended research discussion

A strong discussion should consider:

- classification uncertainty;
- training-sample representativeness;
- temporal differences in imagery and land-cover conditions;
- the difference between annual classification accuracy and transition-model accuracy;
- the implications of using a short 2023–2024 transition interval for longer-term projection;
- the need for independent reference data for future validation;
- whether observed mapped changes could partly reflect classification or compositing effects.
