import { StandardPage } from '~/components/page/StandardPage';
import { api } from '~/utils/api';
import {
  Badge,
  Card,
  Chip,
  Collapse,
  Combobox,
  Flex,
  Group,
  Text,
  Title,
  useCombobox,
} from '@mantine/core';
import { PosterImage } from '~/components/movie/PosterImage';
import { useState } from 'react';
import {
  ArrowsUpDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useDisclosure } from '@mantine/hooks';

const Watched = () => {
  const { data } = api.watched.getAllWatchInstances.useQuery();
  const [moviesEnabled, setMoviesEnabled] = useState(true);
  const [showsEnabled, setShowsEnabled] = useState(true);
  const [opened, { toggle }] = useDisclosure(false);
  const combobox = useCombobox({
    onDropdownClose: () => void combobox.resetSelectedOption(),
  });
  const [filterMode, setFilterMode] = useState('a-z');

  return (
    <StandardPage>
      <div className={'flex w-full flex-row items-center justify-between'}>
        <FunnelIcon className={'ml-5 h-6 w-6'} onClick={toggle} />
        <Title>Watched</Title>
        <MagnifyingGlassIcon className={'mr-5 h-6 w-6'} />
      </div>
      <Collapse in={opened} className={'mb-2 mt-2 flex w-full'}>
        <div className={'flex w-full flex-row justify-between pl-3 pr-3'}>
          <Group gap={'xs'}>
            <Chip
              defaultChecked
              variant={'light'}
              value={'movies'}
              onChange={setMoviesEnabled}
            >
              Movies
            </Chip>
            <Chip
              defaultChecked
              variant={'light'}
              color={'red'}
              value={'shows'}
              onChange={setShowsEnabled}
            >
              Shows
            </Chip>
          </Group>
          <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
              setFilterMode(val);
              combobox.closeDropdown();
            }}
          >
            <Combobox.Target>
              <Badge
                variant={'light'}
                color={'blue'}
                p={'sm'}
                onClick={() => void combobox.toggleDropdown()}
                leftSection={<ArrowsUpDownIcon className={'h-4 w-4'} />}
              >
                {filterMode}
              </Badge>
            </Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options>
                <Combobox.Option value={'a-z'}>A-Z</Combobox.Option>
                <Combobox.Option value={'z-a'}>Z-A</Combobox.Option>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </div>
      </Collapse>
      <Flex
        className={'mt-2 w-full pl-3 pr-3'}
        wrap={'wrap'}
        justify={{ base: 'space-between', xs: 'start' }}
        gap={10}
      >
        {data &&
          [
            ...(moviesEnabled ? data.movies : []),
            ...(showsEnabled ? data.shows : []),
          ]
            .sort((a, b) =>
              a.title > b.title ? 1 : a.title < b.title ? -1 : 0,
            )
            .map((watchInstance) => {
              const isShow = 'totalEpisodes' in watchInstance;

              return (
                <Card
                  key={watchInstance.id}
                  withBorder
                  shadow="sm"
                  radius="md"
                  w={'150px'}
                  classNames={{
                    root: '!bg-base-100 items-center sm:mr-5 grow sm:grow-0',
                  }}
                >
                  <Badge
                    variant={'light'}
                    className={'mb-2'}
                    color={isShow ? 'red' : 'blue'}
                  >
                    {isShow ? 'Show' : 'Movie'}
                  </Badge>
                  <PosterImage
                    alt={watchInstance.title}
                    imageHash={watchInstance.imageHash}
                    url={watchInstance.posterUrl}
                    noMargin
                  />
                  <Text mt={5} ta={'center'} size={'sm'} lineClamp={2}>
                    {watchInstance.title}
                  </Text>
                </Card>
              );
            })}
      </Flex>
    </StandardPage>
  );
};

export default Watched;
