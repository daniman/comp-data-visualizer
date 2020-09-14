import React from 'react';
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
const labels = ['percentile', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
const data = [
  [10, 100000, 115000, 125000, 150000, 170000, 185000],
  [25, 105000, 120000, 135000, 155000, 175000, 195000],
  [50, 115000, 124000, 150000, 165000, 185000, 210000],
  [75, 120000, 135000, 160000, 175000, 200000, 224000],
  [90, 125000, 150000, 165000, 185000, 210000, 245000],
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
        label: `${row[0]}th percentile ${
          labels[j]
        }: $${point.toLocaleString()}`,
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

function App() {
  return (
    <div style={{ width: 700, height: 300, margin: '40px auto' }}>
      <Chart
        pointsToPlot={pointsToPlot}
        linesToPlot={linesToPlot}
        labelMap={labelMap}
      />
    </div>
  );
}

export default App;
