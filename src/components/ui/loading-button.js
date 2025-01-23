import { Button } from "./button";
import { LoadingSpinner } from "./loading";

export function LoadingButton({ children, loading, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
} 