import { StandardPage } from '~/components/page/StandardPage';
import { api } from '~/utils/api';

const Watched = () => {
  const { data } = api.watched.getAllWatchInstances.useQuery();

  return (
    <StandardPage>
      <div className="prose alert flex flex-col shadow-xl">
        <h1 className={'mb-2'}>Watched</h1>
        <h4 className={'mt-0'}>
          This feature is coming soon. Stay tuned for future updates!
        </h4>
      </div>
    </StandardPage>
  );
};

export default Watched;
