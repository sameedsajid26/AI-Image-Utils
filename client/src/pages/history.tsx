import { useQuery } from "@tanstack/react-query";
import DashboardShell from "@/components/layout/dashboard-shell";
import ResultDisplay from "@/components/result-display";
import { Operation } from "@shared/schema";

export default function History() {
  const { data: operations, isLoading } = useQuery<Operation[]>({
    queryKey: ["/api/operations"],
  });

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold">Operation History</h2>
        
        <div className="space-y-4">
          {operations?.map((operation) => (
            <ResultDisplay key={operation.id} operation={operation} />
          ))}

          {operations?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No operations performed yet
            </p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
