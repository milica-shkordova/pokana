import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();

  const handleLogOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="home-page">
      <h1>HOME PAGE</h1>
      <button onClick={handleLogOut}>LOG OUT</button>
    </div>
  );
}
