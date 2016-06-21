

var target = "#visualizedata"
    w1 = canvasSize(target)[0];
    h1 = canvasSize(target)[1] - 100;

var color = d3.scale.threshold()
    .domain([0.02, 0.04, 0.06, 0.08, 0.10])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

var path = d3.geo.path();

var svg = d3.select("#visualizedata").append("svg")
    .attr("width", w1)
    .attr("height", h1);

queue()
    .defer(d3.json, "../../../data/us.json")
    .defer(d3.tsv, "../../../data/unemployment.tsv")
    .await(ready);

function ready(error, us, unemployment) {

  if (error) throw error;

  var rateById = {};

  unemployment.forEach(function(d) { rateById[d.id] = +d.rate; });
 console.log(rateById)
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) {      
        return color(rateById[d.id]); })
    .on("mouseover",function(d) { console.log(d)}) 
     //.on("mouseout",function(d) { outTrans(d3.select(this))})
   
  // svg.append("path")
  //     .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
  //     .attr("class", "states")
  //     .attr("d", path);
}
function canvasSize(target) { 
    var height = parseFloat(d3.select(target).node().clientHeight)
    var width = parseFloat(d3.select(target).node().clientWidth)
    return [width,height]
}//canvasSize
function boundingBox(path,json){    
      b = path.bounds(json);
      s = .95/Math.max((b[1][0] - b[0][0]) / w1, (b[1][1] - b[0][1]) / h1);
      t = [(w1 - s * (b[1][0] + b[0][0])) / 2, (h1 - s * (b[1][1] + b[0][1])) / 2];
      return [s,t]
    }
