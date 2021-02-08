---
title: 'Node: Migrate Javascript to Typescript'
date: 2020-12-09T00:00:00+00:00
hero: /images/client-server/es5-es6-typescript-circle-diagram.png
menu:
  sidebar:
    name: 'Node: Migrate JS to TS'
    identifier: client-server-migrate_js_ts
    parent: client-server
    weight: 12
---

In this guide we will see how to migrate a backend server with node.js 14 and express from javascript to typescript

---

## Why Typescript

- help developer to write consistent code
- makes code easier to read and to mantain

## Converting project

The first step is to add the TypeScript compiler. You can install the compiler as a developer dependency using the --save-dev flag.

```
npm install --save-dev typescript
```

Based on this tsconfig.json file, the TypeScript compiler will (attempt to) compile any files ending with .ts it finds in the src folder, and store the results in a folder named dist. Node.js uses the CommonJS module system, so the value for the module setting is commonjs. Also, the target version of JavaScript is ES6 (ES2015), which is compatible with modern versions of Node.js.

Add a file in root folder named _tsconfig.json_

```
{
  "extends": "@tsconfig/node14/tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "noImplicitAny": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist",
    "paths": {
      "*": ["node_modules/*"]
    },
    "resolveJsonModule": true
  }
}
```

It’s also a great idea to add tslint and create a tslint.json file that instructs TypeScript how to lint your code. If you’re not familiar with linting, it is a code analysis tool to alert you to potential problems in your code beyond syntax issues.

Install tslint as a developer dependency.

```
npm install --save-dev tslint
```

Add a file in root folder named _tslint.json_

```
{
  "defaultSeverity": "error",
  "extends": [
    "tslint:recommended"
  ],
  "jsRules": {},
  "rules": {
    "trailing-comma": [
      false
    ],
    "no-console": false
  },
  "rulesDirectory": []
}
```

Add _dist_ folder to gitignore

```
node_modules
[...]
dist
```

Next, update your package.json to change main to point to the new dist folder created by the TypeScript compiler. Also, add a couple of scripts to execute TSLint and the TypeScript compiler just before starting the Node.js server.

```
  "scripts": {
    "prebuild": "tslint -c tslint.json -p tsconfig.json --fix",
    "build": "tsc",
    "prestart": "npm run build",
    "start": "node dist/index.js"
  },
```

To run the server we will not use `node index.js`, but `npm start`

## Fix errors

now it's time to change _index.js_ to _index.ts_

You will see tons of errors, but no problem

1. Change require to import

```
const express = require('express'); //js
import express from 'express';      //ts
```

than install the types for the correspective package: `npm i --save-dev @types/express`.

vscode will help you in right importing with the quick fix shortcut

2. some packages hasn't the types module, in this case you can import with the require keyword, but it isn't recommended so try to use import first

```
require('dotenv').config({
  path: './backend/environments/develop.env',
});
```

3. add the types to your code and the model classes

```
import { UserType } from './Enums';

export default class TokenData {
  constructor(
    public userId: string,
    public userType: UserType,
    public bookingId?: string
  ) {}
}

export function readToken(value: string): TokenData {
  return jwt.verify(value, secretCode) as TokenData;
}
```

## Conclusion

When you fixed all compiler errors and run `npm start`. You will see that it creates the dist folder with the compiled javascript. The node environment will run the dist source code.
