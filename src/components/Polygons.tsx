import React from "react";
import { Line, Text } from "react-konva";
export default function Polygons({ polygons }: { polygons: Polygon[] }) {
    return (
        <>
            {polygons.map((polygon) => (
                <React.Fragment key={polygon.name}>
                    <Line
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
                </React.Fragment>
            ))}
        </>
    );
}
