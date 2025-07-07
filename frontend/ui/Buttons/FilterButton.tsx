import { ReactElement } from 'react';

type FilterButtonProps = {
  attributes: string[];
  onClick: (clickedAttribute: string) => void;
  filterColor: string | undefined;
  filterTextColor: string | undefined;
  clickedAttribute: string;
};

export default function FilterButton(props: FilterButtonProps): ReactElement {
  const {
    attributes,
    onClick,
    filterColor,
    filterTextColor,
    clickedAttribute,
  } = props;

  return (
    <div className="hidden sm:flex flex-col items-center gap-4 px-3 w-[250px]">
      {attributes.length > 0 &&
        attributes.map((attribute) => (
          <button
            key={`button-linechart-${attribute}`}
            onClick={() => onClick(attribute)}
            style={{
              width: '100%',
              padding: 4,
              color:
                clickedAttribute === attribute ? filterTextColor : filterColor,
              backgroundColor:
                clickedAttribute === attribute ? filterColor : 'transparent',
              borderColor: filterColor,
              borderRadius: '12px',
              borderWidth: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: 'calc(1em - 2px)',
            }}
          >
            {attribute}
          </button>
        ))}
    </div>
  );
}
