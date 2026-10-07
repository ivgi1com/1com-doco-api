import { guideApis, guidesForApi } from "@/content/guides";
import { redirect } from "@/i18n/navigation";

/** Guides open on the default API's first guide (Open API, Phase 8E). */
export default async function GuidesIndex({ params }: PageProps<"/[locale]/guides">) {
  const { locale } = await params;
  redirect({ href: `/guides/${guidesForApi(guideApis()[0].id)[0].slug}`, locale });
}
