import SectorNode from './SectorNode.js';

export default class CompanyNode extends SectorNode {
  constructor(datum) {
    super(datum);
    this.visible = false;
    this.parent = datum["Of_Country"] + datum["Industry"] + "EQ";
    this.name = 'Company'
  }
}