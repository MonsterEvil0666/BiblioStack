import { NextResponse } from 'next/server';
import { addAutor, getAutorByName, getAllAutores } from '../../../lib/autores';

// Função para normalizar strings (remover acentos e espaços extras)
function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function POST(req: Request) {
  try {
    const autor = await req.json();

    // Validação básica
    if (!autor.nome || typeof autor.nome !== 'string') {
      return NextResponse.json({ message: 'Nome do autor é obrigatório e deve ser uma string' }, { status: 400 });
    }

    // Normalizar o nome do autor para evitar duplicidade
    const nomeNormalizado = normalizeString(autor.nome);

    // Verificar se o autor já existe
    const autorExistente = await getAutorByName(nomeNormalizado);
    if (autorExistente) {
      return NextResponse.json({ message: 'Autor já cadastrado' }, { status: 400 });
    }

    // Adicionar novo autor
    // Aqui passamos o nome original do autor para manter o formato do usuário, mas normalizamos para verificar duplicidades.
    autor.nome = autor.nome.trim();  // Manter formato original com espaços corrigidos
    const result = await addAutor(autor);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar autor:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar autor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const autores = await getAllAutores();
    return NextResponse.json(autores, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return NextResponse.json({ error: 'Erro ao buscar autores' }, { status: 500 });
  }
}
