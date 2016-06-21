
//(function() {
  var maptype = "";
  var proj = "choropleth";
  var color;
 init()

//var color = d3.scale.category20();
function init() {

  color = d3.scale.threshold()
    .domain([0.02, 0.04, 0.06, 0.08, 0.10])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

  var target = "#visualizedata"
  w1 = canvasSize(target)[0];
  //do i need to add if for undefined height???
    h1 = (canvasSize(target))[1] ? (canvasSize(target)[1]-100) : 700;

  svg = d3.select(target)
    .append("svg").attr({"width":w1,"height":h1}).style("z-index",1)
    .attr("class","visualizedata").style("z-index",1);

  d3.selectAll(".viz").on("click",function(d) { 
  (this.className.split(" "))[3] == "choro" ?  changeViz("choropleth") : changeViz("bubble")  
 })
  changeViz("choropleth")
}//init() 

function resize() {
  var target = "#visualizedata"
  w1 = canvasSize(target)[0];
  h1 = (canvasSize(target)[1]-100);

  //Create SVG
  svg.attr({"width":w1,"height":h1}).style("z-index",1)
  maptype == "choropleth" ? changeViz(svg,"choropleth") : changeViz(svg,"bubble") 
}

function  changeViz(viz) {
    maptype = viz
    queue()
      .defer(d3.json, "../../../data/us.json")
      .defer(d3.tsv, "../../../data/unemployment.tsv")
      .defer(d3.csv, "../../../data/cities.csv")
      .await(redraw)

  function redraw(error,us,unemployment,cities) {
      var rateById = {};
      unemployment.forEach(function(d) { rateById[d.id] = +d.rate; });

      var projection = d3.geo.albersUsa().scale(1).translate([0,0])
      var path = d3.geo.path().projection(projection)
      var bounds = boundingBox(path,(topojson.feature(us,us.objects.counties)))

      switch(viz) {
        case "choropleth":  {
          svg.selectAll('g').remove()
          svg.selectAll("path").remove()

          var maps = d3.models.maps()
            .transX(bounds[1][0]).transY(bounds[1][1])
            .scale(bounds[0])
            .proj("albersUsa")
            .uniqueClass("choro")
            .geoData(topojson.feature(us,us.objects.counties).features)
          svg.call(maps)
          svg.selectAll("path.choro").style("fill", function(d,i) { return color(rateById[d.id]) })
            .style("stroke", "black")
           .style("stroke-width", 0.5);
          break;
         }
        case "bubble":  {
     
          var maps = d3.models.maps()
            .transX(bounds[1][0]).transY(bounds[1][1])
            .scale(bounds[0])
            .proj("albersUsa")
            .uniqueClass("bubble")
            .geoData(topojson.feature(us,us.objects.counties).features)
           svg.call(maps)
           projection.scale(bounds[0]).translate([bounds[1][0],bounds[1][1]])
           svg.selectAll("path.bubble").style({"fill":"#e5e5e5","stroke":"white","stroke-width":0.5})
             .style("stroke", "black")
            .style("stroke-width", 0.5);
           drawCities(cities,projection)
          break;
        }
      }//switch
    }//redraw
}//changeViz

function drawCities(cities,projection) {

  svg.selectAll('g').remove()

  var elem = svg.selectAll('g').data(cities)

  var elemEnter = elem.enter().append('g')
  .attr("transform", function(d,i) { 
  return "translate(" + projection([d.lon, d.lat])[0] + "," + projection([d.lon, d.lat])[1] + ")" } )

  var circle = elemEnter.append('circle')
    .attr("fill-opacity",0)
    .style("stroke-width",0)
    .attr("fill","#d4ee80")
    .attr("stroke", "#59b318")
  .transition().delay(function(d,i) { 
    // if(i % 2 === 0) { text(this) }
    return i / cities.length * 6000})  
    .attr("r",5)
  .transition().duration(2000)
    //.attr("stroke", "rgba(230,230,230, .5)")
    .attr("stroke", "#59b318")
    .attr("fill-opacity",.3)
    .attr("fill","#59b318")
    .attr("r",20)
    .style("stroke-width",2)
    // .style("stroke-opacity",1)
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
 //d3.select(window).on("resize",function(){ console.log("resize");resize() } )
//})()
 
