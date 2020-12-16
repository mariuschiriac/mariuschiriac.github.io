---
title: 'Migrate Javascript to Typescript'
date: 2020-12-16T00:00:00+00:00
hero: /images/client-server/es5-es6-typescript-circle-diagram.png
menu:
  sidebar:
    name: Migrate JS to TS
    identifier: react-migrate_js_ts
    parent: react
    weight: 10
---

In this guide we will see how to migrate a website with react from javascript to typescript

---

## Why Typescript

- **Code suggestions**: Typescript offers suggestions and options while you type. This saves a lot of effort and makes it easier for a new developer to use your source code. These code suggestions prevent wasted time, ease team communication, and make your codebase more consistent.

- **Readability and validation**: Since Typescript is a statically-typed system, you can add types to variables, functions, and properties, making your code far easier to read. Typescript also serves to eliminate React’s PropTypes, which makes React development easier.

- **Catch errors earlier and IntelliSense**: One of the most loved features of Typescript is its ability to highlight errors as soon as they crop up. Typescript shows you errors before you ever run the code, saving hours of time fixing bugs or mistakes early on.

- **Accurate code maintenance and refactoring**: As the codebase of a React app grows, it can become too difficult to read, share, or maintain. Navigating these codebases can be tedious, and refactoring code is risky. Typescript actually helps you refactor code and prevent typos, making it far easier to maintain and update without changing any of its behaviors.

- **Improves use of JavaScript**: Typescript integrates fully with JavaScript and uses the newest features available to a JavaScript developer. React projects built with Typescript compile to a version of JavaScript that runs on any browser.

## Converting project

The first step is to add the TypeScript compiler. You can install the compiler as a developer dependency using the --save-dev flag.

```
npm install --save-dev typescript
```

Based on this tsconfig.json file, the TypeScript compiler will (attempt to) compile any files ending with .ts or .tsx it finds in the src folder, and store the results in a folder named dist.

To add a file in root folder named _tsconfig.json_ you can use the command

```
npx tsc --init
```

than add to the file this option:

```
"compilerOptions": {
    "jsx": "react",
    [...]
```

To run use as always `npm start`

## Fix errors

now it's time to change _filename.js_ to _filename.ts_ (_filename.tsx_ if it contains html)

use `import` instead of `require`

than install the types for the correspective package: `npm i --save-dev @types/react`.

vscode will help you in right importing with the quick fix shortcut

add the types to your code and the model classes

If you find that something implicitly has the type any and you’re not sure how to fix it in that moment, don’t. Create this and use it to hush the error:

```
export type FixMeLater = any
```

## Conclusion

Now your project is typescript based, it's up to you choose how much strictfull it is.

<a href="https://github.com/typescript-cheatsheets/react#reacttypescript-cheatsheets" target="_blank">This</a> is a good resource where to found usefull snippets of react example in typescript
