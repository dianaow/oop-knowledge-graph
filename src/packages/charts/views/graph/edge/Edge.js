import { addEdge } from '../edge/edgeRepository.js';

export default class Edge {
  constructor(datum) {
    this.id = datum.start_node + '_' + datum.end_node
    this.source = datum.start_node;
    this.target = datum.end_node;
    this.visible = datum.type === 'Located_In' ? true  : false

    addEdge(this)
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}