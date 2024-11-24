import "./HomePage.scss";
import { routes } from "@constants/routes.const";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const handleLogOut = () => {
        localStorage.removeItem("token");
        navigate(`${routes.ROOT}${routes.LOGIN}`);
    };

    return (
        //temporary code
        <div className="home-page">
            <h1>HOME PAGE</h1>
            <button onClick={handleLogOut}>LOG OUT</button>
        </div>
    );
};

export default HomePage;
