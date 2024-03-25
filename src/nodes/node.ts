import bodyParser from "body-parser";
import express from "express";
import { BASE_NODE_PORT } from "../config";
import { Value } from "../types";
import { delay } from "../utils";

//node state type
type NodeState = {
  killed: boolean;
  x: 0 | 1 | "?" | null;
  decided: boolean | null;
  k: number | null;
};

//maps
type Proposition = {[key: number]: Value[]};
type Vote = {[key: number]: Value[]};

//function to send to N nodes
function sendToAll(N:number,body: any) {
for (let i = 0; i < N; i++) {
  fetch(`http://localhost:${BASE_NODE_PORT + i}/message`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
			}
}


export async function node(
  nodeId: number,
  N: number,
  F: number,
  initialValue: Value,
  isFaulty: boolean,
  nodesAreReady: () => boolean,
  setNodeIsReady: (index: number) => void
) {
  const node = express();
  node.use(express.json());
  node.use(bodyParser.json());

  let current_state: NodeState = {
    killed: false,
    x: null,
    decided: null,
    k: null,
  }
  
  let propositions: Proposition = {};
  let votes: Vote= {};


  // status GET route
  node.get("/status", (req, res) => {
  if(isFaulty)
  {    res.status(500).send("faulty");}
  else
  {    res.status(200).send("live");}
  });

  // stop GET route
  node.get("/stop", (req, res) => {
    current_state.killed = true;
    res.status(200).send("node stopped successfully");
  });

  // state GET route
  node.get("/getState", (req, res) => {
    res.status(200).send(current_state);
  });

  // start GET route
  node.get("/start", async (req, res) => {
    while (!nodesAreReady()) {
      await delay(1);
    }

    if (isFaulty) { //ifFaulty, null
      current_state = { k: null, x: null, decided: null, killed: current_state.killed };
    } else {
      
	  current_state = { 
	  ...current_state, 
	  k: 1,
	  x: initialValue,
	  decided: false
	  }; sendToAll(N,{ k: current_state.k, x: current_state.x, _type: "proposition" });
    }
    res.status(200).send("Started successfully.");
  });

  // message POST route
  node.post("/message", async (req, res) => {
   //body
    let { k, x, _type } = req.body;
	
    if (!current_state.killed! && !isFaulty ) {
	
      if (_type == "proposition") {
        if (!propositions[k]) {
    propositions[k] = [];
}
		
        propositions[k].push(x);
		
let proposition = propositions[k];

        if (proposition.length >= (N - F)) {
          let zeros = 0;
let ones = 0;

for (let p of proposition) {
    zeros += (p === 0) ? 1 : 0;
    ones += (p === 1) ? 1 : 0;
}

let x = (zeros > N / 2) ? 0 : (ones > N / 2) ? 1 : "?";

		  
          sendToAll(N,{ k: k, x: x, _type: "vote" });
        }
      } 
	  if (_type == "vote") {
        if (!votes[k]) {
        votes[k] = [];
    }
        votes[k].push(x);
    let vote = votes[k];
        if (vote.length >= (N - F)) {
                    let zeros = 0;
let ones = 0;

for (let p of vote) {
    zeros += (p === 0) ? 1 : 0;
    ones += (p === 1) ? 1 : 0;
}

          if (zeros >= F + 1) {
  current_state = { ...current_state,x: 0, decided: true };
} else if (ones >= F + 1) {
  current_state = { ...current_state,x: 1, decided: true };
} else {
  current_state = {
  ...current_state,
    x: zeros > ones ? 0 : (zeros < ones ? 1 : Math.random() > 0.5 ? 0 : 1),
    k: k + 1
  };
  sendToAll(N, { k: current_state.k, x: current_state.x, _type: "proposition" });
}
        }
      }
    }
    res.status(200).send("Received successfully.");
  });

  const server = node.listen(BASE_NODE_PORT + nodeId, async () => {
    console.log(`Node ${nodeId} is listening on port ${BASE_NODE_PORT + nodeId}`);
    setNodeIsReady(nodeId);
  });

  return server;
}