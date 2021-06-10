'use strict';

/*function populateTable(tableId, data) {
  $('#' + tableId).DataTable({
    'data': data,
    'columns': [{title: 'questionId'}, {title: 'total'}, {title: 'correct'}],
    'paging': true,
    'searching':true,
    'info':true,
    'ordering':false
  });
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){//adjusts the columns of the dataTable on switching between navTabs
  $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
});*/

/*for (let i=1; i<=3; ++i) {
  const id = "module-" + i;
  $('#' + id).click((event) => {
    event.preventDefault();
    $.ajax({
      type: "GET",
      url: '/api/questions/analysis',
      success: function(data){
        updateBarChart(data[i]);
      }
    });
  });
}

$.ajax({
  type: "GET",
  url: '/api/questions/analysis',
  success: function(data){
    updateBarChart(data['1']);
  }
});*/

$('.dropdown-menu a').click(function(){
  $('#questions-module-button').text($(this).text());
});

// set the dimensions and margins of the graph
var margin1 = {top: 30, right: 30, bottom: 70, left: 60},
    width1 = 560 - margin1.left - margin1.right,
    height1 = 500 - margin1.top - margin1.bottom;

// append the svg object to the body of the page
var svg2 = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin1.left + "," + margin1.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
  .range([ 0, width1 ])
  .padding(0.2);
var xAxis = svg2.append("g")
  .attr("transform", "translate(0," + height1 + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
  .range([ height1, 0]);
var yAxis = svg2.append("g")
  .attr("class", "myYaxis")

svg2.append("text")
  .attr("class", "y-label")
  .attr("text-anchor", "middle")
  .attr("x", width1/2)
  .attr("y", height1+40)
  .text("question number");


svg2.append("text")
  .attr("class", "y-label")
  .attr("text-anchor", "middle")
  .attr("x", -height1/2)
  .attr("y", -40)
  .attr("transform", "rotate(-90)")
  .text("total correct answers");


// A function that create / update the plot for a given variable:
function renderQuestions(data) {

    // X axis
    x.domain(data.map(function(d) { return d.group; }))
    xAxis.transition().duration(1000).call(d3.axisBottom(x))

    // Add Y axis
    y.domain([0, d3.max(data, function(d) { return +d['value'] }) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // variable u: map data to existing bars
    var u = svg2.selectAll("rect")
      .data(data)

    // update bars
    u.exit().remove()

    u
      .enter()
      .append("rect")
      .merge(u)
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
          .duration(50)
          .attr('opacity', '.85');
        tooltip.html("question " + d.group + " correctly answered " + d.value + " times")
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
      })
      .transition()
      .duration(100)
        .attr("x", function(d) { return x(d.group); })
        .attr("y", function(d) { return y(d['value']); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height1 - y(d['value']); })
        .attr("fill", "#69b3a2");
}

updateQuestions(1);

function updateQuestions(moduleId) {
  $.ajax({
    type: "GET",
    url: '/api/questions/analysis',
    success: function(data){
      renderQuestions(data[moduleId]);
    }
  });
}
