import { Shape } from "react-konva";

type DataPointsType = {
    points: Point[];
    xDataStart: number;
    axisOffset: number;
    toCanvasX: (x: number) => number;
    toCanvasY: (y: number) => number;
};

export default function DataPoints({
    points,
    xDataStart,
    axisOffset,
    toCanvasX,
    toCanvasY,
}: DataPointsType) {
    return (
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
    );
}
