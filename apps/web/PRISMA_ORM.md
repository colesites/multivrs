# Prisma Postgres (/docs/prisma-orm/quickstart/prisma-postgres)

Location: Prisma ORM > Quickstart > Prisma Postgres

[Prisma Postgres](/postgres) is a fully managed PostgreSQL database that scales to zero and integrates smoothly with both Prisma ORM and Prisma Studio. In this guide, you will learn how to set up a new TypeScript project from scratch, connect it to Prisma Postgres using Prisma ORM, and generate a Prisma Client for easy, type-safe access to your database.

Prerequisites [#prerequisites]

1. Create a new project [#1-create-a-new-project]

```shell
mkdir hello-prisma
cd hello-prisma
```

Initialize a TypeScript project:

#### bun

```bash
bun init
bun add typescript tsx @types/node --dev
bunx --bun tsc --init
```

#### pnpm

```bash
pnpm init
pnpm add typescript tsx @types/node --save-dev
pnpm dlx tsc --init
```

#### yarn

```bash
yarn init
yarn add typescript tsx @types/node --dev
yarn dlx tsc --init
```

#### npm

```bash
npm init
npm install typescript tsx @types/node --save-dev
npx tsc --init
```

2. Install required dependencies [#2-install-required-dependencies]

Install the packages needed for this quickstart:

#### bun

```bash
bun add prisma @types/pg --dev
bun add @prisma/client @prisma/adapter-pg pg dotenv
```

#### pnpm

```bash
pnpm add prisma @types/pg --save-dev
pnpm add @prisma/client @prisma/adapter-pg pg dotenv
```

#### yarn

```bash
yarn add prisma @types/pg --dev
yarn add @prisma/client @prisma/adapter-pg pg dotenv
```

#### npm

```bash
npm install prisma @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv
```

Here's what each package does:

- **`prisma`** - The Prisma CLI for running commands like `prisma init`, `prisma migrate`, and `prisma generate`
- **`@prisma/client`** - The Prisma Client library for querying your database
- **`@prisma/adapter-pg`** - The [`node-postgres` driver adapter](/orm/core-concepts/supported-databases/postgresql#using-driver-adapters) that connects Prisma Client to your database
- **`pg`** - The node-postgres database driver
- **`@types/pg`** - TypeScript type definitions for node-postgres
- **`dotenv`** - Loads environment variables from your `.env` file

3. Configure ESM support [#3-configure-esm-support]

Update `tsconfig.json` for ESM compatibility:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  }
}
```

Update `package.json` to enable ESM:

```json title="package.json"
{
  "type": "module" // [!code ++]
}
```

4. Initialize Prisma ORM [#4-initialize-prisma-orm]

You can now invoke the Prisma CLI by prefixing it with `npx`:

#### bun

```bash
bunx --bun prisma
```

#### pnpm

```bash
pnpm dlx prisma
```

#### yarn

```bash
yarn dlx prisma
```

#### npm

```bash
npx prisma
```

Next, set up your Prisma ORM project by creating your [Prisma Schema](/orm/prisma-schema/overview) file with the following command:

#### bun

```bash
bunx --bun prisma init --output ../generated/prisma
```

#### pnpm

```bash
pnpm dlx prisma init --output ../generated/prisma
```

#### yarn

```bash
yarn dlx prisma init --output ../generated/prisma
```

#### npm

```bash
npx prisma init --output ../generated/prisma
```

`prisma init` creates the Prisma scaffolding and a local `DATABASE_URL`.

This command does a few things:

- Creates a `prisma/` directory with a `schema.prisma` file containing your database connection and schema models
- Creates a `.env` file in the root directory for environment variables
- Creates a `prisma.config.ts` file for Prisma configuration

The generated `prisma.config.ts` file looks like this:

```typescript title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

The generated schema uses [the ESM-first `prisma-client` generator](/orm/prisma-schema/overview/generators#prisma-client) with a custom output path:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Create a Prisma Postgres database and replace the generated `DATABASE_URL` in your `.env` file with the `postgres://...` connection string from the CLI output:

#### bun

```bash
bunx --bun create-db
```

#### pnpm

```bash
pnpm dlx create-db
```

#### yarn

```bash
yarn dlx create-db
```

#### npm

```bash
npx create-db
```

5. Define your data model [#5-define-your-data-model]

Open `prisma/schema.prisma` and add the following models:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User { // [!code ++]
  id    Int     @id @default(autoincrement()) // [!code ++]
  email String  @unique // [!code ++]
  name  String? // [!code ++]
  posts Post[] // [!code ++]
} // [!code ++]

model Post { // [!code ++]
  id        Int     @id @default(autoincrement()) // [!code ++]
  title     String // [!code ++]
  content   String? // [!code ++]
  published Boolean @default(false) // [!code ++]
  author    User    @relation(fields: [authorId], references: [id]) // [!code ++]
  authorId  Int // [!code ++]
} // [!code ++]
```

6. Create and apply your first migration [#6-create-and-apply-your-first-migration]

Create your first migration to set up the database tables:

#### bun

```bash
bunx --bun prisma migrate dev --name init
```

#### pnpm

```bash
pnpm dlx prisma migrate dev --name init
```

#### yarn

```bash
yarn dlx prisma migrate dev --name init
```

#### npm

```bash
npx prisma migrate dev --name init
```

This command creates the database tables based on your schema.

Now run the following command to generate the Prisma Client:

#### bun

```bash
bunx --bun prisma generate
```

#### pnpm

```bash
pnpm dlx prisma generate
```

#### yarn

```bash
yarn dlx prisma generate
```

#### npm

```bash
npx prisma generate
```

7. Instantiate Prisma Client [#7-instantiate-prisma-client]

Now that you have all the dependencies installed, you can instantiate Prisma Client. You need to pass an instance of the Prisma ORM driver adapter to the `PrismaClient` constructor:

```typescript title="lib/prisma.ts"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

> [!NOTE]
> If you need to query your database via HTTP from an edge runtime (Cloudflare Workers, Vercel Edge Functions, etc.), use the [Prisma Postgres serverless driver](/postgres/database/serverless-driver#use-with-prisma-orm).

8. Write your first query [#8-write-your-first-query]

Create a `script.ts` file to test your setup:

```typescript title="script.ts"
import { prisma } from "./lib/prisma";

async function main() {
  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post!",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log("Created user:", user);

  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run the script:

#### bun

```bash
bunx --bun tsx script.ts
```

#### pnpm

```bash
pnpm dlx tsx script.ts
```

#### yarn

```bash
yarn dlx tsx script.ts
```

#### npm

```bash
npx tsx script.ts
```

You should see the created user and all users printed to the console!

9. Explore your data with Prisma Studio [#9-explore-your-data-with-prisma-studio]

Prisma Studio is a visual editor for your database. Launch it with:

```shell
npx prisma studio
```

Next steps [#next-steps]

You've successfully set up Prisma ORM. Here's what you can explore next:

- **Learn more about Prisma Client**: Explore the [Prisma Client API](/orm/prisma-client/setup-and-configuration/introduction) for advanced querying, filtering, and relations
- **Database migrations**: Learn about [Prisma Migrate](/orm/prisma-migrate) for evolving your database schema
- **Performance optimization**: Discover [query optimization techniques](/orm/prisma-client/queries/advanced/query-optimization-performance)
- **Build a full application**: Check out our [framework guides](/guides) to integrate Prisma ORM with Next.js, Express, and more
- **Join the community**: Connect with other developers on [Discord](https://pris.ly/discord)

> [!NOTE]
> Deploy to Compute
>
> Want to run this app in the cloud? Deploy it to [Prisma Compute](/compute), which runs your app next to your Prisma Postgres database. Follow [Deploy your first app](/prisma-compute/deploy).

More info [#more-info]

- [Prisma Postgres documentation](/postgres)
- [Prisma Config reference](/orm/reference/prisma-config-reference)
- [Database connection management](/orm/prisma-client/setup-and-configuration/databases-connections)

## Related pages

- [`CockroachDB`](https://www.prisma.io/docs/prisma-orm/quickstart/cockroachdb): Create a new TypeScript project from scratch by connecting Prisma ORM to CockroachDB and generating a Prisma Client for database access
- [`MongoDB`](https://www.prisma.io/docs/prisma-orm/quickstart/mongodb): Create a new TypeScript project from scratch by connecting Prisma ORM to MongoDB and generating a Prisma Client for database access
- [`MySQL`](https://www.prisma.io/docs/prisma-orm/quickstart/mysql): Create a new TypeScript project from scratch by connecting Prisma ORM to MySQL and generating a Prisma Client for database access
- [`PlanetScale`](https://www.prisma.io/docs/prisma-orm/quickstart/planetscale): Create a new TypeScript project from scratch by connecting Prisma ORM to PlanetScale and generating a Prisma Client for database access
- [`PostgreSQL`](https://www.prisma.io/docs/prisma-orm/quickstart/postgresql): Create a new TypeScript project from scratch by connecting Prisma ORM to PostgreSQL and generating a Prisma Client for database access
