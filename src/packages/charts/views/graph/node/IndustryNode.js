import EquityNode from './EquityNode.js';

export default class IndustryNode extends EquityNode {
  constructor(datum) {
    super(datum);
    this.parent = datum["Of_Country"] + datum["Sector"] + "EQ"
    this.visible = false;
    this.name = 'Industry'
  }

  click() {
    super.click();
  }
}