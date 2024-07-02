import { addNode, removeNode, getNodes } from './nodesRepository.js';
import { addEdge, removeEdge, getEdges } from '../edge/edgeRepository.js';

export default class Node {
  constructor(datum) {
    this.id = datum.Node;
    this.x = datum.x;
    this.y = datum.y;
    this.label = datum.Label;
    this.longitude = datum.Longitude;
    this.latitude = datum.Latitude;
    this.country = datum.Of_Country;
    this.parent = null;
    this.name = 'Node';
    this.visible = true; // You can add more properties as needed
    this.size = +datum.size;

    addNode(this);
  }


  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  click() {
    const allNodes = getNodes();
    const allEdges = getEdges();

    const toggleVisibility = (parentNode) => {
      const childNodes = allNodes.filter(n => n.parent === parentNode.id);

      const childEdges = allEdges.filter(edge =>
        ((typeof edge.target === 'object' && edge.target !== null) ? edge.target.id : edge.target) === parentNode.id
      );

      // Toggle visibility of child nodes and recursively toggle their children
      for (const childNode of childNodes) {
        if (childNode.visible) {
          childNode.hide();
          toggleVisibility(childNode); // Recursive call to hide descendants
        } else {
          if(parentNode.visible) childNode.show();
        }
      }

      // Toggle visibility of child edges
      for (const childEdge of childEdges) {
        if (childEdge.visible) {
          childEdge.hide();
        } else {
          if(parentNode.visible) childEdge.show();
        }
      }
    };

    // Start the process from the clicked node
    toggleVisibility(this);
  }
}