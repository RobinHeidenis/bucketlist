import { CustomDropdown } from '~/components/dropdown/CustomDropdown';
import { filterModeOptions } from '~/hooks/filterModes/filterModeOptions';
import { ArrowsUpDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

export const SortAndFilterHeader = ({
  filterMode,
  setFilterMode,
  setFilterText,
}: {
  filterMode: string;
  setFilterMode: (filterMode: string) => void;
  setFilterText: (filterText: string) => void;
}) => {
  return (
    <div className="sticky top-[65px] z-30 flex items-start justify-between backdrop-blur-md">
      <CustomDropdown
        items={filterModeOptions}
        label={
          <div className={'flex flex-row items-center justify-start'}>
            <ArrowsUpDownIcon className={'h-6 w-6'} />
            <span className={'pl-2 text-start'}>
              {filterMode === 'default'
                ? 'Sort'
                : filterModeOptions.find((i) => i.value === filterMode)
                    ?.label ?? ''}
            </span>
          </div>
        }
        selected={filterMode}
        setSelected={setFilterMode}
        justifyStart
      />
      <div className={`input-group flex items-center justify-end`}>
        <FunnelIcon className={'h-6 w-6'} />
        <input
          placeholder="Filter"
          onChange={(e) => {
            setFilterText(e.target.value.trim());
          }}
          className={`input input-ghost w-48`}
        />
      </div>
    </div>
  );
};
