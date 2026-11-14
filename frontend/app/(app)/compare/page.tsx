import { redirect } from "next/navigation";

// Everything for this page is on the dashboard, so the old address jumps to that section.
export default function Page() {
  redirect("/dashboard#plans");
}
