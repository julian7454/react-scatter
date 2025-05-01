import { useState } from 'react';
import './App.css';

import Chart from './components/Chart';
import PolygonsControl from './components/PolygonsControl';

const axisOffset = 25;
const xMax = 1025;
const yMax = 1025;
const canvasHeight = 800;
const canvasWidth = 800;


function csvToJson(csvText: string) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    return lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    });
}
async function fetchCsvPoints(
    url: string
): Promise<Point[]> {
    const response = await fetch(url);
    const text = await response.text();
    const jsonData = csvToJson(text);
    console.log(jsonData);
    const result = jsonData.map((item) => ({
        id: item['Cell_ID'],
        'CD45-KrO': parseFloat(item['CD45-KrO']),
        'CD19-PB': parseFloat(item['CD19-PB']),
        'SS INT LIN': parseFloat(item['SS INT LIN']),
        color: '#555',
    }));

    return result;
}

export default function App() {
    const [points, setPoints] = useState<Point[]>([]);
    const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [testPoint, setTestPoint] = useState(false);
    const [canUsePolygon, setCanUsePolygon] = useState(true);
    const [hiddenPolygonIds, setHiddenPolygonIds] = useState<string[] | null>(null);

    console.log(hiddenPolygonIds);
    const handleLoad = async () => {
        const data = await fetchCsvPoints('CD45_pos.csv');
        console.log(data);
        setLoaded(true);
        requestIdleCallback(() => {
            setPoints(data);
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
            <div className="chart-wrapper">
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
                    xField="CD45-KrO"
                    yField="SS INT LIN"
                    hiddenPolygonIds={hiddenPolygonIds}
                />
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
                    xField="CD19-PB"
                    yField="SS INT LIN"
                    hiddenPolygonIds={hiddenPolygonIds}
                />
            </div>
            <PolygonsControl
                polygons={polygons}
                setHiddenPolygonIds={setHiddenPolygonIds}
                setPoints={setPoints}
                setPolygons={setPolygons}
            />
        </div>
    );
}
