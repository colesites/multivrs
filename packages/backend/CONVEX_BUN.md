Learn how to query data from Convex in a Bun project.

For instructions for subscriptions instead of point-in-time queries see [Bun notes](/client/javascript/bun.md).

# Using Convex with Bun

1. Create a new Bun project

   Create a new directory for your Bun project.

   ```
   mkdir my-project && cd my-project && bun init -y
   ```

2. Install the Convex client and server library

   Install the `convex` package.

   ```
   bun add convex
   ```

3. Set up a Convex dev deployment

   Next, run `bunx convex dev`. This will prompt you to log in with GitHub, create a project, and save your production and deployment URLs.

   It will also create a `convex/` folder for you to write your backend API functions in. The `dev` command will then continue running to sync your functions with your dev deployment in the cloud.

   ```
   bunx convex dev
   ```

4. Create sample data for your database

   In a new terminal window, create a `sampleData.jsonl` file with some sample data.

   sampleData.jsonl

   ```
   {"text": "Buy groceries", "isCompleted": true}

   {"text": "Go for a swim", "isCompleted": true}

   {"text": "Integrate Convex", "isCompleted": false}
   ```

5. Add the sample data to your database

   Now that your project is ready, add a `tasks` table with the sample data into your Convex database with the `import` command.

   ```
   bunx convex import --table tasks sampleData.jsonl
   ```

6. Expose a database query

   Add a new file `tasks.ts` in the `convex/` folder with a query function that loads the data.

   Exporting a query function from this file declares an API function named after the file and the export name, `api.tasks.get`.

   convex/tasks.ts

   ```
   import { query } from "./_generated/server";



   export const get = query({

     args: {},

     handler: async (ctx) => {

       return await ctx.db.query("tasks").collect();

     },

   });
   ```

7. Connect the script to your backend

   In a new file `index.ts`, create a `ConvexClient` using the URL of your development environment.

   index.ts

   ```
   import { ConvexClient } from "convex/browser";

   import { api } from "./convex/_generated/api.js";



   const client = new ConvexClient(process.env["CONVEX_URL"]);



   const unsubscribe = client.onUpdate(api.tasks.get, {}, async (tasks) => {

     console.log(tasks);

   });



   await Bun.sleep(1000);

   unsubscribe();

   await client.close();
   ```

8. Run the script

   Run the script from the same directory and see the list of tasks logged to the terminal.

   ```
   bun index.ts
   ```

See the complete [Bun documentation](/client/javascript/bun.md).
