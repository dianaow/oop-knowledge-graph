import IndustryNode from './IndustryNode.js';

export default class SectorNode extends IndustryNode {
  constructor(datum) {
    super(datum);
    this.visible = false;
    this.parent = datum["Of_Country"] + "EQ";
    this.name = 'Sector'
  }

  click() {
    super.click();
  }
}