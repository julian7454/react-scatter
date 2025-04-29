import React, { useState, useEffect } from "react";
import inside from "point-in-polygon";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

import Chart from "./components/Chart";

const axisOffset = 25;
const xDataStart = 200;

// 設定軸範圍
const xMax = 1025;
const yMax = 1025;
const yMin = -axisOffset;
const xDisplayMin = xDataStart - axisOffset;
const xDisplayRange = xMax - xDisplayMin;

const canvasHeight = 800;
const canvasWidth = 800;

const scaleMarginRatio = 0.9; // 縮放比例
// 換算單位的像素
const scaleX = (canvasWidth * scaleMarginRatio) / xDisplayRange;
const scaleY = (canvasHeight * scaleMarginRatio) / yMax;

// 圖表雨畫布的距離
const offsetX = (canvasWidth - xDisplayRange * scaleX) / 2;
const offsetY = (canvasHeight - yMax * scaleY) / 2;

const toCanvasX = (x: number) => (x - xDisplayMin) * scaleX + offsetX;
const toCanvasY = (y: number) => canvasHeight - y * scaleY - offsetY;

// 生成隨機資料點
function generatePoints(n: number) {
    const points = [];
    for (let i = 0; i < n; i++) {
        points.push({
            id: uuidv4(),
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
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
    const [points, setPoints] = useState<Point[]>([]);
    const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [testPoint, setTestPoint] = useState(true);

    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [drawPoints, setDrawPoints] = useState<DrawPoints>([]);
    const [canUsePolygon, setCanUsePolygon] = useState(true);
    const [currentColor, setCurrentColor] = useState(
        `hsl(${(polygons.length * 137.5) % 360}, 80%, 60%)`
    );

    const isCloseToFirstPoint = (x: number, y: number) => {
        if (drawPoints.length === 0) return false;
        const [firstX, firstY] = drawPoints[0];
        const dx = firstX - x;
        const dy = firstY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 10;
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!canUsePolygon) {
            return;
        }
        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();
        if (!pointerPosition) return;

        const { x, y } = pointerPosition;

        setCurrentColor(`hsl(${(polygons.length * 137.5) % 360}, 80%, 60%)`);

        if (drawPoints.length > 2 && isCloseToFirstPoint(x, y)) {
            setPolygons([
                ...polygons,
                {
                    id: uuidv4(),
                    name: `Polygon ${polygons.length + 1}`,
                    color: currentColor,
                    points: drawPoints,
                },
            ]);
            setDrawPoints([]);

            const selectedPoints = points
                .filter((point) =>
                    inside(
                        [toCanvasX(point.x), toCanvasY(point.y + axisOffset)],
                        drawPoints
                    )
                )
                .map((point) => point.id);

            setPoints((points) => {
                return points?.map((point) => {
                    if (selectedPoints?.includes(point.id)) {
                        return {
                            ...point,
                            color: currentColor,
                        };
                    }

                    return point;
                });
            });
        } else {
            setDrawPoints([...drawPoints, [x, y]]);
        }
    };

    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log(e);
        e.preventDefault();
        setDrawPoints([]);
    };

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
        console.log("原始座標：", { x, y });
        console.log("轉換後座標：", { x, y: toCanvasY(y) });
        setPoint({ x, y });
    };

    return (
        <div className="plot" onContextMenu={handleRightClick}>
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
                xDataStart={xDataStart}
                axisOffset={axisOffset}
                xMin={xDataStart}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
                loaded={loaded}
                canUsePolygon={canUsePolygon}
                currentColor={currentColor}
                polygons={polygons}
                drawPoints={drawPoints}
                points={points}
                point={point}
                handleStageClick={handleStageClick}
                toCanvasX={toCanvasX}
                toCanvasY={toCanvasY}
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
                </div>
            ))}
        </div>
    );
}
