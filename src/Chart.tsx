import React, { useRef, useEffect } from "react";
import { Point, Line, LabelMap } from "./App";
import * as d3 from "d3";

const PADDING = 20; // pixels

const getGrid = (min: number, max: number, delimiter: number) =>
  Array.from(
    new Set([
      ...new Array(Math.ceil((max - min) / delimiter))
        .fill(0)
        .map((_i, j) => min + j * delimiter),
      min,
      max,
    ])
  );

export const Chart: React.FC<{
  datumsToPlot: number[][];
  pointsToPlot: Point[];
  linesToPlot: Line[];
  labelMap: LabelMap;
}> = ({ datumsToPlot, pointsToPlot, linesToPlot, labelMap }) => {
  const d3Container = useRef(null);

  const line1 = datumsToPlot[0].slice(1);

  /**
   * The useEffect hooks is running side effects outside of React,
   * like inserting elements into the DOM using D3.
   */
  useEffect(
    () => {
      if (pointsToPlot && d3Container && d3Container.current) {
        const svg = d3.select(d3Container.current);

        // color source: https://www.materialui.co/colors
        // const colors = [
        //   "#e53935",
        //   "#FB8C00",
        //   "#FFEB3B",
        //   "#8BC34A",
        //   "#03A9F4",
        //   "#BA68C8",
        // ];
        // var color = d3
        //   .scaleLinear()
        //   .domain(linesToPlot.map((d) => d.color))
        //   // @ts-ignore
        //   .range(colors);

        const [dxMin, dxMax] = [
          Math.min(...pointsToPlot.map((p) => p.x)),
          Math.max(...pointsToPlot.map((p) => p.x)),
        ];
        const [xMin, xMax] = [
          dxMin - (dxMax - dxMin) / 10,
          dxMax + (dxMax - dxMin) / 10,
        ];
        const x = d3
          .scaleLinear()
          .domain([xMin, xMax])
          // @ts-ignore
          .range([1.5 * PADDING, d3Container.current.clientWidth - PADDING]);

        const [dyMin, dyMax] = [
          Math.min(...Object.keys(labelMap).map((k) => parseInt(k))),
          Math.max(...Object.keys(labelMap).map((k) => parseInt(k))),
        ];
        const yStep = 1;
        const [yMin, yMax] = [dyMin - yStep, dyMax + yStep];
        const y = d3
          .scaleLinear()
          .domain([yMax, yMin])
          // @ts-ignore
          .range([PADDING, d3Container.current.clientHeight - 1.5 * PADDING]);

        // x-axis grid
        if (!svg.selectAll("g.x-axis").size())
          svg.append("g").attr("class", "x-axis");
        const xAxisGroup = svg.select("g.x-axis");
        const xLines = xAxisGroup
          .selectAll("line")
          .data(getGrid(xMin, xMax, 10000));
        const xLabels = xAxisGroup
          .selectAll("text")
          .data(getGrid(xMin, xMax, 10000));
        xLines
          .enter()
          .append("line")
          .attr("stroke", "#eee")
          .attr("stroke-dasharray", 2)
          .attr("x1", (d) => x(d))
          .attr("x2", (d) => x(d))
          .attr("y1", (d) => y(yMin))
          .attr("y2", (d) => y(yMax));
        xLines
          .attr("x1", (d) => x(d))
          .attr("x2", (d) => x(d))
          .attr("y1", (d) => y(yMin))
          .attr("y2", (d) => y(yMax));
        xLabels
          .enter()
          .append("text")
          .attr("font-size", 8)
          .attr("fill", "#aaa")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "hanging")
          .attr("x", (d) => x(d))
          .attr("y", (d) => y(yMin) + 6)
          .text((d) => `${d / 1000}k`);
        xLabels
          .attr("x", (d) => x(d))
          .attr("y", (d) => y(yMin) + 6)
          .text((d) => `${d / 1000}k`);
        xLines.exit().remove();
        xLabels.exit().remove();

        // y-axis grid
        if (!svg.selectAll("g.y-axis").size())
          svg.append("g").attr("class", "y-axis");
        const yAxisGroup = svg.select("g.y-axis");
        const yLines = yAxisGroup
          .selectAll("line")
          .data(getGrid(yMin, yMax, yStep));
        const yLabels = yAxisGroup
          .selectAll("text")
          .data(getGrid(yMin, yMax, yStep));
        yLines
          .enter()
          .append("line")
          .attr("stroke", "#eee")
          .attr("stroke-dasharray", 2)
          .attr("x1", x(xMin))
          .attr("x2", (d) => x(xMax))
          .attr("y1", (d) => y(d))
          .attr("y2", (d) => y(d));
        yLines
          .attr("x1", x(xMin))
          .attr("x2", (d) => x(xMax))
          .attr("y1", (d) => y(d))
          .attr("y2", (d) => y(d));
        yLabels
          .enter()
          .append("text")
          .attr("font-size", 8)
          .attr("fill", "#aaa")
          .attr("text-anchor", "end")
          .attr("alignment-baseline", "middle")
          .attr("x", x(xMin) - 6)
          .attr("y", (d) => y(d))
          .text((d) => labelMap[d] || "");
        yLabels
          .attr("x", x(xMin) - 6)
          .attr("y", (d) => y(d))
          .text((d) => labelMap[d] || "");
        yLines.exit().remove();
        yLabels.exit().remove();

        // lines to plot
        if (!svg.selectAll("g.lines").size())
          svg.append("g").attr("class", "lines");
        const linesGroup = svg.select("g.lines");
        const lines = linesGroup.selectAll("polyline").data(linesToPlot);
        lines
          .enter()
          .append("polyline")
          .attr("fill", "transparent")
          .attr("stroke", (d) => "#666")
          .attr("stroke-width", 1)
          .attr("points", (d) =>
            d.points.map(([a]) => `${x(a)},${y(d.y)}`).join(" ")
          );
        lines.attr("points", (d) =>
          d.points.map(([a]) => `${x(a)},${y(d.y)}`).join(" ")
        );
        lines.exit().remove();

        // points to plot in the form of dots
        if (!svg.selectAll("g.dots").size())
          svg.append("g").attr("class", "dots");
        const dotsGroup = svg.select("g.dots");
        const dots = dotsGroup.selectAll("circle").data(pointsToPlot);
        dots
          .enter()
          .append("circle")
          .attr("r", 3)
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .attr("fill", "#666")
          .append("title")
          .text((d) => d.label);
        dots
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .select("title")
          .text((d) => d.label);
        dots.exit().remove();

        // // points to plot in the form of dots
        // if (!svg.selectAll("g.points").size())
        //   svg.append("g").attr("class", "points");
        // const poitnsGroup = svg.select("g.points");
        // const points = poitnsGroup.selectAll("circle").data(line1);
        // points
        //   .enter()
        //   .append("circle")
        //   .attr("r", 3)
        //   .attr("cx", (d) => x(d))
        //   .attr("cy", 100)
        //   .attr("fill", "black")
        //   .append("title")
        //   .text((d) => "hello");
        // points
        //   .attr("cx", (d) => x(d))
        //   .attr("cy", 100)
        //   .attr("fill", "black")
        //   .select("title")
        //   .text((d) => "hello");
        // points.exit().remove();
      }
    },

    /**
     * Run this block of code whenever these variables change. We need to check
     * if the variables are valid, but we no longer need to compare old props to
     * new props to decide wether to re-render.
     */
    [pointsToPlot, linesToPlot, labelMap, datumsToPlot]
  );

  return (
    <svg
      style={{ border: "1px solid #eee" }}
      className="d3-component"
      width="100%"
      height="100%"
      ref={d3Container}
    />
  );
};
