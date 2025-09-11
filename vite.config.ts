import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 4000, // change to your desired port
    host: true, // allows access from network
  },
  plugins: [react()],
});
