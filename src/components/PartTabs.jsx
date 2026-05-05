export default function PartTabs({ parts, selectedPart, onSelectPart }) {
  return (
    <div className="tabs">
      {parts.map((part) => (
        <button
          key={part.id}
          className={selectedPart === part.id ? "tab active" : "tab"}
          onClick={() => onSelectPart(part.id)}
        >
          <span>{part.name}</span>
          <strong>{part.title}</strong>
        </button>
      ))}
    </div>
  );
}