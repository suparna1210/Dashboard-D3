/*-------------------------------------------------------------------- 
  
   Module: tree class implemented in Bostock's functional style
   Author: Mike Chantler
  
   What it does:
  	Renders a tree hierarchy using the GUP
	
		
   Input
	Only accepts 'format 2' 

	
	Format 2: "nest" or "key-values" format
	 This is the same format as provided by d3.nest
	 (an array of objects with "key" and "values" fields)
	 as below:
	 
			[
			  {
				"key": "RP",
				"values": [
				  {
					"key": "tab",
					"values": [
					  {
						"date": "2011-11-14T16:17:54Z",
						"quantity": 2,
						"waiter": "RP",
						"tip": 100,
						"method": "tab"
					  }
					]
				  }
				]
			  },
			  {
				"key": "BS",
				"values": [
				  {
					"key": "cash",
					"values": [
					  {				etc.
					  

			
   Dependencies
  	D3.js v4
  
   Version history
  	v001	17/09/2017	mjc	Created.
  
---------------------------------------------------------------------- */
var hierarchyGraph; //The graph of objects used to represent the hierarchy

function tree(targetDOMelement) { 
	//Here we use a function declaration to imitate a 'class' definition
	//
	//Invoking the function will return an object (treeObject)
	//    e.g. tree_instance = tree(target)
	//    This also has the 'side effect' of appending an svg to the target element 
	//
	//The returned object has attached public and private methods (functions in JavaScript)
	//For instance calling method 'updateAndRenderData()' on the returned object 
	//(e.g. tree_instance) will render a tree to the svg
	
	
	

	//Delare the main object that will be returned to caller
	var treeObject = {};
	
	
	
	
	//=================== PUBLIC FUNCTIONS =========================
	//

		
	treeObject.loadAndRenderNestDataset = function (nestFormatHierarchy, rootName) {
		//Loads and renders (format 2) hierarchy in "nest" or "key-values" format.
		layoutAndRenderHierarchyInNestFormat(nestFormatHierarchy, rootName)
		return treeObject; //for method chaining
	}	

	
	treeObject.nodeLabelIfNoKey = function (fn) {
		//Leaf nodes from d3.nest typically have no 'key' property
		//By default the d3.nest 'key' property is used as the node text label
		//If this does not exist the nodeLabelIfNoKey() function will be called to 
		// provide the label
		nodeLabelIfNoKey = fn;
		return treeObject; //for method chaining
	}
	
	
	//=================== PRIVATE VARIABLES ====================================
	
	//Declare and append SVG element
	var margin = {top: 20, right: 200, bottom: 20, left: 50},
	width = 1600- margin.right - margin.left,
	height = 1000 - margin.top - margin.bottom;

	//Set up SVG and append group to act as container for tree graph
	var grp = d3.select(targetDOMelement).append("svg")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		                            
	//Add group for the nodes, just for clarity when 'inspecting' the html & svg
	var nodesGroup = grp
		.append("g")
		.classed("nodesGroup", true);
		
	//Add group for the links, just for clarity when 'inspecting' the html & svg
	var linksGroup = grp
		.append("g")
		.classed("linksGroup", true);
 
	var datasetAsJsonD3Hierarchy; //Hierarchy in JSON form (suitable for use in d3.hierarchy 


	//=================== PRIVATE FUNCTIONS ====================================
	var nodeLabelIfNoKey = function(){return "No name set"};
	var appendClickFunction = function(){console.log ("No click fn appended")};
	var clickFunction = function (d,i){console.log("node clicked, d = ",d)}
	var nodeLabel = function(d) {
		//we'll use the nest 'keys' as the node labels
		if (d.data.id) return  "NODE: "+ d.data.id ;
		else return nodeLabelIfNoKey(d);
	}
	
	
	function layoutAndRenderHierarchyInNestFormat (nestFormatHierarchy, rootName){
	//Lays out and renders (format 2) hierarchy in "nest" ("key-values" format).

		//Move the 'nest' array into a root node:
		datasetAsJsonD3Hierarchy = {"id":rootName, "children": nestFormatHierarchy.children}

		//Now create hierarchy structure 
		//Note that we need to add the "children" accessor "d=>d.values" in order
		//to tell d3.hierarchy to use nest's 'values' as children
		hierarchyGraph = d3
			.hierarchy(datasetAsJsonD3Hierarchy, d=>d.children) //
			.sum(d => d.depth)
			.sort(function(a, b) { return b.depth- a.depth; });

			
		//Can now calculate XY data and render
		calculateXYpositionsAndRender(hierarchyGraph);
	}


	
	function calculateXYpositionsAndRender(hierarchyGraph){
	
		//get and setup the tree layout generator 
		var myTreeLayoutGenerator = d3.pack().size([height, width]);

		//Add x and y properties to each node in the hierarchy graph.
		var hierarchyGraphWithPositions = myTreeLayoutGenerator(hierarchyGraph);

		//Get lists of nodes 
		var listOfNodes = hierarchyGraphWithPositions.descendants();
        console.log("listOfNodes = ", listOfNodes)	
		//Chop the root node off and use this as the list of links
		var listOfLinksByDescendants = listOfNodes.slice(1);
 

		//Render links and nodes
		GUPrenderLinks(listOfLinksByDescendants);
		GUPrenderNodes(listOfNodes);		

	}


	function GUPrenderNodes(listOfNodes){
		
		//DATA BIND
		var selectionGroup = nodesGroup
			.selectAll("g.cssClassNode") //select groups with class = "cssClassNode"
			.data(listOfNodes);		

		//ENTER  SELECTION PROCESSING
		
		//Create groups
		var enterSelectionGroup = selectionGroup
			.enter()
			.append("g")
			.classed("cssClassNode enterSelection", true)
			.on("click", clickFunction)
			
		//Append nodes to group
		enterSelectionGroup
			.append("circle")
			.attr("r", function(d){console.log("d=",d); return d.r} );
			
		//Append text to group
		enterSelectionGroup
			.append("text")

        //Append text to group
		enterSelectionGroup
        .append("title")
        .text(nodeLabel)
			
		
		//Merged ENTER + UPDATE group selections
		enterUpdateSelectionGroup = enterSelectionGroup
			.merge(selectionGroup)
			
		enterUpdateSelectionGroup
			//translate the group into the correct position 
			.attr("transform", function(d) { 
				return "translate(" + d.y + "," + d.x + ")"; 
			})
			
		enterUpdateSelectionGroup
			//set appropriate classes for the group
			.classed("leafNode", d => d.height == 0)
			.classed("rootNode", d => d.depth == 0)
			.classed("intermediateNode", d => (d.height != 0 && d.depth != 0));
		
		//Create Merged ENTER + UPDATE selections for the text element in the group
		enterUpdateSelectionText = 	enterUpdateSelectionGroup
			//add text to the text element
			.select("text")
			.text(nodeLabel);
			
		//UPDATE 
		selectionGroup
			//Set Update classes on group
			.classed("enterSelection", false)
			.classed("updateSelection", true)

		// EXIT 
		selectionGroup
			.exit()
			.classed("enterSelection updateSelection", false)
			.classed("exitSelection", true)
			.remove();
	}


	
	function GUPrenderLinks(listOfLinksByDescendants){
		
		// DATA JOIN
		var selection = linksGroup
			// .selectAll("path.cssClassLink")
			.data(listOfLinksByDescendants);
			
		//ENTER 
		var enterSel = selection
			.enter()
			.append('path')
			.classed("cssClassLink enterSelection", true)
			.attr("d", diagonalShapeGenerator1);
			
		// UPDATE
		selection
			.classed("enterSelection", false)
			.classed("updateSelection", false)			
			.attr("d", diagonalShapeGenerator1);
		
		// EXIT 
		selection
			.exit()
			.classed("enterSelection updateSelection", false)
			.classed("exitSelection", false)
			.remove();			
	}


	//Define the diagonal path shape generator function
	function diagonalShapeGenerator1(d){
		source = d.parent;
		descendant = d;
		return diagonalShapeGenerator2(source, descendant);
	}	
	
	//Define the diagonal path shape generator function
	function diagonalShapeGenerator2(source, descendant){
		return "M" + source.y + "," + source.x
			+ "C" + (source.y + descendant.y) / 2 + "," + source.x
			+ " " + (source.y + descendant.y) / 2 + "," + descendant.x
			+ " " + descendant.y + "," + descendant.x;
	}	

	
	//================== IMPORTANT do not delete ==================================
	return treeObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of tree() declaration	