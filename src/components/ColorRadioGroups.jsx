import { useState } from 'react';

const ColorRadioGroups = ({onCustomColors}) => {
  const colors = ['yellow', 'green', 'blue', 'purple'];
  const [selections, setSelections] = useState({
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0
  });

  const handleChange = (color, value) => {
    const newSelections = selections;
    newSelections[color] = value;
    setSelections(prev => ({ ...prev, [color]: value }));
    updateCustomColors(newSelections);
  };

  const updateCustomColors = (newSelections) => {
    onCustomColors(newSelections);
  }

  return (
    <div>
      {colors.map(color => (
        <div key={color} className="color-row">
          <h4>{color}</h4>
          <div>
            {[0, 1, 2, 3, 4].map(num => (
              <label key={`${color}-${num}`}>
                <input
                  type="radio"
                  name={color}
                  value={num}
                  checked={selections[color] === num}
                  onChange={() => handleChange(color, num)}
                  className="form-radio"
                />
                <span>{num}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorRadioGroups;