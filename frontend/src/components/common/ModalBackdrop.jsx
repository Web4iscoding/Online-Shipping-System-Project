import "../../styles/ModalBackdrop.css";

const ModalBackdrop = ({ onClose }) => {
  return <div className="modal-backdrop" onClick={onClose} />;
};

export default ModalBackdrop;
