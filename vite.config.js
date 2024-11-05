import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dns from "dns";

//changed Vite's default server to use http://localhost:3000 instead of http://127.0.0.1:5173
dns.setDefaultResultOrder("verbatim");

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: "localhost",
        port: 3000,
    },
});
