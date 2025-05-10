import { useState, useEffect } from 'react';
import './App.css';

import Chart from './components/Chart';
import { streamCsvToPoints } from './streamCsvToPoints';

const axisOffset = 25;
const xMax = 1025;
const yMax = 1025;
const canvasHeight = 800;
const canvasWidth = 800;

export default function App() {
    const [points, setPoints] = useState<Point[]>([]);
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [canUsePolygon, setCanUsePolygon] = useState(true);
    const [hiddenPolygonIds, setHiddenPolygonIds] = useState<string[] | null>(
        null
    );

    const handleLoad = async () => {
        streamCsvToPoints(
            'fake_data.csv',
            (batch) => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        setPoints((prev) => [...prev, ...batch]);
                    });
                } else {
                    setPoints((prev) => [...prev, ...batch]);
                }
            },
            () => setLoaded(true)
        );
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
                    xField="x1"
                    yField="y"
                    hiddenPolygonIds={hiddenPolygonIds}
                    setHiddenPolygonIds={setHiddenPolygonIds}
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
                    xField="x2"
                    yField="y"
                    hiddenPolygonIds={hiddenPolygonIds}
                    setHiddenPolygonIds={setHiddenPolygonIds}
                />
            </div>
        </div>
    );
}
