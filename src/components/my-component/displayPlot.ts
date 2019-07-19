import * as clTree from './clusteringTree';
import * as d3 from "d3";


/**
* Display the genome by a blue circle
* @param {number} sizeCircle Size of the circle
* @param {Object} data Data in dictionary with keys and list as values
* @param {number} diagonalSVG Size in pixel of the svg
* @param {HTMLElement} pathDiv HTMLElement where the svg must be added
* @param {number} coloredSection Index of the section which must be colored
* @param {boolean} sendLimits_bool Send or not the subdata in the selected section with limits
* @returns {Object} The svg node
*/
export function generateSunburst(sizeCircle:number, data:Object, diagonalSVG:number, pathDiv:HTMLElement, coloredSection:number, sendLimits_bool=false ):Object {
  const options = {
    sizeCircle: sizeCircle,
    data: data,
    diagonalSVG: diagonalSVG,
    pathDiv: pathDiv,
    coloredSection: coloredSection,
    sendLimits_bool: sendLimits_bool
  }

  // raw tree clustering sequences and sections
  const treeClustering = new clTree.TreeClustering(options.sizeCircle, options.data, 4, 7);
  const radius = options.diagonalSVG*10/100 + options.diagonalSVG*15/100, padInnerRadius = options.diagonalSVG*10/100 + options.diagonalSVG*10/100;
  // root of the treeClustering hierarchical
  const root = d3.partition().size([2*Math.PI, radius])(d3.hierarchy(treeClustering.root).sum((d) => d['niv']));
  // Find the maximum number of sequences in a section for the color scale
  let maxChild = Math.max(...treeClustering.root['children'].map(o => {return o.weight}));
  const arc =d3.arc()
              .startAngle(d =>  d['x0'])
              .endAngle(d => d['x1'])
              .padAngle(d => Math.min((d['x1'] - d['x0']) / 2, 0.005))
              .padRadius(radius / 2)
              .innerRadius(d => d['y0'] + padInnerRadius)
              .outerRadius(d => d['y1'] - 1 + padInnerRadius);

  const color = d3.scaleQuantize()
                  .domain([0, maxChild])
                  // @ts-ignore
                  .range(['#F7FACE', '#E0F6BF', '#C1F2B0', '#A3EDAA', '#96E7B9', '#8BE0CD', '#80CDD8', '#6DA7C3', '#5B81AD', '#4A5E95', '#3A3E7D']);

  const svg = d3.select(options.pathDiv);

  function findSgrnaChildren(list_children:Object):string[] {
    let allSgrna: string[] = [];

    for (var i in list_children){
      // Il y a des enfants
      if(list_children[i].hasOwnProperty('children')) {
        allSgrna = [... new Set([...findSgrnaChildren(list_children[i].children) , ...allSgrna])];
        // Il n'y a plus d'enfants, mais il y a des données
      } else if (list_children[i].data.children != {}){
        allSgrna = [... new Set([...Object.keys(list_children[i].data.children) , ...allSgrna])];
      }
      // Sinon rien à ajouter
    }
    return allSgrna;
  }

  // Section
  svg.append('g')
      .attr('class', 'sunburst')
      .attr('fill-opacity', 0.6)
      .selectAll('path')
      .data(root.descendants().filter(d => d.depth > 0))
      .enter().append('path')
        .attr('fill',(d, i) => {
          if(options.coloredSection == -1) {
            // Specific color for zero
            if (d.data['weight'] == 0) {
              return "rgba(226, 210, 186, 0.46)";
            }else {
              return color(d.data['weight']);
            }
          } else if (i == options.coloredSection){
            return "rgba(78, 195, 236, 0.9)";
          } else {
            return "rgba(226, 210, 186, 0.46)";
          }
        })
        // @ts-ignore
        .attr('d', arc)
        .attr('transform', 'translate(' + options.diagonalSVG/2 + ', ' + options.diagonalSVG/2 + ')')
        .on("click", (d, i) => {
          let uniqSgrna:string[];
          if(d.hasOwnProperty('children')) {
            uniqSgrna= findSgrnaChildren(d.children);
          } else   {
            uniqSgrna = Object.keys(d.data.children);
          }

          var event = new CustomEvent('sectionSelected', {detail : {sgRNA: uniqSgrna, section: i}});
          window.dispatchEvent(event)

          if(options.sendLimits_bool){
            let subData={};
            Object.keys(options.data).forEach(e => {
              if(uniqSgrna.includes(e)){
                subData[e] = options.data[e];
              }
            });
            var eventSG = new CustomEvent('sectionSelectedSG', {detail : {sgRNA: subData, min: parseFloat(d.data.min), max:parseFloat(d.data.max)}});
            window.dispatchEvent(eventSG)
          }
        });

  // Text
  svg.append("g")
      .attr('transform', 'translate(' + options.diagonalSVG/2 + ', ' + options.diagonalSVG/2 + ')')
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
        .data(root.descendants().filter(d => d.depth > 0 && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
        .enter().append("text")
          .attr("transform", function(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 + padInnerRadius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
          })
          .attr("dy", "0.35em")
          .text(d => d.data['weight']);

  ///////////////////////////////////////////////////////////////////////////
  //////////////// Create the gradient for the legend ///////////////////////
  ///////////////////////////////////////////////////////////////////////////

  //Extra scale since the color scale is interpolated
  var tempScale = d3.scaleLinear()
                    .domain([0, maxChild])
                    .range([0, 11]);

  //Calculate the variables for the temp gradient
  var numStops = 10;
  let tempRange = tempScale.domain();
  tempRange[2] = tempRange[1] - tempRange[0];
  let tempPoint = [];
  for(var i = 0; i < numStops; i++) {
    tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
  }

  //Create the gradient
  svg.append("defs")
    .append("linearGradient")
    .attr("id", "legend-weather")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop")
      .data(d3.range(numStops))
      .enter().append("stop")
        // @ts-ignore
        .attr("offset", function(d,i) { return tempScale( tempPoint[i] )/12; })
        // @ts-ignore
        .attr("stop-color", function(d,i) { return color( tempPoint[i] ); });

  ///////////////////////////////////////////////////////////////////////////
  ////////////////////////// Draw the legend ////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  var legendWidth = Math.min(200, 400);

  //Color Legend container
  var legendsvg = svg.append("g")
    .attr("class", "legendWrapper")
    .attr("transform", "translate(" + 130 + "," + 30 + ")");

  //Draw the Rectangle
  legendsvg.append("rect")
    .attr("class", "legendRect")
    .attr("x", -legendWidth/2)
    .attr("y", 0)
    .attr("rx", 8/2)
    .attr("width", legendWidth)
    .attr("height", 8)
    .style("fill", "url(#legend-weather)");

  //Append title
  legendsvg.append("text")
    .attr("class", "legendTitle")
    .attr("x", 0)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .text("Color scale ");

  //Set scale for x-axis
  var xScale = d3.scaleLinear()
     .range([-legendWidth/2, legendWidth/2])
     .domain([0,maxChild] );

  //Define x-axis
  var xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat( (d) => {return d + ""});
  //Set up X axis
  legendsvg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (10) + ")")
      .call(xAxis);
  return svg.node();
}


/**
* Display the genome by a blue circle
* @param {function} Function to display the inside circle
* @param {number} diagonalSVG Size in pixel of the svg
* @param {number} sizeCircle Size of the circle
* @param {ShadowRoot} pathDiv HTMLElement where the svg must be added
* @param {Object} dataSticks Dicitonary to create sticks
* @param {string} labelSticks Label of sticks represented
*/
export function generateGenomicCard(DisplayGenome:Function, diagonalSVG:number, sizeCircle:number, pathDiv:ShadowRoot, dataSticks:Object, labelSticks:string):void {
  let width = diagonalSVG, height = diagonalSVG;
  DisplayGenome(pathDiv, width, height);
  var sizeGenome = sizeCircle;
  let data = [];
  for (var i in dataSticks) {
    data[i] = {};
    data[i].direction = dataSticks[i].match('[+-]')[0];
    data[i].start = /\(([0-9]*),/.exec(dataSticks[i])[1];
    data[i].sgRNA = labelSticks;
  }
  // Div for the box containing coordinates
  let div = d3.select(pathDiv.querySelector(".genomeGraph"))
  .append('div')
  .attr('class', 'tooltip-coord')
  // .style('tooltip', 0)
  .style("position", "absolute")
  .style("display", "none");
  // Generator arc for one sgRNA
  let pathSgRNA = d3.arc()
    .innerRadius(width*15/100 + width*2/100)
    .outerRadius(width*15/100 + width*3.5/100);

  // Draw sgRNA
  d3.select(pathDiv.querySelector('svg'))
    .append('g')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    // Draw and add animation for sgRNA
    .each(arcFunction)
    .style('fill', 'red')
    // When mouse is over the sgRNA, show the box
    .on('mouseover', (d) => {
      div.style("display", "block");

      div.transition()
        .duration(500)
        // .style('opacity', '.9');
      div.html('<b>' + d.sgRNA + '</b></br>' + ' &nbsp;&nbsp; <i class="material-icons">directions</i> &nbsp; Direction : ' + d.direction + '</br>' +
               ' &nbsp;&nbsp; <i class="material-icons">play_arrow</i> &nbsp; Start : ' + d.start + '</br>' +
               ' &nbsp;&nbsp; <i class="material-icons">stop</i> &nbsp; Stop : ' + (+d.sgRNA.length + +d.start))
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY) + 'px');
    })
    // When mouse is out, hide the box
    .on('mouseout', () => {
      div.transition()
        .duration(50000)
        .style('display', "none");
    })
    ;
  // Add the arc for the sgRNA
  // The animation to place sgRNA
  function arcFunction(datum){
    let end: number = +datum.sgRNA.length + +datum.start;
    datum.startAngle = 2*Math.PI * datum.start * (1/sizeGenome);
    let endAngle = 2*Math.PI * end * (1/sizeGenome)  ;
    datum.endAngle = (Math.abs(endAngle - datum.startAngle) < 0.01) ? endAngle + 0.01 : endAngle;
    return d3.select(this)
            .transition()
              .ease(d3.easeBackInOut)
              .duration(600)
              .attr('d', pathSgRNA)
              .attr('transform', `translate( ${width / 2} , ${height / 2})`);
  }
}
