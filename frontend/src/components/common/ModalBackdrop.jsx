import "../../styles/ModalBackdrop.css";

const ModalBackdrop = ({ onClose, visible = true }) => {
  return (
    <div
      className={`modal-backdrop${visible ? "" : " modal-backdrop--hidden"}`}
      onClick={onClose}
    />
  );
};

export default ModalBackdrop;
