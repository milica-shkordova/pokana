import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@routes/routes";
import config from "@root/config.json";

const App = () => {
    useEffect(() => {
        config.theme.forEach((theme) => {
            const color_name: string = Object.keys(theme)[0];
            const color_value = (theme as any)[color_name];

            document.documentElement.style.setProperty(
                `--color-${color_name}`,
                color_value
            );
        });
    }, [config]);

    return <RouterProvider router={router} />;
};

export default App;
