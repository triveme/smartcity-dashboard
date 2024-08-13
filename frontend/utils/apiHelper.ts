import { deleteAuthData } from '@/api/authData-service';
import { deleteDashboard } from '@/api/dashboard-service';
import { deleteWidget } from '@/api/widget-service';

export async function deleteGenericItemById(
  accessToken: string | undefined,
  id: string,
  type: string,
): Promise<void> {
  switch (type) {
    case 'dashboard':
      await deleteDashboard(accessToken, id);
      break;
    case 'widget':
      await deleteWidget(accessToken, id);
      break;
    case 'AuthData':
      await deleteAuthData(accessToken, id);
      break;
    default:
      console.error('Unknown generic type');
      break;
  }
}
