import Sidebar from '@/components/layout/Sidebar';

export default function DeploymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-12">
        {children}
      </div>
    </div>
  );
}
