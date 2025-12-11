import AgentSidebar from "@/components/AgentSidebar";

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AgentSidebar />
            <div className="pl-64">
                {children}
            </div>
        </div>
    );
}
