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
const sampleGraphLabels = ["percentile", "E1", "E2", "E3", "E4", "E5", "E6"];
const sampleGraphData = [
  [10, 100000, 110000, 120000, 130000, 140000, 150000],
  [25, 110000, 120000, 130000, 140000, 150000, 160000],
  [50, 120000, 130000, 140000, 150000, 160000, 170000],
  [75, 130000, 140000, 150000, 160000, 170000, 180000],
  [100, 140000, 150000, 160000, 170000, 180000, 190000],
];

const sampleDataLabels = ["name", "2017", "2018", "2019", "2020"];
const sampleDataPoints = [
  ["pineapple", "105000@E1", "115000@E2", "120000@E2", "130000@E3"],
  ["orange", "150000@E3", "150000@E3", "150000@E3", "150000@E3"],
  ["apricot", "145000@E4", "150000@E5", "155000@E5", "160000@E5"],
];

export interface LabelMap {
  [val: number]: string;
}

export interface GraphPoint {
  x: number;
  y: number;
  label: string;
}

export interface GraphLine {
  y: number;
  points: number[];
}

export interface UserLine {
  name: string;
  nameIndex: number;
  points: {
    label: string;
    y: number;
    x: number;
  }[];
}

export interface UserPoint {
  radius: number;
  name: string;
  year: string;
  comp: number;
  levelIndex: number;
  nameIndex: number;
}

const DropZone: React.FC<{
  title: string;
  style?: object;
  update: (fileContents: string) => void;
}> = ({ title, style = {}, update }) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [fileName, setFileName] = useState("");

  return (
    <div
      style={{
        ...style,
        height: 100,
        padding: 10,
        fontSize: 12,
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
          if (file.type !== "text/csv") {
            console.error("Cannot process this file.");
            return;
          }
          setFileName(file.name);

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
      <span>{title}</span>
      {fileName && <span>{fileName}</span>}
    </div>
  );
};

function App() {
  const [graphlabels, setGraphLabels] = useState<string[]>(sampleGraphLabels);
  const [graphData, setGraphData] = useState<number[][]>(sampleGraphData);
  const [userLabels, setUserLabels] = useState<string[]>(sampleDataLabels);
  const [userData, setUserData] = useState<string[][]>(sampleDataPoints);

  const userLabelMap: LabelMap = {};
  userLabels.forEach((l, i) => {
    if (i !== 0) {
      userLabelMap[i] = l;
    }
  });
  const userLinesCache: {
    [nameIndex: number]: {
      y: number;
      x: number;
      label: string;
    }[];
  } = {};
  const userPointsToPlot: UserPoint[] = [];
  userData.forEach((row, i) => {
    row.forEach((datum, j) => {
      if (j !== 0) {
        const [compStr, levelStr] = datum.split("@");
        if (!compStr.replace(/\s/g, "").length) return; // empty cell in the csv data input

        const name = row[0];
        const comp = parseInt(compStr);
        const year = userLabels[j];
        const levelIndex = graphlabels.findIndex(
          (d) => d.replace(/\s/g, "") === levelStr
        );
        if (levelIndex < 0)
          console.error(
            `Cound not match user "${name}"'s ${comp.toLocaleString()} comp for ${year} to a known level. Received "${levelStr}", but expected something in the set "${graphlabels
              .slice(1)
              .join(", ")}".`
          );

        const repeatIndex = userPointsToPlot.findIndex(
          (p) =>
            p.comp === comp && p.name === name && p.levelIndex === levelIndex
        );

        if (repeatIndex >= 0) {
          userPointsToPlot[repeatIndex].radius =
            userPointsToPlot[repeatIndex].radius + 1;
          userPointsToPlot[repeatIndex].year =
            userPointsToPlot[repeatIndex].year + `, ${year}`;
        } else {
          userPointsToPlot.push({
            radius: 1,
            levelIndex,
            comp,
            year,
            name,
            nameIndex: i,
          });

          const pointsInLine = userLinesCache[i] || [];
          pointsInLine.push({
            y: levelIndex,
            x: comp,
            label: year,
          });
          userLinesCache[i] = pointsInLine;
        }
      }
    });
  });
  const userLinesToPlot = Object.entries(userLinesCache).map(
    ([nameIndex, points]) => ({
      name: userData[parseInt(nameIndex)][0],
      nameIndex: parseInt(nameIndex),
      points,
    })
  );

  const graphLabelMap: LabelMap = {};
  graphlabels.forEach((l, i) => {
    if (i !== 0) {
      graphLabelMap[i] = l;
    }
  });
  const graphLinesCache: { [percentile: number]: number[] } = {};
  const graphPointsToPlot: GraphPoint[] = [];
  graphData.forEach((row, i) => {
    row.forEach((point, j) => {
      if (j !== 0) {
        graphPointsToPlot.push({
          x: point,
          y: j,
          label: `${graphlabels[j]}: ${
            row[0]
          }th percentile, ${point.toLocaleString()}`,
        });

        const pointsInLine = graphLinesCache[j] || [];
        pointsInLine.push(point);
        graphLinesCache[j] = pointsInLine;
      }
    });
  });
  const graphLinesToPlot = Object.entries(graphLinesCache).map(
    ([y, points]) => ({
      y: parseInt(y),
      points,
    })
  );

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
          userPointsToPlot={userPointsToPlot}
          userLinesToPlot={userLinesToPlot}
          graphPointsToPlot={graphPointsToPlot}
          graphLinesToPlot={graphLinesToPlot}
          graphLabelMap={graphLabelMap}
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
        <DropZone
          title="Upload Data Points"
          update={(data) => {
            const rows = data.split("\n");
            setUserLabels(rows[0].split(","));
            setUserData(rows.splice(1).map((str) => str.split(",")));
          }}
        />
      </div>
    </div>
  );
}

export default App;
