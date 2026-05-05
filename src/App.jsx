import { useEffect, useMemo, useState } from "react";
import "./App.css";

import { parts, charactersByPart } from "./data/characters";

function removeHtml(text) {
  if (!text) return "";

  return text
    .replaceAll('<span class="searchmatch">', "")
    .replaceAll("</span>", "")
    .replace(/<[^>]*>/g, "");
}

function createWikiUrl(title) {
  return `https://jojowiki.com/${title.replaceAll(" ", "_")}`;
}

async function getCharacterImage(title) {
  const imageUrl = `https://jojowiki.com/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(
    title
  )}&format=json&origin=*&pithumbsize=600`;

  const response = await fetch(imageUrl);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];

  return page?.thumbnail?.source || null;
}

async function searchCharacterOnWiki(name) {
  const searchUrl = `https://jojowiki.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    name
  )}&format=json&origin=*`;

  const response = await fetch(searchUrl);

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${name}`);
  }

  const data = await response.json();
  const firstResult = data.query?.search?.[0];

  if (!firstResult) {
    return {
      id: name,
      name,
      title: name,
      snippet: "Nenhuma informação encontrada na JoJo Wiki.",
      image: null,
      pageUrl: `https://jojowiki.com/wiki/Special:Search?search=${encodeURIComponent(
        name
      )}`,
      wordcount: 0,
    };
  }

  const image = await getCharacterImage(firstResult.title);

  return {
    id: firstResult.pageid,
    name,
    title: firstResult.title,
    snippet: removeHtml(firstResult.snippet),
    image,
    pageUrl: createWikiUrl(firstResult.title),
    wordcount: firstResult.wordcount || 0,
    timestamp: firstResult.timestamp,
  };
}

export default function App() {
  const [selectedPart, setSelectedPart] = useState("part1");
  const [characters, setCharacters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentPart = parts.find((part) => part.id === selectedPart);

  useEffect(() => {
    async function loadCharacters() {
      try {
        setLoading(true);
        setError("");
        setCharacters([]);

        const names = charactersByPart[selectedPart] || [];

        const results = await Promise.allSettled(
          names.map((name) => searchCharacterOnWiki(name))
        );

        const successfulCharacters = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        setCharacters(successfulCharacters);

        const failedCount = results.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failedCount > 0) {
          console.warn(`${failedCount} personagens falharam ao carregar.`);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os personagens da JoJo Wiki.");
      } finally {
        setLoading(false);
      }
    }

    loadCharacters();
  }, [selectedPart]);

  const filteredCharacters = useMemo(() => {
    if (!search.trim()) return characters;

    const query = search.toLowerCase();

    return characters.filter((character) => {
      return (
        character.name.toLowerCase().includes(query) ||
        character.title.toLowerCase().includes(query) ||
        character.snippet.toLowerCase().includes(query)
      );
    });
  }, [characters, search]);

  return (
    <main className="app">
      <section
        className="hero"
        style={{
          "--accent": currentPart?.color || "#f72585",
        }}
      >
        <div className="heroContent">
          <p className="eyebrow">JoJo Wiki API</p>

          <h1>
            JoJo <span>Characters</span>
          </h1>

          <p>
            Explore personagens de JoJo's Bizarre Adventure separados da Parte 1
            até a Parte 8 usando a API de busca da JoJo Wiki.
          </p>

          <div className="heroStats">
            <div>
              <strong>8</strong>
              <span>partes</span>
            </div>

            <div>
              <strong>{characters.length}</strong>
              <span>personagens</span>
            </div>

            <div>
              <strong>Wiki</strong>
              <span>API</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="panel">
          <div className="panelTop">
            <div>
              <p className="miniLabel">Parte selecionada</p>
              <h2>
                Parte {currentPart?.number}: {currentPart?.title}
              </h2>
            </div>

            <input
              type="text"
              placeholder="Pesquisar personagem..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="tabs">
            {parts.map((part) => (
              <button
                key={part.id}
                className={selectedPart === part.id ? "tab active" : "tab"}
                style={{
                  "--part-color": part.color,
                }}
                onClick={() => {
                  setSelectedPart(part.id);
                  setSearch("");
                }}
              >
                <span>Parte {part.number}</span>
                <strong>{part.title}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="sectionHeader">
          <p>Personagens</p>
          <h2>
            Parte {currentPart?.number}: {currentPart?.title}
          </h2>
        </div>

        {loading && (
          <div className="stateBox">
            <h3>Carregando personagens...</h3>
            <p>Buscando dados e imagens na JoJo Wiki API.</p>
          </div>
        )}

        {error && (
          <div className="stateBox error">
            <h3>Erro</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid">
            {filteredCharacters.map((character) => (
              <article className="card" key={character.id}>
                <div className="cardImage">
                  {character.image ? (
                    <img src={character.image} alt={character.title} />
                  ) : (
                    <div className="cardSymbol">
                      <span>{character.title.slice(0, 1)}</span>
                    </div>
                  )}
                </div>

                <div className="cardContent">
                  <div className="cardMeta">
                    <span>Parte {currentPart?.number}</span>
                    <small>{character.wordcount} palavras</small>
                  </div>

                  <h3>{character.title}</h3>

                  <p className="description">{character.snippet}</p>

                  <a
                    href={character.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="detailsButton"
                  >
                    Abrir na JoJo Wiki
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredCharacters.length === 0 && (
          <div className="stateBox">
            <h3>Nenhum personagem encontrado</h3>
            <p>Tente pesquisar outro nome.</p>
          </div>
        )}
      </section>
    </main>
  );
}