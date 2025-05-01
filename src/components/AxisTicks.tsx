import React from 'react';
import { Line, Text } from 'react-konva';

// 設定刻度間距
const xTickInterval = 100;
const yTickInterval = 200;

type AxisTicksType = {
    axisOffset: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    toCanvasX: (x: number) => number;
    toCanvasY: (y: number) => number;
};

const generateTicks = (max: number, interval: number) =>
    Array.from({ length: max / interval + 1 }, (_, i) => i * interval);

console.log(generateTicks(1000, 100));

export default function AxisTicks({
    axisOffset,
    xMin,
    xMax,
    yMin,
    yMax,
    toCanvasX,
    toCanvasY,
}: AxisTicksType) {
    return (
        <>
            {/* 繪製 X 軸 */}
            <Line
                points={[toCanvasX(xMin), toCanvasY(0), toCanvasX(xMax), toCanvasY(0)]}
                stroke="white"
                strokeWidth={2}
            />

            {/* 繪製 Y 軸 */}
            <Line
                points={[
                    toCanvasX(xMin),
                    toCanvasY(yMin + axisOffset),
                    toCanvasX(xMin),
                    toCanvasY(yMax + axisOffset),
                ]}
                stroke="white"
                strokeWidth={2}
            />

            {/* X 軸刻度 */}
            {generateTicks(xMax, xTickInterval)
                .filter((x) => x >= xMin + axisOffset)
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
                            toCanvasX(xMin),
                            toCanvasY(y + axisOffset),
                            toCanvasX(xMin) - 10,
                            toCanvasY(y + axisOffset),
                        ]}
                        stroke="white"
                        strokeWidth={2}
                    />
                    <Text
                        text={y.toString()}
                        x={toCanvasX(xMin) - 40}
                        y={toCanvasY(y + axisOffset) - 5}
                        fontSize={14}
                        fill="white"
                    />
                </React.Fragment>
            ))}
        </>
    );
}
