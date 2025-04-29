type PolygonPoint = [number, number];
type Polygon = {
  id: string;
  name: string;
  color: string;
  points: PolygonPoint[];
};
type Point = {
  id: string;
  x: number;
  y: number;
  color: string;
};

type DrawPoints = [number, number][];
