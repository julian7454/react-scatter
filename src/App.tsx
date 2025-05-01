import { useState, useEffect } from 'react';
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
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [canUsePolygon, setCanUsePolygon] = useState(true);
    const [hiddenPolygonIds, setHiddenPolygonIds] = useState<string[] | null>(null);

    const handleLoad = async () => {
        const data = await fetchCsvPoints('CD45_pos.csv');
        console.log(data);
        setLoaded(true);
        requestIdleCallback(() => {
            setPoints(data);
        });
    };

    useEffect(() => {
        handleLoad();
    }, []);

    return (
        <div className="plot">

            <button
                onClick={() => setCanUsePolygon((canUsePolygon) => !canUsePolygon)}
            >
                Enable / Disable Polygon
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
                    xField="CD45-KrO"
                    yField="SS INT LIN"
                    hiddenPolygonIds={hiddenPolygonIds}
                    setHiddenPolygonIds={setHiddenPolygonIds}
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
                    xField="CD19-PB"
                    yField="SS INT LIN"
                    hiddenPolygonIds={hiddenPolygonIds}
                    setHiddenPolygonIds={setHiddenPolygonIds}
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
