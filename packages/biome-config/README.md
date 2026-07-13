# @repo/biome-config

Shared [Biome](https://biomejs.dev) configuration for the monorepo, replacing ESLint + Prettier.

## Available Presets

| Export            | Use For                          |
| ----------------- | -------------------------------- |
| `./base`          | General TypeScript/Node packages |
| `./next-js`       | Next.js applications             |
| `./react-library` | React component libraries        |

## Usage

Create a `biome.json` in your package/app:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.0/schema.json",
  "extends": ["@repo/biome-config/base"]
}
```

For a Next.js app:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.0/schema.json",
  "extends": ["@repo/biome-config/next-js"]
}
```

For a React component library:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.0/schema.json",
  "extends": ["@repo/biome-config/react-library"]
}
```

## Scripts

In your package's `package.json`:

```json
{
  "scripts": {
    "lint": "biome check .",
    "format": "biome check --fix ."
  },
  "devDependencies": {
    "@repo/biome-config": "*"
  }
}
```
