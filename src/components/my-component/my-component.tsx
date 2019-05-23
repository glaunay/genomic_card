import { Component, Prop, State, Listen, EventEmitter, Event } from '@stencil/core';
import * as d3 from "d3";

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
  @State() plotArray: any;

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
    this.displayPlot = this.displayPlot.bind(this);
    this.generateGenomicCard = this.generateGenomicCard.bind(this);
  }


// *************************** CLICK ***************************
  @Listen('changeOrgCard')
  handleChangeOrg(event: CustomEvent) {
    this.orgSelected= event.detail;
    this.refSelected = undefined;
    console.log(`CLICK on ${this.orgSelected}`);
  }

  @Listen('changeRefCard')
  handleChangeRef(event: CustomEvent) {
    this.refSelected = event.detail;
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

  generatePlot() {
    let plotArray = new Array(this.sizeSelected).fill(0);
    for (var i in this.show_data) {

      this.show_data[i].forEach(coord => {
        let start = (/\(([0-9]*),/.exec(coord)[1] as unknown as number);
        let end = (/,([0-9]*)\)/.exec(coord)[1] as unknown as number);

        plotArray.slice(start -1, end).forEach(function(part, index) {
          this[index] = part + 1;
        }, plotArray);
      })
    }
    plotArray.forEach(function(part, index) {
      this[index] = [part, index + 1];
    }, plotArray);
    console.log("******* Plot *******")
    this.plotArray = plotArray;
    console.log(plotArray);
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
                  .attr('transform', 'translate(400, 240)')
      }
  }


// *************************** DISPLAY ***************************

  displayPlot() {
    var margin = {top: 30, right: 30, bottom: 30, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    d3.select('#densityPlot')
        .selectAll('g').remove()
     let svg = d3.select('#densityPlot')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                .append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleLinear()
              .domain([0, this.sizeSelected])
              .range([0, width]);
    svg.append('g')
       .attr('transform', 'translate(0, ' + height + ')')
       .call(d3.axisBottom(x));

    let y = d3.scaleLinear()
              .domain([0, 4])
              .range([height, 0]);
    svg.append('g')
       .call(d3.axisLeft(y));


    svg.append('path')
       .attr('class', 'mypath')
       .datum(this.plotArray)
       .attr('fill', '#69b3a2')
       .attr('opacity', '.8')
       .attr('stroke', '#000')
       .attr('stroke-width', 1)
       .attr('stroke-linejoin', 'round')
       .attr('d', d3.line()
        .curve(d3.curveBasis)
          .x( (d) => {return x(d[1]);})
          .y( (d) => {return y(d[0]);})
        );
  }


  // displayPlot() {
  //   var margin = {top: 10, right: 10, bottom: 10, left: 10},
  //       width = 460 - margin.left - margin.right,
  //       height = 460 - margin.top - margin.bottom,
  //       innerRadius = 340,
  //       outerRadius = Math.min(width, height);
  //
  //   d3.select('#densityPlot')
  //       .selectAll('g').remove()
  //    let svg = d3.select('#densityPlot')
  //                 .attr('width', width + margin.left + margin.right)
  //                 .attr('height', height + margin.top + margin.bottom)
  //               .append('g')
  //                 .attr("transform", "translate(" + width / 2 + "," + ( height/2+100 )+ ")"); // Add 100 on Y translation, cause upper bars are longer
  //
  //   var x = d3.scaleLinear()
  //        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
  //        .domain( [0, 6] ); // The domain of the X axis is the list of states.
  //
  //  var y = d3.scaleLinear()
  //        .range([innerRadius, outerRadius])   // Domain will be define later.
  //        .domain([0, 4]); // Domain of Y is from 0 to the max seen in the data
  // let test = [[12, 1], [10, 2], [15, 3], [3, 4], [2, 5], [10, 6]];
  //  svg.append("g")
  //     .selectAll("path")
  //     .data(test)
  //     .enter()
  //     .append("path")
  //       .attr("fill", "#69b3a2")
  //       .attr("d", d3.arc()     // imagine your doing a part of a donut plot
  //           .innerRadius(innerRadius)
  //           .outerRadius(function(d) { return y(d[0]); })
  //           .startAngle(function(d) { return x(d[1]); })
  //           .endAngle(function(d) { return x(d[1]); })
  //           .padAngle(0.01)
  //           .padRadius(innerRadius))
  // }


  render() {
    console.log("render called");
    let tabOrgName = this.org_names.split("&");
    if (this.orgSelected == undefined) this.orgSelected = tabOrgName[0];

    let styleDisplay = (this.all_data == undefined) ? ['block', 'none'] : ['none', 'block'];
    let displayLoad=styleDisplay[0], displayGenomeCard=styleDisplay[1];
    let all_data = JSON.parse(this.all_data);

    this.genomeRef = Object.keys(all_data[this.orgSelected]);
    if (this.refSelected == undefined) this.refSelected = this.genomeRef[0];
    this.show_data = all_data[this.orgSelected][this.refSelected];
    this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);

    if (this.plotArray == undefined) this.generatePlot();


    return ([
      // @ts-ignore
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />,
      // @ts-ignore
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous" />,
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
            <text transform= 'translate(370, 250)'> {this.sizeSelected} pb </text>
          </svg>

           {/* ************* Plot *************  */}
          <svg id='densityPlot'> {this.displayPlot()}</svg>

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
    .attr('transform', 'translate(400, 240)')
    .style('fill', 'steelblue');
}
