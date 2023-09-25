/*-------------------------------------------------------------------- 
  
   Module: simple map class implemented in Bostock's functional style
   Author: Mike Chantler
  
   What it does:
  	Renders a bar chart in as simple mannert as posibe
  
   Dependencies
  	D3.js v4
  
   Version history
  	v001	29/08/2018	mjc	Created.
  
---------------------------------------------------------------------- */
"use safe"

function map(targetDOMelement) { 
	//Here we use a function declaration to imitate a 'class' definition
	//
	//Invoking the function will return an object (mapObject)
	//    e.g. map_instance = map(target)
	//    This also has the 'side effect' of appending an svg to the target element 
	//
	//The returned object has attached public and private methods (functions in JavaScript)
	//For instance calling method 'updateAndRenderData()' on the returned object 
	//(e.g. map_instance) will render a map to the svg
	

	//Delare the main object that will be returned to caller
	var mapObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	//

	var myMapObject;
	
	mapObject.loadAndRenderMap = function (countries){
		topojsonCountries=countries;
		GUP_countries(mapGrp, topojsonCountries);
		return mapObject;
	}	
	mapObject.loadAndRenderTowns = function (towns){
		topojsonTowns=towns;
		GUP_towns(townsGrp, topojsonTowns);
		return mapObject;
	}	
	mapObject.overrideTownLongLatAccessor = function (functionRef) {
		longLatAccessor = functionRef;
		return mapObject;
	}	
	mapObject.overrideTownNameAccessor = function (functionRef) {
		townNameAccessor = functionRef;
		return mapObject;
	}

	mapObject.overrideOnClick = function (functionRef) {
		townOnClick = functionRef;
		return mapObject;
	}
	
	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var width = 960,
		height = 1160;
	var topojsonCountries, topojsonTowns;
	var targetDOM = targetDOMelement;
	var countries, towns;


	//=================== INITIALISATION CODE ====================================
	
	//Declare and append SVG element
	//Create SVG
	var svg = d3
		.select(targetDOMelement)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.classed("map",true);	

	var mapGrp = svg.append("g").classed("mapGroup", true);
	var townsGrp = svg.append("g").classed("townsGrp",true);
	var mySet1 = new Set()

		
	//===================== PRIVATE FUNCTIONS =========================================
	
	var townNameAccessor = d => {console.log("d=", d); return d.properties.name}; //Default town name in topojson format
	var longLatAccessor = d => d.geometry.coordinates; //Default latitude, longitude is geojson
	var town_xyPosition = d => ("translate(" + projection(longLatAccessor(d)) + ")"); 
	var townOnClick = d => {console.log("Hello =", d)}

	//define projection of spherical coordinates to the Cartesian plane
	var projection = d3.geoAlbers()
		.center([0, 55.4])
		.rotate([4.4, 0])
		.parallels([50, 60])
		.scale(1200 * 5)
		.translate([width / 2, height / 2]);

	var scale = d3.scaleLinear()
		.domain([1,500])  
		.range([3, 25])  

	//Define path generator (takes projected 2D geometry and formats for SVG)
	var pathGen = d3
		.geoPath()
		.projection(projection)
		.pointRadius(2);
		
	

	
	function GUP_countries(mapGrp, countries){
		//Draw the five unit outlines (ENG, IRL, NIR, SCT, WLS)
		
		//DATA BIND
		var selection = mapGrp
			.selectAll(".classCountry")
			.data(countries, d=>d.id); //Use ENG, IRL etc as key
		
		//ENTER
		var enterSel = selection
			.enter()
			.append("path")
			.attr("class", d=>("key--"+d.id))
			.classed("classCountry", true)
			.attr("d", pathGen);

			
		//ENTER + UPDATE
		enterSel.merge(selection) 
			.on("mouseover", function(d,i){
				d3.select(this).classed("highlight", true)
			})
			.on("mouseout", function(d,i){
				d3.select(this).classed("highlight", false)
			})
			.on("click", d=>console.log(d))
		
		//EXIT
		selection.exit().remove();
	}


	function GUP_towns(townsGrp, towns){

		
		//DATA BIND
		var selection = townsGrp
			.selectAll("g.classTown")
			.data(towns, townNameAccessor);		

		//ENTER  
		var enterSelection = selection.enter()
			.append("g")
			.attr("class", d=>("key--"+townNameAccessor(d)))
			.classed("classTown", true)		
			// .on("mouseover", function(d){console.log("d=",d)})
			.attr("transform", town_xyPosition);
			
		//Append circles
		enterSelection
			.append("circle")
			.attr("r", function(d){ var sumFTETotal=0; d.values.forEach(element => {
				sumFTETotal+=element.context.scaledFTE || 0;
			}); console.log(sumFTETotal); return scale(sumFTETotal); })
			.attr("class", "non_brushed");

			
		//Append labels
		enterSelection
			.append("text")
			.text(townNameAccessor);
			
			function isBrushed(brush_coords, cx, cy) {

				// console.log("isbrushed", brush_coords, " ", Date.now())


				var x0 = brush_coords[0][0],
					x1 = brush_coords[1][0],
					y0 = brush_coords[0][1],
					y1 = brush_coords[1][1];
   
			   return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
		   }

		   svg.append("g")
		   .call(d3.brush().extent([[0, 0], [width, height]]).on("brush", brushed).on("end", brushended ));


		function brushed() {
			var s = d3.event.selection,
				x0 = s[0][0],
				y0 = s[0][1],
				dx = s[1][0] - x0,
				dy = s[1][1] - y0;
			// console.log(s, x0, y0, dx, dy, "HGFVGKLJK");
			mySet1 = new Set()


			console.log("BRUSHDE CALLED")
			svg.selectAll('circle')
			   .style("fill", function (d) {
			
				   if (isBrushed(s,projection(longLatAccessor(d))[0], projection(longLatAccessor(d))[1] ))
						{ mySet1.add(d); return "yellow"; }
				   else { return "#ffffff"; }
			   })
			   .attr('class', function (d) {
			   	   if (isBrushed(s,projection(longLatAccessor(d))[0], projection(longLatAccessor(d))[1] ))
					{mySet1.add(d); return "brushed" }
			   else { return "non_brushed"; }
		   });
		}
   
		function brushended() {
			console.log(mySet1);
			myMapObject = mySet1;
			dummy(mySet1);
			

			if (!d3.event.selection) {
				svg.selectAll('circle')
				  .transition()
				  .duration(150)
				  .ease(d3.easeLinear)
				  .style("fill", "#ffffff");
			}
		}


		//ENTER + UPDATE
		// enterSelection.merge(selection) 
			// .on("mouseout", function(d,i){
			// 	d3.select(this).classed("highlight", false)
			// })
			// .on("click", function(d,i){
				
			// 	d3.selectAll(".classTown").classed("highlightNeighbor", false)
			// 	d3.selectAll(".classTown").classed("highlightMain", false)

			// 	var neighbors = townOnClick(d);
			// 	console.log("HAHAHAHA", neighbors);
			// 	neighbors.forEach(element => {
			// 		className = sentenceCase(element.townName.toLowerCase()); 
			// 		console.log("HAHAHAHA", className)
			// 		d3.select(`.key--${className}`).classed("highlightNeighbor", true)
			// 	});

			// 	d3.select(this).classed("highlightMain", true)
			// })
			// .on("mouseover", function(d,i){
			// 	d3.select(this).classed("highlight", true)
			// })	

			
		
		//EXIT
		selection.exit().remove();
	}

	// svg.append("g")
    //            .call(brush);
	
	function sentenceCase (str) { return str.replace(/[a-z]/i, function (letter) { return letter.toUpperCase(); }).trim(); } ;
	
	
	//================== IMPORTANT do not delete ==================================
	return mapObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of map() declaration	

