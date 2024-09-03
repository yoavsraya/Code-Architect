import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white', width: '15rem' ,height: '2.9rem' }),
  menu: (styles) => ({ ...styles, backgroundColor: '#DFE6E0' }), // This line sets the background color of the menu
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
  placeholder: (styles) => ({ ...styles, color: '#282c34', fontStyle: 'italic' }), // Add custom styles for the placeholder
  singleValue: (styles) => ({ ...styles }),
};

const CustomSelect = ({ options, value, onChange, placeholder }) => (
  <Select
    defaultValue={value}
    options={options}
    styles={customStyles}
    onChange={onChange}
    placeholder={placeholder} // Add the placeholder prop here
  />
);

export default CustomSelect;
