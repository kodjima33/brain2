# Brain<sup>2</sup>

Brain<sup>2</sup> is your handy cerebral companion

## Installation
Install the workspace dependencies by running
```
pnpm i
```

## Creating a new package
To create a new package, run the following command in the monorepo root:
```
pnpm turbo gen init
```

If you want to use the package live (with transpilation) in the nextjs app, be sure to update [next.config.js](https://github.com/gramliu/brain2/blob/5c96f97714cb81658cefd025a5b6b44009d5931c/apps/nextjs/next.config.js#L8).