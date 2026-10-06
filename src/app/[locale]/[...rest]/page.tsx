import { notFound } from "next/navigation";

// Any unknown address under a locale shows that locale's 404 page
// (app/[locale]/not-found.tsx) inside the localized layout, with its title.
export default function UnknownPage() {
  notFound();
}
