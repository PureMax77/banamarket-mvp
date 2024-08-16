import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export default function Home() {
  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };

  return (
    <div>
      <form action={logOut}>
        <button className="btn">logout</button>
      </form>
    </div>
  );
}
