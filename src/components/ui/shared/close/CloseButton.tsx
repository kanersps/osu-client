import "./CloseButton.css";

export default function CloseButton({ onClick }: { onClick: () => void }) {
  return <div onClick={onClick} className="close"></div>
}
