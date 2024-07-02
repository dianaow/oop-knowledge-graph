import CountryNode from './CountryNode.js';

export default class CurrencyNode extends CountryNode {
  constructor() {
    super();
    this.visible = false;
    this.name = 'Currency'
  }
}