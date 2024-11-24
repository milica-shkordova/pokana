import Root from "./Root/Root";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "@pages/ErrorPage/ErrorPage";
import { routes } from "@constants/routes.const";
import LoginPage from "@pages/LoginPage/LoginPage";
import HomePage from "@pages/HomePage/HomePage";

export const router = createBrowserRouter([
    {
        path: routes.ROOT,
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: routes.HOME,
                element: <HomePage />,
            },
            {
                path: routes.LOGIN,
                element: <LoginPage />,
            },
        ],
    },
]);
