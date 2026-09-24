import { redirect } from "@/i18n/navigation";
import { apis } from "@/content";

export default async function ReferenceIndex({ params }: PageProps<"/[locale]/reference">) {
  const { locale } = await params;
  redirect({ href: `/reference/${apis[0].id}`, locale });
}
