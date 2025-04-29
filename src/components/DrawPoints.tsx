import { Line, Circle } from "react-konva";

type DrawPointsType = {
    drawPoints: DrawPoints;
    currentColor: string;
};

export default function drawPoints({
    drawPoints,
    currentColor,
}: DrawPointsType) {
    return (
        <>
            {drawPoints.map(([x, y], index) => (
                <Circle key={index} x={x} y={y} radius={4} fill={currentColor} />
            ))}
            {drawPoints.length > 1 && (
                <Line
                    points={drawPoints.flat()}
                    stroke={currentColor}
                    strokeWidth={2}
                />
            )}
        </>
    );
}
