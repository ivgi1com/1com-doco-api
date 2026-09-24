import { Sidebar } from "@/components/shell/sidebar-nav";

export default function ReferenceLayout({ children }: LayoutProps<"/[locale]/reference">) {
  return (
    <div className="flex">
      <Sidebar section="reference" />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
