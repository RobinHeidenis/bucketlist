import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import { Navbar } from '../../components/nav/Navbar';
import { ListHeaderMenu } from '../../components/list/ListHeaderMenu';
import { ListItem } from '../../components/list/ListItem';
import { Fragment } from 'react';

const List = () => {
  const router = useRouter();
  const { list: listId } = router.query;
  const { data: listData, isLoading } = api.lists.getList.useQuery(
    listId as string,
    { enabled: !!listId },
  );

  if (!listData && !isLoading) return <div>404</div>;

  if (!listData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
      <Navbar />
      <main className="mt-10 flex flex-col items-center justify-center">
        <div className="prose w-1/2">
          <h1 className="m-0 text-4xl">{listData.title}</h1>
          <p className="mt-3 text-xl">{listData.description}</p>
          <ListHeaderMenu {...listData} />
          <div className="divider" />
          <div className="mt-5">
            {listData.items.map((item) => (
              <Fragment key={item.id}>
                <ListItem {...item} />
                <div className="divider" />
              </Fragment>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default List;
