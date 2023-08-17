import { Tooltip } from "react-tippy";
import classes from "./productDetails.module.css";
import "react-tippy/dist/tippy.css";

export default function AttributeViewer({ item, click, selected }) {
  return (
    <Tooltip
      title={`${item.name} ${item.qty < 1 ? "- Out Of Stock" : ""}`}
      position="top"
      trigger="mouseenter focus"
      arrow={true}
    >
      <span
        className={classes.attr}
        onClick={() => (item.qty < 1 ? () => {} : click())}
        data-selected={selected === item.name}
        data-disabled={item.qty < 1 ? true : false}
      >
        {item.name}
        {item.image && (
          <div
            className={classes.attr_image}
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          ></div>
        )}
      </span>
    </Tooltip>
  );
}
