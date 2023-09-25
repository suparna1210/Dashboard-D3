function Sunburst(uni_data)
{
  var width = 960,
      height = 700,
      radius = (Math.min(width, height) / 2) - 10;

  var formatNumber = d3.format(",d");

  var x = d3.scaleLinear()
      .range([0, 2 * Math.PI]);

  var y = d3.scaleSqrt()
      .range([0, radius]);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var partition = d3.partition();

  var arc = d3.arc()
      .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
      .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
      .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
      .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


    let root = uni_data;
    console.log('basic', root);

    root= d3.hierarchy(root[0], d=>d.values)
    console.log('hier',root)
    root.sum(function(d) { return d.value; });
    svg.selectAll("path")
        .data(partition(root).descendants())
      .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color((d.values ? d : d).data.key); })
        .on("click", click)
      .append("title")
        .text(function(d) { return d.data.key + "\n" + formatNumber(d.value); });


  function click(d) {
    svg.transition()
        .duration(750)
        .tween("scale", function() {
          var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
              yd = d3.interpolate(y.domain(), [d.y0, 1]),
              yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
          return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
        })
      .selectAll("path")
        .attrTween("d", function(d) { return function() { return arc(d); }; });
  }

  d3.select(self.frameElement).style("height", height + "px");
}

// function sunburst(data)
// {
//   var width = 960,;
//   var height = 700;
//   var radius = (Math.min(width, height) / 2) - 10;
//
//   var num_format = d3.format(",d");
//
//   var x = d3.scaleLinear().range([0, 2 * Math.PI]);
//   var y = d3.scaleSqrt().range([0, radius]);
//
//   var color_scheme = d3.scaleOrdinal(d3.schemeCategory20);
//   var partition = d3.partition();
//
//   var arc = d3.arc()
//       .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
//       .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
//       .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
//       .outerRadius(function(d) { return Math.max(0, y(d.y1)); });
//
//   var svg = d3.select("body").append("svg")
//       .attr("width", width)
//       .attr("height", height)
//       .append("g")
//       .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");
//
//   var text, path;
//   var root = d3.hierarchy(data);
//
//   root.sum(d => d.size);
//
//   svg.selectAll("path")
//      .data(partition(root).descendants())
//      .enter().append("g").attr("class", "node");
//
//   path = svg.selectAll(".node")
//       .append("path")
//       .attr("d", arc)
//       .style("fill", d => color_scheme((d.children ? d : d.parent).data.name))
//       .on("click", click);
//
//   text = svg.selectAll(".node")
//        .append("text")
//           .attr("transform", function(d) {
//              return "rotate(" + computeTextRotation(d) + ")";
//           })
//           .attr("x", function(d) {
//              return y(d.y0);
//           })
//           .attr("dx", "6")
//           .attr("dy", ".35em")
//           .text(function(d) {
//               return d.data.name === "root" ? "" : d.data.name
//           });
//
//   function click(d) {
//     text.transition().attr("opacity", 0);
//
//     svg.transition()
//         .duration(750)
//         .tween("scale", function() {
//           var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
//               yd = d3.interpolate(y.domain(), [d.y0, 1]),
//               yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
//           return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
//         })
//       .selectAll("path")
//       .attrTween("d", function(d) { return function() { return arc(d); }; })
//       .on("end", function(e, i) {
//
//             if (e.x0 > d.x0 && e.x0 < d.x1)
//             {
//                 var arcText = d3.select(this.parentNode).select("text");
//
//                 arcText.transition().duration(750)
//                     .attr("opacity", 1)
//                     .attr("class", "visible")
//                     .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
//                     .attr("x", function(d) { return y(d.y0); })
//                     .text(function(d) {
//                         return d.data.name === "root" ? "" : d.data.name
//                     });
//             }
//   });
//   }
//
//   function computeTextRotation(d) {
//     return (x((d.x0 + d.x1)/2) - Math.PI / 2) / Math.PI * 180;
//   }
//
//   d3.select(self.frameElement).style("height", height + "px");
// }
//
//
// // /////////////////////////////
// // // Prepare the sunburst chart
// // /////////////////////////////
// //
// // // Properties for the chart.
// // var svg_width = 800;
// // var svg_height = 800;
// // var radius = Math.min(svg_width, svg_height) / 2;
// // var chart_color = d3.scaleOrdinal(d3.schemeCategory20b);
// //
// // // Prepare the main element.
// // var g = d3.select('svg')
// //           .attr('width', svg_width)
// //           .attr('height', svg_height)
// //           .append('g')
// //           .attr('transform', 'translate(' + svg_width / 2 + ',' + svg_height / 2 + ')');
// //
// // // Use partition function to organize data into circle form.
// // var partition = d3.partition()
// //                   .size([2 * Math.PI, radius]);
// //
// // // Create json data.
// // d3.json("data.json", function(error, nodeData) {
// //         if (error) throw error;
// //
// //   // Set root node.
// //   var root = d3.hierarchy(nodeData)
// //                .sum(d => d.size);
// //
// //   // Prepare the arc.
// //   partition(root);
// //   var arc = d3.arc()
// //               .startAngle(d => d.x0)
// //               .endAngle(d => d.x1)
// //               .innerRadius(d => d.y0)
// //               .outerRadius(d => d.y1);
// //
// //   // Add a <g> element for each node in thd data, then append <path> elements and draw lines based on the arc
// //   // variable calculations. Last, color the lines and the slices.
// //   g.selectAll('g')
// //       .data(root.descendants())
// //       .enter().append('g').attr("class", "node").append('path')
// //       .attr("display", function (d) { return d.depth ? null : "none"; })
// //       .attr("d", arc)
// //       .style('stroke', '#fff')
// //       .style("fill", function (d) { return chart_color((d.children ? d : d.parent).data.name); });
// //
// //
// //   // Populate the <text> elements with our data-driven titles.
// //   g.selectAll(".node")
// //       .append("text")
// //       .attr("transform", function(d) {
// //           return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; })
// //       .attr("dx", "-20") // radius margin
// //       .attr("dy", ".5em") // rotation align
// //       .text(function(d) { return d.parent ? d.data.name : "" });
// // });
// //
// //   /**
// //    * Calculate the correct distance to rotate each label based on its location in the sunburst.
// //    * @param {Node} d
// //    * @return {Number}
// //    */
// //   function computeTextRotation(d) {
// //       var angle = (d.x0 + d.x1) / Math.PI * 90;
// //
// //       // Avoid upside-down labels
// //       return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
// //       //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
// //   }
// //
// // // const dummy_data = [
// // //   { id: '1', value: 11, region: 'USA'},
// // //   { id: '2', value: 51, region: 'China'},
// // //   { id: '3', value: 69, region: 'France'},
// // //   { id: '4', value: 1, region: 'Germany'},
// // // ]
// // //
// // // //const dummy_data = [10, 41, 54, 67, 13, 1, 65, 13, 25, 64];
// // //
// // // var svg_height = 300;
// // // var svg_width = 500;
// // //
// // // var barwidth = (svg_width / dummy_data.length);
// // //
// // // const svg = d3.select('svg')
// // //                     .attr('width', svg_width)
// // //                     .attr('height', svg_height);
// // //
// // // const bars = svg.selectAll('rect')
// // //                     .data(dummy_data)
// // //                     .enter()
// // //                     .append('rect')
// // //                     .attr('class', 'bar')
// // //                     .attr('y', d => svg_height - d.value)
// // //                     .attr('height', d => d.value)
// // //                     .attr('width', barwidth - 5)
// // //                     .attr('transform', function (d, i) {
// // //                         var trans = [barwidth * i, 0];
// // //                         return 'translate(' + trans + ')';
// // //                     });
// // //
// // // const text = svg.selectAll('text')
// // //                 .data(dummy_data)
// // //                 .enter()
// // //                 .append('text')
// // //                 .text(d => d.region)
// // //                 .attr('y', d => svg_height - d.value - 2)
// // //                 .attr('x', (d, i) => barwidth * i)
// // //                 .attr('fill', '#A64C38');
