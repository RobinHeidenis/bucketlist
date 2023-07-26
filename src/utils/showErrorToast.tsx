import toast from 'react-hot-toast';
import { ErrorToast } from '~/components/toasts/ErrorToast';

export const showErrorToast = ({ message }: { message: string }) => {
  toast.custom(<ErrorToast message={message} />);
};
