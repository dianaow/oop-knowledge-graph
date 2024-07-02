import CountryNode from './CountryNode.js';

export default class FXNode extends CountryNode {
  constructor(datum) {
    super(datum);
    this.visible = false;
    this.parent = datum["Of_Country"]
    this.name = 'FX'
  }
}