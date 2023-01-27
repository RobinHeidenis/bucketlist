import { trpc } from '../utils/trpc';
import { Navbar } from '../components/nav/Navbar';

const Lists = () => {
  const { data: lists } = trpc.auth.getLists.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <Navbar />
      <main className="mt-10 flex flex-col items-center justify-center">
        <h1 className="text-4xl">Lists</h1>
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {lists?.map((list) => (
            <article
              key={list.id}
              className="card h-48 w-72 transform cursor-pointer bg-base-100 shadow-xl transition duration-300 hover:scale-110"
            >
              <div className="card-body">
                <h2 className="card-title">{list.title}</h2>
                <p className="line-clamp-3">{list.description}</p>
                <div className="card-actions">
                  <p>
                    {list.items?.length} items |{' '}
                    {list.items.filter((item) => item.checked).length} checked
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Lists;
