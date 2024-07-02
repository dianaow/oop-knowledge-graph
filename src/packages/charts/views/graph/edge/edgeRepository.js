// This module will manage all edges
let allEdges = [];

// Add an edge to the list of edges
const addEdge = (edge) => {
  allEdges.push(edge);
};

// Remove an edge from the list of edges
const removeEdge = (edge) => {
  allEdges = allEdges.filter(e => e.source.id !== edge.id);
};

const removeAllEdges = () => {
  allEdges = [];
};

// Retrieve all edges
const getEdges = () => allEdges

const getVisibleEdges = () => allEdges.filter(d => d.visible);

const makeAllEdgesInvisible = () => {
  allEdges.forEach(edge => {
    edge.visible = false
  });
};

const makeSelectedEdgesVisible = (ids) => {
  allEdges.forEach(edge => {
    edge.visible = ids.includes(edge.id) ? true : edge.visible
  });
};

// Export the functions
export { addEdge, removeEdge, removeAllEdges, getEdges, getVisibleEdges, makeAllEdgesInvisible, makeSelectedEdgesVisible };
