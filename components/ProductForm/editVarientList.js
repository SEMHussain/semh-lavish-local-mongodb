import { useEffect, useState } from "react";
import ModalCard from "../Ui/customModalCard";
import FileUpload from "../FileUpload/fileUpload";
import CustomSelect from "../CustomSelect";

export default function EditVarient({
  close,
  setVariable,
  varientData,
  galleryImage,
}) {
  const [variant, setVarient] = useState({});

  function setItemData(accessKey, targetType, value, index) {
    let data = { ...variant };
    data[accessKey][index][targetType] = value;
    setVarient(data);
  }

  function updateVarient() {
    let data = { ...variant };
    setVariable(data);
    close();
  }

  useEffect(() => {
    if (varientData) {
      setVarient(varientData);
    }
  }, [varientData]);

  function genPreSelectedFile(link) {
    return link && link.length > 0
      ? [
          {
            name: link?.split("/").pop(),
            url: link,
          },
        ]
      : [];
  }

  return (
    <ModalCard handleClose={() => close()} compact={false}>
      <>
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
                        defaultValue={x.price}
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
                        defaultValue={x.qty}
                      />
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
                        defaultValue={x.discount}
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
                      preSelectedFiles={genPreSelectedFile(x.image)}
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <CustomSelect
                      list={galleryImage || []}
                      preIndex={x.imageIndex}
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
        <button
          type="button"
          onClick={updateVarient}
          className="btn btn-success my-3"
        >
          Update Varient
        </button>
      </>
    </ModalCard>
  );
}
