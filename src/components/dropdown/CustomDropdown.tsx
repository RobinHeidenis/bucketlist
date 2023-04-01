interface CustomDropdownProps {
  items: { label: string; value: string; icon?: JSX.Element }[];
  label: string | JSX.Element;
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
  <div className="dropdown">
    <label
      className={`btn-ghost btn flex w-44 p-0 ${
        justifyStart ? 'justify-start' : ''
      }`}
      tabIndex={0}
    >
      {label}
    </label>
    <ul
      className="dropdown-content menu rounded-box mt-4 w-40 bg-base-100 p-2 shadow"
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
            className="btn-ghost btn-md btn flex w-full justify-start p-0"
            onClick={() => setSelected(item.value)}
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
