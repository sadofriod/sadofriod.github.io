---
title: 'Running only the E2E tests your commit actually affects'
date: '2022-08-08 19:51:42'
excerpt: 'How we cut CI time by selecting E2E specs from the git diff: base-commit detection, AST-free path matching, and streaming the run in real time.'
description: 'An incremental E2E runner for large frontends: pick the base commit from the branch, diff it against HEAD, keep the specs the change can touch, and stream the Cypress output so CI does not time out.'
tags: project
p: project
categories: project
keywords: 'incremental e2e testing,e2e tests too slow,cypress run only changed specs,playwright run only changed tests,test selection git diff,ci test optimization,frontend testing engineering'
lang: en
translationKey: incremental-e2e-testing
---

<img src="/images/e2e-testing-banner.png" />

## Prerequisites

What you should know before reading:

+ [What E2E testing is](https://katalon.com/resources-center/blog/end-to-end-e2e-testing)
+ [Cypress, the E2E framework](https://docs.cypress.io/guides/overview/why-cypress)
+ Common `git` commands
+ Basics of `nodejs`

## The problem

As a project iterates, new features are added and old ones are rewritten, so the E2E suite keeps growing. But a given change never touches all of it. So: can we run only the E2E specs that this commit affects?

## Breaking the problem down

I split it into four sub-problems:

1. What is the base commit to compare against?
2. How do we get that commit's id?
3. How do we get the set of changes between this commit and the base?
4. How do we run only the updated files, and stream the logs while it runs?

### Analysis

+ **Problem 1**
  + Usually the comparison is between this `commit` and the commit the current branch was created from — the branch normally starts from the latest `master`, and the E2E on `master` has, in most cases, already been verified.
  + Comparing against a specific commit: useful when you need to chase a bug introduced by a particular change. The specific `commitID` is marked inside the commit message.
  + Running the full suite: when the project actually ships to production we still want a complete E2E pass for availability. Running everything is also requested by a marker in the commit message.
+ **Problems 2 and 3:** drive `git` through nodejs' `child_process` module and extract what we need with regular expressions.
+ **Problem 4:** drive `cypress` through `child_process` as well, but pipe the output through a `Stream` so it appears in real time.

## The solution

### Getting the base commit id to compare against

+ **The usual case**
```typescript
const getBranchFirstCommitID = () => {
  return new Promise<string>((res, rej) => {
    // compare with master
    exec('git cherry -v master', (err, data) => {
      if (err) rej(err);
      const dataArr = data.split('\n') as string[];
      const commitContent = dataArr[0].split(' ');

      res(commitContent[1]);
    });
  });
};
```

+ **Comparing against a specific commit**
```typescript
const getCurrentCommit = () => {
  return new Promise<string>((res, rej) =>
    exec(`git log -1`, (err, stdout, stderr) => {
      if (err) {
        rej(stderr);
      }
      res(stdout);
    })
  );
};
const getCompareCommitID = async () => {
  const commitContent = await getCurrentCommit();
  const regx = /\[Compare: (.+?)\]/;
  if (!regx.test(commitContent)) {
    return await getBranchFirstCommitID();
  }
  const resultArray = commitContent.match(regx) as RegExpMatchArray;
  return resultArray[1];
};
```
If `getCompareCommitID` returns `'ALL'`, the whole E2E suite runs.

### Getting the changes between two commits

**The convention here: every E2E file path contains the string `cypress`.**

```typescript
const getDiffFlies = (baseCommitID: string, commitID: string) => {
  return new Promise<string>((res, rej) =>
    exec(`git diff --name-only ${baseCommitID} ${commitID}`, (err, stdout, stderr) => {
      if (err) {
        rej(stderr);
      }
      res(stdout);
    })
  );
};

const getCommitID = (index: number) => {
  return new Promise<string>((res, rej) =>
    exec(`git show HEAD~${index} --pretty=format:"%h" --no-patch`, (err, stdout) => {
      if (err) {
        rej(err);
      }
      res(stdout);
    })
  );
};

// Some project structures hold several subsystems, so we match the current one
const getProjectDiffFiles = async () => {
  try {
    const compareCommitID = await getCompareCommitID();
    const currentCommitID = await getCommitID(0);
    if (compareCommitID === 'ALL') {
      // it will run all tests
      return [];
    }

    const diffFiles = (await getDiffFlies(currentCommitID, compareCommitID)).split('\n');
    const currentProjectDiffFile = diffFiles
      .filter((file) => {
        const {dir} = parse(file);
        const currentDirArr = __dirname.split(sep);
        const currentDir = currentDirArr[currentDirArr.length - 2] as string;
        if (dir.includes(currentDir) && dir.includes('cypress')) {
          return true;
        }
        return false;
      })
      .map((file) => {
        return join(...file.split(sep).slice(2)) as string;
      });
    return currentProjectDiffFile;
  } catch (error) {
    console.log(error); // eslint-disable-line
    throw new Error('get commit id is fail');
  }
};
```

### Running only the changed specs, with live logs

`child_process` offers several ways to run a command. `exec` is the usual choice, but it only emits output once the command has finished, and CI steps usually have a response-time budget — a long E2E run through `exec` can time out.

So I use `spawn`, which streams the log while the command runs.

```typescript
const testRunner = (specPath: string[]) => {
  console.log('It will run test', specPath.join(',')); // eslint-disable-line
  const runner = spawn('cypress', ['run', '--headless', '--spec', specPath.join(',')]);
  runner.stderr.on('data', (data) => {
    if (data) console.log(data.toString()); // eslint-disable-line
  });
  runner.stdout.on('data', (data) => {
    console.log(data.toString()); // eslint-disable-line
  });
};

const main = async () => {
  const testPath = await getProjectDiffFiles();
  testRunner(testPath);
};
```

That is incremental E2E testing.
