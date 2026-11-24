import type { ReactNode } from 'react';
import { isApiError } from '../../services/api/client';
import { usePortfolio } from '../../services/api/portfolio';
import type { Portfolio } from '../../services/types/portfolio';
import { LoadingState, QueryErrorAlert } from '../AsyncStatus/AsyncStatus';

interface PortfolioQueryGateProps {
  subject: string;
  children: (context: {
    portfolio: Portfolio | undefined;
    missing: boolean;
  }) => ReactNode;
}

export function PortfolioQueryGate({
  subject,
  children,
}: PortfolioQueryGateProps) {
  const portfolioQuery = usePortfolio();

  const missing =
    portfolioQuery.isError &&
    isApiError(portfolioQuery.error) &&
    portfolioQuery.error.code === 'not_found';

  if (portfolioQuery.isLoading) {
    return <LoadingState />;
  }

  if (portfolioQuery.isError && !missing) {
    return (
      <QueryErrorAlert
        error={portfolioQuery.error}
        subject={subject}
        onRetry={() => void portfolioQuery.refetch()}
      />
    );
  }

  return <>{children({ portfolio: portfolioQuery.data, missing })}</>;
}
