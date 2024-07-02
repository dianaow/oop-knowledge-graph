import RegionNode from './RegionNode.js';

export default class ZoneNode extends RegionNode {
  constructor(datum) {
    super(datum);
    this.parent = datum["Of_Currency"]
    this.visible = false;
    this.name = 'Zone'
  }

  click() {
    super.click();
  }
}