export const abiAgroTwin = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "date",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "recommendedCrop",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "healthRating",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "hasAnomaly",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "recommendations",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "recordHash",
        "type": "bytes32"
      }
    ],
    "name": "DailyInsightStored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "measuredAtVN",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "dataHash",
        "type": "bytes32"
      }
    ],
    "name": "SensorReadingStored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_date",
        "type": "string"
      }
    ],
    "name": "getDailyInsightByDate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "date",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "recommendedCrop",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "confidence",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "soilHealthScore",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "healthRating",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "hasAnomaly",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "recommendations",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "recordHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct AgroTwinData.DailyInsight",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDailyInsightCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getSensorReading",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "measuredAtVN",
            "type": "string"
          },
          {
            "internalType": "uint16",
            "name": "soilTemperatureC",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "soilMoisturePct",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "conductivity",
            "type": "uint32"
          },
          {
            "internalType": "uint16",
            "name": "phValue",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "nitrogen",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "phosphorus",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "potassium",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "salt",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "airTemperatureC",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "airHumidityPct",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "isRaining",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct AgroTwinData.SensorReading",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSensorReadingCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_date",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_recommendedCrop",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_confidence",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "_soilHealthScore",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "_healthRating",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "_hasAnomaly",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "_recommendations",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "_recordHash",
        "type": "bytes32"
      }
    ],
    "name": "storeDailyInsight",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_measuredAtVN",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "_soilTemperatureC",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_soilMoisturePct",
        "type": "uint16"
      },
      {
        "internalType": "uint32",
        "name": "_conductivity",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "_phValue",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_nitrogen",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_phosphorus",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_potassium",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_salt",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_airTemperatureC",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_airHumidityPct",
        "type": "uint16"
      },
      {
        "internalType": "bool",
        "name": "_isRaining",
        "type": "bool"
      },
      {
        "internalType": "bytes32",
        "name": "_dataHash",
        "type": "bytes32"
      }
    ],
    "name": "storeSensorReading",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

