//(function() { 

//d3.select(window).on("resize",function(){ console.log("inside proj resize");resizeProj() } )

var maptype = "";

init()

function init() {
	var target = "#projections"
	w1 = canvasSize(target)[0]-40;
	//canvasSize error on initial page load regarding -100 height
	h1 = (canvasSize(target))[1] ? (canvasSize(target)[1]) : 650;


	//Create SVG
	svg = d3.select(target)
				.append("svg").attr({"width":w1,"height":h1})//.attr("width", w1).attr("height", h1)
				.attr("class","projections").style("z-index",1);

	//Load in GeoJSON data
  changeGeo("mercator")

  d3.selectAll(".proj").on("click",function(d) { 
 	(this.className.split(" "))[3] == "mer" ?  changeGeo("mercator") : changeGeo("orthographic")	
 })
}//init()			
//resize makes the map responsive
function resizeProj() {
	  //console.log("inside reize for projections.js")
		var target = "#projections"
		w1 = canvasSize(target)[0]-40;
		h1 = (canvasSize(target))[1] ? (canvasSize(target)[1]) : 650;
			console.log(w1)
		//Create SVG
		//svg.attr({"width":w1,"height":h1}).style("z-index",1);
		d3.select("svg.projections").attr("width",w1).attr("height",h1)
	  maptype == "mercator" ? changeGeo("mercator") : changeGeo("orthographic")	
}

function  changeGeo(proj) {  
	  maptype = proj
		d3.json("../../../data/countries/mapshaper_output.json", function(json) {		
			switch(proj) {
				case "mercator":  {
					//var projection = d3.geo.equirectangular().scale(1).translate([0, 0]);
					var projection = d3.geo.mercator().scale(1).translate([0, 0]); 
					//var projection = d3.geo.cylindricalEqualArea().scale(1).translate([0, 0]);        
          maptype = "mercator"
					redraw(projection)
				  break;
				  //Lambert cylindrical - d3.geo.cylindricalEqualArea()
				 }
		   	case "orthographic":  {
		   		console.log("inside orth")
					var projection = d3.geo.orthographic().scale(1).translate([0, 0]).center([ 0, 0 ])
   				maptype = "orthographic"
					redraw(projection)
			  	break;
		   	}
		    case "stereographic":  {
		    	console.log("st")
		    	var projection = d3.geo.stereographic()	
						 .scale(80)
				    .translate([w1 / 2, h1 / 2])
				    .rotate([-20, -10])
				    .clipAngle(180 - 1e-4)
				    .clipExtent([[0, 0], [w1,h1]])
				    .precision(.1);

				  redraw(projection)
			  	break;
		   	}
			}//switch

		function redraw(proj) {
			var path = d3.geo.path().projection(proj);
			var bounds = boundingBox(path,json)
			console.log(bounds)
		  projection.scale(bounds[0]).translate(bounds[1]);

		  //equator(path)

		  //data bind
		  var map = d3.select("svg.projections").selectAll("path.section1map").data(json.features)
		  //data enter
		  map.enter().append("path").attr("class","section1map")
		   .on("mouseover",function(d) { overTrans(d3.select(this))}) 
		   .on("mouseout" ,function(d) { outTrans(d3.select(this))})
		   //data and enter updated
		  map.attr("d",path)
		  //why not condense this???
		   map.attr("opacity",0)
					.transition().delay(100)
		    .attr("d",path)
					.transition().duration(100)
				.attr("opacity",1)
				//.style("fill","#e5e5e5")
				.style("fill","lightblue")
				   .style("stroke", "black")
		       .style("stroke-width", 0.5);

		}	//redraw
	});//d3.json
}//changeGeo
//SUPPORTING FUNCTIONS//
function overTrans(d) {
		d.transition().duration(500).style("fill","steelblue")
}
function outTrans(d) {
		d.transition().duration(500).style("fill","lightblue")
}
function canvasSize(target) { 
		var height = parseFloat(d3.select(target).node().clientHeight)
		var width = parseFloat(d3.select(target).node().clientWidth)
		//console.log(width)
		return [width,height]
}//canvasSize
function boundingBox(path,json){		
	b = path.bounds(json);
  s = .95/Math.max((b[1][0] - b[0][0]) / w1, (b[1][1] - b[0][1]) / h1);
  t = [(w1 - s * (b[1][0] + b[0][0])) / 2, (h1 - s * (b[1][1] + b[0][1])) / 2];
  return [s,t]
}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
  throttleTimer = window.setTimeout(function() {
    resizeProj();
  }, 1000);
}

function equator(path){

	 d3.select(".equator").remove()

			 d3.select("svg.projections").append("path")
  .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
  .attr("class", "equator")
  .attr("d", path)
     .style("stroke", "white")
		       .style("stroke-width", 0.5);
}



//})()
//ISSUES
//1. ISSUE: When using orthographic the boundingBox method 9 attribute returns infinity
// http://stackoverflow.com/questions/13944704/d3-js-geojson-and-bounds
//	RESOLUTION:  was missing json in the function call
				  //?-Does path need to have projection defined here before b=path.bounds(json)
				  //YES IT DOES...otherwise it plots the US more so than anything else
