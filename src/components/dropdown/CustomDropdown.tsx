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
      className="menu dropdown-content rounded-box mt-4 w-40 bg-base-100 p-2 shadow"
      tabIndex={0}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className={`menu-item text-wrap flex flex-row items-center justify-start ${
            selected === item.value ? 'bg-primary text-black' : ''
          }`}
        >
          <a
            className="btn btn-ghost btn-md flex w-full justify-start p-0"
            onClick={() => void setSelected(item.value)}
          >
            <div className={'flex flex-row items-center justify-start'}>
              {item.icon}
              <span className={'ml-2 text-start'}>{item.label}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  </div>
);
