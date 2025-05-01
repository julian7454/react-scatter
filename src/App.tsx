import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

import Chart from "./components/Chart";

const axisOffset = 25;
const xMax = 1025;
const yMax = 1025;
const canvasHeight = 800;
const canvasWidth = 800;

// 生成隨機資料點
function generatePoints(n: number) {
    const points = [];
    for (let i = 0; i < n; i++) {
        points.push({
            id: uuidv4(),
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            //color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            color: '#555',
        });
    }
    return points;
}
async function fetchCsvPoints(
    url: string
): Promise<{ x: number; y: number; color: string }[]> {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.trim().split("\n");
    const result: { x: number; y: number; color: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
        const [xStr, yStr, color] = lines[i].split(",");
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        if (!isNaN(x) && !isNaN(y)) {
            result.push({ x, y, color });
        }
    }

    return result;
}

export default function App() {
    const [points, setPoints] = useState<Point<"x", "y">[]>([]);
    const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [testPoint, setTestPoint] = useState(true);
    const [canUsePolygon, setCanUsePolygon] = useState(true);

    const handleLoad = async () => {
        const data = await fetchCsvPoints("public/CD45_pos.csv");
        console.log(data);
        setLoaded(true);
        requestIdleCallback(() => {
            setPoints(generatePoints(20000));
        });
    };

    const generateRandomPoint = () => {
        const x = Math.random() * xMax;
        const y = Math.random() * yMax;
        setPoint({ x, y });
    };

    return (
        <div className="plot">
            <input
                type="checkbox"
                checked={testPoint}
                onChange={() => setTestPoint(!testPoint)}
            />
            <button onClick={testPoint ? generateRandomPoint : handleLoad}>
                載入資料點
            </button>
            <button
                onClick={() => setCanUsePolygon((canUsePolygon) => !canUsePolygon)}
            >
                繪製 polygon
            </button>
            <Chart
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                xDataStart={0}
                axisOffset={axisOffset}
                xMax={xMax}
                yMax={yMax}
                loaded={loaded}
                polygons={polygons}
                setPolygons={setPolygons}
                canUsePolygon={canUsePolygon}
                points={points}
                setPoints={setPoints}
                point={point}
                xField="x"
                yField="y"
            />
            <Chart
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                xDataStart={200}
                axisOffset={axisOffset}
                xMax={xMax}
                yMax={yMax}
                loaded={loaded}
                polygons={polygons}
                setPolygons={setPolygons}
                canUsePolygon={canUsePolygon}
                points={points}
                setPoints={setPoints}
                point={point}
                xField="x"
                yField="y"
            />

            {polygons.map((polygon) => (
                <div>
                    <div style={{ color: polygon.color }}>{polygon.id}</div>
                    <input
                        type="text"
                        value={polygon.name}
                        onChange={(e) => {
                            setPolygons((prevPolygons) => {
                                return prevPolygons.map((p) => {
                                    if (p.id === polygon.id) {
                                        return {
                                            ...p,
                                            name: e.target.value,
                                        };
                                    }
                                    return p;
                                });
                            });
                        }}
                    />
                    <button
                        onClick={() => {
                            setPolygons((prev) => prev.filter((p) => p.id !== polygon.id));
                            setPoints((points) =>
                                points.map((point) =>
                                    point.sourcePolygonId === polygon.id
                                        ? { ...point, color: "#555", sourcePolygonId: undefined }
                                        : point
                                )
                            );
                        }}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
