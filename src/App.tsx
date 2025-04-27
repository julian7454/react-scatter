import React, { useState } from "react";
import { Stage, Layer, Shape, Line, Text, Circle } from "react-konva";
import "./App.css";
// 生成隨機資料點
function generatePoints(n: number) {
    const points = [];
    for (let i = 0; i < n; i++) {
        points.push({
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
    const [points, setPoints] = useState<{ x: number; y: number; color: string }[]>([]);
    const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [testPoint, setTestPoint] = useState(true);

    const handleLoad = async () => {
        const data = await fetchCsvPoints("public/CD45_pos.csv");
        console.log(data);
        setLoaded(true);
        requestIdleCallback(() => {
            setPoints(generatePoints(20000));
        });
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

    const generateRandomPoint = () => {
        const x = Math.random() * xMax;
        const y = Math.random() * yMax;
        console.log("原始座標：", { x, y });
        console.log("轉換後座標：", { x, y: toCanvasY(y) });
        setPoint({ x: 1000, y: 0 });
    };

    const generateTicks = (max: number, interval: number) => {
        return Array.from({ length: max / interval + 1 }, (_, i) => i * interval);
    };

    return (
        <div className="plot">
            <input type="checkbox" checked={testPoint} onChange={() => setTestPoint(!testPoint)} />
            <button onClick={testPoint ? generateRandomPoint : handleLoad}>載入資料點</button>
            <Stage width={canvasWidth} height={canvasWidth}>
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
            </Stage>
        </div>
    );
}
