
import Node from './Node.js';

export default class RegionNode extends Node {
  constructor(datum) {
    super(datum);
    this.parent = 'ALL'
    this.name = 'Region'
  }
}