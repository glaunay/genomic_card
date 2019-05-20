import { Component, Prop } from '@stencil/core';
import * as d3 from "d3";

@Component({
  tag: 'genomic-card',
  styleUrl: 'my-component.css',
  shadow: false
})
export class MyComponent {
// *************************** PROPERTY & CONSTRUCTOR ***************************
  private orgSelected:string;
  private refSelected:string;
  // TEST
  @Prop({mutable: true}) genomCard: string="Je suis le premier genome";
  @Prop({mutable: true}) genomeRef= ["Chromosome1", "Chromosome2", "Chromosome3"];

  @Prop() org_names: string;
  @Prop() height_svg: number;
  @Prop() width_svg: number;

  constructor() {
    this.changeOrg = this.changeOrg.bind(this);
    this.handleChangeRef = this.handleChangeRef.bind(this);
  }


// *************************** CLICK ***************************
  changeOrg(event: Event) {
    let listCards = {"premier": "Je suis le premier genome",
                         "deuxieme" : "Je suis le second genome",
                         "troisieme": "Je suis le troisieme genome"};
    this.orgSelected= (event.currentTarget as HTMLElement).innerText;
    console.log(`CLICK on ${this.orgSelected}`);
    this.genomCard = listCards[this.orgSelected];
  }

  handleChangeRef(event: Event) {
    console.log((event.currentTarget as HTMLOptionElement).value);
  }

  componentDidLoad() {
    console.log("Loaded")
    var start=90, stop=110, start2=10, stop2=30, sizeGenome=200;
    let data = [
      {startAngle: 2*Math.PI * start * (1/sizeGenome), endAngle: 2*Math.PI * stop * (1/sizeGenome), 'sgRNA': 'ACACCTGTCAGTAGCGATCGGG', 'start': start, 'stop': stop},
      {startAngle: 2*Math.PI * start2 * (1/sizeGenome), endAngle: 2*Math.PI * stop2 * (1/sizeGenome), 'sgRNA': 'AAAACTGTCAGTAGCAAAAGG', 'start': start2, 'stop': stop2}
    ];

    let arcGenerator = d3.arc();
    // Generator arc for the complete genome
    let pathGenome = arcGenerator({
      startAngle: 0,
      endAngle: 2 * Math.PI,
      innerRadius: 190,
      outerRadius: 200
    })
    // Div for the box containing coordinates
    let div = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
    // Generator arc for one sgRNA
    let pathSgRNA = d3.arc()
      .innerRadius(205)
      .outerRadius(210);


    // Draw the complete genome
    d3.select("g")
      .append('path')
      .attr('d', pathGenome);


    // Draw sgRNA
    d3.select('svg')
      .append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      // Draw and add animation for sgRNA
      .each(arcFunction)
      .style('fill', 'orange')
      // When mouse is over the sgRNA, show the box
      .on('mouseover', (d) => {
        div.transition()
          .duration(500)
          .style('opacity', '.9');
        div.html('<b>' + d.sgRNA + '</b></br>' + ' &nbsp;&nbsp; <i class="fas fa-play"></i> &nbsp; Start : ' + d.start + '</br>' +
                 ' &nbsp;&nbsp; <i class="fas fa-hand-paper"></i> &nbsp; Stop : ' + d.stop)
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
      // The animation to place sgRNA
      function arcFunction(){
        return d3.select(this)
                .transition()
                  .ease(d3.easeBackInOut)
                  .duration(600)
                  .attr('d', pathSgRNA)
                  .attr('transform', 'translate(400, 240)')
      }
  }

// *************************** DISPLAY ***************************
  render() {
    console.log("render called");
    let tabOrgName = this.org_names.split("&");
    if (this.orgSelected == undefined) this.orgSelected = tabOrgName[0];
    if (this.refSelected == undefined) this.refSelected = this.genomeRef[0];

    return ([
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>,
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous"/>,
      <ul class="nav nav-tabs" id="myTab" role="tablist">
      {tabOrgName.map(name => {
        let classTag: string="nav-link", bool: string="false";
        if (name == this.orgSelected) {
          classTag = "nav-link active";
          bool = "true";
        }
        return <li class="nav-item"> <a class={classTag} data-toggle="tab" role="tab" aria-selected={bool} href="#" onClick={this.changeOrg}> {name} </a> </li>
      })}
      </ul>,

      <div class="tab-content genomeGraph" id="myTabContent" >
        <div class="select-menu">
          <select class="custom-select" onChange={e => this.handleChangeRef(e)}>
            {this.genomeRef.map(ref => <option>{ref}</option>)}
          </select>
        </div>

        <p>
          {this.genomCard}
        </p>
        <svg width={this.width_svg} height={this.height_svg}>
          <text transform="translate(385, 250)"> Size </text>
          <g transform="translate(400, 240)"></g>
        </svg>
      </div>,
      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>,
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>,
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
])
  }
}
