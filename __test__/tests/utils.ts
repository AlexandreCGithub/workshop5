import { BASE_NODE_PORT } from "../../src/config";
import { NodeState } from "../../src/types";

async function getNodeState(nodeId: number) {
  const state = await fetch(
    `http://localhost:${BASE_NODE_PORT + nodeId}/getState`
  )
    .then((res) => res.json())
    .then((json: any) => json as NodeState);

  return state;
}

export async function getNodesState(N: number): Promise<NodeState[]> {
  const states = await Promise.all(
    new Array(N).fill(0).map(async (_, index) => getNodeState(index))
  );

  return states;
}

export function reachedFinality(states: NodeState[]): boolean {
  return states.find((el) => el.decided === false) === undefined;
}
