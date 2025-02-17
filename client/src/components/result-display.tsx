import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@shared/schema";

export default function ResultDisplay({ operation }: { operation: Operation }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Operation Type</h4>
            <p className="text-sm text-muted-foreground capitalize">{operation.type}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Model Used</h4>
            <p className="text-sm text-muted-foreground">{operation.modelId}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Results</h4>
            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(operation.result, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
