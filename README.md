# ben-or-consensus-algorithm

Your goal for this exercise is to implement a version of the Ben Or consensus algorithm

This repository already implements the basic structure you need for the consensus network, your goal will be to implement the inner workings of the algorithm.

## The Ben-Or decentralized consensus algorithm

The Ben-Or consensus algorithm is making use of randomness to create consensus among a decentralised network of nodes. This type of algorithm is at the core of blockchain networks and other decentralised technologies.

To complete this exercise, you will need to dive into the inner workings of the algorithm and implement it. Here is a list of ressources to learn more about the technicalities of the algorithm:
- [https://muratbuffalo.blogspot.com/2019/12/the-ben-or-decentralized-consensus.html](https://muratbuffalo.blogspot.com/2019/12/the-ben-or-decentralized-consensus.html)
- [https://courses.cs.washington.edu/courses/cse452/19sp/slides/l13-benor.pdf](https://courses.cs.washington.edu/courses/cse452/19sp/slides/l13-benor.pdf)
- [https://decentralizedthoughts.github.io/2022-03-30-asynchronous-agreement-part-two-ben-ors-protocol/](https://decentralizedthoughts.github.io/2022-03-30-asynchronous-agreement-part-two-ben-ors-protocol/)

## Setting up the project

You will first need to install the dependencies of the project by running `yarn install` at the root of the project.

Note that the only required dependencies are already specified and no other package should be installed to complete this exercise.

Used packages are
- body-parser
- express

You should have Node installed at a version superior to v18.

## How to test your code

There are two ways to achieve this.

1. Run the unit tests with the command `yarn test` and see how your implementation performs against the given tests
2. Modify the `start.ts` file with the parameters you'd like, launch the network manually with `yarn start` and see the results

## Implementing the Ben-Or algorithm

Follow the [step by step instructions](./instructions.md) to complete this workshop.

## Grading

You are graded out of 20 points based on the unit tests provided in the `__test__/tests/` directory. 

Note that not all tests are provided so you can secure a number of points but the rest will be graded after you submit the exercise.

This exercise should be completed individually, you are not allowed to reuse code from other students. Any detected instances of copied code will incur a reduction of your grade.