import { Tooltip } from "react-tippy";
import classes from "./productDetails.module.css";
import "react-tippy/dist/tippy.css";

export default function ColorViewer({ color, click, selected }) {
  return (
    <Tooltip
      title={`${color.name} ${color.qty < 1 ? "- Out Of Stock" : ""}`}
      position="top"
      trigger="mouseenter focus"
      arrow={true}
    >
      <div
        className={classes.circle_outer}
        onClick={() => (color.qty < 1 ? () => {} : click())}
        data-disabled={color.qty < 1 ? true : false}
      >
        <label
          data-selected={selected === color.name}
          style={{ backgroundColor: color.value }}
        />
        {color.image && (
          <div
            className={classes.attr_image}
            style={{
              backgroundImage: `url(${color.image})`,
            }}
          ></div>
        )}
      </div>
    </Tooltip>
  );
}
