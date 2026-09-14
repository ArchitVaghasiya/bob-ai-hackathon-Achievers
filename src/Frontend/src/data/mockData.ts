export interface Asset {
  id: string;
  substation: string;
  riskIndex: number;
  anomalyStatus: 'Anomaly' | 'Normal';
  weatherThreat: 'Extreme Heat' | 'High Wind' | 'Stable' | 'Severe Storm';
  customersImpacted: number;
  model1: {
    anomalyScore: number;
    anomalyFlag: number;
    anomalousFeatures: string[];
  };
  model2: {
    weatherContext: {
      ambientTemp: number;
      humidity: number;
      windSpeed: number;
    };
    temperatureData: Array<{
      time: string;
      predicted: number;
      actual: number;
    }>;
  };
  model3: {
    failureProbabilityScore: number;
    severityScore: number;
    impactVariables: {
      hospitalConnected: boolean;
      criticalWaterPlant: boolean;
      homesPowered: number;
    };
  };
}

export const mockAssets: Asset[] = [
  {
    id: "TX-939 (2_trans_939)",
    substation: "Riverdale Heights Substation",
    riskIndex: 85,
    anomalyStatus: "Anomaly",
    weatherThreat: "Extreme Heat",
    customersImpacted: 48200,
    model1: {
      anomalyScore: 0.85,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Predicted Class 4 High-Energy Arcing Pattern (99.98% confidence)",
        "Elevated terminal Ethylene concentration (C2H4 = 0.00873)",
        "Critically depleted remaining useful life (approx. 417 cycles)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 42.1,
        humidity: 68,
        windSpeed: 4.2
      },
      temperatureData: [
        { time: "00:00", predicted: 52, actual: 55 },
        { time: "04:00", predicted: 49, actual: 53 },
        { time: "08:00", predicted: 58, actual: 66 },
        { time: "12:00", predicted: 68, actual: 82 },
        { time: "16:00", predicted: 72, actual: 89 },
        { time: "20:00", predicted: 63, actual: 76 }
      ]
    },
    model3: {
      failureProbabilityScore: 92,
      severityScore: 75,
      impactVariables: {
        hospitalConnected: true,
        criticalWaterPlant: true,
        homesPowered: 38500
      }
    }
  },
  {
    id: "TX-1672 (2_trans_1672)",
    substation: "Oakridge Metro Switching Yard",
    riskIndex: 84,
    anomalyStatus: "Anomaly",
    weatherThreat: "Severe Storm",
    customersImpacted: 39500,
    model1: {
      anomalyScore: 0.82,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Predicted Class 4 arcing pattern (confidence 100.0%)",
        "Elevated terminal Acetylene concentration (C2H2 = 0.00046)",
        "Critically depleted remaining useful life (approx. 465 cycles)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 34.5,
        humidity: 89,
        windSpeed: 18.2
      },
      temperatureData: [
        { time: "00:00", predicted: 48, actual: 50 },
        { time: "04:00", predicted: 46, actual: 48 },
        { time: "08:00", predicted: 54, actual: 61 },
        { time: "12:00", predicted: 64, actual: 76 },
        { time: "16:00", predicted: 67, actual: 83 },
        { time: "20:00", predicted: 58, actual: 69 }
      ]
    },
    model3: {
      failureProbabilityScore: 89,
      severityScore: 76,
      impactVariables: {
        hospitalConnected: true,
        criticalWaterPlant: false,
        homesPowered: 31000
      }
    }
  },
  {
    id: "TX-1036 (2_trans_1036)",
    substation: "Highland Valley Distribution Hub",
    riskIndex: 83,
    anomalyStatus: "Anomaly",
    weatherThreat: "Extreme Heat",
    customersImpacted: 34000,
    model1: {
      anomalyScore: 0.79,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Predicted Class 4 arcing pattern (confidence 100.0%)",
        "Elevated terminal Acetylene concentration (C2H2 = 0.00053)",
        "Critically depleted remaining useful life (approx. 437 cycles)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 40.8,
        humidity: 62,
        windSpeed: 5.1
      },
      temperatureData: [
        { time: "00:00", predicted: 50, actual: 52 },
        { time: "04:00", predicted: 47, actual: 50 },
        { time: "08:00", predicted: 56, actual: 64 },
        { time: "12:00", predicted: 66, actual: 79 },
        { time: "16:00", predicted: 70, actual: 85 },
        { time: "20:00", predicted: 61, actual: 72 }
      ]
    },
    model3: {
      failureProbabilityScore: 87,
      severityScore: 77,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: true,
        homesPowered: 28500
      }
    }
  },
  {
    id: "TX-1081 (2_trans_1081)",
    substation: "Eastpoint Industrial Corridor",
    riskIndex: 81,
    anomalyStatus: "Anomaly",
    weatherThreat: "High Wind",
    customersImpacted: 27500,
    model1: {
      anomalyScore: 0.76,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Predicted Class 4 arcing pattern (confidence 100.0%)",
        "Critically depleted remaining useful life (approx. 483 cycles)",
        "Elevated terminal Hydrogen concentration (H2 = 0.00463)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 32.0,
        humidity: 55,
        windSpeed: 14.8
      },
      temperatureData: [
        { time: "00:00", predicted: 46, actual: 49 },
        { time: "04:00", predicted: 44, actual: 47 },
        { time: "08:00", predicted: 52, actual: 58 },
        { time: "12:00", predicted: 61, actual: 72 },
        { time: "16:00", predicted: 65, actual: 77 },
        { time: "20:00", predicted: 56, actual: 65 }
      ]
    },
    model3: {
      failureProbabilityScore: 84,
      severityScore: 76,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 23000
      }
    }
  },
  {
    id: "TX-81 (2_trans_81)",
    substation: "Lakeside Commercial Park",
    riskIndex: 60,
    anomalyStatus: "Anomaly",
    weatherThreat: "High Wind",
    customersImpacted: 22000,
    model1: {
      anomalyScore: 0.58,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Predicted Class 4 arcing pattern (confidence 100.0%)",
        "Elevated terminal Hydrogen concentration (H2 = 0.00351)",
        "Remaining useful life at 831 cycles"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 29.4,
        humidity: 65,
        windSpeed: 11.2
      },
      temperatureData: [
        { time: "00:00", predicted: 44, actual: 46 },
        { time: "04:00", predicted: 42, actual: 44 },
        { time: "08:00", predicted: 50, actual: 54 },
        { time: "12:00", predicted: 59, actual: 66 },
        { time: "16:00", predicted: 62, actual: 70 },
        { time: "20:00", predicted: 53, actual: 59 }
      ]
    },
    model3: {
      failureProbabilityScore: 65,
      severityScore: 52,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 19500
      }
    }
  },
  {
    id: "TX-2911 (2_trans_2911)",
    substation: "North Hills Substation",
    riskIndex: 60,
    anomalyStatus: "Anomaly",
    weatherThreat: "Stable",
    customersImpacted: 18500,
    model1: {
      anomalyScore: 0.55,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Elevated terminal Hydrogen concentration (H2 = 0.00401)",
        "Predicted Class 2 partial discharge pattern (confidence 100.0%)",
        "Substantially degraded remaining useful life (507 cycles)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 26.8,
        humidity: 50,
        windSpeed: 4.8
      },
      temperatureData: [
        { time: "00:00", predicted: 42, actual: 43 },
        { time: "04:00", predicted: 40, actual: 42 },
        { time: "08:00", predicted: 47, actual: 50 },
        { time: "12:00", predicted: 55, actual: 61 },
        { time: "16:00", predicted: 58, actual: 64 },
        { time: "20:00", predicted: 49, actual: 53 }
      ]
    },
    model3: {
      failureProbabilityScore: 63,
      severityScore: 55,
      impactVariables: {
        hospitalConnected: true,
        criticalWaterPlant: false,
        homesPowered: 16000
      }
    }
  },
  {
    id: "TX-1851 (2_trans_1851)",
    substation: "Sun Valley Substation",
    riskIndex: 59,
    anomalyStatus: "Anomaly",
    weatherThreat: "Stable",
    customersImpacted: 21000,
    model1: {
      anomalyScore: 0.52,
      anomalyFlag: -1,
      anomalousFeatures: [
        "Elevated terminal Acetylene concentration (C2H2 = 0.00032)",
        "Predicted Class 3 thermal breakdown pattern (confidence 100.0%)",
        "Elevated terminal Ethylene concentration (C2H4 = 0.01059)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 28.0,
        humidity: 48,
        windSpeed: 6.2
      },
      temperatureData: [
        { time: "00:00", predicted: 43, actual: 44 },
        { time: "04:00", predicted: 41, actual: 43 },
        { time: "08:00", predicted: 49, actual: 52 },
        { time: "12:00", predicted: 57, actual: 63 },
        { time: "16:00", predicted: 60, actual: 66 },
        { time: "20:00", predicted: 51, actual: 55 }
      ]
    },
    model3: {
      failureProbabilityScore: 62,
      severityScore: 54,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 18000
      }
    }
  },
  {
    id: "TX-2556 (2_trans_2556)",
    substation: "Westfield Substation",
    riskIndex: 35,
    anomalyStatus: "Normal",
    weatherThreat: "Stable",
    customersImpacted: 14000,
    model1: {
      anomalyScore: 0.28,
      anomalyFlag: 1,
      anomalousFeatures: [
        "Normal baseline operation (Class 1 Cellulose Degradation)",
        "Healthy predicted RUL (~610 cycles)",
        "Standard operating gas ratios"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 24.5,
        humidity: 45,
        windSpeed: 5.0
      },
      temperatureData: [
        { time: "00:00", predicted: 40, actual: 40 },
        { time: "04:00", predicted: 38, actual: 38 },
        { time: "08:00", predicted: 45, actual: 46 },
        { time: "12:00", predicted: 52, actual: 53 },
        { time: "16:00", predicted: 55, actual: 55 },
        { time: "20:00", predicted: 47, actual: 47 }
      ]
    },
    model3: {
      failureProbabilityScore: 32,
      severityScore: 39,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 12500
      }
    }
  },
  {
    id: "TX-1343 (2_trans_1343)",
    substation: "Pinewood Grid Interconnect",
    riskIndex: 35,
    anomalyStatus: "Normal",
    weatherThreat: "Stable",
    customersImpacted: 12500,
    model1: {
      anomalyScore: 0.25,
      anomalyFlag: 1,
      anomalousFeatures: [
        "Operating within normal Category 1 cellulose aging limits",
        "Stable thermal gas equilibrium",
        "Predicted RUL is healthy (525 cycles)"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 23.0,
        humidity: 42,
        windSpeed: 4.1
      },
      temperatureData: [
        { time: "00:00", predicted: 39, actual: 39 },
        { time: "04:00", predicted: 37, actual: 37 },
        { time: "08:00", predicted: 44, actual: 44 },
        { time: "12:00", predicted: 50, actual: 51 },
        { time: "16:00", predicted: 53, actual: 53 },
        { time: "20:00", predicted: 45, actual: 45 }
      ]
    },
    model3: {
      failureProbabilityScore: 30,
      severityScore: 42,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 11000
      }
    }
  },
  {
    id: "TX-2014 (2_trans_2014)",
    substation: "Meadowlands Distribution Station",
    riskIndex: 35,
    anomalyStatus: "Normal",
    weatherThreat: "Stable",
    customersImpacted: 16000,
    model1: {
      anomalyScore: 0.26,
      anomalyFlag: 1,
      anomalousFeatures: [
        "Normal baseline degradation (Cellulose Aging)",
        "DGA chromatography within IEEE C57.104 normal range",
        "Estimated RUL 578 cycles"
      ]
    },
    model2: {
      weatherContext: {
        ambientTemp: 23.8,
        humidity: 44,
        windSpeed: 3.9
      },
      temperatureData: [
        { time: "00:00", predicted: 39, actual: 40 },
        { time: "04:00", predicted: 38, actual: 38 },
        { time: "08:00", predicted: 45, actual: 45 },
        { time: "12:00", predicted: 51, actual: 52 },
        { time: "16:00", predicted: 54, actual: 54 },
        { time: "20:00", predicted: 46, actual: 46 }
      ]
    },
    model3: {
      failureProbabilityScore: 31,
      severityScore: 41,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 14000
      }
    }
  }
];
