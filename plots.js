function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
   console.log("data", data);
   
    var sampleNames = data.names;
    console.log("sample names", sampleNames);
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
   
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected

  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
   
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sampleData = data.samples;
    var headerData = data.metadata;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
     //  5. Create a variable that holds the first sample in the array.

    // create variable to store otu_id, otu_labels, samples
    var resultArray = sampleData.filter(sampleObj => sampleObj.id == sample);
    var selectionResult = resultArray[0];

    // capture metadata header to get wash frequency for gauge chart
    var headerArray = headerData.filter(sampleObj => sampleObj.id == sample);
    var washFreq = headerArray[0].wfreq;
   
// Slice arrays to capture only top 10 results for bar & bubble charts    
  slicedResult = selectionResult.sample_values.map(samplevals => selectionResult.sample_values);
  slicedIds = selectionResult.otu_ids.map(samplevals => selectionResult.otu_ids);
  slicedLabels = selectionResult.otu_labels.map(samplevals => selectionResult.otu_labels);

// reverse the arrays to display bar chart correctly
  values = slicedResult[0];
  ids = slicedIds[0];
  sample_labels = slicedLabels[0];

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
// Get tp[ 10 for bar chart
  topTenValues = values.slice(0,10).reverse();
  topTenIds = ids.slice(0,10).reverse();
  topTenLables = sample_labels.slice(0,10).reverse();
  var yticks = ids.map(String).reverse();


    // 8. Create the trace for the bar chart. 
  var barData = [{
      x: topTenValues,
 //     y: yticks,
      type: 'bar',
      orientation: 'h',
      hovertext: sample_labels 
     },
    ];
      
    // 9. Create the layout for the bar chart. 
  var barLayout = { 
      title: "Top 10 Cultures Found",
     
      "titlefont": { 
        "size":28,
        "color": "black",
    },
      hovermode: "closest",
      hoverlabel: { bgcolor: "lightblue"},
      yaxis: {
        tickmode: "Array",
        tickvals: yticks,
        showticklablel: "True",
        tickprefix: "OTU ID",
      },
       xaxis: {
        gridcolor:"black"
       }
     
    };
    // 10. Use Plotly to plot the data with the layout. 
Plotly.newPlot("bar", barData, barLayout);

 // 1. Create the trace for the bubble chart.
 var trace = {
    x:ids,
    y:values,
    mode: 'markers',
    text: sample_labels,
    marker: { 
      size: values,
      color: ids,
      line: {
        color: "black",
        width: 1
      } 
    }

 };
 
 var bubbleData = [trace];

 // 2. Create the layout for the bubble chart.
 var bubbleLayout = {
   title: "Bacteria Cultures Per Sample",
   plot_bgcolor:"d9d9db",
   hovermode: "closest",
   hoverlabel: { bgcolor:"lightblue"},
   "titlefont":{ "size":30 },
   xaxis: {
    title: "OTU ID",
    gridcolor:"gray",
    griddash: "dot"
   },
   yaxis: {
    gridcolor:"ff335a",
    griddash: "solid"
   }

 };

 // 3. Use Plotly to plot the data with the layout.
 Plotly.newPlot("bubble", bubbleData, bubbleLayout); 


 // Build gauge chart


 var trace1 =  {
    domain: {x:[0,1], y:[0,1]}, 
    value: washFreq,
    title: { text: "Scrubs per Week"},
    type: "indicator",
    mode: "gauge+number",
    bgcolor: "lightgray",
//    delta: { reference: 2 },
    gauge: {
      axis: { range: [null, 10],
               ticklabelstep: 2,
               ticks: "outside",
               tickmode: "linear",
               dtick: 2,
               tickcolor: "black"},
      bar: { color: "black"},
      steps: [
        { range: [0, 2], color: "red"},
        { range: [2, 4], color: "orange"},
        { range: [4, 6], color: "yellow"},
        { range: [6, 8], color: "lightgreen"},
        { range: [8,10], color: "green"}
      ],

    }
 };
  var gaugeData = [trace1];

  var gaugeLayout = {
    title: "Belly Button Wash Frequency",
    "titlefont": { "size":25}, 

  };
  Plotly.newPlot("gauge", gaugeData, gaugeLayout); 

  });
}
