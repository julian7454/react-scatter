import Papa from 'papaparse';

export function streamCsvToPoints(
    url: string,
    onBatch: (points: Point[]) => void,
    onComplete: () => void,
    batchSize: number = 1000
) {
    let batch: Point[] = [];

    Papa.parse(url, {
        download: true,
        header: true,
        step: (result: Papa.ParseStepResult<{ [key: string]: string }>) => {
            const row = result.data as { [key: string]: string };
            const point: Point = {
                id: row['id'],
                color: '#555',
                'x1': parseFloat(row['x1']),
                'x2': parseFloat(row['x2']),
                'y': parseFloat(row['y']),
            };
            batch.push(point);

            if (batch.length >= batchSize) {
                onBatch([...batch]);
                batch = [];
            }
        },
        complete: () => {
            if (batch.length > 0) {
                onBatch(batch);
            }
            onComplete();
        },
    });
}
