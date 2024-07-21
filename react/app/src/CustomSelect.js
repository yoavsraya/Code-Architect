import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white' , width: '200px'}),
  menu: (styles) => ({ ...styles, backgroundColor: '#7d8c8a' }), // This line sets the background color of the menu
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      fontSize: '14px',
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? '#c1f0aa'
        : isFocused
        ? '#c1f0aa'
        : undefined,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? 'white'
        : 'black',
      cursor: isDisabled ? 'not-allowed' : 'default',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled
          ? isSelected
            ? '#c1f0aa'
            : '#c1f0aa'
          : undefined,
      },
    };
  },
  input: (styles) => ({ ...styles }),
  placeholder: (styles) => ({ ...styles }),
  singleValue: (styles) => ({ ...styles }),
};

const CustomSelect = ({ options, value, onChange }) => (
  <Select
    defaultValue={value}
    options={options}
    styles={customStyles}
    onChange={onChange}
  />
);

export default CustomSelect;
