import { Navigate, useParams } from 'react-router-dom';
import { ErrorState, Spinner } from '@/components/ui';
import { useGetDriverByIdManager } from '@/modules/drivers/driversController';

export function DriverRedirect() {
  const { id = '' } = useParams();
  const { data: driver, isLoading, isError, error } = useGetDriverByIdManager({ driverId: id });

  if (isLoading) return <Spinner label="Opening profile…" />;
  if (isError || !driver) {
    return <ErrorState message={error?.message ?? 'Driver not found.'} />;
  }
  return <Navigate to={`/users/${driver.userId}`} replace />;
}
