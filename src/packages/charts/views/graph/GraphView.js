/** @format */

import * as d3 from "d3";

import defaultConfig from './defaultConfig.js';
import ChartOption from '@/packages/data/types/ChartOption';
import ChartViewDescriptive from '@/packages/charts/modular/general/chart-view-descriptive/ChartViewDescriptive.js';
import AppEventType from '@/packages/events/types/AppEventType.js';
import { splitLongText, getTextSize  } from './utils.js';
import { generateArc, generatePath } from './pathUtils.js';

import { getVisibleNodes, removeAllNodes, makeAllNodesInvisible, makeSelectedNodesVisible } from './node/nodesRepository.js';
import { getVisibleEdges, removeAllEdges, makeAllEdgesInvisible, makeSelectedEdgesVisible } from './edge/edgeRepository.js';

import RegionNode from './node/RegionNode.js';
import CountryNode from './node/CountryNode.js';
import CompanyNode from './node/CompanyNode.js';
import SectorNode from './node/SectorNode.js';
import IndustryNode from './node/IndustryNode.js';
import EquityNode from './node/EquityNode.js';
import FXNode from './node/FXNode.js';
import Node from './node/Node.js';
import Edge from './edge/Edge.js';

/**
 * @class
 * Graph/Network view
 */
export default class GraphView extends ChartViewDescriptive {

  #linkG;
  #linkTextG;
  #nodeG;
  #textG;

	constructor() {
		super();

		this.mergeConfig(defaultConfig);

    this.nodeId = "Node"
    this.sourceId = "start_node"
    this.targetId = "end_node"

    this.state = this.context.value(ChartOption.VIEW_STATE)
    this.country = null

    this.linkStyles = defaultConfig.linkStyles
    this.nodeStyles = defaultConfig.nodeStyles
    this.labelStyles = defaultConfig.labelStyles

    const g = this.chart.childrenContainer.append("g");

    this.#linkG = g.append("g").attr("class", "links");
    this.#linkTextG = g.append("g").attr("class", "linkTexts");
    this.#nodeG = g.append("g").attr("class", "nodes");
    this.#textG = g.append("g").attr("class", "labels");

    this.simulation = this.initSimulation()

		this.addEventListener(AppEventType.REDRAW_CHART, () => {
      g.attr('transform', `translate(${this.width/2},${this.height/2-100})`)
      this.redraw(this.state);
		});
    
    this.context.subscribe(ChartOption.VIEW_STATE, value => {
      this.state = value
			this.redraw(value)
		});
	}

	redraw(state) {
		const data = this.data;
    if(data.length === 0) return;

    this.resetGraphElements(data)

    if (state == 'map') {
      let tiers = ['Region', 'Country']
      this.nodes = this.nodes.filter((d) => tiers.indexOf(d.name) != -1)
      this.links = []
      this.generateMapLayout()
    }
    if (state == 'region-tree') {
      this.generateTreeEntities(['Region', 'Country']);
      this.generateTreeLayout()
    }
    if (state.includes('country-tree')) {
      this.country = state.split('-')[2]
      this.generateCountryTree(state.split('-')[2], ['Country', 'Equity', 'Sector', 'Industry'])
      this.generateTreeLayout()
    }
    if (state.includes('all-tree')) {
      this.generateCountryTree(this.country)
      this.generateTreeLayout()
    }

    this.updateAttributes()
    this.restartSimulation()
    this.updateGraph()
	}
  
  updateGraph() {
    const nodes = this.nodes
    const links = this.links
    const nodeStyles = this.nodeStyles
    const linkStyles = this.linkStyles
    const labelStyles = this.labelStyles
    let that = this

    // Update existing links
    this.#linkG
    .selectAll("path.link")
    .data(links, (d) => d.source.id + "_" + d.target.id)
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("class", "link")
          .attr("id", (d) => d.source.id + "_" + d.target.id)
          .attr("pointer-events", "auto")
          .attr("cursor", "pointer")
          .attr("fill", "none")
          .attr("stroke", (d) => linkStyles.stroke || d.source.color)
          .attr("stroke-width", (d) => d.strokeWidth)
          .attr("marker-end", (d) => (!linkStyles.stroke ? `url(#arrowhead-${d.source.color})` : "url(#arrowhead)"))
          .attr("d", (d) => (linkStyles.type === "arc" ? generateArc(d, 1, true) : generatePath(d, true)))
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", (d) => (links.length > 200 ? 0.5 : linkStyles.strokeOpacity)),
      (update) =>
        update
          //.attr('opacity', 0)
          .transition()
          .duration(500)
          .attr("d", (d) => (linkStyles.type === "arc" ? generateArc(d, 1, true) : generatePath(d, true)))
          .attr("opacity", (d) => (links.length > 200 ? 0.5 : linkStyles.strokeOpacity))
          .selection(),
      (exit) => exit.transition().duration(500).attr("opacity", 0).remove()
    );


  // Update existing nodes
  this.#nodeG
    .selectAll(".node")
    .data(nodes, (d) => d.id)
    .join(
      (enter) => {
        const newNode = enter
          .append("g")
          .attr("class", "node")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .attr("opacity", 1)
          .attr("pointer-events", "auto")
          .attr("cursor", "pointer")
          .on("dblclick.zoom", null)
          .on("click", function (event, dd) { 
            if (that.state == 'map') {
              that.context.set(ChartOption.VIEW_STATE, 'country-tree-' + dd.id)
              return
            } else {
              dd.click() 
              that.nodes = getVisibleNodes()
              that.links = getVisibleEdges()
            }
            that.generateTreeLayout()
            that.updateAttributes()
            that.restartSimulation()
            that.updateGraph()
          })

        newNode
          .append("circle")
          .attr("r", (d) => d.radius)
          .attr("fill", (d) => (nodeStyles.type === "gradient" ? `url('#radial-gradient-${d.color}')` : d.color))
          .attr("stroke", (d) => nodeStyles.stroke || d.color)
          .attr("fill-opacity", nodeStyles.fillOpacity)
          .attr("stroke-opacity", nodeStyles.type === "filled" ? nodeStyles.fillOpacity : nodeStyles.strokeOpacity)
          .attr("stroke-width", nodeStyles.type === "gradient" ? "0.5px" : nodeStyles.strokeWidth); // it's nicer to have a thin circle stroke for nodes with radial gradient stroke

        return newNode;
      },
      (update) => {
        const newUpdate = update
          .transition()
          .duration(500)
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          
        newUpdate
          .select('circle')
          .attr("r", (d) => d.radius)

        return newUpdate;
      },
      (exit) => exit.remove()
    );

  function getLabel(d) {
    return splitLongText(d.label, 20);
  }

  // Update existing node labels
  this.#textG
    .selectAll(".label")
    .data(nodes, (d) => d.id)
    .join(
      (enter) => {
        const newText = enter
          .append("g")
          .attr("class", "label")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)

        const text = newText
          .append("text")
          .attr("transform", (d) => d.name === 'Country' ? `translate(0, 0)` : `translate(${d.radius + 2}, 0)`) // position label next to node without overlap
          .attr("fill", labelStyles.color)
          .attr("font-size", (d) => Math.max(10, d.radius / 2)) // label size is proportionate to node size
          .attr("font-weight", labelStyles.fontWeight)
          .attr("dominant-baseline", "middle")
          .attr("text-anchor",  (d) => d.name === 'Country' ? "middle" : "start");

        text
          .selectAll("tspan")
          .data((d) => getLabel(d))
          .enter()
          .append("tspan")
          .attr("x", 0)
          .attr("y", (d, i) => 9 * i)
          .text((d) => d);

        return newText;
      },
      (update) => {
        const newUpdate = update
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          
        newUpdate
          .select('text')
          .attr("font-size", (d) => Math.max(10, d.radius / 2)) 
        return newUpdate;
      },
      (exit) => exit.remove()
    );
  }

  initSimulation() {
		return d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(function (d) {
          return d.target._children ? 150 : 50;
        })
    )
    .force("x", d3.forceX((d) => d.x).strength(0.9))
    .force("y", d3.forceY((d) => d.y).strength(0.9))
    .force("charge", d3.forceManyBody().strength(-300))
    .force(
      "collide",
      d3
        .forceCollide()
        .radius((d) => d.radius * 1.2)
        .iterations(3)
    );
  }

  restartSimulation() {
    const simulation = this.simulation
    simulation.nodes(this.nodes).force("link").links(this.links);
    simulation.alphaTarget(0.1).restart();
    simulation.tick(Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())));
  }

  ticked () {
    this.#linkG.selectAll('path.link').attr('d', (d) => (this.linkStyles.type === 'arc' ? generateArc(d, 1, true) : generatePath(d, true)))
    this.#nodeG.selectAll('.node').attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    this.#textG.selectAll('.label').attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    this.#linkTextG.selectAll('.link').attr('x', (d) => (d.target.x - d.source.x) / 2 + d.source.x + 6).attr('y', (d) => (d.target.y - d.source.y) / 2 + d.source.y)
  }

  updateAttributes() {
    const linkWidthScale = d3
      .scaleSqrt()
      .domain(d3.extent(this.links, (d) => d[this.linkStyles.strokeWidth] || 1))
      .range([1, 3])
      .clamp(true)

    this.nodes.forEach((n, i) => {
      let radius = 30
      if((this.state.includes('country-tree') || this.state.includes('all-tree'))) {
        if(n.name === 'Company' || n.name === 'Industry' || n.name === 'Sector') {
          radius = +n.size * 8000
        } else if (n.name === 'Country') {
          radius = 50
        } else {
          radius = 30
        }
      }
      if(this.state === 'map' || this.state === 'region-tree') {
        if(n.name === 'Company' || n.name === 'Industry' || n.name === 'Sector') {
          radius = +n.size * 4000
        } else {
          radius = Math.min(30, +n.size * 800)
        }
      }
      n.radius = radius

      const maxLineLength = 22
      const substrings = splitLongText(n.id, maxLineLength)
      const texts = []
      substrings.forEach((string) => {
        const text = getTextSize(string, Math.max(8, radius) + 'px', 'Courier')
        texts.push({ text: string, width: text.width, height: text.height })
      })
      n.width = d3.max(texts, (d) => d.width) + radius * 2
      n.height = d3.max(texts, (d) => d.height) * substrings.length + radius

      n.color = this.colorScale(n.name)
    })
  
    this.links.forEach((l, i) => {
      if (typeof this.linkStyles.strokeWidth === 'string' && !this.linkStyles.strokeWidth.includes('px')) {
        const W = d3.map(this.links, (d) => d[this.linkStyles.strokeWidth])
        l.strokeWidth = linkWidthScale(W[i]) || 1
      } else {
        l.strokeWidth = this.linkStyles.strokeWidth
      }
    })
  }

  resetGraphElements(data) {
    const ele = this.uniqueElements(data)

    const nodeTypeMapping = {
      ['GEO_REG']: RegionNode,
      ['GEO_CTY']: CountryNode,
      ['Equity_STY']: CompanyNode,
      ['Equity_CTY-SEC']: SectorNode,
      ['Equity_CTY-IND']: IndustryNode,
      ['Equity_CTY']: EquityNode,
      ['FX_EM']: FXNode,
      ['FX_DM']: FXNode,
      ['Equity_SEC']: SectorNode,
      ['Equity_IND']: IndustryNode,
      ['GEO_CUZ']: Node
    };

    removeAllNodes()
    removeAllEdges()

    const newNodes = ele.nodes.map((d) => {
      const NodeClass = nodeTypeMapping[d.Type + '_' + d.SubType];

      if (!NodeClass) {
        throw new Error(`Unknown type: ${d.type}`);
      }
      return new NodeClass(d);
    });
    
    const newLinks = ele.links.map((d) => {
      const EdgeClass = Edge
      if (!EdgeClass) {
        throw new Error(`Unknown type: ${d.type}`);
      }
      return new EdgeClass(d);
    });

    this.nodes = newNodes
    this.links = newLinks
  }

  uniqueElements(data) {
    const {nodes, links} = data

    const uniqueNodes = nodes.reduce((acc, node) => {
      // Check if a node with the same 'entity' already exists in the accumulator
      const existingNode = acc.find((n) => n[this.nodeId] === node[this.nodeId]);
      // If not found, add the current node to the accumulator
      if (!existingNode) {
        acc.push(node);
      } 
      return acc;
    }, []);

    const uniqueLinks = links.reduce((acc, link) => {
      // Check if a link with the same 'Subject' and 'Object' already exists in the accumulator
      const existingLink = acc.find(
        (l) => l[this.sourceId] === link[this.sourceId] && l[this.targetId] === link[this.targetId]
      );
      // If not found, add the current link to the accumulator
      if (!existingLink) {
        acc.push(link);
      }
      return acc;
    }, []);

    return {nodes: uniqueNodes, links:uniqueLinks}
  }

  generateTreeEntities(tiers) {
    let nodesTree = [{ id: "ALL", Node: "ALL", radius: 0 }];
    new Node(nodesTree[0])
    tiers.map(tier => {
      nodesTree = nodesTree.concat(this.nodes.filter((d) => d.name === tier))
    })
    this.nodes = nodesTree.slice()

    let linksTree = []
    this.links.forEach((row) => {
      if (nodesTree.some((node) => node.id === row.source) && nodesTree.some((node) => node.id === row.target)) {
        linksTree.push(row);
      }
    });
    this.links = linksTree.slice()
  }

  generateCountryTree(country, tiers) {
    makeAllNodesInvisible();
    this.nodes = this.nodes.filter((d) => d.country === country)
    if(tiers) this.nodes = this.nodes.filter(d => tiers.indexOf(d.name) != -1)
    this.nodes.forEach(d => {
      if(d.name === 'Country') d.parent = null
    })
    makeSelectedNodesVisible(this.nodes.map(d => d.id));
    let nodesTree = this.nodes.slice()

    makeAllEdgesInvisible()
    let linksTree = []
    this.links.forEach((row) => {
      if (nodesTree.some((node) => node.id === row.source) && nodesTree.some((node) => node.id === row.target)) {
        linksTree.push(row);
      }
    });
    makeSelectedEdgesVisible(linksTree.map(d => d.id));

    this.links = linksTree.slice()
  }

  generateTreeLayout() {
    const root = d3
      .stratify()
      .id((d) => d.id)
      .parentId((d) => d.parent)(this.nodes);

    const treeData = d3
      .tree()
      .size([2 * Math.PI, this.height/2.5])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(root);

    this.nodes.forEach((node) => {
      const correspondingNode = treeData.descendants().find((d) => d.data.id === node.id);
      if (correspondingNode) {
        const newX = Math.cos(correspondingNode.x) * correspondingNode.y;
        const newY = Math.sin(correspondingNode.x) * correspondingNode.y;
        const parent = this.nodes.find((d) => d.id === node.parent) || { x: 0, y: 0 };
        node.x = (node.name === 'Company') ? parent.x : newX;
        node.y = (node.name === 'Company') ? parent.y : newY;
      } else {
        node.x = 0;
        node.y = 0;
      }
    });
  }

  generateMapLayout() {
    const projection = d3.geoMercator().translate([-100, 100]).scale(280);
    this.nodes.forEach((n) => {
      let coord = n.longitude && n.latitude ? projection([+n.longitude, +n.latitude]) : [0, 0];
      n.x = coord[0];
      n.y = coord[1];
    });
  }

}
