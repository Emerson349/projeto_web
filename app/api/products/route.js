import { NextResponse } from 'next/server';
import { getProducts } from '@/repositories/productsRepository'; // Ajuste o nome da função se no seu repositório for diferente

export async function GET(request) {
  try {
    // Busca os produtos usando o seu repositório estruturado
    const products = await getProducts(); 
    
    return NextResponse.json(products);
  } catch (error) {
    // Printa no terminal do VS Code o motivo exato do erro
    console.error("Erro detalhado na API de Products:", error);

    // Retorna o erro real na tela para podermos consertar agora
    return NextResponse.json(
      { 
        message: "Não foi possível carregar os produtos.",
        detalheDoErro: error.message 
      }, 
      { status: 500 }
    );
  }
}