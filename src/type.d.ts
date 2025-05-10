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
  'x1': number;
  'x2': number;
  'y': number;
  sourcePolygonId?: string;
  colorDisabledCharts?: ColorDisabledCharts;
};
type XField = 'x1' | 'x2';
type YField = 'y';

type DrawPoints = [number, number][];
