import { guides } from "@/content/guides";
import { redirect } from "@/i18n/navigation";

export default async function GuidesIndex({ params }: PageProps<"/[locale]/guides">) {
  const { locale } = await params;
  redirect({ href: `/guides/${guides[0].slug}`, locale });
}
