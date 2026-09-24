/** Guide registry. Phase 2 ships one synthetic guide to exercise the guide layout. */
export interface GuideMeta {
  slug: string;
  title: string;
  summary: string;
  synthetic: boolean;
}

export const guides: GuideMeta[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    summary: "Create an API key, send your first request and read the response.",
    synthetic: true,
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
