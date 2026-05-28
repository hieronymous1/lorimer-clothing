"use client";

import { ErrorState } from "@/components/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <ErrorState
      title="The requested route could not be composed cleanly."
      description="A content or integration boundary interrupted the page before it could settle into the archive. Retrying will request the route again."
      reset={reset}
    />
  );
}
