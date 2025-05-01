type PolygonPoint = [number, number];
type Polygon = {
  id: string;
  name: string;
  color: string;
  points: PolygonPoint[];
  chartId: string;
};
type Point<TX extends string, TY extends string> = {
  id: string;
  color: string;
  sourcePolygonId?: string;
} & {
  [key in TX | TY]: number;
};

type DrawPoints = [number, number][];
