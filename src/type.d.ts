type PolygonPoint = [number, number];
type Polygon = {
  id: string;
  name: string;
  color: string;
  points: PolygonPoint[];
  chartId: string;
};
type ColorDisabledCharts = {
  [chartId: string]: {
    [polygonId: string]: boolean;
  };
};

type Point = {
  id: string;
  color: string;
  'CD45-KrO': number;
  'CD19-PB': number;
  'SS INT LIN': number;
  sourcePolygonId?: string;
  colorDisabledCharts?: ColorDisabledCharts;
};
type XField = 'CD45-KrO' | 'CD19-PB';
type YField = 'SS INT LIN';

type DrawPoints = [number, number][];
