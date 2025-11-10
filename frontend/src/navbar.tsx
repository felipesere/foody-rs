import { Link } from "@tanstack/react-router";
import { useUser } from "./apis/user.ts";
import { Route as RootRoute } from "./routes/__root.tsx";

export function Navbar() {
  const { token } = RootRoute.useRouteContext();

  return (
    <nav className="content-grid py-1lh border-solid border-black border-b-2 dotted-bg">
      <ul className="flex flex-wrap gap-x-1ch gap-y-2lh">
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
      className={
        "px-1ch py-0.5lh text-black border-black border-2 border-solid uppercase"
      }
      to={props.to}
    >
      {props.name}
    </Link>
  );
}
