type PolygonPoint = [number, number];
type Polygon = {
  id: string;
  name: string;
  color: string;
  points: PolygonPoint[];
  chartId: string;
};
type Point = {
  id: string;
  x1: number;
  x2: number;
  y: number;
  color: string;
  sourcePolygonId?: string;
};

type DrawPoints = [number, number][];
