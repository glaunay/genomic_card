import { Component, Prop, State, Listen, EventEmitter, Event, Element, h } from '@stencil/core';
import * as d3 from "d3";
import * as clTree from './clusteringTree';
import * as dspl from './displayPlot';
import "@mmsb/mmsb-select";

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
  @State() allSize:Object;

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
  @Prop() size:string;


  constructor() {
    this.handleChangeOrg = this.handleChangeOrg.bind(this);
    this.handleChangeRef = this.handleChangeRef.bind(this);
    this.handleChangeSgrna = this.handleChangeSgrna.bind(this);
    this.emitOrgChange = this.emitOrgChange.bind(this);
    this.emitRefChange = this.emitRefChange.bind(this);
    this.emitSgrnaChange = this.emitSgrnaChange.bind(this);
  }

// *************************** CLICK ***************************
  @Listen('changeOrgCard')
  handleChangeOrg(event: CustomEvent) {
    this.orgSelected= event.detail;
    this.refSelected = this.genomeRef[0];
    this.updateDataOrg();
    console.log(`CLICK on ${this.orgSelected}`);
  }

  @Listen('changeOrgRefSgrna', { target: 'window' })
  handleChangeOrgRefSgrna(event: CustomEvent) {
    var tmp_name = event.detail.axis.split("$");
    this.orgSelected = tmp_name[0];
    this.sgrnaSelected = event.detail.sgrna;
    this.updateDataOrg(tmp_name[1]);
  }

  updateDataOrg(ref=undefined) {
    this.subSgrna = undefined;
    this.selectedSection = -1;
    let all_data = JSON.parse(this.all_data);
    this.genomeRef = Object.keys(all_data[this.orgSelected]);
    ref === undefined ? this.refSelected = this.genomeRef[0] : ref;
    this.show_data = all_data[this.orgSelected][this.refSelected];
    this.allSgrna = Object.keys(all_data[this.orgSelected][this.refSelected]);
    (this.allSize == undefined) ? this.sizeSelected = 4518734 : this.sizeSelected = this.allSize[this.orgSelected][this.refSelected]
    new clTree.TreeClustering(this.sizeSelected, this.show_data, 4, 5);
  }

  @Listen('changeRefCard')
  handleChangeRef(event: CustomEvent) {
    this.refSelected = event.detail;
    this.updateDataOrg();
  }

  @Listen('sectionSelected', {target: 'window'})
  handleSectionSelected(event: CustomEvent) {
    this.subSgrna = event.detail["sgRNA"];
    this.selectedSection = event.detail["section"];
    this.sgrnaSelected = this.subSgrna[0];
  }

  @Listen('sectionSelectedSG', {target: 'window'})
  handleSectionSelectedSG(event: CustomEvent) {
    this.emitsgData(event.detail["sgRNA"], event.detail["min"], event.detail["max"]);
  }

  @Listen('mmsb-select.select')
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


// *************************** DISPLAY ***************************
  /**
  * Return all coordinates of a given sgRNA if the state is not undefined
  * @returns {string} The sgRNA, the number of occurences and coordinates
  */
  showCoord():string {
    if(this.sgrnaSelected == undefined){
      return "";
    }
    let dataOneSgrna = this.show_data[this.sgrnaSelected];
    // let text = "<span id='coordBoxHeader'>" + this.sgrnaSelected + " : " + dataOneSgrna.length +  "</span></br>";
    let text = this.sgrnaSelected + " : " + dataOneSgrna.length +  "\n";
    dataOneSgrna.forEach(coord => {
      text += coord + "\n";
    })
    return (text);
  }

  /**
  * Display the genome by a blue circle
  * @param {string} ref The selector where the tooltip must appear
  * @param {string} target The selector of the tooltip
  */
  styleHelp(ref:string, target:string){
    if(this.element.shadowRoot.querySelector(ref) != null){
      var coordGen = this.element.shadowRoot.querySelector(ref).getBoundingClientRect();
      (this.element.shadowRoot.querySelector(target) as HTMLElement).style.top = coordGen.top.toString() + "px";
      (this.element.shadowRoot.querySelector(target) as HTMLElement).style.left = coordGen.left.toString() + "px";
    }
  }

  componentDidUpdate() {
    this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
      this.subSgrna = undefined;
      this.selectedSection = -1;
      this.sgrnaSelected = this.allSgrna[0];
    })
    this.styleHelp(".genomeCircle>path", ".help-gen");
    this.styleHelp(".sunburst>path", ".help-section");
  }

  componentDidLoad() {
    if (this.size != undefined){
      this.allSize = JSON.parse(this.size)
      this.sizeSelected = this.allSize[this.orgSelected][this.refSelected]
    }else {
      this.sizeSelected = 4518734
    }
    DisplayGenome(this.element.shadowRoot, this.diagonal_svg, this.diagonal_svg);
    dspl.generateGenomicCard(DisplayGenome, this.diagonal_svg, this.sizeSelected, this.element.shadowRoot, this.show_data[this.sgrnaSelected], this.sgrnaSelected);
    dspl.generateSunburst(this.sizeSelected, this.show_data, this.diagonal_svg, this.element.shadowRoot.querySelector('#displayGenomicCard'), this.selectedSection, this.gene != undefined ? true : false);

    if(this.element.shadowRoot.querySelector('.genomeCircle') != null) {
      this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
        this.subSgrna = undefined;
      })
    }
    this.styleHelp(".genomeCircle>path", ".help-gen");
    this.styleHelp(".sunburst>path", ".help-section");
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
        this.sgrnaSelected = this.allSgrna[0];
      }
    }

    let displayLoad=styleDisplay[0], displayGenomeCard=styleDisplay[1];
    if (this.all_data == undefined) {
      return ([
        //@ts-ignore
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>,
        <div style={{display: displayLoad}}>
          <strong> Loading ... </strong>
          <div class="spinner-grow text-info" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>])
    }else{
      return([
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
          //@ts-ignore
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>
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
              <mmsb-select label="Select sgRNA" data={this.subSgrna === undefined ? this.allSgrna.map(sgRna => [sgRna, sgRna]) : this.subSgrna.map(sgRna => [sgRna, sgRna])}></mmsb-select>
            </div>
            </div>


            <div>
              <p style={{padding:"12px 0px 0px 230px", marginBottom:"0px"}}> <strong> Coordinates Box </strong></p>
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
              {dspl.generateGenomicCard(DisplayGenome, this.diagonal_svg, this.sizeSelected, this.element.shadowRoot, this.show_data[this.sgrnaSelected], this.sgrnaSelected)}
              <text transform= {`translate(${this.diagonal_svg/2 - 30} , ${this.diagonal_svg/2})`}> {this.sizeSelected} pb </text>
            </svg>

             {/* ************* Plot *************  */}
             {dspl.generateSunburst(this.sizeSelected, this.show_data, this.diagonal_svg, this.element.shadowRoot.querySelector('#displayGenomicCard'), this.selectedSection, this.gene != undefined ? true : false)}
          </div>
        </div>,
        ])
    }
  }
}

/**
* Display the genome by a blue circle
* @param {ShadowRoot} nivMax Maximal level of the sunburst
* @param {Number} nivCurr Maximal level of the sunburst
* @param {Number} nbSec Number of section by circle
*/
function DisplayGenome (root:ShadowRoot, width:number, height:number):void {
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
