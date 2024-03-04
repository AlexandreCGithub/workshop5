import * as http from "http";
import { launchNetwork } from "../../src/index";
import { startConsensus, stopConsensus } from "../../src/nodes/consensus";
import { delay } from "../../src/utils";
import { BASE_NODE_PORT } from "../../src/config";
import { getNodesState, reachedFinality } from "./utils";
import { Value } from "../../src/types";

function generateRandomValue() {
  return Math.round(Math.random()) as 0 | 1;
}

async function closeAllServers(
  servers: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >[]
) {
  await Promise.all(
    servers.map((server) =>
      server.close(() => {
        server.closeAllConnections();
      })
    )
  );

  await delay(50);
}

describe("Ben-Or decentralized consensus algorithm", () => {
  describe("Project is setup correctly - 4 pt", () => {
    let servers: http.Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >[] = [];

    afterEach(async () => {
      await stopConsensus(servers.length);
      await delay(100);
      await closeAllServers(servers);
      servers.splice(0);
    });

    it("Can start 2 healthy nodes and 1 faulty node - 2pts", async () => {
      const faultyArray = [true, false, false];

      const initialValues: Value[] = [1, 1, 1];

      servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValues,
        faultyArray
      );

      await delay(200);

      for (let index = 0; index < 3; index++) {
        await fetch(`http://localhost:${BASE_NODE_PORT + index}/status`)
          .then((res) => {
            if (faultyArray[index]) {
              expect(res.status).toBe(500);
            }
            return res.text();
          })
          .then((body: any) => {
            if (faultyArray[index]) {
              expect(body).toBe("faulty");
            } else {
              expect(body).toBe("live");
            }
          });
      }
    });

    it("Can start 8 healthy nodes and 2 faulty nodes - 2 pts", async () => {
      const faultyArray = [
        true,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
      ];

      const initialValues: Value[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

      servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValues,
        faultyArray
      );

      await delay(200);

      for (let index = 0; index < faultyArray.length; index++) {
        await fetch(`http://localhost:${BASE_NODE_PORT + index}/status`)
          .then((res) => {
            if (faultyArray[index]) {
              expect(res.status).toBe(500);
            }
            return res.text();
          })
          .then((body: any) => {
            if (faultyArray[index]) {
              expect(body).toBe("faulty");
            } else {
              expect(body).toBe("live");
            }
          });
      }
    });
  });

  describe("Testing Ben-Or implementation - 16 pt", () => {
    const servers: http.Server[] = [];

    afterEach(async () => {
      await stopConsensus(servers.length);
      await delay(100);
      await closeAllServers(servers);
      servers.splice(0);
    });

    const timeLimit = 2000; // 2s

    it("Finality is reached - Unanimous Agreement - 2 pt", async () => {
      const faultyArray = [false, false, false, false, false];

      const initialValues: Value[] = [1, 1, 1, 1, 1];

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValues,
        faultyArray
      );

      servers.push(..._servers);

      await startConsensus(faultyArray.length);

      const time = new Date().getTime();

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      for (let index = 0; index < states.length; index++) {
        const state = states[index];

        if (faultyArray[index]) {
          expect(state.decided).toBeNull();
          expect(state.x).toBeNull();
          expect(state.k).toBeNull();
        } else {
          expect(state.decided).toBeTruthy();
          expect(state.x).toBe(1);
          expect(state.k).toBeLessThanOrEqual(2);
        }
      }
    });

    test.todo("Hidden test - Finality is reached - Unanimous Agreement - 2 pt");

    it("Finality is reached - Simple Majority - 1 pt", async () => {
      const faultyArray = [false, false, false, false, true];

      const initialValues: Value[] = [1, 1, 1, 0, 0];

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValues,
        faultyArray
      );

      servers.push(..._servers);

      await startConsensus(faultyArray.length);

      const time = new Date().getTime();

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      console.log("---------STATES", states);

      for (let index = 0; index < states.length; index++) {
        const state = states[index];

        if (faultyArray[index]) {
          expect(state.decided).toBeNull();
          expect(state.x).toBeNull();
          expect(state.k).toBeNull();
        } else {
          expect(state.decided).toBeTruthy();
          expect(state.x).toBe(1);
          expect(state.k).toBeLessThanOrEqual(2);
        }
      }
    });

    test.todo("Hidden test - Simple Majority - Unanimous Agreement - 1 pt");

    it("Finality is reached - Fault Tolerance Threshold - 1 pt", async () => {
      const faultyArray = [
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
      ];

      const initialValues: Value[] = [0, 0, 1, 1, 1, 0, 0, 1, 1];

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValues,
        faultyArray
      );

      servers.push(..._servers);

      const time = new Date().getTime();

      await startConsensus(faultyArray.length);

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      const consensusValues: (Value | null)[] = [];

      for (let index = 0; index < states.length; index++) {
        const state = states[index];

        if (faultyArray[index]) {
          expect(state.decided).toBeNull();
          expect(state.x).toBeNull();
          expect(state.k).toBeNull();
        } else {
          expect(state.decided).toBeTruthy();
          expect(state.k).not.toBeNull();
          expect(state.x).not.toBeNull();
          consensusValues.push(state.x);
        }
      }

      expect(
        consensusValues.find((el) => el !== consensusValues[0])
      ).toBeUndefined();
    });

    test.todo(
      "Hidden test - Fault Tolerance Threshold - Unanimous Agreement - 1 pt"
    );

    it("Finality is reached - Exceeding Fault Tolerance - 1 pt", async () => {
      const faultyArray = [
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
      ];

      const initialValues: Value[] = [0, 0, 1, 1, 1, 0, 0, 1, 1, 0];

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValues,
        faultyArray
      );

      servers.push(..._servers);

      const time = new Date().getTime();

      await startConsensus(faultyArray.length);

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      for (let index = 0; index < states.length; index++) {
        const state = states[index];

        if (faultyArray[index]) {
          expect(state.decided).toBeNull();
          expect(state.x).toBeNull();
          expect(state.k).toBeNull();
        } else {
          expect(state.decided).not.toBeTruthy();
          expect(state.k).toBeGreaterThan(10);
          expect(state.x).not.toBeNull();
        }
      }
    });

    test.todo(
      "Hidden test - Fault Tolerance Threshold - Exceeding Fault Tolerance - 1 pt"
    );

    it("Finality is reached - No Faulty Nodes - 1 pt", async () => {
      const faultyArray = [false, false, false, false, false];

      const _initialValues: Value[] = [0, 1, 0, 1, 1];

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        _initialValues,
        faultyArray
      );

      servers.push(..._servers);

      const time = new Date().getTime();

      await startConsensus(faultyArray.length);

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      for (let index = 0; index < states.length; index++) {
        const state = states[index];

        if (faultyArray[index]) {
          expect(state.decided).toBeNull();
          expect(state.x).toBeNull();
          expect(state.k).toBeNull();
        } else {
          expect(state.decided).toBeTruthy();
          expect(state.x).toBe(1);
          expect(state.k).toBeLessThanOrEqual(2);
        }
      }
    });

    test.todo(
      "Hidden test - Fault Tolerance Threshold - No Faulty Nodes - 1 pt"
    );

    it("Finality is reached - Randomized - 1 pt", async () => {
      const faultyArray = [false, false, true, false, true, false, false];

      const _initialValues: Value[] = new Array(7).fill(0);
      const initialValue = _initialValues.map(
        (el) => generateRandomValue() as Value
      );

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        initialValue,
        faultyArray
      );

      servers.push(..._servers);

      const time = new Date().getTime();

      await startConsensus(faultyArray.length);

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      const consensusValues: (Value | null)[] = [];

      for (let index = 0; index < states.length; index++) {
        const state = states[index];

        if (faultyArray[index]) {
          expect(state.decided).toBeNull();
          expect(state.x).toBeNull();
          expect(state.k).toBeNull();
        } else {
          expect(state.decided).toBeTruthy();
          expect(state.x).not.toBeNull();
          consensusValues.push(state.x);
        }
      }

      expect(
        consensusValues.find((el) => el !== consensusValues[0])
      ).toBeUndefined();
    });

    test.todo("Hidden test - Fault Tolerance Threshold - Randomized - 1 pt");

    it("Hidden Test - Finality is reached - One node - 1 pt", async () => {
      const faultyArray = [false];

      const _initialValues: Value[] = [1];

      const _servers = await launchNetwork(
        faultyArray.length,
        faultyArray.filter((el) => el === true).length,
        _initialValues,
        faultyArray
      );

      servers.push(..._servers);

      const time = new Date().getTime();

      await startConsensus(faultyArray.length);

      let states = await getNodesState(faultyArray.length);

      while (
        new Date().getTime() - time < timeLimit &&
        !reachedFinality(states)
      ) {
        await delay(200);

        states = await getNodesState(faultyArray.length);
      }

      expect(states.length).toBe(1);
      expect(states[0].decided).toBeTruthy();
      expect(states[0].x).toBe(1);
    });

    test.todo("Hidden test - Fault Tolerance Threshold - One node - 1 pt");

    test.todo("Hidden Test - 1 pt");
  });
});
