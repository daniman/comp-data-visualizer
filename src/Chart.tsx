import React, { useRef, useEffect } from 'react';
import { Point, Line, LabelMap } from './App';
import * as d3 from 'd3';

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
  pointsToPlot: Point[];
  linesToPlot: Line[];
  labelMap: LabelMap;
}> = ({ pointsToPlot, linesToPlot, labelMap }) => {
  const d3Container = useRef(null);

  console.log(labelMap);

  /**
   * The useEffect hooks is running side effects outside of React,
   * like inserting elements into the DOM using D3.
   */
  useEffect(
    () => {
      if (pointsToPlot && d3Container && d3Container.current) {
        const svg = d3.select(d3Container.current);

        // color source: https://www.materialui.co/colors
        const colors = [
          '#e53935',
          '#FB8C00',
          '#FFEB3B',
          '#8BC34A',
          '#03A9F4',
          '#BA68C8',
        ];
        var color = d3
          .scaleLinear()
          .domain(linesToPlot.map((d) => d.color))
          // @ts-ignore
          .range(colors);

        console.log(
          Math.min(...pointsToPlot.map((p) => p.x)),
          d3.max(pointsToPlot.map((p) => p.x))
        );
        const [xMin, xMax] = [
          Math.min(...pointsToPlot.map((p) => p.x)) - 10000,
          Math.max(...pointsToPlot.map((p) => p.x)) + 10000,
        ];
        const x = d3
          .scaleLinear()
          .domain([xMin, xMax])
          // @ts-ignore
          .range([1.5 * PADDING, d3Container.current.clientWidth - PADDING]);

        const [yMin, yMax] = [0, 100];
        const y = d3
          .scaleLinear()
          .domain([yMax, yMin])
          // @ts-ignore
          .range([PADDING, d3Container.current.clientHeight - 1.5 * PADDING]);

        const xGrid = svg
          .append('g')
          .attr('class', 'x-grid')
          .selectAll('line')
          .data(getGrid(xMin, xMax, 10000));
        xGrid
          .enter()
          .append('line')
          .attr('x1', (d) => x(d))
          .attr('x2', (d) => x(d))
          .attr('y1', (d) => y(yMin))
          .attr('y2', (d) => y(yMax))
          .attr('stroke', '#eee')
          .attr('stroke-dasharray', 2);
        xGrid
          .enter()
          .append('text')
          .attr('x', (d) => x(d))
          .attr('y', (d) => y(yMin - 3))
          .attr('font-size', 8)
          .attr('fill', '#aaa')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'hanging')
          .text((d) => `${d / 1000}k`);
        xGrid.exit().remove();

        const yGrid = svg
          .append('g')
          .attr('class', 'y-grid')
          .selectAll('line')
          .data(getGrid(yMin, yMax, 10));
        yGrid
          .enter()
          .append('line')
          .attr('x1', x(xMin))
          .attr('x2', (d) => x(xMax))
          .attr('y1', (d) => y(d))
          .attr('y2', (d) => y(d))
          .attr('stroke', '#eee')
          .attr('stroke-dasharray', 2);
        yGrid
          .enter()
          .append('text')
          .attr('x', x(xMin - 2000))
          .attr('y', (d) => y(d))
          .attr('font-size', 8)
          .attr('fill', '#aaa')
          .attr('text-anchor', 'end')
          .attr('alignment-baseline', 'middle')
          .text((d) => d);
        yGrid.exit().remove();

        const key = svg
          .append('g')
          .attr('class', 'key')
          .selectAll('rect')
          .data(
            Object.entries(labelMap).map(([c, l]) => ({
              color: parseInt(c),
              label: l,
            }))
          );
        key
          .enter()
          .append('rect')
          .attr('fill', (d) => color(d.color))
          .attr('x', (d) => x(xMax) - 25)
          .attr('y', (_d, i) => y(yMin) - 25 - 20 * i)
          .attr('width', 15)
          .attr('height', 15)
          .attr('text', 'hello');
        key
          .enter()
          .append('text')
          .text((d) => d.label)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('font-size', 8)
          .attr('font-weight', 700)
          .attr('x', (d) => x(xMax) - 18)
          .attr('y', (_d, i) => y(yMin) - 17 - 20 * i);

        const lines = svg
          .append('g')
          .attr('class', 'lines')
          .selectAll('polyline')
          .data(linesToPlot);
        lines
          .enter()
          .append('polyline')
          .attr('points', (d) =>
            d.points.map(([a, b]) => `${x(a)},${y(b)}`).join(' ')
          )
          .attr('fill', 'transparent')
          .attr('stroke', (d) => color(d.color));
        lines.exit().remove();

        // Bind D3 data
        const dots = svg
          .append('g')
          .attr('class', 'points')
          .selectAll('circle')
          .data(pointsToPlot);
        dots
          .enter()
          .append('circle')
          .attr('r', 3)
          .attr('cx', (d) => x(d.x))
          .attr('cy', (d) => y(d.y))
          .attr('fill', (d) => color(d.color))
          .append('title')
          .text((d) => d.label);
        // Update existing D3 elements
        // update.attr('x', (d, i) => i * 40).text((d: number) => d);
        dots.exit().remove();
      }
    },

    /**
     * Run this block of code whenever these variables change. We need to check
     * if the variables are valid, but we no longer need to compare old props to
     * new props to decide wether to re-render.
     */
    [pointsToPlot, linesToPlot, labelMap]
  );

  return (
    <svg
      style={{ border: '1px solid #eee' }}
      className="d3-component"
      width="100%"
      height="100%"
      ref={d3Container}
    />
  );
};
