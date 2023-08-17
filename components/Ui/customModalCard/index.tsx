import { XLg } from "@styled-icons/bootstrap";
import { FC } from "react";
import c from "./customModal.module.css";

interface _Props {
  handleClose: any;
  children: React.ReactNode;
  compact?: Boolean;
}

const ModalCard = ({ children, handleClose, compact }: _Props) => {
  return (
    <div className={c.card_bg}>
      <div
        className={c.card}
        style={compact ? { height: "auto", minHeight: "auto" } : undefined}
      >
        <span className={c.close} onClick={handleClose}>
          <XLg width={20} height={20} />
        </span>
        <div className={c.body}>
          <div className={c.content}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ModalCard;
