/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';




export namespace Components {

  interface GenomicCard {
    'genomCard': string;
    'height_svg': number;
    'org_names': string;
    'with_svg': number;
  }
  interface GenomicCardAttributes extends StencilHTMLAttributes {
    'genomCard'?: string;
    'height_svg'?: number;
    'org_names'?: string;
    'with_svg'?: number;
  }
}

declare global {
  interface StencilElementInterfaces {
    'GenomicCard': Components.GenomicCard;
  }

  interface StencilIntrinsicElements {
    'genomic-card': Components.GenomicCardAttributes;
  }


  interface HTMLGenomicCardElement extends Components.GenomicCard, HTMLStencilElement {}
  var HTMLGenomicCardElement: {
    prototype: HTMLGenomicCardElement;
    new (): HTMLGenomicCardElement;
  };

  interface HTMLElementTagNameMap {
    'genomic-card': HTMLGenomicCardElement
  }

  interface ElementTagNameMap {
    'genomic-card': HTMLGenomicCardElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
