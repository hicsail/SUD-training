
// set the dimensions and margins of the graph
let margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg1 = d3.select("#bar_chartViz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

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
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return xSubgroup(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return color(d.key); });

}

$.ajax({
  type: "GET",
  url: '/api/users/quizCompleted/summaryStatistics',     
  success: function(data){
    let result = {'1': [], '2': [], '': [], 'max': []};    
    for (let d of data) {
      result[d[group]].push(d)
    }         
    renderBarChart(data);          
  }
});  

$.ajax({
  type: "GET",
  url: '/api/questions/analysis',     
  success: function(data){          
    //console.log(data)          
  }
});  