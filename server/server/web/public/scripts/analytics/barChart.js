
// set the dimensions and margins of the graph
let margin = {top: 10, right: 60, bottom: 20, left: 50},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg1 = d3.select("#bar_chartViz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

const legendColors = [["module 1", "#e41a1d"], ["module 2", "#377eb8"], ["module 3", "#4daf4a"]]

let legend = svg1.append("g")
  .attr("class", "legend")
  .attr("height", 100)
  .attr("width", 100)
  .attr("transform", "translate(-20, 50)");

let legendRect = legend.selectAll("rect").data(legendColors);

legendRect.enter()
  .append("rect")
  .attr("x", width)
  .attr("width", 10)
  .attr("height", 10)
  .attr("y", function(d, i) {
    return i * 20;
  })
  .style("fill", function(d) {
    return d[1];
  });

let legendText = legend.selectAll("text").data(legendColors);

legendText.enter()
  .append("text")
  .attr("x", width + 12)
  .attr("y", function(d, i) {
    return i * 20 + 9;
  })
  .text(function(d) {
    return d[0];
  });


// Parse the Data
function renderBarChart(data) {

  // List of subgroups = header of the csv files = soil condition here
  let subgroups = ['1', '2', '3'];

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  let groups = d3.map(data, function(d){return(d.group)}).keys()

  // Add X axis
  let x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.3])
  svg1.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0 ]);
  svg1.append("g")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  let xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  let color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a'])

  // Show the bars
  svg1.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .enter()
    .append("g")
      .attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key], group: d.group}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return xSubgroup(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return color(d.key); })
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', '.85');
      tooltip.html(d.group + " of module " + d.key + ": " + d.value)
        .style("left", (d3.event.pageX - 85) + "px")
        .style("top", (d3.event.pageY - 40) + "px");
      tooltip.transition()
        .duration(50)
        .style("opacity", 1);
    })
    .on("mousemove", function (d, i) {
      tooltip.style("left", (d3.event.pageX - 85) + "px")
        .style("top", (d3.event.pageY - 40) + "px");
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', '1');
      tooltip.transition()
        .duration(50)
        .style("opacity", 0)
    });

  svg1.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", -40)
    // .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("score (percentage)");


}

function createTable(data) {
  let tableData = [{moduleId: 1}, {moduleId: 2}, {moduleId: 3}];

  for (const stat of data) {
    for (const module of tableData) {
      module[stat.group] = stat[module.moduleId];
    }
  }

  $(document).ready(function () {
    $('#statistics-table').DataTable({
      data: tableData,
      columns: [
        { data: 'moduleId' },
        { data: 'mean' },
        { data: 'median' },
        { data: 'min' },
        { data: 'max' }
      ],
      lengthChange: false,
      bPaginate: false,
      searching: false,
      info: false
    });
  });
}

$.ajax({
  type: "GET",
  url: '/api/users/quizCompleted/summaryStatistics',
  success: function(data){
    renderBarChart(data);
    createTable(data);
  }
});

$.ajax({
  type: "GET",
  url: '/api/questions/analysis',
  success: function(data){
    //console.log(data)
  }
});
