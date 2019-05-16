import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'genomic-card',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  /**
   * The first name
   */
  @Prop() org_names: string;

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  render() {
    let tabOrgName = this.org_names.split("&");
    console.log(tabOrgName);

    return ([
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>,

      <ul class="nav nav-tabs" id="myTab" role="tablist">
      {tabOrgName.map(name => {
        let classTag: string="nav-link", bool: string="false";
        if (name == "premier") {
          classTag = "nav-link active";
          bool = "true";
        }
        return <li class="nav-item"> <a class={classTag} data-toggle="tab" role="tab" aria-selected={bool} href="#"> {name} </a> </li>
      })}
      </ul>,

      <div class="tab-content genomeGraph" id="myTabContent">
        Ici se trouve la carte du genome selectionne
      </div>,

      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>,
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>,
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
])
  }
}
// <li class="nav-item">
// <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Home</a>
// </li>
// <li class="nav-item">
//   <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Profile</a>
// </li>
// <li class="nav-item">
//   <a class="nav-link" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="false">Contact</a>
// </li>
