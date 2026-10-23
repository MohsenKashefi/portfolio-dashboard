import { redirect } from "next/navigation";

// skills are now managed as the website's stack layers
export default function Skills() {
  redirect("/dashboard/stack");
}
