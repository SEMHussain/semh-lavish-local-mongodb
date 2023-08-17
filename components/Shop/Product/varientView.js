import classes from "./productDetails.module.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import AttributeViewer from "./attribute";
import ColorViewer from "./color";

export default function VarientView({
  varients,
  basePrice,
  updateRootVarient,
  updatePrice,
  updateDiscountPrice,
  imageIndex,
}) {
  const { t } = useTranslation();
  const [varient, setVarient] = useState(varients[0] || {});
  const [selectedVariant, setSelectedVarient] = useState({});

  useEffect(() => {
    if (varient) {
      const v = varient;
      let data = {};
      data[v.title] = v[v.title]?.name;
      for (const k in v) {
        if (Object.hasOwnProperty.call(v, k)) {
          const el = v[k];
          if (Array.isArray(el)) {
            data[k] = el[0]?.name;
          }
        }
      }
      data.id = v.id;
      setSelectedVarient(data);
    }
  }, [varient]);

  async function checkPrice(v) {
    try {
      let rootVar = { ...varient };
      let price = +basePrice;
      let discountPrice = 0;
      Object.keys(v).forEach((k) => {
        if (Array.isArray(rootVar[k])) {
          const res = rootVar[k].find((x) => x.name === v[k]);
          if (res) {
            price = price + +res.price;
            discountPrice = price - (res.discount / 100) * price;
          }
        }
      });
      updatePrice(discountPrice);
      updateDiscountPrice(price);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    checkPrice(selectedVariant);
    updateRootVarient(selectedVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant, varient]);

  function updateVarient(key, value, imageIdx) {
    let v = { ...selectedVariant };
    v[key] = value;
    setSelectedVarient(v);
    imageIndex(imageIdx ? imageIdx - 1 : 0);
  }

  return (
    <>
      <div className={classes.color_selector}>
        <p className={classes.section_heading} style={{ marginBottom: "11px" }}>
          {t(varients[0].title)}
        </p>
        {varients[0].title === "color" ? (
          <div className={classes.color_selector_container}>
            {varients.map((item, i) => (
              <ColorViewer
                key={i}
                color={item["color"]}
                click={() => setVarient(item)}
                selected={selectedVariant["color"]}
              />
            ))}
          </div>
        ) : (
          <div className={classes.select}>
            {varients.map((item, i) => (
              <AttributeViewer
                key={i}
                item={item[varients[0].title]}
                click={() => setVarient(item)}
                selected={selectedVariant[varients[0].title]}
              />
            ))}
          </div>
        )}
      </div>
      {Object.keys(varient).map((x, idx) =>
        Array.isArray(varient[x]) ? (
          x === "color" ? (
            <div key={idx}>
              <p className={classes.section_heading}>{x}</p>
              <div className={classes.color_selector_container}>
                {varient[x].map((color, i) => (
                  <ColorViewer
                    key={i}
                    color={color}
                    selected={selectedVariant[x]}
                    click={() =>
                      updateVarient("color", color.name, color.imageIndex)
                    }
                  />
                ))}
              </div>
            </div>
          ) : (
            <div key={idx}>
              <p className={classes.section_heading}>{x}</p>
              <div className={classes.select}>
                {varient[x].map((item, i) => (
                  <AttributeViewer
                    key={i}
                    item={item}
                    selected={selectedVariant[x]}
                    click={() => updateVarient(x, item.name, item.imageIndex)}
                  />
                ))}
              </div>
            </div>
          )
        ) : null
      )}
    </>
  );
}
