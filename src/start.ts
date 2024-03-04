import { launchNetwork } from ".";
import { startConsensus } from "./nodes/consensus";
import { Value } from "./types";
import { delay } from "./utils";

async function main() {
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
    false,
  ];

  const initialValues: Value[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  if (initialValues.length !== faultyArray.length)
    throw new Error("Lengths don't match");

  if (
    faultyArray.filter((faulty) => faulty === true).length >
    initialValues.length / 2
  )
    throw new Error("Too many faulty nodes");

  await launchNetwork(
    initialValues.length,
    faultyArray.filter((el) => el === true).length,
    initialValues,
    faultyArray
  );

  await delay(200);

  await startConsensus(initialValues.length);
}

main();
