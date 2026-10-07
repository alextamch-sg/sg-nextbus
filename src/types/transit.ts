export type CrowdingLevel = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusDeck = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy
export type TransitOperator = 'SBS TRANSIT' | 'SMRT' | 'TOWER' | 'GO-AHEAD';

export interface BusArrivalInfo {
  min: number | 'Arr' | '--';
  crowding: CrowdingLevel;
  deck: BusDeck;
  isWab: boolean; // Wheelchair accessible bus
  plateNumber?: string;
  loadPercentage?: number; // e.g. 35%, 75%, 92%
}

export interface BusService {
  serviceNo: string;
  operator: TransitOperator;
  destination: string;
  via: string;
  corridorTag?: string; // e.g. "Trunk", "High Frequency Corridor", "Express", "Feeder"
  isActiveInPane?: boolean;
  stopsAheadCount: number;
  direction: 1 | 2;
  nextBus: BusArrivalInfo;
  secondBus: BusArrivalInfo;
  thirdBus: BusArrivalInfo;
  totalDistanceKm: number;
  schematicStops: {
    code: string;
    name: string;
    etaMinutes: number;
    isBoarding?: boolean;
    isTerminus?: boolean;
  }[];
  activeBusTelemetry?: {
    plateNumber: string;
    statusText: string;
    distanceToStopMeters: number;
    currentSpeedKmh: number;
    approachingJunction: string;
  };
  stopsProgression: StopProgressionNode[];
}

export interface StopProgressionNode {
  code: string;
  name: string;
  subtext?: string;
  distanceKmFromBoard?: number;
  mrtBadges?: { line: 'NSL' | 'EWL' | 'NEL' | 'CCL' | 'DTL' | 'TEL'; label?: string }[];
  locationNote?: string;
  etaOffsetMin: number;
  formattedEta: string;
  isBoarding?: boolean;
  isTerminus?: boolean;
  isCurrentStopOfBus?: boolean;
  busStatusNote?: string;
}

export interface BusStop {
  code: string;
  name: string;
  roadName: string;
  description: string;
  directionDesc?: string;
  distanceMeters: number;
  walkMinutes: number;
  isActiveBoarding?: boolean;
  services: BusService[];
  compactServices?: {
    serviceNo: string;
    arrivalText: string;
    deck: BusDeck;
    crowding?: CrowdingLevel;
    tag?: string;
  }[];
}

export interface AlightAlert {
  serviceNo: string;
  stopCode: string;
  stopName: string;
  remainingStops: number;
  estimatedArrival: string;
  alertArmed: boolean;
}
