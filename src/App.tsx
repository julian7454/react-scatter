import React, { useState } from "react";
import inside from "point-in-polygon";
import { Stage, Layer, Shape, Line, Text, Circle } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

type Point = [number, number];
type Polygon = {
    id: string;
    name: string;
    color: string;
    points: Point[];
};

const axisOffset = 25;
// 設定軸範圍
const xMax = 1025;
const yMin = -axisOffset;
const yMax = 1025;

const xDataStart = 200;
const xDisplayMin = xDataStart - axisOffset;
const xDisplayMax = xMax;
const xDisplayRange = xDisplayMax - xDisplayMin;

// 設定刻度間距
const xTickInterval = 100;
const yTickInterval = 200;

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
const generateTicks = (max: number, interval: number) =>
    Array.from({ length: max / interval + 1 }, (_, i) => i * interval);

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
    const [points, setPoints] = useState<
        { id: string; x: number; y: number; color: string }[]
    >([]);
    const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [testPoint, setTestPoint] = useState(true);

    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
    const [canUsePolygon, setCanUsePolygon] = useState(true);
    const [currentColor, setCurrentColor] = useState(`hsl(${(polygons.length * 137.5) % 360}, 80%, 60%)`);

    const isCloseToFirstPoint = (x: number, y: number) => {
        if (drawPoints.length === 0) return false;
        const [firstX, firstY] = drawPoints[0];
        const dx = firstX - x;
        const dy = firstY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 10;
    };

    const handleStageClick = (e) => {
        if (!canUsePolygon) {
            return;
        }
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();
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

    const handleRightClick = (e) => {
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
            <Stage
                width={canvasWidth}
                height={canvasWidth}
                onClick={handleStageClick}
            >
                <Layer offsetX={0} offsetY={0}>
                    {/* 繪製 X 軸 */}
                    <Line
                        points={[
                            toCanvasX(xDisplayMin),
                            toCanvasY(0),
                            toCanvasX(xDisplayMax),
                            toCanvasY(0),
                        ]}
                        stroke="white"
                        strokeWidth={2}
                    />

                    {/* 繪製 Y 軸 */}
                    <Line
                        points={[
                            toCanvasX(xDisplayMin),
                            toCanvasY(yMin + axisOffset),
                            toCanvasX(xDisplayMin),
                            toCanvasY(yMax + axisOffset),
                        ]}
                        stroke="white"
                        strokeWidth={2}
                    />

                    {/* X 軸刻度 */}
                    {generateTicks(xMax, xTickInterval)
                        .filter((x) => x >= xDataStart)
                        .map((x, index) => (
                            <React.Fragment key={`x-tick-${index}`}>
                                <Line
                                    points={[
                                        toCanvasX(x),
                                        toCanvasY(0),
                                        toCanvasX(x),
                                        toCanvasY(0) + 10,
                                    ]}
                                    stroke="white"
                                    strokeWidth={2}
                                />
                                <Text
                                    text={x.toString()}
                                    x={toCanvasX(x) - (x >= 100 ? 15 : 5)}
                                    y={toCanvasY(0) + axisOffset}
                                    fontSize={14}
                                    fill="white"
                                />
                            </React.Fragment>
                        ))}

                    {/* 繪製 Y 軸刻度 */}
                    {generateTicks(yMax, yTickInterval).map((y, index) => (
                        <React.Fragment key={`y-tick-${index}`}>
                            <Line
                                points={[
                                    toCanvasX(xDisplayMin),
                                    toCanvasY(y + axisOffset),
                                    toCanvasX(xDisplayMin) - 10,
                                    toCanvasY(y + axisOffset),
                                ]}
                                stroke="white"
                                strokeWidth={2}
                            />
                            <Text
                                text={y.toString()}
                                x={toCanvasX(xDisplayMin) - 40}
                                y={toCanvasY(y + axisOffset) - 5}
                                fontSize={14}
                                fill="white"
                            />
                        </React.Fragment>
                    ))}

                    {/* 繪製資料點 */}
                    {loaded && (
                        <Shape
                            sceneFunc={(ctx) => {
                                points.forEach((p) => {
                                    if (p.x < xDataStart) return;
                                    ctx.beginPath();
                                    ctx.arc(
                                        toCanvasX(p.x),
                                        toCanvasY(p.y + axisOffset),
                                        1.5,
                                        0,
                                        Math.PI * 2
                                    );
                                    ctx.fillStyle = p.color;
                                    ctx.fill();
                                });
                            }}
                        />
                    )}
                    {point && (
                        <>
                            <Circle
                                x={toCanvasX(point.x)}
                                y={toCanvasY(point.y + axisOffset)}
                                radius={5}
                                fill="red"
                            />
                            <Text
                                text={`(${point.x.toFixed(0)}, ${point.y.toFixed(0)})`}
                                x={toCanvasX(point.x) + 10}
                                y={toCanvasY(point.y) - 10}
                                fontSize={14}
                                fill="white"
                            />
                        </>
                    )}
                </Layer>
                <Layer>
                    {canUsePolygon &&
                        polygons.map((polygon, index) => (
                            <>
                                <Line
                                    key={index}
                                    points={polygon.points.flat()}
                                    stroke={polygon.color}
                                    strokeWidth={2}
                                    closed
                                />
                                <Text
                                    x={polygon.points[0][0] + 15}
                                    y={polygon.points[0][1] + 15}
                                    text={polygon.name}
                                    fontSize={16}
                                    fill="white"
                                    align="center"
                                />
                            </>
                        ))}
                    {/* 畫出所有點 */}
                    {canUsePolygon &&
                        drawPoints.map(([x, y], index) => (
                            <Circle key={index} x={x} y={y} radius={4} fill={currentColor} />
                        ))}

                    {/* 畫線（或面） */}
                    {canUsePolygon && drawPoints.length > 1 && (
                        <Line
                            points={drawPoints.flat()}
                            stroke={currentColor}
                            strokeWidth={2}
                        />
                    )}
                </Layer>
            </Stage>
            {polygons.map((polygon) => (
                <div>
                    <div style={{ color: polygon.color }}>{polygon.id}</div>
                    <input type="text" value={polygon.name} onChange={(e) => {
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
                    }} />
                </div>
            ))}
        </div>
    );
}
