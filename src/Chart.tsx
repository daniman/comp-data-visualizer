import React, { useRef, useEffect } from "react";
import { GraphPoint, GraphLine, LabelMap, UserPoint, UserLine } from "./App";
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
  userPointsToPlot: UserPoint[];
  userLinesToPlot: UserLine[];
  graphPointsToPlot: GraphPoint[];
  graphLinesToPlot: GraphLine[];
  graphLabelMap: LabelMap;
}> = ({
  userPointsToPlot,
  userLinesToPlot,
  graphPointsToPlot,
  graphLinesToPlot,
  graphLabelMap,
}) => {
  const d3Container = useRef(null);

  /**
   * The useEffect hooks is running side effects outside of React,
   * like inserting elements into the DOM using D3.
   */
  useEffect(
    () => {
      if (d3Container && d3Container.current) {
        const svg = d3.select(d3Container.current);

        // color source: https://www.materialui.co/colors
        const colors = [
          "#e53935",
          "#FB8C00",
          "#FFEB3B",
          "#8BC34A",
          "#03A9F4",
          "#BA68C8",
        ];
        var color = d3
          .scaleLinear()
          .domain([
            -1, // buffer with a -1 in case the list of users is only of length 1, in which case we would not have a proper domain
            ...Array.from(new Set(userPointsToPlot.map((d) => d.nameIndex))),
          ])
          // @ts-ignore
          .range(colors);

        const [dxMin, dxMax] = [
          Math.min(...graphPointsToPlot.map((p) => p.x)),
          Math.max(...graphPointsToPlot.map((p) => p.x)),
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
          Math.min(...Object.keys(graphLabelMap).map((k) => parseInt(k))),
          Math.max(...Object.keys(graphLabelMap).map((k) => parseInt(k))),
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
          .text((d) => graphLabelMap[d] || "");
        yLabels
          .attr("x", x(xMin) - 6)
          .attr("y", (d) => y(d))
          .text((d) => graphLabelMap[d] || "");
        yLines.exit().remove();
        yLabels.exit().remove();

        // lines to plot
        if (!svg.selectAll("g.graph-lines").size())
          svg.append("g").attr("class", "graph-lines");
        const graphLinesGroup = svg.select("g.graph-lines");
        const graphLines = graphLinesGroup
          .selectAll("polyline")
          .data(graphLinesToPlot);
        graphLines
          .enter()
          .append("polyline")
          .attr("fill", "transparent")
          .attr("opacity", 0.5)
          .attr("stroke", (d) => "#666")
          .attr("stroke-width", 1)
          .attr("points", (d) =>
            d.points.map((a) => `${x(a)},${y(d.y)}`).join(" ")
          );
        graphLines.attr("points", (d) =>
          d.points.map((a) => `${x(a)},${y(d.y)}`).join(" ")
        );
        graphLines.exit().remove();

        // points to plot in the form of dots
        if (!svg.selectAll("g.graph-dots").size())
          svg.append("g").attr("class", "graph-dots");
        const graphDotsGroup = svg.select("g.graph-dots");
        const graphDots = graphDotsGroup
          .selectAll("circle")
          .data(graphPointsToPlot);
        graphDots
          .enter()
          .append("circle")
          .attr("r", 4)
          .attr("opacity", 0.5)
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .attr("fill", "#666")
          .append("title")
          .text((d) => d.label);
        graphDots
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .select("title")
          .text((d) => d.label);
        graphDots.exit().remove();

        // more lines to plot to represent user tenures
        if (!svg.selectAll("g.user-lines").size())
          svg.append("g").attr("class", "user-lines");
        const userLinesGroup = svg.select("g.user-lines");
        const userLines = userLinesGroup
          .selectAll("polyline")
          .data(userLinesToPlot);
        userLines
          .enter()
          .append("polyline")
          .attr("fill", "transparent")
          .attr("stroke", (d) => color(d.nameIndex))
          .attr("stroke-width", 1)
          .attr("points", (d) =>
            d.points.map(({ x: dx, y: dy }) => `${x(dx)},${y(dy)}`).join(" ")
          );
        userLines.attr("points", (d) =>
          d.points.map(({ x: dx, y: dy }) => `${x(dx)},${y(dy)}`).join(" ")
        );
        userLines.exit().remove();

        // more points to plot in the form of dots
        if (!svg.selectAll("g.user-dots").size())
          svg.append("g").attr("class", "user-dots");
        const userDotsGroup = svg.select("g.user-dots");
        const userDots = userDotsGroup
          .selectAll("circle")
          .data(userPointsToPlot);
        userDots
          .enter()
          .append("circle")
          .attr("r", (d) => 2 + d.radius * 2)
          .attr("cx", (d) => x(d.comp))
          .attr("cy", (d) => y(d.levelIndex))
          .attr("fill", (d) => color(d.nameIndex))
          .append("title")
          .text((d) => `${d.name} –– ${d.year}`);
        userDots
          .attr("r", (d) => 3 + d.radius * 2)
          .attr("cx", (d) => x(d.comp))
          .attr("cy", (d) => y(d.levelIndex))
          .attr("fill", (d) => color(d.nameIndex))
          .select("title")
          .text((d) => `${d.name} –– ${d.year}`);
        userDots.exit().remove();
      }
    },

    /**
     * Run this block of code whenever these variables change. We need to check
     * if the variables are valid, but we no longer need to compare old props to
     * new props to decide wether to re-render.
     */
    [graphPointsToPlot, graphLinesToPlot, graphLabelMap, userPointsToPlot]
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
