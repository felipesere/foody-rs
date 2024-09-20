import { Link } from "@tanstack/react-router";
import { useUser } from "./apis/user.ts";
import { Route as RootRoute } from "./routes/__root.tsx";

export function Navbar() {
  const { token } = RootRoute.useRouteContext();

  return (
    <nav className="content-grid pt-4 border-solid border-black border-b-2 dotted-bg">
      <ul className="mb-4 flex flex-row justify-between">
        <li>
          <NavLink name={"Meal plan"} to={"/mealplan"} />
        </li>
        <li>
          <NavLink name={"Shopping"} to={"/"} />
        </li>
        <li>
          <NavLink name={"Ingredients"} to={"/ingredients"} />
        </li>
        <li>
          <NavLink name={"Recipes"} to={"/recipes"} />
        </li>
        <li>
          {token ? (
            <UserOrLogin token={token} />
          ) : (
            <NavLink name={"Login"} to={"/login"} />
          )}
        </li>
      </ul>
    </nav>
  );
}

function UserOrLogin(props: { token: string }) {
  const user = useUser(props.token);
  return <NavLink name={user.data ? user.data.name : "Login"} to={"/login"} />;
}

function NavLink(props: {
  name: string;
  // I would much rather use a type-safe variant here
  to: string;
}) {
  return (
    <Link
      activeProps={{
        className: "bg-gray-200 hover:bg-gray-300",
      }}
      inactiveProps={{
        className: "bg-white hover:bg-gray-100",
      }}
      className={"p-2 text-black border-black border-2 border-solid uppercase"}
      to={props.to}
    >
      {props.name}
    </Link>
  );
}
