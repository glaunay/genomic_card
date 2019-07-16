import { Component, Prop, State, Listen, EventEmitter, Event, Element, h } from '@stencil/core';
import * as d3 from "d3";
import * as clTree from './clusteringTree';

@Component({
  tag: 'genomic-card',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
// *************************** PROPERTY & CONSTRUCTOR ***************************
  @Element() private element: HTMLElement;

  @State() show_data: any;
  @State() allSgrna: string[] = [];
  @State() genomeRef: string[];

  @State() subSgrna: string[];
  @State() selectedSection = -1;

  @State() orgSelected:string;
  @State() refSelected:string;
  @State() sgrnaSelected:string;
  @State() sizeSelected:number=4518734;

  @Prop() org_names: string;
  @Prop() diagonal_svg: number;
  @Prop() all_data: string;
  @Prop() gene: string;


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
    this.subSgrna = undefined;
    this.selectedSection = -1;
    new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
    console.log(`CLICK on ${this.orgSelected}`);
  }

  @Listen('changeOrgRefSgrna', { target: 'window' })
  handleChangeOrgRefSgrna(event: CustomEvent) {
    var tmp_name = event.detail.axis.split("$");
    this.orgSelected = tmp_name[0];
    this.refSelected = tmp_name[1];
    this.sgrnaSelected = event.detail.sgrna;
    this.subSgrna = undefined;
    this.selectedSection = -1;
    let all_data = JSON.parse(this.all_data);
    this.genomeRef = Object.keys(all_data[this.orgSelected]);
    this.show_data = all_data[this.orgSelected][this.refSelected];
    this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);
    new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
  }

  @Listen('changeRefCard')
  handleChangeRef(event: CustomEvent) {
    this.refSelected = event.detail;
    let all_data = JSON.parse(this.all_data);
    this.show_data = all_data[this.orgSelected][this.refSelected];
    this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);
    this.subSgrna = undefined;
    this.selectedSection = -1;
    new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
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

  @Event() sgDataSection: EventEmitter;
  emitsgData(event: Object, min:number, max:number){
    let geneParsed = JSON.parse(this.gene);
    let geneOnSection = [];
    geneParsed[this.orgSelected][this.refSelected].forEach(gene => {
      if((parseInt(gene.start) >= min && parseInt(gene.start) <= max) ||
         (parseInt(gene.end) >= min && parseInt(gene.end) <= max)){
        geneOnSection.push(gene);
      }
    })
    let msg = {allSgrna: JSON.stringify(event),
               gene: JSON.stringify(geneOnSection)}
    this.sgDataSection.emit(msg);
  }

// *************************** GENOMIC CARD ***************************
  componentDidUpdate() {
    this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
      this.subSgrna = undefined;
      this.selectedSection = -1;
      this.sgrnaSelected = undefined;
    })
    this.styleHelp(".genomeCircle>path", ".help-gen");
    this.styleHelp(".sunburst>path", ".help-section");
  }

  componentDidLoad() {
    DisplayGenome(this.element.shadowRoot, this.diagonal_svg, this.diagonal_svg);
    this.generatePlot();
    if(this.element.shadowRoot.querySelector('.genomeCircle') != null) {
      this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
        this.subSgrna = undefined;
      })
    }
    this.styleHelp(".genomeCircle>path", ".help-gen");
    this.styleHelp(".sunburst>path", ".help-section");
  }


  generateGenomicCard() {
    let width = this.diagonal_svg, height = this.diagonal_svg;
    DisplayGenome(this.element.shadowRoot, width, height);
    if (this.sgrnaSelected == undefined || this.sgrnaSelected == '') { return;}
    var sizeGenome = this.sizeSelected;
    let data = [];
    let dataOneSgrna = this.show_data[this.sgrnaSelected];
    for (var i in dataOneSgrna) {
      data[i] = {};
      data[i].direction = dataOneSgrna[i].match('[+-]')[0];
      data[i].start = /\(([0-9]*),/.exec(dataOneSgrna[i])[1];
      data[i].sgRNA = this.sgrnaSelected;
    }
    // Div for the box containing coordinates
    let div = d3.select(this.element.shadowRoot.querySelector(".genomeGraph"))
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
    d3.select(this.element.shadowRoot.querySelector('svg'))
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

// *************************** SUNBURST **************************
  generatePlot() {
    const treeClustering = new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 7);
    const radius = this.diagonal_svg*10/100 + this.diagonal_svg*15/100, padInnerRadisu = this.diagonal_svg*10/100 + this.diagonal_svg*10/100;
    const root = d3.partition().size([2*Math.PI, radius])(d3.hierarchy(treeClustering.root).sum((d) => d['niv']));
    let maxChild = Math.max(...treeClustering.root['children'].map(o => {return o.weight}));
    const arc =d3.arc()
        .startAngle(d =>  d['x0'])
        .endAngle(d => d['x1'])
        .padAngle(d => Math.min((d['x1'] - d['x0']) / 2, 0.005))
        .padRadius(radius / 2)
        .innerRadius(d => d['y0'] + padInnerRadisu)
        .outerRadius(d => d['y1'] - 1 + padInnerRadisu);

    const color = d3.scaleQuantize()
              .domain([0, maxChild])
              // @ts-ignore
              .range(['#F7FACE', '#E0F6BF', '#C1F2B0', '#A3EDAA', '#96E7B9', '#8BE0CD', '#80CDD8', '#6DA7C3', '#5B81AD', '#4A5E95', '#3A3E7D']);

    const svg = d3.select(this.element.shadowRoot.querySelector('#displayGenomicCard'));

    function findSgrnaChildren(list_children):string[] {
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
            if(this.selectedSection == -1) {
              // Specific color for zero
              if (d.data['weight'] == 0) {
                return "rgba(226, 210, 186, 0.46)";
              }else {
                return color(d.data['weight']);
              }
            } else if (i == this.selectedSection){
              return "rgba(78, 195, 236, 0.9)";
            } else {
              return "rgba(226, 210, 186, 0.46)";
            }
          })
          // @ts-ignore
          .attr('d', arc)
          .attr('transform', 'translate(' + this.diagonal_svg/2 + ', ' + this.diagonal_svg/2 + ')')
          // .attr('opacity', (d) => {return d.depth < 2 ? 1 : 0})
          .on("click", (d, i) => {
            let uniqSgrna:string[];
            if(d.hasOwnProperty('children')) {
              uniqSgrna= findSgrnaChildren(d.children);
            } else   {
              uniqSgrna = Object.keys(d.data.children);
            }
            this.subSgrna = uniqSgrna;
            this.sgrnaSelected = undefined;
            this.selectedSection = i;
            let subData={};
            Object.keys(this.show_data).forEach(e => {
              if(this.subSgrna.includes(e)){
                subData[e] = this.show_data[e];
              }
            });
            if(this.gene != undefined) this.emitsgData(subData, parseFloat(d.data.min), parseFloat(d.data.max));
          });

    // Text
    svg.append("g")
    .attr('transform', 'translate(' + this.diagonal_svg/2 + ', ' + this.diagonal_svg/2 + ')')
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants().filter(d => d.depth > 0 && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
      .enter().append("text")
        .attr("transform", function(d) {
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
          const y = (d.y0 + d.y1) / 2 + padInnerRadisu;
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


// *************************** DISPLAY ***************************
  showCoord() {
    if(this.sgrnaSelected == undefined){
      return "";
    }
    let dataOneSgrna = this.show_data[this.sgrnaSelected];
    let text = this.sgrnaSelected + " : " + dataOneSgrna.length +  "\n";
    dataOneSgrna.forEach(coord => {
      text += coord + "\n";
    })
    return (text);
  }

  styleHelp(ref:string, target:string){
    if(this.element.shadowRoot.querySelector(ref) != null){
      var coordGen = this.element.shadowRoot.querySelector(ref).getBoundingClientRect();
      (this.element.shadowRoot.querySelector(target) as HTMLElement).style.top = coordGen.top.toString() + "px";
      (this.element.shadowRoot.querySelector(target) as HTMLElement).style.left = coordGen.left.toString() + "px";
    }
  }

  render() {
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
    if (this.all_data == undefined) {
    return ([
      <div style={{display: displayLoad}}>
        <strong> Loading ... </strong>
        <div class="spinner-grow text-info" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>])
    }else{
        return([
          <head><link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
          </head>,
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
            <div class="test" style={{float:"left"}}>
              <div class="select-menu">
                <span>References</span>
                <select class="custom-select" onChange={e => this.emitRefChange(e)}>
                  {this.genomeRef.map(ref => <option>{ref}</option>)}
                </select>
              </div>

              <div class="select-menu">
                <span>sgRNA</span>
                <select class="custom-select" onChange={e => this.emitSgrnaChange(e)} style={{background:(this.subSgrna == undefined) ? "none" : "rgba(78, 195, 236, 0.2)"}}>
                  <option>  </option>
                  {(this.subSgrna == undefined) ?
                    (this.allSgrna.map(sgRna => (sgRna != this.sgrnaSelected) ? <option>{sgRna}</option> : <option selected>{sgRna}</option>)) :
                    (this.subSgrna.map(sgRna => (sgRna != this.sgrnaSelected) ? <option>{sgRna}</option> : <option selected>{sgRna}</option>))
                  }
                </select>
              </div>
              </div>


              <div>
                <p style={{padding:"12px 0px 0px 225px", margin:"Opx 0px 5px 0px"}}> <strong> Coordinates Box </strong></p>
                <p class="coordBox">
                  {this.showCoord()}
                </p>
              </div>
              <div class="help">
                <i class="material-icons">help</i>
                <div class="help-text help-gen"> Click on me to reinitialize sgRNA </div>
                <div class="help-text help-section"> Click on me to display only sgRNA which are on me </div>

              </div>


               {/* ************* Card *************  */}
              <svg id='displayGenomicCard' width={this.diagonal_svg} height={this.diagonal_svg}>
                {this.generateGenomicCard()}
                <text transform= {`translate(${this.diagonal_svg/2 - 30} , ${this.diagonal_svg/2})`}> {this.sizeSelected} pb </text>
              </svg>

               {/* ************* Plot *************  */}
               {this.generatePlot()}

            </div>
          </div>,
          // @ts-ignore
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>,
          <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>,
          <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>,
    ])
      }


  }
}

// Display the entire blue circle
function DisplayGenome (root, width, height) {
  // Clean all arc
  d3.select(root.querySelector('#displayGenomicCard')).selectAll('g').remove();
  let arcGenerator = d3.arc();
  // Generator arc for the complete genome
  let pathGenome = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
    innerRadius: width*15/100 - width*1/100,
    outerRadius: width*15/100
  })
  // Draw the complete genome
  d3.select(root.querySelector('svg'))
    .append("g")
    .attr('class', 'genomeCircle')
    .append('path')
    .attr('d', pathGenome)
    .attr('transform', 'translate(' + width/2 + ', ' + height/2 + ')')
    .style('fill', 'rgba(79, 93, 117)');
}
