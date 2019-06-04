import { Component, Prop, State, Listen, EventEmitter, Event } from '@stencil/core';
import * as d3 from "d3";
import * as clTree from './clusteringTree';

@Component({
  tag: 'genomic-card',
  styleUrl: 'my-component.css',
  shadow: false
})
export class MyComponent {
// *************************** PROPERTY & CONSTRUCTOR ***************************
  @State() show_data: any;
  @State() allSgrna: string[];
  @State() genomeRef: string[];

  @State() orgSelected:string;
  @State() refSelected:string;
  @State() sgrnaSelected:string;
  @State() sizeSelected:number=3000000;

  @Prop() org_names: string;
  @Prop() height_svg: number;
  @Prop() width_svg: number;
  @Prop() all_data: string;


  constructor() {
    this.handleChangeOrg = this.handleChangeOrg.bind(this);
    this.handleChangeRef = this.handleChangeRef.bind(this);
    this.handleChangeSgrna = this.handleChangeSgrna.bind(this);
    this.emitOrgChange = this.emitOrgChange.bind(this);
    this.emitRefChange = this.emitRefChange.bind(this);
    this.emitSgrnaChange = this.emitSgrnaChange.bind(this);
    this.generatePlot = this.generatePlot.bind(this);
    // this.displayPlot = this.displayPlot.bind(this);
    this.generateGenomicCard = this.generateGenomicCard.bind(this);
  }


// *************************** CLICK ***************************
  @Listen('changeOrgCard')
  handleChangeOrg(event: CustomEvent) {
    this.orgSelected= event.detail;
    let all_data = JSON.parse(this.all_data);
    this.genomeRef = Object.keys(all_data[this.orgSelected]);
    this.refSelected = this.genomeRef[0];
    this.show_data = all_data[this.orgSelected][this.refSelected];
    this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);
    const test = new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
    console.log(test);
    console.log(`CLICK on ${this.orgSelected}`);
  }

  @Listen('changeRefCard')
  handleChangeRef(event: CustomEvent) {
    this.refSelected = event.detail;
    let all_data = JSON.parse(this.all_data);
    this.show_data = all_data[this.orgSelected][this.refSelected];
    this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);
    const test = new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
    console.log(test);
  }

  @Listen('changeSgrnaCard')
  handleChangeSgrna(event: CustomEvent) {
    this.sgrnaSelected = event.detail;
  }

  @Event() changeOrgCard: EventEmitter;
  emitOrgChange(event: Event){
    let val = (event.currentTarget as HTMLElement).innerText;
    this.changeOrgCard.emit(val);
  }

  @Event() changeRefCard: EventEmitter;
  emitRefChange(event: Event){
    let val = (event.currentTarget as HTMLOptionElement).value;
    this.changeRefCard.emit(val);
  }

  @Event() changeSgrnaCard: EventEmitter;
  emitSgrnaChange(event: Event){
    let val = (event.currentTarget as HTMLOptionElement).value;
    this.changeSgrnaCard.emit(val);
  }


// *************************** GENOMIC CARD ***************************
  componentDidLoad() {
    this.newMethod();
  }

  private newMethod() {
    DisplayGenome();
  }

  generateGenomicCard() {
    DisplayGenome();
    if (this.sgrnaSelected == undefined || this.sgrnaSelected == '') { return;}

    console.log("Loaded")
    var sizeGenome = this.sizeSelected;
    let data = [];
    let dataOneSgrna = this.show_data[this.sgrnaSelected]
    for (var i in dataOneSgrna) {
      data[i] = {}
      data[i].direction = dataOneSgrna[i].match('[+-]')[0];
      data[i].start = /\(([0-9]*),/.exec(dataOneSgrna[i])[1];
      data[i].sgRNA = this.sgrnaSelected;
    }
    // Div for the box containing coordinates
    let div = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
    // Generator arc for one sgRNA
    let pathSgRNA = d3.arc()
      .innerRadius(205)
      .outerRadius(220);

    // Draw sgRNA
    d3.select('svg')
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
        div.transition()
          .duration(500)
          .style('opacity', '.9');
        div.html('<b>' + d.sgRNA + '</b></br>' + ' &nbsp;&nbsp; <i class="fas fa-map-signs"></i> &nbsp; Direction : ' + d.direction + '</br>' +
                 ' &nbsp;&nbsp; <i class="fas fa-play"></i> &nbsp; Start : ' + d.start + '</br>' +
                 ' &nbsp;&nbsp; <i class="fas fa-hand-paper"></i> &nbsp; Stop : ' + (+d.sgRNA.length + +d.start))
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY) + 'px');
      })
      // When mouse is out, hide the box
      .on('mouseout', () => {
        div.transition()
          .duration(500)
          .style('opacity', 0);
      })
      ;
      // Add the arc for the sgRNA
      // The animation to place sgRNA
      function arcFunction(datum){
        let end: number = +datum.sgRNA.length + +datum.start;
        datum.startAngle = 2*Math.PI * datum.start * (1/sizeGenome);
        let endAngle = 2*Math.PI * end * (1/sizeGenome)  ;
        datum.endAngle = (Math.abs(endAngle - datum.startAngle) < 0.01) ? endAngle + 0.01 : endAngle;
        console.log(datum.startAngle + '    FIN:    ' + datum.endAngle);
        return d3.select(this)
                .transition()
                  .ease(d3.easeBackInOut)
                  .duration(600)
                  .attr('d', pathSgRNA)
                  .attr('transform', 'translate(400, 290)')
      }
  }


// *************************** SUNBURST **************************
  generatePlot() {
    d3.select('.sunburst').remove();
    const treeClustering = new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
    const root = d3.partition().size([2*Math.PI, 466])(d3.hierarchy(treeClustering.root).sum(() => 5));
    console.log(treeClustering)
    let maxChild = Math.max(...treeClustering.root['children'].map(o => {console.log(o.weight); return o.weight}));
    console.log('Max children ' + maxChild);
    const arc =d3.arc()
        .startAngle(d =>  d['x0'])
        .endAngle(d => d['x1'])
        .padAngle(d => Math.min((d['x1'] - d['x0']) / 2, 0.005))
        .padRadius(466 / 2)
        .innerRadius(d => d['y0'])
        .outerRadius(d => d['y1'] - 1);

    const color = d3.scaleQuantize()
              // RECHERCHER L ENFANT AVEC LE POIDS MAXIMAL CAR LE ROOT ADITIONNE TOUS LES POIDS
              // --> si fait cela, il n'y aura pas de couleur pour les poids à la racine
              .domain([0, maxChild])
              // @ts-ignore
              .range(['#F7FACE', '#E0F6BF', '#C1F2B0', '#A3EDAA', '#96E7B9', '#8BE0CD', '#80CDD8', '#6DA7C3', '#5B81AD', '#4A5E95', '#3A3E7D']);
    const svg = d3.select('body')
                  .append('svg')
                  .style('height', this.height_svg)
                  .style('width', this.width_svg)
                  .attr('class', 'sunburst');

    svg.append('g')
        .attr('fill-opacity', 0.6)
        .selectAll('path')
        .data(root.descendants().filter(d => d.depth > 0))
        .enter().append('path')
          .attr('fill',d => {return color(d.data['weight'])})
          // @ts-ignore
          .attr('d', arc)
          .attr('transform', 'translate(300, 450)')
          .append('title')
            .text(d => d.weight);

    svg.append("g")
    .attr('transform', 'translate(300, 450)')
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants().filter(d => d.depth > 0 && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
      .enter().append("text")
        .attr("transform", function(d) {
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
          const y = (d.y0 + d.y1) / 2;
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
        }//for i

        //Create the gradient
        svg.append("defs")
        	.append("linearGradient")
        	.attr("id", "legend-weather")
        	.attr("x1", "0%").attr("y1", "0%")
        	.attr("x2", "100%").attr("y2", "0%")
        	.selectAll("stop")
        	.data(d3.range(numStops))
        	.enter().append("stop")
        	.attr("offset", function(d,i) { return tempScale( tempPoint[i] )/12; })
        	.attr("stop-color", function(d,i) { return color( tempPoint[i] ); });

        ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Draw the legend ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    var legendWidth = Math.min(200, 400);

    //Color Legend container
    var legendsvg = svg.append("g")
    	.attr("class", "legendWrapper")
    	.attr("transform", "translate(" + 200 + "," + (100 + 70) + ")");

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


// *************************** DISPLAY ***************************
  render() {
    console.log("render called");
    let tabOrgName = this.org_names.split("&");

    let styleDisplay: string[], all_data;
    if (this.all_data == undefined) {
      styleDisplay = ['block', 'none'];
    } else {
      styleDisplay = ['none', 'block'];
      all_data = JSON.parse(this.all_data);

      if (this.orgSelected == undefined) {
        this.orgSelected = tabOrgName[0];
        this.genomeRef = Object.keys(all_data[this.orgSelected]);
        this.refSelected = this.genomeRef[0];
        this.show_data = all_data[this.orgSelected][this.refSelected];
        this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);
      }
    }

    let displayLoad=styleDisplay[0], displayGenomeCard=styleDisplay[1];

    return ([
      <div style={{display: displayLoad}}>
        <strong> Loading ... </strong>
        <div class="spinner-grow text-info" role="status"></div>
      </div>,

      /* ************************************************************* */
      /* ************* Main component with menu and card ************* */
      /* ************************************************************* */

      /* ************* Menu ************* */
      <div class="main-genome-card" style={{display: displayGenomeCard}}>
         {/* ************* Tab menu *************  */}
        <ul class="nav nav-tabs" id="myTab" role="tablist">
        {tabOrgName.map(name => {
          let classTag: string="nav-link", bool: string="false";
          if (name == this.orgSelected) {
            classTag = "nav-link active";
            bool = "true";
          }
          return <li class="nav-item"> <a class={classTag} data-toggle="tab" role="tab" aria-selected={bool} href="#" onClick={this.emitOrgChange}> {name} </a> </li>
        })}
        </ul>
        {/* ************* Menu for References and sgRNA ************* */}
        <div class="tab-content genomeGraph" id="myTabContent" >
          <div class="select-menu">
            <span>References</span>
            <select class="custom-select" onChange={e => this.emitRefChange(e)}>
              {this.genomeRef.map(ref => <option>{ref}</option>)}
            </select>
          </div>

          <div class="select-menu">
            <span>sgRNA</span>
            <select class="custom-select" onChange={e => this.emitSgrnaChange(e)}>
              <option>  </option>
              {this.allSgrna.map(sgRna => <option>{sgRna}</option>)}
            </select>
          </div>

           {/* ************* Card *************  */}
          <svg id='displayGenomicCard' width={this.width_svg} height={this.height_svg}>
            {this.generateGenomicCard()}
            <text transform= 'translate(370, 300)'> {this.sizeSelected} pb </text>
          </svg>

           {/* ************* Plot *************  */}
           {this.generatePlot()}

        </div>
      </div>,
      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>,
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>,
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
])
  }
}

// Display the entire blue circle
function DisplayGenome () {
  // Clean all arc
  d3.select('#displayGenomicCard').selectAll('g').remove();
  let arcGenerator = d3.arc();
  // Generator arc for the complete genome
  let pathGenome = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
    innerRadius: 190,
    outerRadius: 200
  })
  // Draw the complete genome
  d3.select('svg')
    .append("g")
    .append('path')
    .attr('d', pathGenome)
    .attr('transform', 'translate(400, 290)')
    .style('fill', 'steelblue');
}
