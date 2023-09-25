/*-------------------------------------------------------------------- 
  
   Module: agglomerative clustering class implemented in Bostock's functional style
   Author: Mike Chantler
  
   What it does:
  	Performs aggloerative clustering 
	Produces a linkage table given a similarity matrix
  
   Dependencies
  	D3.js v4
  
   Version history
  	v001	11/10/2018	mjc	Created.

  
---------------------------------------------------------------------- */
"use safe"

function agglomCluster() { 


	//Delare the main object that will be returned to caller
	var agglomClusterObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	//

	agglomClusterObject.oneDsimMatrix = function (data) {
		return oneDsimMatrix;
	}

	agglomClusterObject.twoDsimMatrix = function (data) {
		return twoDsimMatrix;
	}		
	
	agglomClusterObject.listOfCategories = function (data) {
		return listOfCategories;
	}

	agglomClusterObject.listOfCategoryObj = function (data) {
		return listOfCategoryObj;
	}	

	agglomClusterObject.linkageTable = function (data) {
		return linkageTable;
	}	

	agglomClusterObject.maxSim = function () {
		var maxSimValue = -1;
		var maxSimObj ={};
		oneDsimMatrix.forEach(function (s, index){
			if (!s.diagonal && s.active && s.similarity > maxSimValue){ 
				maxSimValue = s.similarity;
				maxSimObj = s;
			}
		})
		//return clone of maxSimObj
		return Object.assign({}, maxSimObj);
	}

	agglomClusterObject.refFormatLoadSimData = function (data) {
		datasetRefFormat=data.map(d=>d); //create local copy of references so that we can sort etc.
		generateOneAnd2dMatrixForms(datasetRefFormat);
		listOfCategories = datasetRefFormat.map(topic => topic.words.first3words);
		listOfCategoryObj = listOfCategories.map(function(c){return {cat:c, active:true}})
		return agglomClusterObject;
	}	

	agglomClusterObject.inactivateOldRowsAndColums = function (simObj) {
		//Get the two node numbers of the two nodes that we are removing
		var nodeAnumber = simObj.xIndex;
		var nodeBnumber = simObj.yIndex;
		oneDsimMatrix.forEach(function (sim){ 
			if (sim.xIndex == nodeAnumber ||
				sim.yIndex == nodeAnumber ||
				sim.yIndex == nodeBnumber ||
				sim.xIndex == nodeBnumber) 
			{sim.active = false}
		})		
		listOfCategoryObj[nodeAnumber].active = false;
		listOfCategoryObj[nodeBnumber].active = false;
	}
	
	agglomClusterObject.addCluster = function (simOfChildNodesToBeJoined, newNodeLabel) {
		//This method adds a new row and a new column to the matrix to represent the new cluster
		//The new cluster (node) represents the union of xCat and yCat nodes 
		//
		//The cells of the new row are assigned a similarity value determined by the linkageCriteria
		//using the cells of the xCat and yCat rows
		//
		//The cells of the new column are assigned a similarity value determined by the linkageCriteria
		//using the cells of the xCat and yCat columns
		//
		//note format: twoDsimMatrix[colNumber][rowNumber] = twoDsimMatrix[xIndex][yIndex]


		linkageTable.push(simOfChildNodesToBeJoined)
		//Get the two node numbers of the two nodes that we are joining into a new cluster
		var nodeAnumber = simOfChildNodesToBeJoined.xIndex;
		var nodeBnumber = simOfChildNodesToBeJoined.yIndex;
		var xCat, yCat, newSimilarity, similarityA, similarityB;

		var new_xIndex = listOfCategories.length;
		var new_yIndex = listOfCategories.length;
		//console.log("addCluster: ", simOfChildNodesToBeJoined, newNodeLabel);
		originalListOfCategories = listOfCategories.map(cat=>cat); 
		//originalListOfCategories = listOfCategoryObj.filter(c=>c.active).map(c=>c.cat) 
		listOfCategories[new_xIndex] = newNodeLabel;
		listOfCategoryObj[new_xIndex] = {cat:newNodeLabel, active:true};


		//Add new column at right of matrix
		twoDsimMatrix[new_xIndex] = [];
		xCat = newNodeLabel;
 		originalListOfCategories.forEach(function(category, yIndex){
		
			yCat = category;
			if (yIndex != new_xIndex && yIndex != listOfCategories.length-1){
				similarityA = twoDsimMatrix[nodeAnumber][yIndex].similarity;
				similarityB = twoDsimMatrix[nodeBnumber][yIndex].similarity;
			}
			active = listOfCategoryObj[yIndex].active; //don't sim of inactive categories active
			newSimilarity 
				= createNewSim(new_xIndex, yIndex, xCat, yCat, similarityA, similarityB, active)			
			oneDsimMatrix.push(newSimilarity)
			twoDsimMatrix[new_xIndex][yIndex] = newSimilarity;	
		})

		//Add new row to  end of matrix
		yCat = newNodeLabel;
		originalListOfCategories.forEach(function(category,xIndex){
			xCat = category;
			similarityA = twoDsimMatrix[xIndex][nodeAnumber].similarity;
			similarityB = twoDsimMatrix[xIndex][nodeBnumber].similarity;
			active = listOfCategoryObj[xIndex].active; //don't sim of inactive categories active
			newSimilarity 
				= createNewSim(xIndex, new_yIndex, xCat, yCat, similarityA, similarityB, active)
			oneDsimMatrix.push(newSimilarity)
			twoDsimMatrix[xIndex][new_yIndex] = newSimilarity;	
		})	

		//Add final diagonal element
		xCat = yCat = newNodeLabel;
		newSimilarity 
			= createNewSim(new_xIndex, new_yIndex, xCat, yCat, 0, 0, true)
		oneDsimMatrix.push(newSimilarity)
		twoDsimMatrix[new_xIndex][new_yIndex] = newSimilarity;
		return agglomClusterObject;
	}	



	
	//=================== PRIVATE VARIABLES ====================================
	var datasetRefFormat = [];
	var listOfCategories = []; //Similarity labels or categories
	var listOfCategoryObj = []; //Array of object representing similarity labels or categories
	var oneDsimMatrix = [];
	var twoDsimMatrix = []; //format: twoDsimMatrix[colNumber][rowNumber] = twoDsimMatrix[xIndex][yIndex]
	var linkageTable = [];
	
	
	
	//=================== PRIVATE FUNCTIONS ====================================
	
	function createNewSim(xIndex, yIndex, xCat, yCat, similarityA, similarityB, active){
		//Returns a sim object
		var simValue, diagonal;
		if (xIndex == yIndex){simValue = 0;  diagonal = true;} //sim is on diagonal
		else simValue = linkageCriteria(similarityA,similarityB);

		return {
			similarity: simValue,
			xCat: xCat,
			xIndex: xIndex, //colNumber
			yCat: yCat,
			yIndex: yIndex, //rowNumber
			diagonal: diagonal,
			active: active
		}
	}	

	var linkageCriteria =  function(simA, simB) {return d3.min([simA, simB])} 

	function generateOneAnd2dMatrixForms(datasetRefFormat){
		//Generate complete list of similarities as a flat array 
		//so that they can be easily manipulated by GUP etc.
		oneDtwoDsimMatrix = [];
		var maxSim = 0;

		//Convert array of similarity matrices into flat array
		var oneDindex = 0;
		datasetRefFormat.forEach(function(xTopic, xIndex){
			twoDsimMatrix[xIndex] = [];
			xTopic.similarities.forEach(function(similarity, yIndex){
				var xCat = dataModel.topics[xIndex].words.first3words;
				var yCat = dataModel.topics[yIndex].words.first3words;
				if(xCat == yCat) {similarity = 0; diagonal = true} else {diagonal = false}
				var obj = {
					similarity:similarity, 
					xCat:xCat, "yCat":yCat,
					xIndex:xIndex, "yIndex":yIndex,
					diagonal: diagonal,
					active: true //true if still part of clustering process
				}
				oneDsimMatrix[oneDindex] = obj;
				twoDsimMatrix[xIndex][yIndex] = oneDsimMatrix[oneDindex];
				oneDindex++;
			})
		})			
	}
	
	
	
	//================== IMPORTANT do not delete ==================================
	return agglomClusterObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of agglomCluster() declaration	

