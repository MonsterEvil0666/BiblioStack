import { NextResponse } from "next/server";
import { addGenero, getGeneroByName, getAllGeneros } from "../../../lib/generos";

export async function POST(req: Request) {
  try {
    const genero = await req.json();

    // Validação básica
    if (!genero.nome || typeof genero.nome !== "string") {
      return NextResponse.json(
        { message: "Nome do gênero é obrigatório e deve ser uma string" },
        { status: 400 }
      );
    }

    // Verificar se o gênero já existe
    const generoExistente = await getGeneroByName(genero.nome);
    if (generoExistente) {
      return NextResponse.json(
        { message: "Gênero já cadastrado" },
        { status: 400 }
      );
    }

    // Adicionar novo gênero
    const result = await addGenero(genero);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar gênero:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar gênero" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sugestao = url.searchParams.get("sugestao");

    let generos;
    if (sugestao) {
      // Busca gêneros que correspondem parcialmente ao nome informado
      generos = await getAllGeneros();
      generos = generos.filter((genero) =>
        genero.nome.toLowerCase().includes(sugestao.toLowerCase())
      );
    } else {
      // Retorna todos os gêneros se nenhuma sugestão for passada
      generos = await getAllGeneros();
    }

    return NextResponse.json(generos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar gêneros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar gêneros" },
      { status: 500 }
    );
  }
}
