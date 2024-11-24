import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dns from "dns";
import path from "path";

//changed Vite's default server to use http://localhost:3000 instead of http://127.0.0.1:5173
dns.setDefaultResultOrder("verbatim");

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: "localhost",
        port: 3000,
    },
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "./src/components"),
            "@constants": path.resolve(__dirname, "./src/constants"),
            "@enums": path.resolve(__dirname, "./src/enums"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
            "@interfaces": path.resolve(__dirname, "./src/interfaces"),
            "@routes": path.resolve(__dirname, "./src/routes"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@public": path.resolve(__dirname, "./src/public"),
            "@assets": path.resolve(__dirname, "./src/assets"),
            "@services": path.resolve(__dirname, "./src/services"),
            "@styles": path.resolve(__dirname, "./src/styles"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@root": path.resolve(__dirname),
        },
    },
});
