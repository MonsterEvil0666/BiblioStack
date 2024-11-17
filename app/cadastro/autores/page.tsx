"use client"; // Indica que este é um Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaSortUp, FaSortDown } from "react-icons/fa";

interface Autor {
  id?: number; // Usar o id numérico sequencial
  nome: string;
}

export default function CadastroAutores() {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [novoAutor, setNovoAutor] = useState<string>("");
  const [autorEditando, setAutorEditando] = useState<Autor | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [showCadastro, setShowCadastro] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedAll, setSelectedAll] = useState<boolean>(false);
  const [filteredAutores, setFilteredAutores] = useState<Autor[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const router = useRouter();

  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    // Indicar que estamos no lado do cliente
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchAutores();
    }
  }, [isClient]);

  async function fetchAutores() {
    try {
      const response = await fetch("/api/autores");
      if (response.ok) {
        const data: Autor[] = await response.json();
        setAutores(data);
        setFilteredAutores(data); // Inicialmente todos os autores são exibidos
      }
    } catch (error) {
      console.error("Erro ao buscar autores:", error);
    }
  }

  const adicionarAutor = async () => {
    const nomeCorrigido = corrigirNome(novoAutor);

    if (!nomeCorrigido) {
      setMensagemErro("O nome do autor é obrigatório e deve conter apenas caracteres alfabéticos.");
      return;
    }

    try {
      const response = await fetch("/api/autores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeCorrigido }),
      });

      if (response.ok) {
        // Após adicionar o autor, recarregar a lista completa
        await fetchAutores();
        setNovoAutor("");
        setMensagemErro("");
        setShowCadastro(false);
      } else {
        const erro = await response.json();
        setMensagemErro(erro.message || "Erro ao adicionar autor.");
      }
    } catch (error) {
      console.error("Erro ao adicionar autor:", error);
      setMensagemErro("Erro ao adicionar autor.");
    }
  };

  const editarAutor = async () => {
    if (!autorEditando) return;

    const nomeCorrigido = corrigirNome(autorEditando.nome);

    if (!nomeCorrigido) {
      setMensagemErro("O nome do autor é obrigatório e deve conter apenas caracteres alfabéticos.");
      return;
    }

    try {
      const response = await fetch(`/api/autores/${autorEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeCorrigido }),
      });

      if (response.ok) {
        // Atualizar a lista de autores após edição
        await fetchAutores();
        setAutorEditando(null);
        setMensagemErro("");
      } else {
        const erro = await response.json();
        setMensagemErro(erro.message || "Erro ao editar autor.");
      }
    } catch (error) {
      console.error("Erro ao editar autor:", error);
      setMensagemErro("Erro ao editar autor.");
    }
  };

  // Função para corrigir o nome e validar caracteres
  const corrigirNome = (nome: string): string | null => {
    // Remover espaços extras antes e depois, e substituir múltiplos espaços por um único
    const nomeLimpo = nome.trim().replace(/\s+/g, " ");

    // Verificar se o nome contém apenas letras e espaços
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!regex.test(nomeLimpo)) {
      return null; // Nome inválido
    }

    return nomeLimpo; // Nome corrigido
  };

  const deletarAutor = async (id: number | undefined) => {
    if (!id) return;

    // Mostrar uma confirmação para o usuário
    const confirmacao = window.confirm("Tem certeza de que deseja deletar este autor?");
    if (!confirmacao) return;

    try {
      // Fazer a requisição DELETE para o endpoint recém-criado
      const response = await fetch(`/api/autores/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Atualizar a lista de autores após deletar
        setAutores((prevAutores) => prevAutores.filter((autor) => autor.id !== id));
        setFilteredAutores((prevFiltered) => prevFiltered.filter((autor) => autor.id !== id));
      } else {
        console.error("Erro ao deletar o autor.");
      }
    } catch (error) {
      console.error("Erro ao deletar o autor:", error);
    }
  };

  const deletarSelecionados = async () => {
    if (selectedIds.size === 0) return;

    const confirmacao = window.confirm("Tem certeza de que deseja deletar os autores selecionados?");
    if (!confirmacao) return;

    try {
      for (let id of selectedIds) {
        const response = await fetch(`/api/autores/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          console.error(`Erro ao deletar o autor com ID ${id}`);
        }
      }
      // Atualizar a lista de autores após deletar
      await fetchAutores();
      setSelectedIds(new Set()); // Limpar seleção após deletar
    } catch (error) {
      console.error("Erro ao deletar autores selecionados:", error);
    }
  };

  const handleEditClick = (autor: Autor) => {
    setAutorEditando(autor);
    setShowCadastro(false); // Esconder o formulário de cadastro ao editar
  };

  const handleEditCancel = () => {
    setAutorEditando(null);
    setMensagemErro("");
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredAutores(autores); // Se a barra de pesquisa estiver vazia, mostrar todos
      return;
    }

    const searchTermNormalized = normalizeString(searchTerm);

    // Se o termo for um número, buscar por ID
    if (!isNaN(Number(searchTerm))) {
      const filtered = autores.filter((autor) => autor.id === Number(searchTerm));
      setFilteredAutores(filtered.length > 0 ? filtered : []);
    } else {
      // Caso contrário, buscar por nome ignorando maiúsculas, minúsculas e acentos
      const filtered = autores.filter((autor) =>
        normalizeString(autor.nome).includes(searchTermNormalized)
      );
      setFilteredAutores(filtered);
    }
  };

  const normalizeString = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentuações
      .toLowerCase(); // Converter para minúsculo
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

  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAutores.slice(startIndex, endIndex);
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && currentPage < Math.ceil(filteredAutores.length / ITEMS_PER_PAGE)) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(filteredAutores.length / ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    const sortedAutores = [...filteredAutores].sort((a, b) => {
      if (newSortOrder === "asc") {
        return (a.id ?? 0) - (b.id ?? 0);
      } else {
        return (b.id ?? 0) - (a.id ?? 0);
      }
    });
    setFilteredAutores(sortedAutores);
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
        <Link href="/cadastro/biblioteca" passHref>
          <button
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "10px",
            }}
          >
            Biblioteca
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
          <span>&gt; Autores</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaFilter style={{ fontSize: "18px", color: "#888" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Pesquisar por ID ou Nome"
            style={{
              width: "375px",
              padding: "6.8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#2c3032",
              color: "#fff",
            }}
          />
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

      {/* Formulário de Cadastro */}
      {showCadastro && !autorEditando && (
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            value={novoAutor}
            onChange={(e) => setNovoAutor(e.target.value)}
            placeholder="Digite o nome do autor"
            style={{
              width: "360px",
              padding: "6.4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: "#000",
            }}
          />
          <button
            onClick={adicionarAutor}
            style={{
              padding: "8px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Salvar
          </button>
          <button
            onClick={() => setShowCadastro(false)}
            style={{
              padding: "8px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          {mensagemErro && <p style={{ color: "red", marginTop: "10px" }}>{mensagemErro}</p>}
        </div>
      )}

      {/* Botões de Cadastro e Deleção em Massa */}
      {!autorEditando && (
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
            + Incluir Cadastro
          </button>
        </div>
      )}

      {/* Formulário de Edição */}
      {autorEditando && (
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#fff" }}>ID: {autorEditando.id}</span>
          <input
            type="text"
            value={autorEditando.nome}
            onChange={(e) =>
              setAutorEditando((prev) => (prev ? { ...prev, nome: e.target.value } : prev))
            }
            style={{
              width: "360px",
              padding: "6.4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: "#000",
            }}
          />
          <button
            onClick={editarAutor}
            style={{
              padding: "8px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Salvar
          </button>
          <button
            onClick={handleEditCancel}
            style={{
              padding: "8px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Tabela com Lista de Autores */}
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
              <th style={{ padding: "5px", textAlign: "left", fontSize: "10px", width: "75%" }}>Nome do Autor</th>
              <th style={{ padding: "5px", textAlign: "center", fontSize: "10px", width: "10%" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentItems().length > 0 ? (
              getCurrentItems().map((autor) => (
                <tr
                  key={autor.id || autor.nome}
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
                      checked={selectedIds.has(autor.id ?? -1)}
                      onChange={() => handleSelect(autor.id ?? -1)}
                      id={`checkbox-${autor.id}`}
                      style={{ marginRight: "10px" }}
                    />
                  </td>
                  <td style={{ padding: "10px", width: "10%" }}>{autor.id || "N/A"}</td>
                  <td style={{ padding: "10px", width: "75%" }}>{autor.nome}</td>
                  <td style={{ padding: "10px", textAlign: "center", width: "10%" }}>
                    <button
                      onClick={() => handleEditClick(autor)}
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
                      onClick={() => deletarAutor(autor.id)}
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
                <td colSpan={4} style={{ padding: "10px", textAlign: "center", color: "#fff" }}>
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
