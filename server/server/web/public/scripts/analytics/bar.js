'use strict';

$('.dropdown-menu a').click(function(){
  $('#bar-module').text($(this).text());
});

let winMargin = {top: 10, right: 30, bottom: 20, left: 50},
  winWidth = 500 - winMargin.left - winMargin.right,
  winHeight = 200 - winMargin.top - winMargin.bottom;

const barHeight = 100,
  halfBarHeight = barHeight / 2,
  colors = ['#15d100', '#eb1300'];

// create module specific bar
let svgBarModules = d3.select("#barVizModules")
  .append("center")
  .append("svg")
  .attr("width", winWidth)
  .attr("height", winHeight)
  .append("g");

// create total bar
let svgBar = d3.select("#barViz")
  .append("center")
  .append("svg")
  .attr("width", winWidth)
  .attr("height", winHeight)
  .append("g");

let tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("text-align", "center")
  .style("padding", ".5rem")
  .style("background", "#FFFFFF")
  .style("color", "#313639")
  .style("border", "1px solid")
  .style("border-radius", "8px")
  .style("pointer-events", "none");


// parse data into new object
function groupData(data, total) {
  // use scale to get percent values
  const percent = d3.scaleLinear()
    .domain([0, total])
    .range([0, 100]);
  // filter out data that has zero values
  // also get mapping for next placement
  let cumulative = 0;
  const _data = data.map(d => {
    cumulative += d.value;
    return {
      value: d.value,
      // want the cumulative to prior value (start of rect)
      cumulative: cumulative - d.value,
      label: d.label,
      percent: percent(d.value)
    };
  }).filter(d => d.value > 0);
  return _data;
}

// create visualization
function renderBar(data, svgSelType) {

  let svgObj;
  if (svgSelType === 'module') {
    svgObj = svgBarModules;
  }
  else if (svgSelType === 'total') {
    svgObj = svgBar;
  }

  const total = d3.sum(data, d => d.value);

  let _data = groupData(data, total);
  const xScale = d3.scaleLinear()
    .domain([0, total])
    .range([0, winWidth]);

  // delete previous rectangles
  svgObj.selectAll('rect').remove();

  // create rectangles for updated data
  svgObj.selectAll('rect')
    .data(_data)
    .enter().append("rect")
    .attr("class", 'rect-stacked')
    .attr("x", d => xScale(d.cumulative))
    .attr("y", winHeight / 2 - halfBarHeight)
    .attr("height", barHeight)
    .attr("width", d => xScale(d.value))
    .style('fill', (d, i) => colors[i])
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', '.85');
      let num = (Math.round((d.value / total) * 100)).toString() + '%';
      tooltip.html(d.label + ": " + num)
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
}

// initialize visualizations
updateBar('total', null);
updateBar('module', 1);

function updateBar(svgSelType, moduleId=null) {

  let url = '/api/users/quizCompleted/counts/';
  if (moduleId) {
    url += moduleId;
  }
  $.ajax({
    type: "GET",
    url: url,
    success: function(data){
      const parsedData = [
        { label: 'pass', value: data.numPassed },
        { label: 'fail', value: data.numFailed }
      ];
      if (moduleId) {
        $('#module-success').empty().append( data['numPassed'] + ' pass');
        $('#module-users').empty().append(data['numPassed'] + data['numFailed'] + data['numNotCompleted'] + ' users');
        $('#module-fail').empty().append(data['numFailed'] + ' fail');
        $('#module-complete').empty().append(data['numPassed'] + data['numFailed'] + ' complete');
      }
      else {
        $('#total-success').empty().append( data['numPassed'] + ' pass');
        $('#total-users').empty().append(data['numPassed'] + data['numFailed'] + data['numNotCompleted'] + ' users');
        $('#total-fail').empty().append(data['numFailed'] + ' fail');
        $('#total-complete').empty().append((data['numPassed'] + data['numFailed']) + ' complete');
      }
      renderBar(parsedData, svgSelType);
    }
  });
}

