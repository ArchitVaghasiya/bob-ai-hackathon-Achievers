export interface Asset {
  id: string;
  substation: string;
  riskIndex: number; 
  anomalyStatus: 'Normal' | 'Anomaly';
  weatherThreat: 'Extreme Heat' | 'High Wind' | 'Stable';
  customersImpacted: number;
  
  // Model 1: Isolation Forest
  model1: {
    anomalyScore: number;
    anomalyFlag: -1 | 1;
    anomalousFeatures: string[];
  };
  
  // Model 2: XGBoost Regressor
  model2: {
    temperatureData: { time: string; predicted: number; actual: number }[];
    weatherContext: {
      ambientTemp: number;
      humidity: number;
      windSpeed: number;
    };
  };

  // Model 3: Weighted Scoring Algorithm
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
    id: 'AS-8492',
    substation: 'Northside Alpha',
    riskIndex: 94,
    anomalyStatus: 'Anomaly',
    weatherThreat: 'Extreme Heat',
    customersImpacted: 45000,
    model1: {
      anomalyScore: 0.88,
      anomalyFlag: -1,
      anomalousFeatures: ['Vibration: +2.3σ', 'Insulation Resistance: Critical Drop', 'Oil Dissolved Gas: High H2'],
    },
    model2: {
      temperatureData: [
        { time: '00:00', predicted: 65, actual: 66 },
        { time: '04:00', predicted: 64, actual: 65 },
        { time: '08:00', predicted: 68, actual: 70 },
        { time: '12:00', predicted: 75, actual: 82 },
        { time: '16:00', predicted: 78, actual: 95 },
        { time: '20:00', predicted: 72, actual: 91 },
      ],
      weatherContext: {
        ambientTemp: 41,
        humidity: 85,
        windSpeed: 3,
      }
    },
    model3: {
      failureProbabilityScore: 92,
      severityScore: 97,
      impactVariables: {
        hospitalConnected: true,
        criticalWaterPlant: false,
        homesPowered: 45000,
      }
    }
  },
  {
    id: 'AS-3105',
    substation: 'West End Sub',
    riskIndex: 87,
    anomalyStatus: 'Anomaly',
    weatherThreat: 'High Wind',
    customersImpacted: 32000,
    model1: {
      anomalyScore: 0.76,
      anomalyFlag: -1,
      anomalousFeatures: ['Bushings Stress: Elevated', 'Load Variance: Erratic'],
    },
    model2: {
      temperatureData: [
        { time: '00:00', predicted: 62, actual: 63 },
        { time: '04:00', predicted: 61, actual: 62 },
        { time: '08:00', predicted: 65, actual: 67 },
        { time: '12:00', predicted: 70, actual: 78 },
        { time: '16:00', predicted: 71, actual: 85 },
        { time: '20:00', predicted: 68, actual: 80 },
      ],
      weatherContext: {
        ambientTemp: 28,
        humidity: 60,
        windSpeed: 24,
      }
    },
    model3: {
      failureProbabilityScore: 84,
      severityScore: 91,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: true,
        homesPowered: 32000,
      }
    }
  },
  {
    id: 'AS-5521',
    substation: 'Central Hub',
    riskIndex: 45,
    anomalyStatus: 'Normal',
    weatherThreat: 'Stable',
    customersImpacted: 120000,
    model1: {
      anomalyScore: 0.12,
      anomalyFlag: 1,
      anomalousFeatures: ['None detected'],
    },
    model2: {
      temperatureData: [
        { time: '00:00', predicted: 60, actual: 60 },
        { time: '04:00', predicted: 59, actual: 59 },
        { time: '08:00', predicted: 64, actual: 65 },
        { time: '12:00', predicted: 71, actual: 72 },
        { time: '16:00', predicted: 75, actual: 76 },
        { time: '20:00', predicted: 69, actual: 70 },
      ],
      weatherContext: {
        ambientTemp: 22,
        humidity: 45,
        windSpeed: 5,
      }
    },
    model3: {
      failureProbabilityScore: 25,
      severityScore: 75,
      impactVariables: {
        hospitalConnected: true,
        criticalWaterPlant: true,
        homesPowered: 120000,
      }
    }
  },
  {
    id: 'AS-9923',
    substation: 'East Ridge',
    riskIndex: 22,
    anomalyStatus: 'Normal',
    weatherThreat: 'Stable',
    customersImpacted: 18500,
    model1: {
      anomalyScore: 0.04,
      anomalyFlag: 1,
      anomalousFeatures: ['None detected'],
    },
    model2: {
      temperatureData: [
        { time: '00:00', predicted: 55, actual: 56 },
        { time: '04:00', predicted: 54, actual: 54 },
        { time: '08:00', predicted: 60, actual: 61 },
        { time: '12:00', predicted: 68, actual: 67 },
        { time: '16:00', predicted: 72, actual: 71 },
        { time: '20:00', predicted: 65, actual: 66 },
      ],
      weatherContext: {
        ambientTemp: 20,
        humidity: 50,
        windSpeed: 4,
      }
    },
    model3: {
      failureProbabilityScore: 18,
      severityScore: 28,
      impactVariables: {
        hospitalConnected: false,
        criticalWaterPlant: false,
        homesPowered: 18500,
      }
    }
  },
];
