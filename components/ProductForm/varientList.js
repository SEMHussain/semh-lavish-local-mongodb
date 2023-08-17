import { useEffect, useState } from "react";
import ModalCard from "../Ui/customModalCard";
import { MultiSelect } from "react-multi-select-component";
import FileUpload from "../FileUpload/fileUpload";
import CustomSelect from "../CustomSelect";

export default function AddVarient({
  close,
  attribute,
  selectedAttrs,
  color,
  setVariable,
  primary,
  galleryImage,
}) {
  const [selPrimary, setSelPrimary] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [attr, setAttr] = useState([]);
  const [__attribute, __setAttribute] = useState([]);
  const [attrVals, setAttrVals] = useState([]);
  const [variant, setVarient] = useState({});

  function getPrimaryArr() {
    if (primary === "color") {
      return color;
    } else {
      let arr = __attribute.find((x) => x.name === primary);
      return arr ? arr.values : [];
    }
  }

  useEffect(() => {
    if (primary !== "color") {
      let arr = __attribute.filter((x) => x.name !== primary);
      setAttr(arr);
    } else {
      setAttr(__attribute);
    }
  }, [__attribute, primary]);

  useEffect(() => {
    if (selectedAttrs.length > 0) {
      let arr = [];
      selectedAttrs.forEach((y) => {
        let output = attribute.find((x) => x.name === y.label);
        output && arr.push(output);
      });
      __setAttribute(arr);
    }
  }, [selectedAttrs, attribute]);

  function multiColorOption() {
    const colorOption = [];
    color.map((color) =>
      colorOption.push({ label: color.name, value: color.value })
    );
    return colorOption;
  }
  // const [attr, setAttr] = useState(selectedAttrs || []);

  function genAttrOpt(i) {
    const c = attr.find((x) => x.name === i);
    if (c.values) {
      const option = [];
      c.values.map((t) =>
        option.push({ label: t.name, value: t.name, title: i })
      );
      return option;
    }
    return [];
  }
  function insAttr(x, i, type) {
    const a = [...attrVals];
    a[i] = x;
    setAttrVals(a);
  }

  function getColorVal(y) {
    const r = color.find((x) => x.name === y);
    return r ? r.value : null;
  }

  function generateData() {
    let data = {};
    data.title = primary.toLowerCase();
    data[primary.toLowerCase()] = {
      name: selPrimary,
      image: null,
      value: primary === "color" ? getColorVal(selPrimary) : null,
    };
    if (primary !== "color" && selectedColors.length > 0) {
      selectedColors.forEach((elem) => {
        let x = {
          name: elem.label,
          value: elem.value,
          image: null,
          qty: 0,
          price: 0,
        };
        data["color"] ? data["color"].push(x) : (data["color"] = [x]);
      });
    }
    for (let i = 0; i < attrVals.length; i++) {
      const el = attrVals[i];
      el.forEach((elem) => {
        let x = { name: elem.label, image: "", qty: 0, price: 0 };
        data[elem.title] ? data[elem.title].push(x) : (data[elem.title] = [x]);
      });
    }
    setVarient(data);
  }

  useEffect(() => {
    generateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attrVals, selPrimary, selectedColors]);

  function setItemData(accessKey, targetType, value, index) {
    let data = { ...variant };
    data[accessKey][index][targetType] = value;
    setVarient(data);
  }

  function addVarient(e) {
    e.preventDefault();
    let data = { ...variant };
    data.id = Math.floor(Math.random() * 6000);
    setVariable(data);
    close();
  }

  return (
    <ModalCard handleClose={() => close()} compact={false}>
      <>
        <form onSubmit={addVarient}>
          <div className="py-3">
            <label className="form-label">{primary} (Primary)</label>
            <select
              className="form-control"
              defaultValue=""
              onChange={(evt) => setSelPrimary(evt.target.value)}
              required
            >
              <option value="">Select {primary.toLowerCase()}</option>
              {getPrimaryArr().map((x, idx) => (
                <option value={x.name} key={idx}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          {primary !== "color" && (
            <>
              <label className="form-label">Color</label>
              <MultiSelect
                options={multiColorOption()}
                onChange={(e) => {
                  setSelectedColors(e);
                }}
                value={selectedColors}
                labelledBy="Select Color"
              />
            </>
          )}
          {attr.length > 0 &&
            attr.map((x, i) => (
              <div className="py-3" key={i}>
                <label className="form-label">{x.name}</label>
                <MultiSelect
                  options={genAttrOpt(x.name)}
                  onChange={(evt) => insAttr(evt, i, x.name)}
                  value={attrVals[i] || []}
                  labelledBy={x.name}
                />
              </div>
            ))}

          {Object.keys(variant).map((key) => {
            return (
              Array.isArray(variant[key]) &&
              variant[key].map((x, i) => (
                <div key={i} className="py-2">
                  <label className="text-danger">
                    {key} ({x.name})
                  </label>
                  <div className="row border-bottom">
                    <div className="col-12 col-md-2">
                      <div className="py-3">
                        <label className="form-label">Additional Price*</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          name="price"
                          required
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            setItemData(key, "price", +e.target.value, i)
                          }
                        />
                        <div className="small text-primary">
                          Set 0 to make it free
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-2">
                      <div className="py-3">
                        <label className="form-label">Item Quantity*</label>
                        <input
                          type="number"
                          min="-1"
                          className="form-control"
                          name="qty"
                          required
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            setItemData(key, "qty", +e.target.value, i)
                          }
                        />
                        {/* <div className="small text-primary">
                        Set -1 to make it unlimited
                      </div> */}
                      </div>
                    </div>
                    <div className="col-12 col-md-2">
                      <div className="py-3">
                        <label className="form-label">
                          Discount in Percentage*
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          name="discount"
                          required
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            setItemData(key, "discount", +e.target.value, i)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-3">
                      <FileUpload
                        accept=".jpg,.png,.jpeg"
                        label={`80px * 80px`}
                        maxFileSizeInBytes={2000000}
                        updateFilesCb={(x) =>
                          setItemData(key, "image", x[0]?.url || null, i)
                        }
                        multiple={false}
                        smallUi={true}
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <CustomSelect
                        list={galleryImage || []}
                        dataChange={(imageIdx) =>
                          setItemData(key, "imageIndex", imageIdx, i)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            );
          })}
          <button type="submit" className="btn btn-success my-3">
            Add Varient
          </button>
        </form>
      </>
    </ModalCard>
  );
}
