import { type ReactElement } from 'react';

interface CustomDropdownProps {
  items: { label: string; value: string; icon?: ReactElement }[];
  label: string | ReactElement;
  selected: string;
  setSelected: (value: string) => void;
  justifyStart?: boolean;
}

export const CustomDropdown = ({
  items,
  label,
  selected,
  setSelected,
  justifyStart = false,
}: CustomDropdownProps) => (
  <div className="dropdown z-50">
    <label
      className={`btn btn-ghost flex w-44 p-0 ${
        justifyStart ? 'justify-start' : ''
      }`}
      tabIndex={0}
    >
      {label}
    </label>
    <ul
      className="dropdown-content menu rounded-box mt-4 bg-base-100 p-2 font-semibold"
      tabIndex={0}
    >
      {items.map((item, index) => (
        <li key={index} className={'not-prose'}>
          <a
            className={`${selected === item.value ? 'active' : ''} pl-1`}
            onClick={() => void setSelected(item.value)}
          >
            {item.icon}
            <span className={'ml-2 text-start'}>
              {item.label.toUpperCase()}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);
