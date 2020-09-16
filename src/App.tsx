import React, { useState } from "react";
import { Chart } from "./Chart";

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
const sampleGraphLabels = ["percentile", "L1", "L2", "L3", "L4", "L5"];
const sampleGraphData = [
  [2, 100000, 110000, 120000, 130000, 140000],
  [4, 110000, 120000, 130000, 140000, 150000],
  [6, 120000, 130000, 140000, 150000, 160000],
  [8, 130000, 140000, 150000, 160000, 170000],
];

const sampleDataLabels = ["name", "2016", "2017", "2018", "2019", "2020"];
const sampleDataPoints = [
  [1, 100000, 110000, 120000, 130000, 140000, 150000],
  [2, 200000, 210000, 220000, 230000, 240000, 250000],
];

export interface LabelMap {
  [val: number]: string;
}

export interface Point {
  x: number;
  y: number;
  label: string;
}

export interface Line {
  y: number;
  points: number[][]; // [percentile, comp]
}

const DropZone: React.FC<{
  title: string;
  style?: object;
  update: (fileContents: string) => void;
}> = ({ title, style = {}, update }) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  return (
    <div
      style={{
        ...style,
        height: 100,
        padding: 10,
        flex: 1,
        border: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        outline: isDraggedOver ? "4px dashed orange" : "4px solid transparent",
        backgroundColor: isDraggedOver ? "#fafafa" : "transparent",
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

          if (file.type !== "text/csv") {
            console.log("Cannot process this file.");
            return;
          }

          const reader = new FileReader();
          reader.addEventListener("load", function handleFileLoad(e) {
            const data = e.target?.result;
            if (typeof data === "string") update(data);
            reader.removeEventListener("load", handleFileLoad);
          });
          reader.readAsText(file);
        }
      }}
    >
      <span role="img" aria-label="open mailbox" style={{ fontSize: 48 }}>
        {isDraggedOver ? "📬" : "📭"}
      </span>
      <span style={{ fontSize: 12 }}>{title}</span>
    </div>
  );
};

function App() {
  const [graphlabels, setGraphLabels] = useState<string[]>(sampleGraphLabels);
  const [graphData, setGraphData] = useState<number[][]>(sampleGraphData);
  const [pointLabels, setPointLabels] = useState<string[]>(sampleDataLabels);
  const [pointData, setPointData] = useState<number[][]>(sampleDataPoints);

  const labelMap: LabelMap = {};
  graphlabels.forEach((l, i) => {
    if (i !== 0) {
      labelMap[i] = l;
    }
  });

  const linesCache: { [percentile: number]: number[][] } = {};
  const pointsToPlot: Point[] = [];
  graphData.forEach((row, i) => {
    row.forEach((point, j) => {
      if (j !== 0) {
        pointsToPlot.push({
          x: point,
          y: j,
          label: `${graphlabels[j]}: ${
            row[0]
          }th percentile, ${point.toLocaleString()}`,
        });

        const pointsInLine = linesCache[j] || [];
        pointsInLine.push([point, row[0]]); // x, y: percentile, comp
        linesCache[j] = pointsInLine;
      }
    });
  });

  const linesToPlot = Object.entries(linesCache).map(([y, points]) => ({
    y: parseInt(y),
    points,
  }));

  return (
    <div
      style={{
        display: "flex",
        marginTop: 20,
        width: 900,
        height: 300,
        margin: "40px auto",
      }}
    >
      <div style={{ flex: 1, marginRight: 20 }}>
        <Chart
          datumsToPlot={pointData}
          pointsToPlot={pointsToPlot}
          linesToPlot={linesToPlot}
          labelMap={labelMap}
        />
      </div>
      <div>
        <DropZone
          title="Drag in Graph Data"
          style={{ marginBottom: 20 }}
          update={(data) => {
            const rows = data.split("\n");
            setGraphLabels(rows[0].split(","));
            setGraphData(
              rows
                .splice(1)
                .map((str) => str.split(",").map((i) => parseInt(i)))
            );
          }}
        />
        {/* <DropZone
          title="Upload Data Points"
          update={(data) => {
            const rows = data.split("\n");
            setPointLabels(rows[0].split(","));
            setPointData(
              rows
                .splice(1)
                .map((str) => str.split(",").map((i) => parseInt(i)))
            );
          }}
        /> */}
      </div>
    </div>
  );
}

export default App;
