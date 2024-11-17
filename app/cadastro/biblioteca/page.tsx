"use client"; // Indica que este é um Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEdit, FaTrash, FaSearch, FaSortUp, FaSortDown, FaEllipsisV } from "react-icons/fa";

interface Livro {
  id?: number;
  nome: string;
  autor: string;
  generos: string[];
}

export default function CadastroLivros() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [novoLivro, setNovoLivro] = useState<Livro>({ nome: "", autor: "", generos: [] });
  const [livroEditando, setLivroEditando] = useState<Livro | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [showCadastro, setShowCadastro] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [authorSearchTerm, setAuthorSearchTerm] = useState<string>("");
  const [autores, setAutores] = useState([{ id: "1", nome: "Autor Existente" }]);
  const [autorInput, setAutorInput] = useState("");
  const [showCadastroAutor, setShowCadastroAutor] = useState(false);
  const [mensagemCadastroAutor, setMensagemCadastroAutor] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [generoInput, setGeneroInput] = useState(""); // Controle do input de gêneros
  const [sugestoes, setSugestoes] = useState<{ nome: string; id: string }[]>([]);
  const [todosGeneros, setTodosGeneros] = useState<{ nome: string; id: string }[]>([]);
  const [genreSearchTerm, setGenreSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedAll, setSelectedAll] = useState<boolean>(false);
  const [filteredLivros, setFilteredLivros] = useState<Livro[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState<"autor" | "genero" | null>(null);
  

  const router = useRouter();

  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchLivros();
    }
  }, [isClient]);

  useEffect(() => {
    fetchGeneros();
  }, []);

  useEffect(() => {
    const fetchSugestoes = async () => {
      try {
        const response = await fetch("/api/generos");
        const data = await response.json();
        // Certifique-se de que 'data' é um array de objetos com 'nome' e 'id'
        setSugestoes(data.map((genero: { nome: string; id: string }) => ({ nome: genero.nome, id: genero.id })));
      } catch (error) {
        console.error("Erro ao buscar sugestões de gêneros:", error);
      }
    };
  
    fetchSugestoes();
  }, []);

  useEffect(() => {
    const fetchTodosGeneros = async () => {
      try {
        const response = await fetch("/api/generos");
        const data = await response.json();
        // Supondo que 'data' seja um array de objetos com 'nome' e 'id'
        setTodosGeneros(data.map((genero: { nome: string; id: string }) => ({ nome: genero.nome, id: genero.id })));
      } catch (error) {
        console.error("Erro ao buscar todos os gêneros:", error);
      }
    };
  
    fetchTodosGeneros();
  }, []);

  async function fetchLivros() {
    try {
      const response = await fetch("/api/biblioteca");
      if (response.ok) {
        const data: Livro[] = await response.json();
        setLivros(data);
        setFilteredLivros(data);
      }
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  }

  const fetchAutores = async () => {
    try {
      const response = await fetch("/api/autores");
      if (response.ok) {
        const data = await response.json();
        setAutores(data); // Armazena a lista de autores
      } else {
        console.error("Erro ao buscar autores");
      }
    } catch (error) {
      console.error("Erro na requisição de autores:", error);
    }
  };

  const fetchGeneros = async () => {
    try {
      const response = await fetch("/api/generos");
      const data = await response.json();
      if (Array.isArray(data)) {
        setTodosGeneros(data.map((genero) => genero.nome)); // Assume que `nome` é a propriedade do gênero
      } else {
        console.error("Resposta inesperada ao buscar gêneros:", data);
      }
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
    }
  };

  useEffect(() => {
    if (isModalOpen === "autor") {
      fetchAutores();
    }
  }, [isModalOpen]);

const adicionarLivro = async () => {
  const nomeCorrigido = corrigirNome(novoLivro.nome) || ""; // Garante que seja string
  const autorCorrigido = corrigirNome(novoLivro.autor) || ""; // Garante que seja string
  const generosCorrigidos = novoLivro.generos
    .map((g) => corrigirNome(g))
    .filter((g): g is string => g !== null); // Filtra valores não nulos e garante que o array seja apenas de strings

  if (!nomeCorrigido || !autorCorrigido || generosCorrigidos.length === 0) {
    setMensagemErro("Todos os campos são obrigatórios e devem conter apenas caracteres alfabéticos.");
    return;
  }
  

  // Verifica se o livro já existe
  const livroExistente = livros.find(
    (livro) => normalizeString(livro.nome) === normalizeString(nomeCorrigido)
  );
  if (livroExistente) {
    setMensagemErro(`O livro "${nomeCorrigido}" já está cadastrado com o ID ${livroExistente.id}.`);
    return;
  }

  // Verifica se o autor existe
  const autorExiste = autores.some(
    (autor) => normalizeString(autor.nome) === normalizeString(autorCorrigido)
  );

  if (!autorExiste) {
    setMensagemErro(
      `O autor "${autorCorrigido}" não está cadastrado. Dirija-se à página de autores para cadastrá-lo.`
    );
    return;
  }

  // Verifica se os gêneros existem
  const generosNaoExistentes = generosCorrigidos.filter(
    (genero) =>
      !todosGeneros.some((g) => normalizeString(g.nome) === normalizeString(genero))
  );
  if (generosNaoExistentes.length > 0) {
    setMensagemErro(
      `Os seguintes gêneros não estão cadastrados: ${generosNaoExistentes.join(
        ", "
      )}. Dirija-se à página de gêneros para cadastrá-los.`
    );
    return;
  }

  // Se tudo estiver correto, prossegue com o cadastro
  try {
    const response = await fetch("/api/biblioteca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeCorrigido, autor: autorCorrigido, generos: generosCorrigidos }),
    });

    if (response.ok) {
      await fetchLivros();
      setNovoLivro({ nome: "", autor: "", generos: [] });
      setMensagemErro("");
      setShowCadastro(false);
    } else {
      const erro = await response.json();
      setMensagemErro(erro.message || "Erro ao adicionar livro.");
    }
  } catch (error) {
    console.error("Erro ao adicionar livro:", error);
    setMensagemErro("Erro ao adicionar livro.");
  }
};

  
  const editarLivro = async () => {
    if (!livroEditando) return;

    const nomeCorrigido = corrigirNome(livroEditando.nome);
    const autorCorrigido = corrigirNome(livroEditando.autor);
    const generosCorrigidos = livroEditando.generos.map((g) => corrigirNome(g)).filter(Boolean);

    if (!nomeCorrigido || !autorCorrigido || generosCorrigidos.length === 0) {
      setMensagemErro("Todos os campos são obrigatórios e devem conter apenas caracteres alfabéticos.");
      return;
    }

    try {
      const response = await fetch(`/api/biblioteca/${livroEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeCorrigido, autor: autorCorrigido, generos: generosCorrigidos }),
      });

      if (response.ok) {
        await fetchLivros();
        setLivroEditando(null);
        setMensagemErro("");
      } else {
        const erro = await response.json();
        setMensagemErro(erro.message || "Erro ao editar livro.");
      }
    } catch (error) {
      console.error("Erro ao editar livro:", error);
      setMensagemErro("Erro ao editar livro.");
    }
  };

  const adicionarGenero = (genero: string) => {
    if (!novoLivro.generos.includes(genero)) {
      setNovoLivro((prev) => ({
        ...prev,
        generos: [...prev.generos, genero],
      }));
    }
    setGeneroInput(""); // Limpa o campo após adicionar
    setSugestoes([]); // Limpa as sugestões
  };

  const removerGenero = (index: number) => {
    setNovoLivro((prev) => ({
      ...prev,
      generos: prev.generos.filter((_, i) => i !== index),
    }));
  };

  const corrigirNome = (nome: string): string | null => {
    const nomeLimpo = nome.trim().replace(/\s+/g, " ");
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/; // Permitir caracteres alfabéticos e espaços
    if (!regex.test(nomeLimpo)) {
      console.log("Erro de validação no nome:", nome);
      return null;
    }
    return nomeLimpo;
};

  
  
  const deletarLivro = async (id: number | undefined) => {
    if (!id) return;

    const confirmacao = window.confirm("Tem certeza de que deseja deletar este livro?");
    if (!confirmacao) return;

    try {
      const response = await fetch(`/api/biblioteca/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLivros((prevLivros) => prevLivros.filter((livro) => livro.id !== id));
        setFilteredLivros((prevFiltered) => prevFiltered.filter((livro) => livro.id !== id));
      } else {
        console.error("Erro ao deletar o livro.");
      }
    } catch (error) {
      console.error("Erro ao deletar o livro:", error);
    }
  };

  const deletarSelecionados = async () => {
    if (selectedIds.size === 0) return;

    const confirmacao = window.confirm("Tem certeza de que deseja deletar os livros selecionados?");
    if (!confirmacao) return;

    try {
      for (let id of selectedIds) {
        const response = await fetch(`/api/biblioteca/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          console.error(`Erro ao deletar o livro com ID ${id}`);
        }
      }
      await fetchLivros();
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Erro ao deletar livros selecionados:", error);
    }
  };

  const handleEditClick = (livro: Livro) => {
    setLivroEditando(livro);
    setShowCadastro(false);
  };

  const handleEditCancel = () => {
    setLivroEditando(null);
    setMensagemErro("");
  };

  const handleSearch = () => {
    const titleTerm = normalizeString(searchTerm);
    const authorTerm = normalizeString(authorSearchTerm);
    const genreTerm = normalizeString(genreSearchTerm);

    const filtered = livros.filter((livro) => {
      const matchesTitle = titleTerm === "" || normalizeString(livro.nome).includes(titleTerm);
      const matchesAuthor = authorTerm === "" || normalizeString(livro.autor).includes(authorTerm);
      const matchesGenre = genreTerm === "" || livro.generos.some((g) => normalizeString(g).includes(genreTerm));
      return matchesTitle && matchesAuthor && matchesGenre;
    });

    setFilteredLivros(filtered);
  };

  const handleGeneroInputChange = (value: string) => {
    setGeneroInput(value);
    if (value.trim()) {
      // Filtra as sugestões com base no texto digitado
      const matches = todosGeneros.filter((genero) =>
        genero.nome.toLowerCase().startsWith(value.toLowerCase())
      );
      setSugestoes(matches);
    } else {
      setSugestoes([]); // Limpa as sugestões quando o input está vazio
    }
  };

  const handleAutorChange = (value: string) => {
    setAutorInput(value);
    const autorExiste = autores.some(
      (autor) => autor.nome.toLowerCase() === value.toLowerCase()
    );

    if (!autorExiste && value.trim() !== "") {
      setMensagemCadastroAutor(
        `O autor "${value}" não está cadastrado. Deseja cadastrá-lo?`
      );
    } else {
      setMensagemCadastroAutor("");
    }
  };

const cadastrarAutor = async () => {
  console.log("Valor do autor antes de corrigir:", autorInput);
  const nomeCorrigido = corrigirNome(autorInput);
  console.log("Valor do autor após corrigir:", nomeCorrigido);

  if (!nomeCorrigido) {
     setMensagemErro("O nome do autor deve conter apenas caracteres alfabéticos.");
     return;
  }

  try {
     const response = await fetch("/api/autores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeCorrigido }),
     });

     if (response.ok) {
        // Atualiza a lista de autores após cadastrar o novo autor
        await fetchAutores();
        setMensagemCadastroAutor(`Autor "${nomeCorrigido}" cadastrado com sucesso!`);
        setAutorInput(nomeCorrigido);
        setMensagemErro("");
     } else {
        const erro = await response.json();
        setMensagemErro(erro.message || "Erro ao cadastrar autor.");
     }
  } catch (error) {
     console.error("Erro ao cadastrar autor:", error);
     setMensagemErro("Erro ao cadastrar autor.");
  }
};

  const normalizeString = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const openModal = (type: "autor" | "genero") => {
    setIsModalOpen(type);
  };

  const handleModalClose = () => {
    setIsModalOpen(null);
  };

  const handleSelectAll = () => {
    const currentItems = getCurrentItems();
    const newSelectedIds = new Set<number>();

    if (!selectedAll) {
      currentItems.forEach((item) => {
        if (item.id !== undefined) newSelectedIds.add(item.id);
      });
    }

    setSelectedAll(!selectedAll);
    setSelectedIds(newSelectedIds);
  };

  const handleSelect = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSaveLivro = async () => {
    const autorExiste = autores.some(
      (autor) => normalizeString(autor.nome) === normalizeString(novoLivro.autor)
    );
  
    if (!autorExiste) {
      // Exibir mensagem clara ao usuário sobre o autor não estar cadastrado
      setMensagemErro(
        `O autor "${novoLivro.autor}" não está cadastrado. Selecione um autor existente através do ícone de três pontinhos ou vá até a página de cadastro de autores para adicioná-lo.`
      );
      return;
    }
  
    // Agora que o autor deve estar cadastrado, prosseguir com a adição do livro
    await adicionarLivro();
  };
  
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLivros.slice(startIndex, endIndex);
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && currentPage < Math.ceil(filteredLivros.length / ITEMS_PER_PAGE)) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(filteredLivros.length / ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    const sortedLivros = [...filteredLivros].sort((a, b) => {
      if (newSortOrder === "asc") {
        return (a.id ?? 0) - (b.id ?? 0);
      } else {
        return (b.id ?? 0) - (a.id ?? 0);
      }
    });
    setFilteredLivros(sortedLivros);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#0d0d0d", padding: "0 15px" }}>
      {/* Barra de Menu */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#1d1e21",
        marginBottom: "20px",
        borderRadius: "0 0 20px 20px"
      }}>
        <Link href="/" passHref>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", marginRight: "20px" }}>
            <Image
              src="/BiblioStackIco.png"
              alt="BiblioStack Logo"
              width={40}
              height={30}
            />
          </div>
        </Link>
        <Link href="/cadastro/autores" passHref>
          <button
            style={{
              padding: "8px 12px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "10px",
            }}
          >
            Autores
          </button>
        </Link>
        <Link href="/cadastro/generos" passHref>
          <button
            style={{
              padding: "8px 12px",
              backgroundColor: "#6f42c1",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Gêneros
          </button>
        </Link>
      </nav>

      {/* Breadcrumb e Campo de Pesquisa */}
      <header style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "18px", marginBottom: "10px" }}>
          <span
            onClick={() => router.back()}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            ...
          </span>
          <span>&gt; Biblioteca</span>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por Título"
              style={{
                width: "250px",
                padding: "6.8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#2c3032",
                color: "#fff",
              }}
            />
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="text"
              value={authorSearchTerm}
              onChange={(e) => setAuthorSearchTerm(e.target.value)}
              placeholder="Pesquisar por Autor"
              style={{
                width: "250px",
                padding: "6.8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#2c3032",
                color: "#fff",
              }}
            />
            <FaEllipsisV
              style={{
                position: "absolute",
                right: "10px",
                cursor: "pointer",
                color: "#888",
              }}
              onClick={() => openModal("autor")}
            />
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="text"
              value={genreSearchTerm}
              onChange={(e) => setGenreSearchTerm(e.target.value)}
              placeholder="Pesquisar por Gênero"
              style={{
                width: "250px",
                padding: "6.8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#2c3032",
                color: "#fff",
              }}
            />
            <FaEllipsisV
              style={{
                position: "absolute",
                right: "10px",
                cursor: "pointer",
                color: "#888",
              }}
              onClick={() => openModal("genero")}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: "8px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <FaSearch />
          </button>
        </div>
      </header>

      {/* Modal de Seleção de Autor */}
      {isModalOpen && isModalOpen === "autor" && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#1d1e21",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "600px",
              color: "#fff",
            }}
          >
            <h3 style={{ marginBottom: "20px" }}>Selecione um Autor</h3>

            {/* Campo de Pesquisa */}
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Pesquisar autor..."
                value={authorSearchTerm}
                onChange={(e) => setAuthorSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor: "#2c3032",
                  color: "#fff",
                  marginRight: "10px",
                }}
              />
            </div>

            {/* Lista de Autores */}
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #444",
                borderRadius: "4px",
                backgroundColor: "#2c3032",
              }}
            >
              {autores
                .filter((autor) =>
                  normalizeString(autor.nome).includes(normalizeString(authorSearchTerm))
                )
                .map((autor) => (
                  <div
                    key={autor.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      borderBottom: "1px solid #444",
                      cursor: "pointer",
                    }}
                    onClick={() => setAuthorSearchTerm(autor.nome)}
                  >
                    <span>{autor.id}</span>
                    <span>{autor.nome}</span>
                  </div>
                ))}
            </div>

            {/* Botões de Ação */}
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                onClick={handleModalClose}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setNovoLivro({ ...novoLivro, autor: authorSearchTerm });
                  handleModalClose();
                }}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Cadastro e Deleção em Massa */}
      {!livroEditando && (
        <div style={{ marginBottom: "20px", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={deletarSelecionados}
            disabled={selectedIds.size === 0}
            style={{
              padding: "8px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
              opacity: selectedIds.size === 0 ? 0.5 : 1,
            }}
          >
            <FaTrash />
          </button>
          <button
            onClick={() => setShowCadastro(!showCadastro)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            + Cadastrar Livro
          </button>
        </div>
      )}

      {/* Formulário de Cadastro */}
      {showCadastro && !livroEditando && (
        <div
          style={{
            marginBottom: "20px",
            backgroundColor: "#1d1e21",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 12fr 9fr",
              gap: "5px",
              alignItems: "start",
            }}
          >
            {/* Linha 1: ID do Livro e Nome do Livro */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ color: "#fff" }}>ID do Livro</label>
              <input
                type="text"
                value={livros.length + 1}
                disabled
                style={{
                  width: "100%",
                  maxWidth: "80px",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  color: "#aaa",
                  backgroundColor: "#2c3032",
                  fontWeight: "bold",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ color: "#fff" }}>Nome do Livro</label>
              <input
                type="text"
                value={novoLivro.nome}
                onChange={(e) => setNovoLivro({ ...novoLivro, nome: e.target.value })}
                placeholder="Nome do Livro"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  color: "#000",
                }}
              />
            </div>

            {/* Caixa de Gêneros */}
            <div
              style={{
                gridRow: "span 2",
                height: "100%",
                position: "relative",
              }}
            >
              <label
                style={{
                  color: "#fff",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Gêneros
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "82%",
                  minHeight: "90px",
                  backgroundColor: "#2c3032",
                  overflowY: "auto",
                }}
                onClick={() => document.getElementById("generoInput")?.focus()}
              >
                {/* Tags de Gêneros */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginBottom: "10px",
                  }}
                >
                  {novoLivro.generos.map((genero, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "#1d1e21",
                        color: "#fff",
                        padding: "5px 10px",
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                      }}
                    >
                      {genero}
                      <span
                        onClick={() => removerGenero(index)}
                        style={{
                          cursor: "pointer",
                          color: "#dc3545",
                          fontWeight: "bold",
                        }}
                      >
                        X
                      </span>
                    </div>
                  ))}
                </div>

                {/* Input para adicionar gêneros */}
                <textarea
                  id="generoInput"
                  value={generoInput}
                  onChange={(e) => handleGeneroInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (
                        highlightedIndex !== null &&
                        sugestoes[highlightedIndex]
                      ) {
                        adicionarGenero(sugestoes[highlightedIndex].nome);
                        setSugestoes([]);
                        setHighlightedIndex(null);
                      } else if (generoInput.trim()) {
                        adicionarGenero(generoInput.trim());
                        setSugestoes([]);
                      }
                    } else if (
                      e.key === "Backspace" &&
                      generoInput === "" &&
                      novoLivro.generos.length > 0
                    ) {
                      removerGenero(novoLivro.generos.length - 1);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (sugestoes.length > 0) {
                        setHighlightedIndex((prev) =>
                          prev === null
                            ? 0
                            : (prev + 1) % sugestoes.length
                        );
                      }
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (sugestoes.length > 0) {
                        setHighlightedIndex((prev) =>
                          prev === null
                            ? sugestoes.length - 1
                            : (prev - 1 + sugestoes.length) % sugestoes.length
                        );
                      }
                    }
                  }}
                  placeholder="Digite um gênero e pressione Enter"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#fff",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    resize: "none",
                  }}
                />

                {/* Sugestões de Gêneros */}
                {generoInput.trim() && sugestoes.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% - 20px)",
                      left: "0",
                      width: "100%",
                      backgroundColor: "#2c3032",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      zIndex: 1000,
                    }}
                  >
                    {sugestoes.map((sugestao, index) => (
                      <div
                        key={sugestao.id}
                        onClick={() => {
                          adicionarGenero(sugestao.nome);
                          setSugestoes([]);
                        }}
                        style={{
                          padding: "10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          color:
                            highlightedIndex === index
                              ? "#007bff"
                              : "#fff",
                          backgroundColor:
                            highlightedIndex === index
                              ? "#1d1e21"
                              : "transparent",
                          borderBottom: "1px solid #444",
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                      >
                        <span>{sugestao.nome}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          ID: {sugestao.id}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Linha 2: ID do Autor e Nome do Autor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ color: "#fff" }}>ID do Autor</label>
              <input
                type="text"
                value={
                  autores.find(
                    (autor) =>
                      normalizeString(autor.nome) ===
                      normalizeString(novoLivro.autor)
                  )?.id || "N/A"
                }
                disabled
                style={{
                  width: "100%",
                  maxWidth: "80px",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  color: "#aaa",
                  backgroundColor: "#2c3032",
                  fontWeight: "bold",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", position: "relative" }}>
              <label style={{ color: "#fff" }}>Nome do Autor</label>
              <input
                type="text"
                value={novoLivro.autor}
                onChange={(e) => setNovoLivro({ ...novoLivro, autor: e.target.value })}
                placeholder="Nome do Autor"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  color: "#000",
                }}
              />
              <FaEllipsisV
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "68%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
                onClick={() => openModal("autor")}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
          <button
            onClick={handleSaveLivro}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Salvar
          </button>
           
            <button
              onClick={() => setShowCadastro(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Formulário de Edição */}
      {livroEditando && (
        <div style={{ marginBottom: "20px", backgroundColor: "#1d1e21", padding: "20px", borderRadius: "8px" }}>
          <span style={{ color: "#fff" }}>ID: {livroEditando.id}</span>
          <input
            type="text"
            value={livroEditando.nome}
            onChange={(e) =>
              setLivroEditando((prev) => (prev ? { ...prev, nome: e.target.value } : prev))
            }
            placeholder="Nome do Livro"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: "#000",
            }}
          />
          <div style={{ position: "relative", marginBottom: "10px" }}>
            <input
              type="text"
              value={livroEditando.autor}
              onChange={(e) =>
                setLivroEditando((prev) => (prev ? { ...prev, autor: e.target.value } : prev))
              }
              placeholder="Autor"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                color: "#000",
              }}
            />
            <FaEllipsisV
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#888",
              }}
              onClick={() => openModal("autor")}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ color: "#fff", display: "block", marginBottom: "5px" }}>Gêneros</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={genreSearchTerm}
                onChange={(e) => setGenreSearchTerm(e.target.value)}
                placeholder="Pesquisar Gêneros"
                style={{
                  flex: "1",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  color: "#000",
                }}
              />
              <FaEllipsisV
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  color: "#888",
                }}
                onClick={() => openModal("genero")}
              />
            </div>
            <div style={{ marginTop: "10px", maxHeight: "100px", overflowY: "auto" }}>
              {livroEditando.generos.map((genero, index) => (
                <div key={index} style={{ color: "#fff", padding: "5px", backgroundColor: "#2c3032", marginBottom: "5px", borderRadius: "4px" }}>
                  {genero}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={editarLivro}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginRight: "10px",
            }}
          >
            Salvar
          </button>
          <button
            onClick={handleEditCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Cancelar
          </button>
          {mensagemErro && <p style={{ color: "red", marginTop: "10px" }}>{mensagemErro}</p>}
        </div>
      )}

      {/* Exibir ID do Autor Selecionado */}
      {authorSearchTerm && (
        <span
          style={{
            marginRight: "10px",
            backgroundColor: "#2c3032",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ID:{" "}
          {
            autores.find(
              (autor) => normalizeString(autor.nome) === normalizeString(authorSearchTerm)
            )?.id || "N/A"
          }
        </span>
      )}

      {/* Tabela com Lista de Livros */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#0d0d0d", zIndex: 1, width: "100%" }}>
            <tr>
              <th style={{ padding: "5px", textAlign: "left", fontSize: "10px", width: "5%" }}>
                <input type="checkbox" checked={selectedAll} onChange={handleSelectAll} />
              </th>
              <th style={{ padding: "5px", textAlign: "left", fontSize: "10px", width: "10%", display: "flex", alignItems: "center", gap: "5px" }}>
                Código
                <span onClick={toggleSortOrder} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
                  <FaSortUp style={{ color: "#fff", opacity: sortOrder === "asc" ? 1 : 0.5 }} />
                  <FaSortDown style={{ color: "#fff", opacity: sortOrder === "desc" ? 1 : 0.5 }} />
                </span>
              </th>
              <th style={{ padding: "5px", textAlign: "left", fontSize: "10px", width: "25%" }}>Nome do Livro</th>
              <th style={{ padding: "5px", textAlign: "left", fontSize: "10px", width: "25%" }}>Autor</th>
              <th style={{ padding: "5px", textAlign: "left", fontSize: "10px", width: "25%" }}>Gêneros</th>
              <th style={{ padding: "5px", textAlign: "center", fontSize: "10px", width: "10%" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentItems().length > 0 ? (
              getCurrentItems().map((livro) => (
                <tr
                  key={livro.id || livro.nome}
                  style={{
                    backgroundColor: "#1d1e21",
                    borderBottom: "1px solid #ccc",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2c3032")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1d1e21")}
                >
                  <td style={{ padding: "10px" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(livro.id ?? -1)}
                      onChange={() => handleSelect(livro.id ?? -1)}
                      id={`checkbox-${livro.id}`}
                      style={{ marginRight: "10px" }}
                    />
                  </td>
                  <td style={{ padding: "10px", width: "10%" }}>{livro.id || "N/A"}</td>
                  <td style={{ padding: "10px", width: "25%" }}>{livro.nome}</td>
                  <td style={{ padding: "10px", width: "25%" }}>{livro.autor}</td>
                  <td style={{ padding: "10px", width: "25%" }}>
                    {livro.generos.join(", ")}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", width: "10%" }}>
                    <button
                      onClick={() => handleEditClick(livro)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        marginRight: "10px",
                      }}
                    >
                      <FaEdit style={{ color: "#007bff" }} />
                    </button>
                    <button
                      onClick={() => deletarLivro(livro.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrash style={{ color: "#dc3545" }} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "10px", textAlign: "center", color: "#fff" }}>
                  Nenhum resultado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botões de Navegação e Indicador de Página */}
      <div style={{ marginTop: "20px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          style={{
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.6 : 1,
          }}
        >
          &lt;
        </button>
        <span style={{ color: "#fff", fontSize: "14px" }}>
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
          style={{
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            opacity: currentPage === totalPages ? 0.6 : 1,
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
