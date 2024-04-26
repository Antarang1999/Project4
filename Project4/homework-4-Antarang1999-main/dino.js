const width = 1000;
const height = 600;
var worldmap;


const svg = d3.select('body').append('svg').attr('width',width).attr('height',height);


const projection = d3.geoMercator().scale(140).translate([width / 2 , height / 1.4]);

const path = d3.geoPath(projection);


const g = svg.append('g');

let selectedCountry = null; 

function resetSelectedCountry() {
    if (selectedCountry) {
        d3.select(selectedCountry)
            .transition()
            .duration(500)
            .attr('transform', 'scale(1)'); 
    }
    selectedCountry = null;
}


var dinoData;
var legendSvg;
d3.csv('data.csv').then(function(csv_data) {

  d3.select('.right-svg').remove();

  const rightsvgWidth = 480
  const rightsvgHeight = 600

  const rightSVG = d3.select('body').append('svg')
      .attr('class', 'right-svg')
      .attr('width', rightsvgWidth)
      .attr('height', rightsvgHeight)
      .append('image')
      .attr('xlink:href', 'logo.png') 
      .attr('x', 90) 
      .attr('y', 190) 
      .attr('width',300)
      .attr('height', 300)
      .attr('id','logo') ;


  const dinosaursPerCountry = {};
  dinoData = csv_data ;
  csv_data.forEach(dino => {
      const country = dino.lived_in;
      dinosaursPerCountry[country] = (dinosaursPerCountry[country] || 0) + 1;
  });
  
  const maxCountry = Object.keys(dinosaursPerCountry).reduce((a, b) => dinosaursPerCountry[a] > dinosaursPerCountry[b] ? a : b);
  const maxCount = dinosaursPerCountry[maxCountry];
  const minCount = 0
  console.log(maxCountry);

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then(data => {
  
  
    const countries = topojson.feature(data, data.objects.countries);

    var tooltip= d3.select("body")
    .append("div")
    .attr("class", "tooltip");

    const colorScale = d3.scaleSequential()
    .domain([0, d3.max(countries.features, d => dinosaursPerCountry[d.properties.name] || 0)])
    .interpolator(d3.interpolateRgb("orange", "red")); 

  
    colorLegend(colorScale, maxCount, minCount);

   
    worldmap =  g.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('class', 'country')
                    .attr('d', path)
                    .style('fill', function (country) {
                      const countryName = country.properties.name;
                      return colorScale(dinosaursPerCountry[countryName] || 0);
                  })
                    .on('mouseenter',function(country){
                      d3.select(this).style('stroke','black');

                
                      tooltip.transition()
                      .duration(200)
                      .style("opacity", 1).style("pointer-events", "none");

                      if(typeof dinosaursPerCountry[country.properties.name] === 'undefined' ){
                     
                        dinosaursPerCountry[country.properties.name] = 0 ;
                      }

                    tooltip.html(
                      `<strong>Country:</strong> <strong>${country.properties.name}</strong><br>`  +
                     `<strong>Count:</strong> <strong>${dinosaursPerCountry[country.properties.name]}
                     </strong><br>`                     
                    )
                      .style("left", (event.pageX) + "px")
                      .style("top", (event.pageY - 28) + "px");
                     
                    })
                  
                    .on('mouseleave', function () {
                      d3.select(this).style('opacity', '1').style('stroke','white');
                    
                      const country = d3.select(this);
                      const countryName = country.data()[0].properties.name;
                      country.style('fill', colorScale(dinosaursPerCountry[countryName] || 0));
                      d3.select(this).style('stroke', 'white');
                      tooltip.transition()
                          .duration(500)
                          .style("opacity", 0);
                  })

                    .on('click', function(country) {
                      console.log('name of country : ', country.properties.name);
                      resetSelectedCountry();

                      g.selectAll('.country')
                      .style('display', 'none');

                    selectedCountry = this;
                    

                    const mapBounds = path.bounds(country);
                    const xMin = mapBounds[0][0];
                    const xMax = mapBounds[1][0];
                    const yMin = mapBounds[0][1];
                    const yMax = mapBounds[1][1];
                    
                    const scaleX = width / (xMax - xMin);
                    const scaleY = height / (yMax - yMin);
                    const scale = Math.min(scaleX, scaleY) * 0.9; 
            
                    const center = [
                        (xMin + xMax) / 2,
                        (yMin + yMax) / 2
                    ];

              
                    const tx = width / 2 - center[0] * scale;
                    const ty = height / 2 - center[1] * scale;

                    d3.select(this)
                        .style('display', 'block')
                        .transition()
                        .duration(500)
                        .attr('transform', `translate(${tx},${ty}) scale(${scale})`);

                        countryVizualizer(country.properties.name);
                      
                      

                        const backButtonGroup = svg.append("g")
                          .attr("transform", "translate(10, 10)");

                          legendSvg.remove();
                       
                   
                        backButtonGroup.append("text")
                          .attr("x", 75)
                          .attr("y", 20)
                          .attr("text-anchor", "middle")
                          .attr("fill", "brown")
                          .style("cursor", "pointer")
                          .text("← Back to World Map")
                          .on('click', function() {
                        
                            g.selectAll('.country')
                            .style('display', 'block')
                            .transition()
                            .duration(500);
                             
                            resetSelectedCountry();
      
                    
                            d3.select('.right-svg').remove();

                            backButtonGroup.remove();
                            countryNameOnMap.remove();

                          const rightsvgWidth = 480
                          const rightsvgHeight = 600

                          d3.select('body').append('svg')
                              .attr('class', 'right-svg')
                              .attr('width', rightsvgWidth)
                              .attr('height', rightsvgHeight)
                              .append('image')
                              .attr('xlink:href', 'logo.png') 
                              .attr('x', 90) 
                              .attr('y', 190) 
                              .attr('width', 300)
                              .attr('height', 300)
                              .attr('id','logo'); 
                              
                            colorLegend(colorScale, maxCount, minCount);
                            
                        });


                        const countryNameOnMap = svg.append("g")
                        .attr("transform", "translate(900, 50)");

                        countryNameOnMap.append("text")
                          .attr("x",0)
                          .attr("y", 0)
                          .attr("text-anchor", "middle")
                          .attr("fill", "brown")
                          .style("font-size", "20px") 
                          .text(`${country.properties.name}`)
                        
                    });

                    
  });

})

function countryVizualizer(country){
  d3.select('.right-svg').remove();

  const rightsvgWidth = 480
  const rightsvgHeight = 600

  const rightSVG = d3.select('body').append('svg')
      .attr('class', 'right-svg')
      .attr('width', rightsvgWidth)
      .attr('height', rightsvgHeight);

  console.log('country :', country);
  const selectedCountryData = dinoData.filter(dino => dino.lived_in === country);
  console.log(country);
  console.log(selectedCountryData)
  console.log(selectedCountryData.length)

  if(selectedCountryData != 0 ){ 
  
  const barChart = rightSVG.append('g')
      .attr('transform', 'translate(100, 50)');  
      
      barChart.append('text')
    .attr('x', -80)
    .attr('y', -20)
    .attr('text-anchor', 'start')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Average Length of Dinosaurs in Meters on the basis of Type');

  const avgLengthData = d3.nest()
      .key(dino => dino.type)
      .rollup(values => {  
        const averageLength = d3.mean(values, d => parseLength(d.length));
        return isNaN(averageLength) ? 0 : averageLength;
      })
      .entries(selectedCountryData);


  console.log(avgLengthData);


var tooltip= d3.select("body")
    .append("div")
    .attr("class", "tooltip");

const xScale = d3.scaleLinear()
    .domain([0, d3.max(avgLengthData, d => d.value)])
    .range([0, 200]);  

const yScale = d3.scaleBand()
    .domain(avgLengthData.map(d => d.key))
    .range([0, 180])  
    .padding(0.1)
     

barChart.append('g')
    .call(d3.axisLeft(yScale));

    barChart.selectAll('rect')
    .data(avgLengthData)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', d => yScale(d.key))
    .attr('height', yScale.bandwidth()) 
    .style('fill', 'pink')
    .on('mouseenter', function (d) {
      d3.select(this).attr('opacity',0.5) .style('cursor', 'pointer');;
    
      tooltip.transition()
          .duration(200)
          .style("opacity", 1).style('pointer-events','all')
         
      const filteredData = dinoData.filter(dino => dino.lived_in === country && dino.type === d.key);
      const nameLength = filteredData.map(dino => ({ name: dino.name, length: parseLength(dino.length), link: dino.link }));
  
      const capitalizeFirstLetter = (string) => {
          return string.charAt(0).toUpperCase() + string.slice(1);
      }
  
      
       tooltip.html(
           `<strong>Dinosaur of the type ${capitalizeFirstLetter(d.key)}</strong>  <br>` +
           nameLength.map((dino, index) =>
               `<strong>Name:</strong> ${capitalizeFirstLetter(dino.name)}, <strong>Length:</strong> ${isNaN(dino.length) ? 'Unknown' : dino.length + 'm'},  <a href="${dino.link}" target="_blank">Link</a>`
         
           ).join("<br>")
       );
    
      
         tooltip.style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");


          setTimeout(function() {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          }, 5000);
  })
  
    
      .on('mouseout', function (d) {
        d3.select(this).attr('opacity', 1 ) ; 
       
      })
      .transition() 
      .duration(2000)
      .attr('width', d => xScale(d.value));
      

barChart.selectAll('.bar-label')
    .data(avgLengthData)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('y', d => yScale(d.key) + 17) 
    .text(d => d.value.toFixed(2)) 
    .style('fill', 'black')
    .transition() 
    .duration(2000)
    .attr('x', d => xScale(d.value) + 5);

 
  const pieChart = rightSVG.append('g')
      .attr('transform', 'translate(70, 350)');  

    pieChart.append('text')
  .attr('x', -25)
  .attr('y', -10)  
  .attr('text-anchor', 'start')
  .style('font-size', '16px')
  .style('font-weight', 'bold')
  .text('Distribution of Dinosaurs on the Basis of Diet');

  const dietData = d3.nest()
      .key(dino => dino.diet)
      .entries(selectedCountryData);

  console.log(dietData);
  

  const colorScale = d3.scaleOrdinal()
    .domain(['herbivorous', 'carnivorous', 'omnivorous', 'unknown', 'herbivorous/omnivorous'])
    .range(['green', 'darkred', 'blue', 'grey', 'orange']);

  const pie = d3.pie().value(d => d.values.length);
  const arc = d3.arc().innerRadius(0).outerRadius(100);

    
  const slices = pieChart.selectAll('path')
  .data(pie(dietData))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('transform', 'translate(125, 120)')
  .style('fill', 'transparent') 
  .on('mouseenter', function (d) {
      tooltip.transition()
          .duration(200)
          .style("opacity", 1).style("pointer-events", "none");

      const capitalizeFirstLetter = (string) => {
          return string.charAt(0).toUpperCase() + string.slice(1);
      };
      d3.select(this).attr('opacity', 0.7 ) ;
      
      const filteredData = dinoData.filter(dino => dino.lived_in === country && dino.type === d.key);

    
      const nameLength = filteredData.map(dino => ({ name: dino.name, length: parseLength(dino.length) }));

      tooltip.html(
                 `<strong>Diet: ${capitalizeFirstLetter(d.data.key)} </strong> <br><strong>Number of Dinosaurs: ${d.data.values.length}</strong> `)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
  })
  .on('mouseout', function (d) {
    d3.select(this).attr('opacity', 1 ) ;
      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  });


  slices.transition()
  .duration(900) 
  .delay((d, i) => i * 300)
  .style('fill', d => colorScale(d.data.key));

  const legend = rightSVG.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(330, 80)');  

  const legendItems = legend.selectAll('.legend-item')
      .data(['herbivorous', 'carnivorous', 'omnivorous', 'unknown', 'herbivorous/omnivorous'])
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${300 + i * 20})`);

  legendItems.append('circle')
      .attr('cx', 9)
      .attr('cy', 9)
      .attr('r', 9)
      .style('fill', d => colorScale(d));

  legendItems.append('text')
      .attr('x', 25)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text(d => d);

    }

    else{

      rightSVG.append('text')
      .attr('x', rightsvgWidth/2)
      .attr('y', rightsvgHeight/2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Looks like you will be the first one`)
      .append('tspan')
      .attr('x', rightsvgWidth / 2)
      .attr('dy', '1.2em') 
      .text(`to discover dinosaur fossils in ${country}`);

    }
}

function parseLength(lengthString) {
  return parseFloat(lengthString.replace('m', ''));
}

function colorLegend(colorScale, maxCount, minCount ){
     
  const legendG = svg.append("g")
  .attr("transform", "translate(20 ,540)"); 
  
  
  const legendWidth = 200;
  const legendHeight = 20;
  const legendMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  
  
   legendSvg = legendG.append("svg")
  .attr("width", legendWidth + legendMargin.left + legendMargin.right)
  .attr("height", legendHeight + legendMargin.top + legendMargin.bottom);
  
  const defs = legendSvg.append("defs");
  
  const linearGradient = defs.append("linearGradient")
  .attr("id", "legend-gradient")
  .attr("x1", "0%")
  .attr("x2", "100%");
  
  linearGradient.append("stop")
  .attr("offset", "0%")
  .style("stop-color", colorScale(0));
  
  linearGradient.append("stop")
  .attr("offset", "100%")
  .style("stop-color", colorScale(maxCount)); 

  legendSvg.append("rect")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("fill", "url(#legend-gradient)")
  .attr("transform", `translate(${legendMargin.left},${legendMargin.top})`)
  .transition()
  .duration(2000);;
  
  legendSvg.append("text")
  .attr("class", "legend-label")
  .attr("x", 0)
  .attr("y", legendHeight + legendMargin.top * 2)
  .text(`Min: ${minCount}`)
  .style('font-size','14px')
  .transition()
  .duration(2000);
  
  
  legendSvg.append("text")
  .attr("class", "legend-label")
  .attr("x", legendWidth - 30)
  .attr("y", legendHeight + legendMargin.top * 2)
  .text(`Max: ${maxCount}`)
  .style('font-size','14px');

    }