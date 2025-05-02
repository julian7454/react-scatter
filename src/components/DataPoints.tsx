import { Shape } from 'react-konva';

type DataPointsType = {
    points: Point[];
    xDataStart: number;
    axisOffset: number;
    xField: XField;
    yField: YField;
    chartId: string;
    toCanvasX: (x: number) => number;
    toCanvasY: (y: number) => number;
};

export default function DataPoints({
    points,
    xDataStart,
    axisOffset,
    toCanvasX,
    toCanvasY,
    chartId,
    xField,
    yField,
}: DataPointsType) {
    return (
        <Shape
            sceneFunc={(ctx) => {
                points.forEach((p) => {
                    if (p[xField] < xDataStart) return;
                    ctx.beginPath();
                    ctx.arc(
                        toCanvasX(p[xField]),
                        toCanvasY(p[yField] + axisOffset),
                        1.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fillStyle =
                        p.sourcePolygonId &&
                            p.colorDisabledCharts?.[chartId]?.[p.sourcePolygonId]
                            ? '#555'
                            : p.color;
                    ctx.fill();
                });
            }}
        />
    );
}
