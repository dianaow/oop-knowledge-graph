// This module will manage all nodes
let allNodes = [];

const addNode = (node) => {
  allNodes.push(node);
};

const removeNode = (node) => {
  allNodes = allNodes.filter(d => d.id !== node.id)
};

const removeAllNodes = () => {
  allNodes = [];
};

const getNodes = () => allNodes;

const getVisibleNodes = () => allNodes.filter(d => d.visible);

const makeAllNodesInvisible = () => {
  allNodes.forEach(node => {
    node.visible = false
  });
};

const makeSelectedNodesVisible = (ids) => {
  allNodes.forEach(node => {
    node.visible = ids.includes(node.id) ? true : node.visible
  });
};

export { addNode, removeNode, removeAllNodes, getNodes, getVisibleNodes, makeAllNodesInvisible, makeSelectedNodesVisible };
