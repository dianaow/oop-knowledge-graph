import RegionNode from './RegionNode.js';

export default class CountryNode extends RegionNode {
  constructor(datum) {
    super(datum);
    this.parent = datum["Of_Region"]
    this.name = 'Country'
  }

  click() {
    super.click();
  }
}