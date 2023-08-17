import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";

export default function MultiSelectItem({
  options,
  label,
  setParentData,
  preSelectedData,
}) {
  const [data, setData] = useState(preSelectedData || []);

  useEffect(() => {
    setParentData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="py-3">
      <label className="form-label">{label}</label>
      <MultiSelect
        options={options}
        onChange={(e) => {
          setData(e);
        }}
        value={data}
        labelledBy={label}
      />
    </div>
  );
}
