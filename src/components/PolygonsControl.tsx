type PolygonsControlType = {
    polygons: Polygon[];
    setHiddenPolygonIds: React.Dispatch<React.SetStateAction<string[] | null>>;
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
    setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
};

export default function PolygonsControl({
    polygons,
    setHiddenPolygonIds,
    setPoints,
    setPolygons,
}: PolygonsControlType) {
    return (
        <>
            {polygons.map((polygon) => (
                <div key={polygon.name}>
                    <span className="cell-color" style={{ backgroundColor: polygon.color }} onClick={() => {
                        setHiddenPolygonIds((prev) => {
                            if (prev?.includes(polygon.id)) {
                                return prev.filter((id) => id !== polygon.id);
                            } else {
                                return prev ? [...prev, polygon.id] : [polygon.id];
                            }
                        });
                        setPoints((points) =>
                            points.map((point) => {
                                if (point.sourcePolygonId === polygon.id) {
                                    return {
                                        ...point,
                                        color: point.color === '#555' ? polygon.color : '#555',
                                    };
                                }
                                return point;
                            })
                        );
                    }
                    }></span>
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
        </>
    );
}