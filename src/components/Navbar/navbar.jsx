import { useState } from "react"
import { Link } from "react-router-dom"
import "./navbar.css"

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="logo">JOJOBIGAS</div>

      <div className="nav-links">
        <Link to="./pages/home">Home</Link>

        <div className="dropdown">
          <button onClick={() => setOpen(!open)} className="dropdown-btn">
            Partes ▼
          </button>

          <div className={`dropdown-menu ${open ? "active" : ""}`}>
            <Link to="./pages/parts/Part1">Parte 1</Link>
            <Link to="./pages/parts/Part2">Parte 2</Link>
            <Link to="./pages/parts/Part3">Parte 3</Link>
            <Link to="./pages/parts/Part4">Parte 4</Link>
            <Link to="./pages/parts/Part5">Parte 5</Link>
            <Link to="./pages/parts/Part6">Parte 6</Link>
            <Link to="./pages/parts/Part7">Parte 7</Link>
            <Link to="./pages/parts/Part8">Parte 8</Link>
          </div>
        </div>

        <Link to="./pages/stands">Stands</Link>
      </div>
    </nav>
  )
}

export default Navbar