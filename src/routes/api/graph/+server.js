/** @format */
import { json } from '@sveltejs/kit';
import Papa from 'papaparse';

/**
 * @param {*} params
 * @returns
 */
export async function GET({fetch}) {

  // Create an array of promises for each CSV file
  const nodesPromise = fetch("/nodes.csv");
  const edgesPromise = fetch("/relationships.csv");

  // Wait for both promises to resolve
  const [nodesResponse, edgesResponse] = await Promise.all([nodesPromise, edgesPromise]);

  const nodesCsv = await nodesResponse.text();
  const edgesCsv = await edgesResponse.text();

  // Manually split CSV data into rows and columns
  const nodes = Papa.parse(nodesCsv, {header: true}).data;
  const links = Papa.parse(edgesCsv, {header: true}).data;

  return json({nodes, links})
}
