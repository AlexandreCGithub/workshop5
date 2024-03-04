# Step by step instructions

This document will help you complete the unit tests in the `__test__` directory. You can run `yarn test` to see the result of these tests.

Note that this file aims at providing general guidance. If there is any ambiguity, you should analyse the unit tests as their execution prevails.

## 1. Basic setup for nodes

You will recognise a lot of elements from workshop nº4.

In the `./src/nodes/node.ts` file, you should implement the routes:

- `/status` - `GET`
this route should respond with a 500 status and the message `faulty` if the node is faulty and respond with a 200 status and the message `live` if the node is not faulty.

- `/getState` - `GET`
this route should respond with the current state of the node defined by the `NodeState` type below.
```ts
type NodeState = {
  killed: boolean; // this is used to know if the node was stopped by the /stop route. It's important for the unit tests but not very relevant for the Ben-Or implementation
  x: 0 | 1 | "?" | null; // the current consensus value
  decided: boolean | null; // used to know if the node reached finality
  k: number | null; // current step of the node
};
```
When a node is faulty, `x`, `decided` and `k` are set to `null`. 

This should allow you to pass the first two tests ("Project is setup correctly")

## 2. Implement the algorithm

For this step you will need to make use of the ressources provided in the `README.md` file in order to implement a working version of the Ben-Or consensus algorithm.

There are a few constraints you should keep in mind to validate the different tests:

- Nodes listen to request on the port defined by `BASE_NODE_PORT` + nodeId, which for the basic configuration, means that node #0 will have the port 3000, #1 the port 3001, etc,
- Nodes always start with an initial state that is provided as a parameter of the `node` function,
- Nodes communicate through POST HTTP request with the `/message` route which you should implement,
- Nodes should start the algorithm when they receive a GET HTTP request to the `/start` route,
- if the `/stop` GET HTTP route is called on a node, it should stop any activity (this is to prevent any errors in the tests),

## 3. Hidden tests

Some tests only have titles, others don't even have a description and are hidden.

To get the grade of 20/20, you will need to pass all tests (including hidden tests). 

To pass all tests, you should follow the instructions precisely and think about edge cases.s