import { Link, LinkProps } from "@tanstack/react-router";
import { useUser } from "./models/api.ts";

export function Navbar() {
  const user = useUser();
  console.log(user.data);
  return (
    <nav className="content-grid pt-4 border-solid border-black border-b-2 dotted-bg">
      <ul className="mb-4 flex flex-row justify-between">
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
          {user.data ? (
            <button type={"button"}>{user.data.name}</button>
          ) : (
            <NavLink name={"Login"} to={"/login"} />
          )}
        </li>
      </ul>
    </nav>
  );
}

function NavLink(params: { name: string; to: LinkProps["to"] }) {
  return (
    <Link
      activeProps={{
        className: "bg-gray-200 hover:bg-gray-300",
      }}
      inactiveProps={{
        className: "bg-white hover:bg-gray-100",
      }}
      className="p-2 text-black border-black border-2 border-solid uppercase"
      to={params.to}
    >
      {params.name}
    </Link>
  );
}
