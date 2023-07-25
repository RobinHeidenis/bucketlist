import {
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { TIcon } from '~/components/list/movie/TIcon';
import { StarIcon } from '@heroicons/react/24/solid';

export const filterModeOptions = [
  {
    value: 'default',
    label: 'Default',
    icon: <ArrowsUpDownIcon className={'h-6 w-6'} />,
  },
  {
    value: 'seen',
    label: 'Seen',
    icon: <EyeIcon className={'h-6 w-6'} />,
  },
  {
    value: 'notSeen',
    label: 'Not seen',
    icon: <EyeSlashIcon className={'h-6 w-6'} />,
  },
  {
    value: 'alphabetically',
    label: 'Title (A-Z)',
    icon: <TIcon />,
  },
  { value: 'alphabeticallyReverse', label: 'Title (Z-A)', icon: <TIcon /> },
  {
    value: 'releaseDate',
    label: 'Release Date (newest)',
    icon: <CalendarDaysIcon className={'h-6 w-6'} />,
  },
  {
    value: 'releaseDateReverse',
    label: 'Release Date (oldest)',
    icon: <CalendarDaysIcon className={'h-6 w-6'} />,
  },
  {
    value: 'rating',
    label: 'Ratings (highest)',
    icon: <StarIcon className={'h-6 w-6'} />,
  },
  {
    value: 'ratingReverse',
    label: 'Ratings (lowest)',
    icon: <StarIcon className={'h-6 w-6'} />,
  },
];
