import { NextResponse } from 'next/server';
import { addLivro, getLivroByName, getAllLivros } from '../../../lib/biblioteca';

export async function GET() {
  try {
    const livros = await getAllLivros();
    return NextResponse.json(livros, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return NextResponse.json({ error: 'Erro ao buscar livros' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const livro = await req.json();

    // Validação básica
    if (!livro.nome || typeof livro.nome !== 'string') {
      return NextResponse.json({ message: 'Nome do livro é obrigatório e deve ser uma string' }, { status: 400 });
    }

    // Verificar se o livro já existe
    const livroExistente = await getLivroByName(livro.nome);
    if (livroExistente) {
      return NextResponse.json({ message: 'Livro já cadastrado' }, { status: 400 });
    }

    // Adicionar novo livro
    const result = await addLivro(livro);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar livro:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar livro' }, { status: 500 });
  }
}
