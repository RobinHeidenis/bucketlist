import { useRouter } from 'next/router';
import { StandardPage } from '../../components/page/StandardPage';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import { SuccessToast } from '../../components/toasts/SuccessToast';
import { ErrorToast } from '../../components/toasts/ErrorToast';

const InvitePage = () => {
  const router = useRouter();
  const { code } = router.query;
  const { data, error } = api.invite.getInviteByCode.useQuery(
    { code: code as string },
    { enabled: !!code, retry: false },
  );

  const { mutate } = api.invite.joinList.useMutation({
    onSuccess: (data) => {
      toast.custom(<SuccessToast message="Successfully joined list!" />);
      void router.push(`/lists/${data.id}`);
    },
    onError: (error) => {
      toast.custom(<ErrorToast message={error.message} />);
    },
  });

  if (!data && error && error.data?.code === 'NOT_FOUND')
    return (
      <StandardPage>
        <div className="mx-0 grid h-[calc(100vh-200px)] place-content-center px-0">
          <div className="alert prose flex w-full flex-col p-5 shadow-xl">
            <h1 className="mb-2">Not Found</h1>
            <h3 className="mb-0">That invite was not found :(</h3>
            <h3 className="mt-0">
              Please check if the URL is correct and try again
            </h3>
            <button
              className="btn-primary btn"
              onClick={() => void router.push('/lists')}
            >
              Go back
            </button>
          </div>
        </div>
      </StandardPage>
    );

  if (!data || error)
    return (
      <StandardPage>
        <div className="mx-0 grid h-[calc(100vh-200px)] max-w-none place-content-center px-0">
          <div className="alert prose flex flex-col p-5 shadow-xl">
            <h1 className="mt-3 mb-3">
              {error?.message ?? 'Something went wrong'}
            </h1>
            <h3>
              Ask the person who sent you this to create a new link or try again
              later.
            </h3>
            <button
              className="btn-primary btn mt-3"
              onClick={() => void router.push('/lists')}
            >
              Go back
            </button>
          </div>
        </div>
      </StandardPage>
    );

  return (
    <StandardPage>
      <div className="prose mx-0 grid h-[calc(100vh-200px)] max-w-none place-content-center px-0">
        <h1 className="place-self-center">
          You&apos;ve been invited to join a list!
        </h1>
        <p className="place-self-center">
          {data.list.owner.name} has invited you to join {data.list.title}
        </p>
        <button
          className="btn-primary btn mt-5 w-2/3 place-self-center"
          onClick={() => {
            mutate({ id: data.id });
          }}
        >
          Accept invite
        </button>
      </div>
    </StandardPage>
  );
};

export default InvitePage;
