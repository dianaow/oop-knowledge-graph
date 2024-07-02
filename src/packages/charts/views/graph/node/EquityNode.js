import CountryNode from './CountryNode.js';

export default class EquityNode extends CountryNode {
  constructor(datum) {
    super(datum);
    this.visible = false;
    this.parent = datum["Of_Country"]
    this.name = 'Equity'
  }

  click() {
    super.click();
  }
}