import { redirect } from "next/navigation";

// the sign-in form lives on the home page
export default function Login() {
  redirect("/");
}
