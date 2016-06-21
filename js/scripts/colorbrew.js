(function() { 

var color = colorbrewer;
console.log("colorbrew")
//console.log(d3.entries(color))

var palette = d3.select("#colorbrew").selectAll("palette").data(d3.entries(color))

palette.enter().append('span').attr('class','palette')
 .attr('title',function(d) { return d.key })
 .on('click',function(d) { 
   console.log( d3.values(d.value).map(JSON.stringify).join('\n') ) })

//var swatch = palette.selectAll('swatch').data(function(d) { return d.value[d3.keys(d.value).sort(d3.descending)[5]]})
var swatch = palette.selectAll('swatch').data(function(d) { return d.value[6]})

swatch.enter().append('div').attr("class",'swatch')
 //.html(function(d) { return d })
 .style("background-color",function(d) { return d })

d3.selectAll('.palette')
.transition().duration(500).delay(function(d,i) { return i / 100 * 20000 })
 .style('opacity',1)
})()
