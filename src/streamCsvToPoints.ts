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
                id: row['Cell_ID'],
                color: '#555',
                'CD45-KrO': parseFloat(row['CD45-KrO']),
                'CD19-PB': parseFloat(row['CD19-PB']),
                'SS INT LIN': parseFloat(row['SS INT LIN']),
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
