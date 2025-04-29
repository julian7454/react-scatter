import { Stage, Layer, Text, Circle } from "react-konva";
import Konva from "konva";
import AxisTicks from "./AxisTicks";
import Polygons from "./Polygons";
import DrawPoints from "./DrawPoints";
import DataPoints from "./DataPoints";

type ChartType = {
    canvasWidth: number;
    canvasHeight: number;
    xDataStart: number;
    axisOffset: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    loaded: boolean;
    canUsePolygon: boolean;
    currentColor: string;
    polygons: Polygon[];
    drawPoints: DrawPoints;
    points: Point[];
    point: { x: number; y: number } | null;
    handleStageClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    toCanvasX: (x: number) => number;
    toCanvasY: (y: number) => number;
};

export default function Chart({
    canvasWidth,
    canvasHeight,
    xDataStart,
    axisOffset,
    xMin,
    xMax,
    yMin,
    yMax,
    loaded,
    canUsePolygon,
    polygons,
    drawPoints,
    points,
    point,
    currentColor,
    toCanvasX,
    toCanvasY,
    handleStageClick,
}: ChartType) {
    return (
        <Stage width={canvasWidth} height={canvasHeight} onClick={handleStageClick}>
            <Layer offsetX={0} offsetY={0}>
                <AxisTicks
                    axisOffset={axisOffset}
                    xMin={xMin}
                    xMax={xMax}
                    yMin={yMin}
                    yMax={yMax}
                    toCanvasX={toCanvasX}
                    toCanvasY={toCanvasY}
                />
                {/* 繪製資料點 */}
                {loaded && (
                    <DataPoints
                        points={points}
                        xDataStart={xDataStart}
                        axisOffset={axisOffset}
                        toCanvasX={toCanvasX}
                        toCanvasY={toCanvasY}
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
                {canUsePolygon && (
                    <>
                        <Polygons polygons={polygons} />
                        <DrawPoints drawPoints={drawPoints} currentColor={currentColor} />
                    </>
                )}
            </Layer>
        </Stage>
    );
}
