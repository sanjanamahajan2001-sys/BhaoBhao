````md
# Pet Grooming Booking System

This is a pet grooming booking system built with React, Redux, and TypeScript. It uses Vite as the development server and Rollup as the bundler.

## Running the application

To run the application, navigate to the root directory and run the following commands:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
````

The application will run by default at [http://localhost:5173](http://localhost:5173).

---

## Building for production

To build the application for production, run:

```bash
npm run build
```

This will generate the optimized build in the `dist/` folder.

---

## Preview production build

To locally preview the production build, run:

```bash
npm run preview
```

---

## Changing the port

By default, Vite runs on port **5173**.
To change this, update the `vite.config.ts` file:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // <- Change this to your preferred port
  },
});
```

After saving the changes, restart the development server:

```bash
npm run dev
```

Now the app will run at [http://localhost:3000](http://localhost:3000).

```

```
