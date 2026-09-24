import { Sidebar } from "@/components/shell/sidebar-nav";

export default function GuidesLayout({ children }: LayoutProps<"/[locale]/guides">) {
  return (
    <div className="flex">
      <Sidebar section="guides" />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
