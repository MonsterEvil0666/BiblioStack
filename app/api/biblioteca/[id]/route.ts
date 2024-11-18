import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function DELETE(req: NextRequest) {
  try {
    // Extraindo o ID da URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("livros");

    // Converter o id para número, já que ele é numérico
    const idNum = parseInt(id, 10);

    // Tentar deletar o livro
    const result = await collection.deleteOne({ id: idNum });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Livro deletado com sucesso' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro ao deletar o livro:', error);
    return NextResponse.json({ error: 'Erro ao deletar o livro' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Extraindo o ID da URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("livros");

    // Converter o id para número, já que ele é numérico
    const idNum = parseInt(id, 10);

    const { nome } = await req.json();
    if (!nome || typeof nome !== 'string') {
      return NextResponse.json({ error: 'Nome do livro é obrigatório e deve ser uma string' }, { status: 400 });
    }

    const result = await collection.updateOne({ id: idNum }, { $set: { nome } });

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: 'Livro atualizado com sucesso' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Livro não encontrado ou nenhuma mudança feita' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro ao atualizar o livro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o livro' }, { status: 500 });
  }
}
