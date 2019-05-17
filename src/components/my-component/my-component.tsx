import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'genomic-card',
  styleUrl: 'my-component.css',
  shadow: true
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


// *************************** DISPLAY ***************************
  render() {
    console.log("render called");
    let tabOrgName = this.org_names.split("&");
    if (this.orgSelected == undefined) this.orgSelected = tabOrgName[0];
    if (this.refSelected == undefined) this.refSelected = this.genomeRef[0];

    return ([
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>,

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
        </svg>

      </div>,

      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>,
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>,
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>,
      <script src="https://d3js.org/d3.v5.min.js"></script>
])
  }
}
