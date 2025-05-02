type PolygonsControlType = {
    polygons: Polygon[];
    chartId: string;
    setHiddenPolygonIds: React.Dispatch<React.SetStateAction<string[] | null>>;
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
    setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
};

function togglePolygonHidden(
    prev: string[] | null,
    polygon: Polygon,
    chartId: string
) {
    if (polygon.chartId !== chartId) return prev;
    return prev?.includes(polygon.id)
        ? prev.filter((id) => id !== polygon.id)
        : [...(prev ?? []), polygon.id];
}

function togglePointColorDisabled(
    point: Point,
    polygon: Polygon,
    chartId: string
): Point {
    if (point.sourcePolygonId !== polygon.id) return point;
    const prevChartMap = point.colorDisabledCharts?.[chartId] ?? {};
    const toggled = !prevChartMap[polygon.id];
    return {
        ...point,
        colorDisabledCharts: {
            ...point.colorDisabledCharts,
            [chartId]: {
                ...prevChartMap,
                [polygon.id]: toggled,
            },
        },
    };
}

export default function PolygonsControl({
    polygons,
    chartId,
    setHiddenPolygonIds,
    setPoints,
    setPolygons,
}: PolygonsControlType) {
    return (
        <div className="polygons-control">
            {polygons.map((polygon) => (
                <div key={polygon.name}>
                    <span
                        className="cell-color"
                        style={{ backgroundColor: polygon.color }}
                        onClick={() => {
                            setHiddenPolygonIds((prev) =>
                                togglePolygonHidden(prev, polygon, chartId)
                            );
                            setPoints((points) =>
                                points.map((point) =>
                                    togglePointColorDisabled(point, polygon, chartId)
                                )
                            );
                        }}
                    ></span>
                    <input
                        type="text"
                        value={polygon.name}
                        onChange={(e) => {
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
                        }}
                    />
                    <button
                        onClick={() => {
                            setPolygons((prev) => prev.filter((p) => p.id !== polygon.id));
                            setPoints((points) =>
                                points.map((point) =>
                                    point.sourcePolygonId === polygon.id
                                        ? { ...point, color: '#555', sourcePolygonId: undefined }
                                        : point
                                )
                            );
                        }}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
