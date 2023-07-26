import { SignIn } from '@clerk/nextjs';
import { StandardPage } from '~/components/page/StandardPage';

export default function Page() {
  return (
    <StandardPage>
      <div className={'flex h-[85vh] flex-col items-center justify-center'}>
        <SignIn />
      </div>
    </StandardPage>
  );
}
