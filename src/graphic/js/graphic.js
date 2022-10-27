import pym from "pym.js";
import * as d3 from "d3";
import data from "../data/cleanedData.csv";

const draw = () => {
  const svg = d3.select("figure").append("svg");

  const margin = {
    top: 80,
    right: 0,
    bottom: 5,
    left: 0,
  };

  svg.attr("width", width).attr("height", height);

  const tickDuration = 500;

  const top_n = 14;
  const height = 600;
  const width = 960;

  const barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5);

  let year = 1900;

  const colorMap = new Map();
  colorMap.set("Michigan", "#00274C");
  colorMap.set("Osu", "#BB0000");
  colorMap.set("Iowa", "#FFCD00");
  colorMap.set("Maryland", "#E03A3E");
  colorMap.set("Michigan State", "#18453B");
  colorMap.set("Minnesota", "#7A0019");
  colorMap.set("Nebraska", "#E41C38");
  colorMap.set("Northwestern", "#4E2A84");
  colorMap.set("Penn State", "#041E42");
  colorMap.set("Purdue", "#CEB888");
  colorMap.set("Rutgers", "#5F6A72");
  colorMap.set("Wisconsin", "#C5050C");
  colorMap.set("Illinois", "#E84A27");
  colorMap.set("Indiana", "#990000");

  //if (error) throw error;

  console.log(data);

  data.forEach((d) => {
    (d.value = +d.value),
      (d.lastValue = +d.lastValue),
      (d.value = isNaN(d.value) ? 0 : d.value),
      (d.year = +d.year),
      (d.colour = colorMap.get(d.name));
  });

  console.log(data);

  let yearSlice = data
    .filter((d) => d.year === year && !isNaN(d.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, top_n);

  yearSlice.forEach((d, i) => (d.rank = i));

  console.log("yearSlice: ", yearSlice);

  const x = d3
    .scaleLinear()
    .domain([0, 1000])
    .range([margin.left, width - margin.right - 65]);

  const y = d3
    .scaleLinear()
    .domain([top_n, 0])
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3
    .axisTop()
    .scale(x)
    .ticks(width > 500 ? 5 : 2)
    .tickSize(-(height - margin.top - margin.bottom))
    .tickFormat((d) => d3.format(",")(d));

  svg
    .append("g")
    .attr("class", "axis xAxis")
    .attr("transform", `translate(0, ${margin.top})`)
    .call(xAxis)
    .selectAll(".tick line")
    .classed("origin", (d) => d === 0);

  svg
    .selectAll("rect.bar")
    .data(yearSlice, (d) => d.name)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", x(0) + 1)
    .attr("width", (d) => x(d.value) - x(0) - 1)
    .attr("y", (d) => y(d.rank) + 5)
    .attr("height", y(1) - y(0) - barPadding)
    .style("fill", (d) => d.colour)
    .style("opacity", "0.7");

  svg
    .selectAll("text.label")
    .data(yearSlice, (d) => d.name)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => x(d.value) - 8)
    .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1)
    .style("text-anchor", "end")
    .html((d) => d.name);

  svg
    .selectAll("text.valueLabel")
    .data(yearSlice, (d) => d.name)
    .enter()
    .append("text")
    .attr("class", "valueLabel")
    .attr("x", (d) => x(d.value) + 5)
    .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1)
    .text((d) => d3.format(",.0f")(d.lastValue));

  const yearText = svg
    .append("text")
    .attr("class", "yearText")
    .attr("x", width - margin.right)
    .attr("y", height - 25)
    .style("text-anchor", "end")
    .html(~~year)
    .call(halo, 10);

  const ticker = d3.interval(() => {
    yearSlice = data
      .filter((d) => d.year === year && !isNaN(d.value))
      .sort((a, b) => b.value - a.value)
      .slice(0, top_n);

    yearSlice.forEach((d, i) => (d.rank = i));

    //console.log('IntervalYear: ', yearSlice);

    x.domain([0, d3.max(yearSlice, (d) => d.value)]);

    svg
      .select(".xAxis")
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .call(xAxis);

    const bars = svg.selectAll(".bar").data(yearSlice, (d) => d.name);

    bars
      .enter()
      .append("rect")
      .attr("class", (d) => `bar ${d.name.replace(/\s/g, "_")}`)
      .attr("x", x(0) + 1)
      .attr("width", (d) => x(d.value) - x(0) - 1)
      .attr("y", () => y(top_n + 1) + 5)
      .attr("height", y(1) - y(0) - barPadding)
      .style("fill", (d) => d.colour)
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("y", (d) => y(d.rank) + 5);

    bars
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("width", (d) => x(d.value) - x(0) - 1)
      .attr("y", (d) => y(d.rank) + 5);

    bars
      .exit()
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("width", (d) => x(d.value) - x(0) - 1)
      .attr("y", () => y(top_n + 1) + 5)
      .remove();

    const labels = svg.selectAll(".label").data(yearSlice, (d) => d.name);

    labels
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.value) - 8)
      .attr("y", () => y(top_n + 1) + 5 + (y(1) - y(0)) / 2)
      .style("text-anchor", "end")
      .style("color", "#ffffff")
      .html((d) => d.name)
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

    labels
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("x", (d) => x(d.value) - 8)
      .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

    labels
      .exit()
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("x", (d) => x(d.value) - 8)
      .attr("y", () => y(top_n + 1) + 5)
      .remove();

    const valueLabels = svg
      .selectAll(".valueLabel")
      .data(yearSlice, (d) => d.name);

    valueLabels
      .enter()
      .append("text")
      .attr("class", "valueLabel")
      .attr("x", (d) => x(d.value) + 5)
      .attr("y", () => y(top_n + 1) + 5)
      .text((d) => d3.format(",.0f")(d.lastValue))
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

    valueLabels
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("x", (d) => x(d.value) + 5)
      .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1)
      .tween("text", (d) => {
        const i = d3.interpolateRound(d.lastValue, d.value);
        return function (t) {
          this.textContent = d3.format(",")(i(t));
        };
      });

    valueLabels
      .exit()
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr("x", (d) => x(d.value) + 5)
      .attr("y", () => y(top_n + 1) + 5)
      .remove();

    yearText.html(~~year);

    if (year === 2022) ticker.stop();
    year = +year + 1;
  }, tickDuration);
};

const halo = function (text, strokeWidth) {
  text
    .select(function () {
      return this.parentNode.insertBefore(this.cloneNode(true), this);
    })
    .style("fill", "#ffffff")
    .style("stroke", "#ffffff")
    .style("stroke-width", strokeWidth)
    .style("stroke-linejoin", "round")
    .style("opacity", 1);
};

window.onresize = () => {};

window.onload = () => {
  const child = new pym.Child({ polling: 500 });
  child.sendHeight();
  //child.onMessage("download", downloadImage);
  //setDisplayOptions();
  draw();
};
