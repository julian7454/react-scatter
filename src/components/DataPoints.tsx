import { Shape } from "react-konva";

type DataPointsType = {
    points: Point<"x", "y">[];
    xDataStart: number;
    axisOffset: number;
    xField: "x";
    yField: "y";
    toCanvasX: (x: number) => number;
    toCanvasY: (y: number) => number;
};

export default function DataPoints({
    points,
    xDataStart,
    axisOffset,
    toCanvasX,
    toCanvasY,
    xField,
    yField,
}: DataPointsType) {
    return (
        <Shape
            sceneFunc={(ctx) => {
                points.forEach((p, i) => {
                    if (p.x < xDataStart) return;
                    ctx.beginPath();
                    ctx.arc(
                        toCanvasX(p[xField]),
                        toCanvasY(p[yField] + axisOffset),
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
