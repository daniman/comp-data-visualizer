import React, { useState } from 'react';
import { Chart } from './Chart';

/**
 * First column dictates the y-axis, and is usually used
 * to represent percentile.
 *
 * Remaining columns are the body of data you want to plot,
 * and all represent the shared range of the s-axis. Each column
 * will receive it's own label in a tooltip, and will be
 * represented with colors in the z-axis.
 *
 * First row of the CSV is reserved for labels, and is not
 * interpreted as data to plot; rather the labels for that data.
 */
const sampleLabels = ['percentile', '1', '2', '3', '4', '5'];
const sampleData = [
  [2, 100000, 110000, 120000, 130000, 140000],
  [4, 110000, 120000, 130000, 140000, 150000],
  [6, 120000, 130000, 140000, 150000, 160000],
  [8, 130000, 140000, 150000, 160000, 170000],
];

export interface LabelMap {
  [val: number]: string;
}

export interface Point {
  x: number;
  y: number;
  color: number;
  label: string;
}

export interface Line {
  points: number[][]; // [percentile, comp]
  color: number;
}

function App() {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [labels, setLabels] = useState<string[]>(sampleLabels);
  const [data, setData] = useState<number[][]>(sampleData);

  const labelMap: LabelMap = {};
  labels.forEach((l, i) => {
    if (i !== 0) {
      labelMap[i] = l;
    }
  });

  const linesCache: { [percentile: number]: number[][] } = {};
  const pointsToPlot: Point[] = [];
  data.forEach((row, i) => {
    row.forEach((point, j) => {
      if (j !== 0) {
        pointsToPlot.push({
          x: point,
          y: row[0],
          color: j,
          // label: `${row[0]}th percentile ${labels[j]
          //   }: $${point.toLocaleString()}`,
          label: `x ${point.toLocaleString()} –– y ${row[0]} –– z ${labels[j]}`,
        });

        const pointsInLine = linesCache[j] || [];
        pointsInLine.push([point, row[0]]); // x, y: percentile, comp
        linesCache[j] = pointsInLine;
      }
    });
  });

  const linesToPlot = Object.entries(linesCache).map(([color, points]) => ({
    color: parseInt(color),
    points,
  }));

  return (
    <div
      style={{
        width: 700,
        height: 300,
        margin: '40px auto',
        outline: isDraggedOver ? '4px dashed orange' : '4px solid transparent',
        backgroundColor: isDraggedOver ? '#fafafa' : 'transparent',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggedOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDraggedOver(true);
      }}
      onDragEnd={(e) => {
        e.preventDefault();
        setIsDraggedOver(false);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDraggedOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDraggedOver(false);

        if (event.dataTransfer.files) {
          const file = event.dataTransfer.files[0];
          console.log(file);

          if (file.type !== 'text/csv') {
            console.log('Cannot process this file.');
            return;
          }

          const reader = new FileReader();
          reader.addEventListener('load', function handleFileLoad(e) {
            const data = e.target?.result;
            if (typeof data === 'string') {
              const rows = data.split('\n');
              setLabels(rows[0].split(','));
              setData(
                rows
                  .splice(1)
                  .map((str) => str.split(',').map((i) => parseInt(i)))
              );
            }
            reader.removeEventListener('load', handleFileLoad);
          });
          reader.readAsText(file);
        }
      }}
    >
      <Chart
        pointsToPlot={pointsToPlot}
        linesToPlot={linesToPlot}
        labelMap={labelMap}
      />
    </div>
  );
}

export default App;
