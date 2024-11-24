import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes.const";

const Root = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        navigate(token ? routes.HOME : routes.LOGIN);
    }, []);

    return <Outlet />;
};

export default Root;
