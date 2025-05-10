import React, { useState, useId } from 'react';
import { v4 as uuidv4 } from 'uuid';
import inside from 'point-in-polygon';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import AxisTicks from './AxisTicks';
import Polygons from './Polygons';
import DrawPoints from './DrawPoints';
import DataPoints from './DataPoints';
import PolygonsControl from './PolygonsControl';

const scaleMarginRatio = 0.9; // 縮放比例
// 換算單位的像素

type ChartType = {
    canvasWidth: number;
    canvasHeight: number;
    xDataStart: number;
    axisOffset: number;
    xMax: number;
    yMax: number;
    loaded: boolean;
    canUsePolygon: boolean;
    polygons: Polygon[];
    setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
    points: Point[];
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
    xField: XField;
    yField: YField;
    hiddenPolygonIds: string[] | null;
    setHiddenPolygonIds: React.Dispatch<React.SetStateAction<string[] | null>>;
};

export default function Chart({
    canvasWidth,
    canvasHeight,
    xDataStart,
    axisOffset,
    xMax,
    yMax,
    loaded,
    canUsePolygon,
    polygons,
    setPolygons,
    points,
    setPoints,
    xField,
    yField,
    hiddenPolygonIds,
    setHiddenPolygonIds,
}: ChartType) {
    const yMin = -axisOffset;
    const [drawPoints, setDrawPoints] = useState<DrawPoints>([]);
    const [currentColor, setCurrentColor] = useState(
        `hsl(${(polygons.length * 137.5) % 360}, 80%, 60%)`
    );
    const chartId = useId();

    const xDisplayMin = xDataStart - axisOffset;
    const xDisplayRange = xMax - xDisplayMin;
    const scaleX = (canvasWidth * scaleMarginRatio) / xDisplayRange;
    const scaleY = (canvasHeight * scaleMarginRatio) / yMax;

    // 圖表雨畫布的距離
    const offsetX = (canvasWidth - xDisplayRange * scaleX) / 2;
    const offsetY = (canvasHeight - yMax * scaleY) / 2;

    const toCanvasX = (x: number) => (x - xDisplayMin) * scaleX + offsetX;
    const toCanvasY = (y: number) => canvasHeight - y * scaleY - offsetY;
    const chartPolygons = polygons.filter((p) => p.chartId === chartId);

    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log(e);
        e.preventDefault();
        setDrawPoints([]);
    };

    const isCloseToFirstPoint = (x: number, y: number) => {
        if (drawPoints.length === 0) return false;
        const [firstX, firstY] = drawPoints[0];
        const dx = firstX - x;
        const dy = firstY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 10;
    };
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 2 || !canUsePolygon) return;

        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();
        if (!pointerPosition) return;

        const { x, y } = pointerPosition;

        setCurrentColor(`hsl(${(polygons.length * 137.5) % 360}, 80%, 60%)`);
        const polygonId = uuidv4();

        if (drawPoints.length > 2 && isCloseToFirstPoint(x, y)) {
            setPolygons([
                ...polygons,
                {
                    chartId,
                    id: polygonId,
                    name: `Polygon ${polygons.length + 1}`,
                    color: currentColor,
                    points: drawPoints,
                },
            ]);
            setDrawPoints([]);

            const selectedPoints = points
                .filter((point) =>
                    inside(
                        [toCanvasX(point[xField]), toCanvasY(point[yField] + axisOffset)],
                        drawPoints
                    )
                )
                .map((point) => point.id);

            const selectedIdSet = new Set(selectedPoints);

            setPoints((points) =>
                points?.map((point) => {
                    if (selectedIdSet.has(point.id)) {
                        return {
                            ...point,
                            color: currentColor,
                            sourcePolygonId: polygonId,
                        };
                    }

                    return point;
                })
            );
        } else {
            setDrawPoints([...drawPoints, [x, y]]);
        }
    };
    return (
        <div className="chart" onContextMenu={handleRightClick}>
            <p className="axis-label y-axis-labe">{yField}</p>
            <Stage
                className="chart-canvas"
                width={canvasWidth}
                height={canvasHeight}
                onClick={handleStageClick}
            >
                <Layer offsetX={0} offsetY={0}>
                    <AxisTicks
                        axisOffset={axisOffset}
                        xMin={xDisplayMin}
                        xMax={xMax}
                        yMin={yMin}
                        yMax={yMax}
                        toCanvasX={toCanvasX}
                        toCanvasY={toCanvasY}
                    />
                    {/* 繪製資料點 */}
                    {loaded && <DataPoints
                        points={points}
                        xDataStart={xDataStart}
                        axisOffset={axisOffset}
                        toCanvasX={toCanvasX}
                        toCanvasY={toCanvasY}
                        xField={xField}
                        yField={yField}
                        chartId={chartId}
                    />}
                </Layer>
                <Layer>
                    {canUsePolygon && loaded && (
                        <>
                            <Polygons
                                polygons={chartPolygons}
                                hiddenPolygonIds={hiddenPolygonIds}
                            />
                            <DrawPoints drawPoints={drawPoints} currentColor={currentColor} />
                        </>
                    )}
                </Layer>
            </Stage>
            <p className="axis-label x-axis-label">{xField}</p>
            {!loaded && (
                <div className="loading">
                    Loading...
                </div>
            )}
            <PolygonsControl
                polygons={polygons}
                setHiddenPolygonIds={setHiddenPolygonIds}
                setPoints={setPoints}
                setPolygons={setPolygons}
                chartId={chartId}
            />
        </div>
    );
}
