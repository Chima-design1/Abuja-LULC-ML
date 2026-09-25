// ============================================================
// ABUJA LAND USE / LAND COVER CLASSIFICATION
// RANDOM FOREST MACHINE LEARNING
// SENTINEL-2: 2023 AND 2024
// ============================================================
//
// REQUIRED IMPORTS AT THE TOP OF THIS SCRIPT:
//
// Built_up
// vegetation
// Bare_land
// water
// cropland
//
// CLASS CODES:
// 0 = Built-up
// 1 = Vegetation
// 2 = Bare land
// 3 = Water
// 4 = Cropland
// ============================================================


// ============================================================
// 1. STUDY AREA
// ============================================================

var abuja = ee.Geometry.Polygon([
  [
    [7.20, 9.30],
    [7.80, 9.30],
    [7.80, 8.80],
    [7.20, 8.80],
    [7.20, 9.30]
  ]
]);

Map.centerObject(abuja, 10);


// ============================================================
// 2. CLASS INFORMATION
// ============================================================

var classNames = [
  'Built-up',
  'Vegetation',
  'Bare land',
  'Water',
  'Cropland'
];

var classCodes = [0, 1, 2, 3, 4];

var classPalette = [
  'red',
  'green',
  'yellow',
  'blue',
  'orange'
];

print('Class names:', classNames);
print('Class codes:', classCodes);


// ============================================================
// 3. SENTINEL-2 IMAGE PREPARATION
// ============================================================
//
// We use CLOUDY_PIXEL_PERCENTAGE filtering.
// A QA60 mask is deliberately not used here because
// QA60 availability can be inconsistent for some dates.
//
// The same seasonal period is used for both years:
// January 1 to May 1.
// Earth Engine's end date is exclusive.
// ============================================================

function getSentinelImage(startDate, endDate, yearLabel) {

  var collection = ee.ImageCollection(
    'COPERNICUS/S2_SR_HARMONIZED'
  )
    .filterBounds(abuja)
    .filterDate(startDate, endDate)
    .filter(
      ee.Filter.lt(
        'CLOUDY_PIXEL_PERCENTAGE',
        40
      )
    );

  print(
    'Sentinel-2 image count for ' + yearLabel + ':',
    collection.size()
  );

  var image = collection
    .median()
    .clip(abuja)
    .divide(10000);

  return image;
}


// ============================================================
// 4. LOAD SENTINEL-2 IMAGES
// ============================================================

var image2023 = getSentinelImage(
  '2023-01-01',
  '2023-05-01',
  '2023'
);

var image2024 = getSentinelImage(
  '2024-01-01',
  '2024-05-01',
  '2024'
);


// ============================================================
// 5. TRUE COLOUR DISPLAY
// ============================================================

var trueColourParameters = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.02,
  max: 0.30
};

Map.addLayer(
  image2023,
  trueColourParameters,
  'Sentinel-2 True Colour 2023',
  false
);

Map.addLayer(
  image2024,
  trueColourParameters,
  'Sentinel-2 True Colour 2024',
  false
);


// ============================================================
// 6. PREPARE CLASSIFICATION BANDS
// ============================================================
//
// Original bands:
// B2  = Blue
// B3  = Green
// B4  = Red
// B8  = Near Infrared
// B11 = SWIR 1
// B12 = SWIR 2
//
// Additional indices:
// NDVI = Vegetation index
// NDWI = Water index
// NDBI = Built-up index
// BSI  = Bare-soil index
// SAVI = Soil-adjusted vegetation index
// ============================================================

function prepareClassificationImage(image) {

  var baseBands = image.select([
    'B2',
    'B3',
    'B4',
    'B8',
    'B11',
    'B12'
  ]);

  var ndvi = image
    .normalizedDifference(['B8', 'B4'])
    .rename('NDVI');

  var ndwi = image
    .normalizedDifference(['B3', 'B8'])
    .rename('NDWI');

  var ndbi = image
    .normalizedDifference(['B11', 'B8'])
    .rename('NDBI');

  var bsi = image.expression(
    '((SWIR1 + RED) - (NIR + BLUE)) / ' +
    '((SWIR1 + RED) + (NIR + BLUE))',
    {
      SWIR1: image.select('B11'),
      RED: image.select('B4'),
      NIR: image.select('B8'),
      BLUE: image.select('B2')
    }
  ).rename('BSI');

  var savi = image.expression(
    '1.5 * ((NIR - RED) / (NIR + RED + 0.5))',
    {
      NIR: image.select('B8'),
      RED: image.select('B4')
    }
  ).rename('SAVI');

  return baseBands.addBands([
    ndvi,
    ndwi,
    ndbi,
    bsi,
    savi
  ]);
}

var classification2023 =
  prepareClassificationImage(image2023);

var classification2024 =
  prepareClassificationImage(image2024);

print(
  'Classification bands:',
  classification2023.bandNames()
);


// ============================================================
// 7. CREATE TRAINING POLYGONS
// ============================================================

var builtUpSamples = ee.Feature(
  Built_up,
  {
    landcover: 0
  }
);

var vegetationSamples = ee.Feature(
  vegetation,
  {
    landcover: 1
  }
);

var bareLandSamples = ee.Feature(
  Bare_land,
  {
    landcover: 2
  }
);

var waterSamples = ee.Feature(
  water,
  {
    landcover: 3
  }
);

var croplandSamples = ee.Feature(
  cropland,
  {
    landcover: 4
  }
);

var trainingPolygons = ee.FeatureCollection([
  builtUpSamples,
  vegetationSamples,
  bareLandSamples,
  waterSamples,
  croplandSamples
]);

print(
  'Training polygons:',
  trainingPolygons
);

print(
  'Number of training polygons:',
  trainingPolygons.size()
);


// ============================================================
// 8. DISPLAY TRAINING POLYGONS
// ============================================================

Map.addLayer(
  trainingPolygons,
  {
    color: 'cyan'
  },
  'Training Polygons',
  false
);


// ============================================================
// 9. CREATE TRAINING LABEL IMAGE
// ============================================================

var trainingLabel = ee.Image(0)
  .byte()
  .paint({
    featureCollection: trainingPolygons,
    color: 'landcover'
  })
  .rename('landcover');

var trainingMask = ee.Image(0)
  .byte()
  .paint({
    featureCollection: trainingPolygons,
    color: 1
  });

trainingLabel = trainingLabel
  .updateMask(trainingMask);

Map.addLayer(
  trainingLabel,
  {
    min: 0,
    max: 4,
    palette: classPalette
  },
  'Training Labels',
  false
);


// ============================================================
// 10. TRAINING REGION
// ============================================================
//
// Using the geometry of the training polygons reduces
// unnecessary processing and helps prevent collection errors.
// ============================================================

var trainingRegion = trainingPolygons.geometry();


// ============================================================
// 11. CREATE TRAINING SAMPLES FOR 2023
// ============================================================
//
// Maximum requested samples:
// 300 x 5 classes = 1,500 samples
//
// geometries: false keeps the FeatureCollection small.
// ============================================================

var trainingImage2023 = classification2023
  .addBands(trainingLabel);

var training2023 = trainingImage2023
  .stratifiedSample({
    numPoints: 300,
    classBand: 'landcover',
    region: trainingRegion,
    scale: 10,
    classValues: classCodes,
    classPoints: [
      300,
      300,
      300,
      300,
      300
    ],
    geometries: false,
    tileScale: 8,
    seed: 42
  })
  .filter(
    ee.Filter.notNull(
      classification2023.bandNames()
    )
  );

print(
  'Training pixels 2023:',
  training2023.size()
);

print(
  'Training class distribution 2023:',
  training2023.aggregate_histogram(
    'landcover'
  )
);


// ============================================================
// 12. CREATE TRAINING SAMPLES FOR 2024
// ============================================================

var trainingImage2024 = classification2024
  .addBands(trainingLabel);

var training2024 = trainingImage2024
  .stratifiedSample({
    numPoints: 300,
    classBand: 'landcover',
    region: trainingRegion,
    scale: 10,
    classValues: classCodes,
    classPoints: [
      300,
      300,
      300,
      300,
      300
    ],
    geometries: false,
    tileScale: 8,
    seed: 42
  })
  .filter(
    ee.Filter.notNull(
      classification2024.bandNames()
    )
  );

print(
  'Training pixels 2024:',
  training2024.size()
);

print(
  'Training class distribution 2024:',
  training2024.aggregate_histogram(
    'landcover'
  )
);


// ============================================================
// 13. RANDOM FOREST CLASSIFIER FOR 2023
// ============================================================

var classifier2023 =
  ee.Classifier.smileRandomForest({
    numberOfTrees: 150,
    variablesPerSplit: 4,
    minLeafPopulation: 2,
    bagFraction: 0.7,
    seed: 42
  })
  .train({
    features: training2023,
    classProperty: 'landcover',
    inputProperties: classification2023.bandNames()
  });

print(
  'Random Forest classifier 2023:',
  classifier2023.explain()
);


// ============================================================
// 14. RANDOM FOREST CLASSIFIER FOR 2024
// ============================================================

var classifier2024 =
  ee.Classifier.smileRandomForest({
    numberOfTrees: 150,
    variablesPerSplit: 4,
    minLeafPopulation: 2,
    bagFraction: 0.7,
    seed: 42
  })
  .train({
    features: training2024,
    classProperty: 'landcover',
    inputProperties: classification2024.bandNames()
  });

print(
  'Random Forest classifier 2024:',
  classifier2024.explain()
);


// ============================================================
// 15. CLASSIFY 2023 AND 2024 IMAGES
// ============================================================

var lulc2023 = classification2023
  .classify(classifier2023)
  .rename('LULC_2023');

var lulc2024 = classification2024
  .classify(classifier2024)
  .rename('LULC_2024');


// ============================================================
// 16. DISPLAY CLASSIFIED MAPS
// ============================================================

var lulcDisplayParameters = {
  min: 0,
  max: 4,
  palette: classPalette
};

Map.addLayer(
  lulc2023,
  lulcDisplayParameters,
  'LULC Classification 2023',
  true
);

Map.addLayer(
  lulc2024,
  lulcDisplayParameters,
  'LULC Classification 2024',
  false
);


// ============================================================
// 17. SIMPLE CHANGE MAP
// ============================================================
//
// 0 = No change
// 1 = Change
// ============================================================

var lulcChange = lulc2023
  .neq(lulc2024)
  .toByte()
  .rename('LULC_Change');

Map.addLayer(
  lulcChange.selfMask(),
  {
    palette: ['magenta']
  },
  'LULC Change 2023-2024',
  false
);


// ============================================================
// 18. DETAILED TRANSITION MAP
// ============================================================
//
// Transition code formula:
//
// transition = old class * 5 + new class
//
// Examples:
// 0 = Built-up to Built-up
// 1 = Built-up to Vegetation
// 2 = Built-up to Bare land
// 3 = Built-up to Water
// 4 = Built-up to Cropland
//
// 5 = Vegetation to Built-up
// 6 = Vegetation to Vegetation
// ...
//
// 24 = Cropland to Cropland
// ============================================================

var lulcTransition = lulc2023
  .multiply(5)
  .add(lulc2024)
  .toByte()
  .rename('LULC_Transition');

var transitionPalette = [
  'red',
  'green',
  'yellow',
  'blue',
  'orange',

  'red',
  'green',
  'yellow',
  'blue',
  'orange',

  'red',
  'green',
  'yellow',
  'blue',
  'orange',

  'red',
  'green',
  'yellow',
  'blue',
  'orange',

  'red',
  'green',
  'yellow',
  'blue',
  'orange'
];

Map.addLayer(
  lulcTransition,
  {
    min: 0,
    max: 24,
    palette: transitionPalette
  },
  'Detailed LULC Transitions 2023-2024',
  false
);


// ============================================================
// 19. ACCURACY ASSESSMENT FOR 2023
// ============================================================
//
// This is an internal random-split validation.
// It is not a fully independent field validation.
// ============================================================

var split2023 = training2023.randomColumn(
  'random',
  42
);

var trainSet2023 = split2023.filter(
  ee.Filter.lt('random', 0.8)
);

var validationSet2023 = split2023.filter(
  ee.Filter.gte('random', 0.8)
);

var validationClassifier2023 =
  ee.Classifier.smileRandomForest({
    numberOfTrees: 150,
    variablesPerSplit: 4,
    minLeafPopulation: 2,
    bagFraction: 0.7,
    seed: 42
  })
  .train({
    features: trainSet2023,
    classProperty: 'landcover',
    inputProperties: classification2023.bandNames()
  });

var validated2023 = validationSet2023.classify(
  validationClassifier2023
);

var confusionMatrix2023 = validated2023.errorMatrix(
  'landcover',
  'classification',
  classCodes
);

print(
  '2023 Confusion Matrix:',
  confusionMatrix2023
);

print(
  '2023 Overall Accuracy:',
  confusionMatrix2023.accuracy()
);

print(
  '2023 Kappa:',
  confusionMatrix2023.kappa()
);


// ============================================================
// 20. ACCURACY ASSESSMENT FOR 2024
// ============================================================

var split2024 = training2024.randomColumn(
  'random',
  42
);

var trainSet2024 = split2024.filter(
  ee.Filter.lt('random', 0.8)
);

var validationSet2024 = split2024.filter(
  ee.Filter.gte('random', 0.8)
);

var validationClassifier2024 =
  ee.Classifier.smileRandomForest({
    numberOfTrees: 150,
    variablesPerSplit: 4,
    minLeafPopulation: 2,
    bagFraction: 0.7,
    seed: 42
  })
  .train({
    features: trainSet2024,
    classProperty: 'landcover',
    inputProperties: classification2024.bandNames()
  });

var validated2024 = validationSet2024.classify(
  validationClassifier2024
);

var confusionMatrix2024 = validated2024.errorMatrix(
  'landcover',
  'classification',
  classCodes
);

print(
  '2024 Confusion Matrix:',
  confusionMatrix2024
);

print(
  '2024 Overall Accuracy:',
  confusionMatrix2024.accuracy()
);

print(
  '2024 Kappa:',
  confusionMatrix2024.kappa()
);


// ============================================================
// 21. AREA BY CLASS FOR 2023
// ============================================================

var areaImage2023 = ee.Image.pixelArea()
  .addBands(lulc2023);

var areaByClass2023 = areaImage2023.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'landcover'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13,
  tileScale: 8
});

print(
  'Area by LULC class 2023 in square metres:',
  areaByClass2023
);


// ============================================================
// 22. AREA BY CLASS FOR 2024
// ============================================================

var areaImage2024 = ee.Image.pixelArea()
  .addBands(lulc2024);

var areaByClass2024 = areaImage2024.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'landcover'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13,
  tileScale: 8
});

print(
  'Area by LULC class 2024 in square metres:',
  areaByClass2024
);


// ============================================================
// 23. AREA BY CLASS IN HECTARES
// ============================================================

var hectares2023 = ee.Image.pixelArea()
  .divide(10000)
  .addBands(lulc2023);

var areaHectares2023 = hectares2023.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'landcover'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13,
  tileScale: 8
});

print(
  'Area by LULC class 2023 in hectares:',
  areaHectares2023
);


var hectares2024 = ee.Image.pixelArea()
  .divide(10000)
  .addBands(lulc2024);

var areaHectares2024 = hectares2024.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'landcover'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13,
  tileScale: 8
});

print(
  'Area by LULC class 2024 in hectares:',
  areaHectares2024
);


// ============================================================
// 24. FINAL INFORMATION
// ============================================================

print(
  'Abuja study area:',
  abuja
);

print(
  'Sentinel-2 image 2023:',
  image2023
);

print(
  'Sentinel-2 image 2024:',
  image2024
);

print(
  'LULC classification 2023:',
  lulc2023
);

print(
  'LULC classification 2024:',
  lulc2024
);

print(
  'Simple LULC change 2023-2024:',
  lulcChange
);

print(
  'Detailed LULC transitions 2023-2024:',
  lulcTransition
);

print(
  'SCRIPT COMPLETE: Check the Console for results.'
);
// ============================================================
// 24. FINAL INFORMATION
// ============================================================

print(
  'Abuja study area:',
  abuja
);

print(
  'Sentinel-2 image 2023:',
  image2023
);

print(
  'Sentinel-2 image 2024:',
  image2024
);

print(
  'LULC classification 2023:',
  lulc2023
);

print(
  'LULC classification 2024:',
  lulc2024
);

print(
  'Simple LULC change 2023-2024:',
  lulcChange
);

print(
  'Detailed LULC transitions 2023-2024:',
  lulcTransition
);

print(
  'SCRIPT COMPLETE: Check the Console for results.'
);


// ============================================================
// 25. EXPORT FINAL LULC MAPS TO GOOGLE DRIVE
// ============================================================

// Export LULC classification for 2023
Export.image.toDrive({
  image: lulc2023,
  description: 'Abuja_LULC_Classification_2023',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_Classification_2023',
  region: abuja,
  scale: 10,
  maxPixels: 1e13
});

// Export LULC classification for 2024
Export.image.toDrive({
  image: lulc2024,
  description: 'Abuja_LULC_Classification_2024',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_Classification_2024',
  region: abuja,
  scale: 10,
  maxPixels: 1e13
});

// Export simple LULC change map
Export.image.toDrive({
  image: lulcChange,
  description: 'Abuja_LULC_Change_2023_2024',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_Change_2023_2024',
  region: abuja,
  scale: 10,
  maxPixels: 1e13
});

// Export detailed LULC transition map
Export.image.toDrive({
  image: lulcTransition,
  description: 'Abuja_LULC_Transitions_2023_2024',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_Transitions_2023_2024',
  region: abuja,
  scale: 10,
  maxPixels: 1e13
});

print(
  'EXPORT TASKS CREATED: Open the Tasks tab to start the exports.'
);
// ============================================================
// 19. LULC CHANGE ANALYSIS: 2023–2024
// ============================================================

// Calculate total area of each LULC class in 2023
var area2023 = ee.Image.pixelArea().addBands(lulc2023);

var areaStats2023 = area2023.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'class'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13
});

print('LULC AREA STATISTICS - 2023 (m²)', areaStats2023);


// Calculate total area of each LULC class in 2024
var area2024 = ee.Image.pixelArea().addBands(lulc2024);

var areaStats2024 = area2024.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'class'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13
});

print('LULC AREA STATISTICS - 2024 (m²)', areaStats2024);


// Calculate total area that changed
var changeArea = ee.Image.pixelArea().addBands(lulcChange);

var changeStats = changeArea.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'change'
  }),
  geometry: abuja,
  scale: 10,
  maxPixels: 1e13
});

print('LULC CHANGE STATISTICS (m²)', changeStats);


// Display the change map
Map.addLayer(
  lulcChange,
  {
    min: 0,
    max: 1,
    palette: ['white', 'red']
  },
  'LULC Change 2023–2024'
);
// ==========================================
// READABLE LULC AREA TABLES
// ==========================================

function groupedAreaTable(stats, year) {
  var groups = ee.List(
    ee.Dictionary(stats).get('groups')
  );

  var features = groups.map(function(item) {
    item = ee.Dictionary(item);

    var area = ee.Number(item.get('sum'));

    return ee.Feature(null, {
      year: year,
      class: item.get('class'),
      area_m2: area,
      area_ha: area.divide(10000),
      area_km2: area.divide(1000000)
    });
  });

  return ee.FeatureCollection(features);
}

var areaTable2023 = groupedAreaTable(areaStats2023, 2023);
var areaTable2024 = groupedAreaTable(areaStats2024, 2024);

print('Readable LULC area table - 2023', areaTable2023);
print('Readable LULC area table - 2024', areaTable2024);
print('CONFIRMED CLASS NAMES:', classNames);
print('CONFIRMED CLASS CODES:', classCodes);
// ==========================================
// LULC TRANSITION MATRIX: 2023–2024
// ==========================================

// Transition code = old class × 5 + new class
var transitionArea = ee.Image.pixelArea()
  .addBands(lulcTransition);

var transitionStats = transitionArea.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'transition'
  }),
  geometry: lulc2023.geometry(),
  scale: 10,
  maxPixels: 1e13
});

// ==========================================
// CONVERT TRANSITION STATISTICS TO A TABLE
// ==========================================

var transitionGroups = ee.List(
  ee.Dictionary(transitionStats).get('groups')
);

var transitionTable = ee.FeatureCollection(
  transitionGroups.map(function(item) {

    item = ee.Dictionary(item);

    var transitionCode = ee.Number(
      item.get('transition')
    ).toInt();

    var fromClass = transitionCode
      .divide(5)
      .floor()
      .toInt();

    var toClass = transitionCode
      .mod(5)
      .toInt();

    var area = ee.Number(item.get('sum'));

    return ee.Feature(null, {
      transition_code: transitionCode,
      from_class_code: fromClass,
      to_class_code: toClass,

      from_class: ee.List(classNames).get(fromClass),
      to_class: ee.List(classNames).get(toClass),

      area_m2: area,
      area_ha: area.divide(10000),
      area_km2: area.divide(1000000)
    });

  })
);

print(
  'LULC TRANSITION MATRIX 2023–2024',
  transitionTable
);

// ==========================================
// EXPORT TRANSITION MATRIX AS CSV
// ==========================================

Export.table.toDrive({
  collection: transitionTable,
  description: 'Abuja_LULC_Transition_Matrix_2023_2024',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_Transition_Matrix_2023_2024',
  fileFormat: 'CSV'
});

print('TRANSITION MATRIX CSV EXPORT CREATED');


// ============================================================
// 26. HOLDOUT VALIDATION USING EXISTING TRAINING POLYGONS
// ============================================================
//
// IMPORTANT:
// This is within-polygon holdout validation.
// It is NOT independent field validation or fully independent
// spatial validation because the same polygons provide training
// and validation pixels.
//
// 80% = model training
// 20% = validation
// ============================================================


// ------------------------------------------------------------
// 26.1 CREATE VALIDATION SAMPLES FOR 2023
// ------------------------------------------------------------

var validationImage2023 = classification2023
  .addBands(trainingLabel);

var validationSamples2023 = validationImage2023
  .stratifiedSample({
    numPoints: 300,
    classBand: 'landcover',
    region: trainingRegion,
    scale: 10,
    classValues: classCodes,
    classPoints: [
      300,
      300,
      300,
      300,
      300
    ],
    geometries: true,
    tileScale: 8,
    seed: 2023
  })
  .filter(
    ee.Filter.notNull(
      classification2023.bandNames()
    )
  );

print(
  'Holdout validation samples 2023:',
  validationSamples2023.size()
);


// ------------------------------------------------------------
// 26.2 SPLIT 2023 SAMPLES INTO TRAINING AND VALIDATION
// ------------------------------------------------------------

var splitValidation2023 = validationSamples2023
  .randomColumn('validation_random', 42);

var holdoutTrain2023 = splitValidation2023
  .filter(
    ee.Filter.lt('validation_random', 0.8)
  );

var holdoutTest2023 = splitValidation2023
  .filter(
    ee.Filter.gte('validation_random', 0.8)
  );

print(
  'Holdout training samples 2023:',
  holdoutTrain2023.size()
);

print(
  'Holdout validation samples 2023:',
  holdoutTest2023.size()
);


// ------------------------------------------------------------
// 26.3 TRAIN HOLDOUT RANDOM FOREST MODEL FOR 2023
// ------------------------------------------------------------

var holdoutClassifier2023 =
  ee.Classifier.smileRandomForest({
    numberOfTrees: 150,
    variablesPerSplit: 4,
    minLeafPopulation: 2,
    bagFraction: 0.7,
    seed: 42
  })
  .train({
    features: holdoutTrain2023,
    classProperty: 'landcover',
    inputProperties: classification2023.bandNames()
  });


// ------------------------------------------------------------
// 26.4 VALIDATE 2023 MODEL
// ------------------------------------------------------------

var holdoutPredictions2023 = holdoutTest2023
  .classify(holdoutClassifier2023);

var holdoutMatrix2023 = holdoutPredictions2023
  .errorMatrix(
    'landcover',
    'classification',
    classCodes
  );

print(
  'HOLDOUT CONFUSION MATRIX 2023:',
  holdoutMatrix2023
);

print(
  'HOLDOUT OVERALL ACCURACY 2023:',
  holdoutMatrix2023.accuracy()
);

print(
  'HOLDOUT KAPPA 2023:',
  holdoutMatrix2023.kappa()
);


// ------------------------------------------------------------
// 26.5 CREATE VALIDATION SAMPLES FOR 2024
// ------------------------------------------------------------

var validationImage2024 = classification2024
  .addBands(trainingLabel);

var validationSamples2024 = validationImage2024
  .stratifiedSample({
    numPoints: 300,
    classBand: 'landcover',
    region: trainingRegion,
    scale: 10,
    classValues: classCodes,
    classPoints: [
      300,
      300,
      300,
      300,
      300
    ],
    geometries: true,
    tileScale: 8,
    seed: 2024
  })
  .filter(
    ee.Filter.notNull(
      classification2024.bandNames()
    )
  );

print(
  'Holdout validation samples 2024:',
  validationSamples2024.size()
);


// ------------------------------------------------------------
// 26.6 SPLIT 2024 SAMPLES INTO TRAINING AND VALIDATION
// ------------------------------------------------------------

var splitValidation2024 = validationSamples2024
  .randomColumn('validation_random', 42);

var holdoutTrain2024 = splitValidation2024
  .filter(
    ee.Filter.lt('validation_random', 0.8)
  );

var holdoutTest2024 = splitValidation2024
  .filter(
    ee.Filter.gte('validation_random', 0.8)
  );

print(
  'Holdout training samples 2024:',
  holdoutTrain2024.size()
);

print(
  'Holdout validation samples 2024:',
  holdoutTest2024.size()
);


// ------------------------------------------------------------
// 26.7 TRAIN HOLDOUT RANDOM FOREST MODEL FOR 2024
// ------------------------------------------------------------

var holdoutClassifier2024 =
  ee.Classifier.smileRandomForest({
    numberOfTrees: 150,
    variablesPerSplit: 4,
    minLeafPopulation: 2,
    bagFraction: 0.7,
    seed: 42
  })
  .train({
    features: holdoutTrain2024,
    classProperty: 'landcover',
    inputProperties: classification2024.bandNames()
  });


// ------------------------------------------------------------
// 26.8 VALIDATE 2024 MODEL
// ------------------------------------------------------------

var holdoutPredictions2024 = holdoutTest2024
  .classify(holdoutClassifier2024);

var holdoutMatrix2024 = holdoutPredictions2024
  .errorMatrix(
    'landcover',
    'classification',
    classCodes
  );

print(
  'HOLDOUT CONFUSION MATRIX 2024:',
  holdoutMatrix2024
);

print(
  'HOLDOUT OVERALL ACCURACY 2024:',
  holdoutMatrix2024.accuracy()
);

print(
  'HOLDOUT KAPPA 2024:',
  holdoutMatrix2024.kappa()
);


// ------------------------------------------------------------
// 26.9 COMPLETION MESSAGE
// ------------------------------------------------------------

print(
  'HOLDOUT VALIDATION COMPLETE:',
  'Review the 2023 and 2024 confusion matrices, accuracy, and Kappa.'
);

// =====================================================
// 27. TRANSITION PROBABILITY MATRIX
// 2023 → 2024
// =====================================================

// Calculate the total area of each 2023 land-cover class
var fromClassAreaStats = ee.Image.pixelArea()
  .addBands(lulc2023)
  .reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'from_class'
    }),
    geometry: abuja,
    scale: 10,
    maxPixels: 1e13,
    tileScale: 8
  });

var fromClassGroups = ee.List(
  ee.Dictionary(fromClassAreaStats).get('groups')
);

// Convert the class-area groups into a FeatureCollection
var fromClassAreaTable = ee.FeatureCollection(
  fromClassGroups.map(function(item) {
    item = ee.Dictionary(item);

    return ee.Feature(null, {
      from_class_code: ee.Number(item.get('from_class')).toInt(),
      from_area_m2: ee.Number(item.get('sum'))
    });
  })
);

print(
  'TOTAL AREA BY 2023 CLASS',
  fromClassAreaTable
);


// Calculate transition probabilities
var transitionProbabilityTable = transitionTable.map(
  function(feature) {

    var fromClass = ee.Number(
      feature.get('from_class_code')
    ).toInt();

    var transitionArea = ee.Number(
      feature.get('area_m2')
    );

    var matchingAreaFeature = fromClassAreaTable
      .filter(
        ee.Filter.eq('from_class_code', fromClass)
      )
      .first();

    var totalFromArea = ee.Number(
      matchingAreaFeature.get('from_area_m2')
    );

    var probability = transitionArea
      .divide(totalFromArea);

    return feature.set({
      transition_probability: probability
    });
  }
);


// Display transition probabilities
print(
  'TRANSITION PROBABILITY MATRIX 2023–2024',
  transitionProbabilityTable
);


// Export the transition probability table
Export.table.toDrive({
  collection: transitionProbabilityTable,
  description: 'Abuja_LULC_Transition_Probabilities_2023_2024',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_Transition_Probabilities_2023_2024',
  fileFormat: 'CSV'
});

// =====================================================
// 28. BASELINE MARKOV-STYLE PREDICTION
// 2024 → 2026
// =====================================================

// Function to retrieve a transition probability
function getTransitionProbability(fromCode, toCode) {

  var matchingTransition = transitionProbabilityTable
    .filter(
      ee.Filter.and(
        ee.Filter.eq('from_class_code', fromCode),
        ee.Filter.eq('to_class_code', toCode)
      )
    );

  return ee.Number(
    ee.Algorithms.If(
      matchingTransition.size().gt(0),
      ee.Feature(matchingTransition.first())
        .get('transition_probability'),
      0
    )
  );
};


// -----------------------------------------------------
// Get transition probabilities for each source class
// -----------------------------------------------------

// Built-up (class 0)
var b0 = getTransitionProbability(0, 0);
var b1 = getTransitionProbability(0, 1);
var b2 = getTransitionProbability(0, 2);
var b3 = getTransitionProbability(0, 3);
var b4 = getTransitionProbability(0, 4);

// Vegetation (class 1)
var v0 = getTransitionProbability(1, 0);
var v1 = getTransitionProbability(1, 1);
var v2 = getTransitionProbability(1, 2);
var v3 = getTransitionProbability(1, 3);
var v4 = getTransitionProbability(1, 4);

// Bare land (class 2)
var r0 = getTransitionProbability(2, 0);
var r1 = getTransitionProbability(2, 1);
var r2 = getTransitionProbability(2, 2);
var r3 = getTransitionProbability(2, 3);
var r4 = getTransitionProbability(2, 4);

// Water (class 3)
var w0 = getTransitionProbability(3, 0);
var w1 = getTransitionProbability(3, 1);
var w2 = getTransitionProbability(3, 2);
var w3 = getTransitionProbability(3, 3);
var w4 = getTransitionProbability(3, 4);

// Cropland (class 4)
var c0 = getTransitionProbability(4, 0);
var c1 = getTransitionProbability(4, 1);
var c2 = getTransitionProbability(4, 2);
var c3 = getTransitionProbability(4, 3);
var c4 = getTransitionProbability(4, 4);


// -----------------------------------------------------
// Print the probabilities for checking
// -----------------------------------------------------

print('Built-up probabilities:', b0, b1, b2, b3, b4);
print('Vegetation probabilities:', v0, v1, v2, v3, v4);
print('Bare land probabilities:', r0, r1, r2, r3, r4);
print('Water probabilities:', w0, w1, w2, w3, w4);
print('Cropland probabilities:', c0, c1, c2, c3, c4);


// -----------------------------------------------------
// Create a random image for allocation
// -----------------------------------------------------

var randomImage = ee.Image.random(2026);


// -----------------------------------------------------
// Function to allocate predicted classes
// -----------------------------------------------------

function allocateClass(
  sourceClass,
  p0,
  p1,
  p2,
  p3,
  p4
) {

  var sourceMask = lulc2024.eq(sourceClass);

  var cumulative1 = p0;
  var cumulative2 = p0.add(p1);
  var cumulative3 = p0.add(p1).add(p2);
  var cumulative4 = p0.add(p1).add(p2).add(p3);

  var predictedClass = ee.Image(0)
    .where(
      randomImage.gte(cumulative1)
        .and(randomImage.lt(cumulative2)),
      1
    )
    .where(
      randomImage.gte(cumulative2)
        .and(randomImage.lt(cumulative3)),
      2
    )
    .where(
      randomImage.gte(cumulative3)
        .and(randomImage.lt(cumulative4)),
      3
    )
    .where(
      randomImage.gte(cumulative4),
      4
    );

  return ee.Image(0)
    .where(sourceMask, predictedClass);
}


// -----------------------------------------------------
// Allocate each 2024 source class
// -----------------------------------------------------

var predictedBuiltUp = allocateClass(
  0, b0, b1, b2, b3, b4
);

var predictedVegetation = allocateClass(
  1, v0, v1, v2, v3, v4
);

var predictedBareLand = allocateClass(
  2, r0, r1, r2, r3, r4
);

var predictedWater = allocateClass(
  3, w0, w1, w2, w3, w4
);

var predictedCropland = allocateClass(
  4, c0, c1, c2, c3, c4
);


// -----------------------------------------------------
// Combine all predicted classes
// -----------------------------------------------------

var lulc2026Prediction = ee.Image(0)
  .where(lulc2024.eq(0), predictedBuiltUp)
  .where(lulc2024.eq(1), predictedVegetation)
  .where(lulc2024.eq(2), predictedBareLand)
  .where(lulc2024.eq(3), predictedWater)
  .where(lulc2024.eq(4), predictedCropland)
  .rename('LULC_2026_Prediction')
  .clip(abuja);


// -----------------------------------------------------
// Display the prediction
// -----------------------------------------------------

Map.addLayer(
  lulc2026Prediction,
  {
    min: 0,
    max: 4,
    palette: classPalette
  },
  'LULC 2026 Baseline Prediction'
);


// -----------------------------------------------------
// Export the predicted map
// -----------------------------------------------------

Export.image.toDrive({
  image: lulc2026Prediction.toByte(),
  description: 'Abuja_LULC_2026_Baseline_Prediction',
  folder: 'Abuja_LULC_ML',
  fileNamePrefix: 'Abuja_LULC_2026_Baseline_Prediction',
  region: abuja,
  scale: 10,
  maxPixels: 1e13
});


// -----------------------------------------------------
// Completion message
// -----------------------------------------------------

print(
  '2026 BASELINE PREDICTION COMPLETE',
  'Review the predicted map and export it from the Tasks tab.'
);

// =====================================================
// 29. 2026 PREDICTED CLASS AREA STATISTICS
// =====================================================

var predictedAreaStats = ee.Image.pixelArea()
  .addBands(lulc2026Prediction)
  .reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'class'
    }),
    geometry: abuja,
    scale: 10,
    maxPixels: 1e13,
    tileScale: 8
  });

var predictedAreaGroups = ee.List(
  ee.Dictionary(predictedAreaStats).get('groups')
);

var predictedAreaTable = ee.FeatureCollection(
  predictedAreaGroups.map(function(item) {
    item = ee.Dictionary(item);

    var classCode = ee.Number(
      item.get('class')
    ).toInt();

    var areaM2 = ee.Number(
      item.get('sum')
    );

    return ee.Feature(null, {
      class_code: classCode,
      class_name: ee.List(classNames).get(classCode),
      area_m2: areaM2,
      area_ha: areaM2.divide(10000),
      area_km2: areaM2.divide(1000000)
    });
  })
);

print(
  'PREDICTED LULC AREA STATISTICS 2026',
  predictedAreaTable
);

// =====================================================
// 30. PREPARE TEMPORAL TRANSITION TRAINING DATA
// 2023 → 2024
// =====================================================

// Predictor bands from the 2023 classification image
var transitionPredictorBands = classification2023
  .bandNames()
  .cat(ee.List(['LULC_2023']));

// Create predictor image
var transitionPredictors2023 = classification2023
  .addBands(lulc2023);

// Add 2024 observed LULC as the target variable
var transitionTrainingImage = transitionPredictors2023
  .addBands(lulc2024.rename('TARGET_LULC_2024'));


// Generate stratified training samples
var transitionTrainingSamples =
  transitionTrainingImage.stratifiedSample({

    numPoints: 500,

    classBand: 'TARGET_LULC_2024',

    region: abuja,

    scale: 10,

    classValues: classCodes,

    classPoints: [500, 500, 500, 500, 500],

    geometries: false,

    tileScale: 8,

    seed: 2026

  });


// Remove samples containing missing values
transitionTrainingSamples =
  transitionTrainingSamples.filter(
    ee.Filter.notNull(
      transitionPredictorBands
        .add('TARGET_LULC_2024')
    )
  );


print(
  'TRANSITION TRAINING SAMPLES',
  transitionTrainingSamples
);

print(
  'TRANSITION PREDICTOR BANDS',
  transitionPredictorBands
);

// =====================================================
// 31. TRAIN AND EVALUATE TRANSITION RANDOM FOREST
// 2023 → 2024
// =====================================================


// -----------------------------------------------------
// Split samples into training and validation datasets
// -----------------------------------------------------

var transitionSamplesWithRandom =
  transitionTrainingSamples.randomColumn(
    'random',
    2026
  );

var transitionTrain =
  transitionSamplesWithRandom.filter(
    ee.Filter.lt('random', 0.8)
  );

var transitionValidation =
  transitionSamplesWithRandom.filter(
    ee.Filter.gte('random', 0.8)
  );


print(
  'TRANSITION TRAINING SAMPLE COUNT',
  transitionTrain.size()
);

print(
  'TRANSITION VALIDATION SAMPLE COUNT',
  transitionValidation.size()
);


// -----------------------------------------------------
// Train the Random Forest transition classifier
// -----------------------------------------------------

var transitionClassifier =
  ee.Classifier.smileRandomForest({

    numberOfTrees: 150,

    variablesPerSplit: 4,

    minLeafPopulation: 2,

    bagFraction: 0.7,

    seed: 2026

  }).train({

    features: transitionTrain,

    classProperty: 'TARGET_LULC_2024',

    inputProperties: transitionPredictorBands

  });


// -----------------------------------------------------
// Evaluate transition classifier
// -----------------------------------------------------

var transitionValidationResults =
  transitionValidation.classify(
    transitionClassifier
  );

var transitionConfusionMatrix =
  transitionValidationResults.errorMatrix(
    'TARGET_LULC_2024',
    'classification'
  );

print(
  'TRANSITION CONFUSION MATRIX',
  transitionConfusionMatrix
);

print(
  'TRANSITION OVERALL ACCURACY',
  transitionConfusionMatrix.accuracy()
);

print(
  'TRANSITION KAPPA',
  transitionConfusionMatrix.kappa()
);


// -----------------------------------------------------
// Feature importance
// -----------------------------------------------------

print(
  'TRANSITION FEATURE IMPORTANCE',
  transitionClassifier.explain()
);


print(
  'TRANSITION MODEL TRAINING COMPLETE',
  'Review the accuracy and Kappa values.'
);