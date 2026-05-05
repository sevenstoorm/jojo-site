export default function CharacterCard({ character }) {
  return (
    <article className="card">
      <div className="cardImage">
        <img src={character.image} alt={character.name} />
      </div>

      <div className="cardContent">
        <p className="ability">{character.ability}</p>
        <h2>{character.name}</h2>
        <p>{character.description}</p>
      </div>
    </article>
  );
}