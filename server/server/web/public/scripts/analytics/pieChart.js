
// set the dimensions and pieChartMargins of the graph
let pieChartWidth = 400
    pieChartHeight = 400
    pieChartMargin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of pieChartMargin.
let radius = Math.min(pieChartWidth, pieChartHeight) / 2 - pieChartMargin

// append the svg object to the div called 'pie_chartVizModules'
let svgModules = d3.select("#pie_chartVizModules")
  .append("svg")
    .attr("width", pieChartWidth)
    .attr("height", pieChartHeight)
  .append("g")
    .attr("transform", "translate(" + pieChartWidth / 2 + "," + pieChartHeight / 2 + ")");

// append the svg object to the div called 'pie_chartVizModules'
let svg = d3.select("#pie_chartViz")
  .append("svg")
    .attr("width", pieChartWidth)
    .attr("height", pieChartHeight)
  .append("g")
    .attr("transform", "translate(" + pieChartWidth / 2 + "," + pieChartHeight / 2 + ")");

let colorScale = d3.scaleOrdinal().domain(["a", "b", "c"])
                                   .range(["red", "green", "blue"]);

// set the color scale
let color = d3.scaleOrdinal()
  .domain(["a", "b", "c"])
  .range(d3.schemeDark2);

// shape helper to build arcs:
let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius)

// A function that create / renderData the plot for a given variable:
function renderData(data, svgSelType) { 

  let svgObj;
  if (svgSelType === 'module') {
    svgObj = svgModules;
  }
  else if (svgSelType === 'total') {
    svgObj = svg;
  }
  // Compute the position of each group on the pie:
  let pie = d3.pie()
    .value(function(d) {return d.value; })    
    .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) // This make sure that group order remains the same in the pie chart

  let data_ready = pie(d3.entries(data))

  // map to data
  let u = svgObj.selectAll("path")
    .data(data_ready)

  let text = svgObj.selectAll("text")
    .data(data_ready)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  u
    .enter()
    .append('path')
    .merge(u)
    .transition()
    .duration(500)
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1)

  // Now add the annotation. Use the centroid method to get the best coordinates
  u    
  .enter()
  .append('text')
  .text(function(d){ return d.data.value})
  .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
  .style("text-anchor", "middle")
  .style("font-size", 15)

  text  
  .text(function(d){ return d.data.value})
  .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
  .style("text-anchor", "middle")
  .style("font-size", 15)  

}

// Initialize the plot with the first dataset
update('total', null);
update('module', 1);

function update(svgSelType, moduleId=null) {   
  
  let url = '/api/users/quizCompleted/counts/';
  if (moduleId) {
    url += moduleId;
  }
  $.ajax({
     type: "GET",
     url: url,     
     success: function(data){

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
      renderData(data, svgSelType);           
     }
  });  
}

