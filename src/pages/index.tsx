import { type NextPage } from 'next';
import Head from 'next/head';
import { Navbar } from '~/components/nav/Navbar';

const Home: NextPage = () => (
  <>
    <Head>
      <title>BucketList</title>
      <meta
        name="description"
        content="BucketList app for todo lists, movies, and shows"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Navbar />
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="prose">
        <h1>BucketList</h1>
        <h3>
          A place to store all your todo&apos;s, movies to watch, and shows you
          got recommended months ago but still haven&apos;t watched
        </h3>
      </div>
    </main>
  </>
);

export default Home;
