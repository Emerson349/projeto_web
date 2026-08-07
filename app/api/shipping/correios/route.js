import { NextResponse } from 'next/server';

// Origem padrão (sede da editora)
const ORIGEM_CEP = process.env.CORREIOS_ORIGEM_CEP || '58400000';

function buildSoapEnvelope(cepDestino, pesoKg = 1, comprimento = 20, altura = 3, largura = 15) {
  return `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <CalcPrecoPrazo xmlns="http://tempuri.org/">
        <nCdEmpresa></nCdEmpresa>
        <sDsSenha></sDsSenha>
        <nCdServico>04510</nCdServico>
        <sCepOrigem>${ORIGEM_CEP}</sCepOrigem>
        <sCepDestino>${cepDestino}</sCepDestino>
        <nVlPeso>${pesoKg}</nVlPeso>
        <nCdFormato>1</nCdFormato>
        <nVlComprimento>${comprimento}</nVlComprimento>
        <nVlAltura>${altura}</nVlAltura>
        <nVlLargura>${largura}</nVlLargura>
        <nVlDiametro>0</nVlDiametro>
        <sCdMaoPropria>N</sCdMaoPropria>
        <nVlValorDeclarado>0</nVlValorDeclarado>
        <sCdAvisoRecebimento>N</sCdAvisoRecebimento>
      </CalcPrecoPrazo>
    </soap:Body>
  </soap:Envelope>`;
}

async function callCorreiosCalc(cepDestino, pesoKg) {
  const url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx';
  const body = buildSoapEnvelope(cepDestino, pesoKg);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/CalcPrecoPrazo'
    },
    body
  });

  const text = await res.text();

  // Extrai o bloco cServico (valor e prazo)
  const services = [];
  const re = /<cServico>[\s\S]*?<Codigo>(.*?)<\/Codigo>[\s\S]*?<Valor>(.*?)<\/Valor>[\s\S]*?<PrazoEntrega>(.*?)<\/PrazoEntrega>[\s\S]*?<Erro>(.*?)<\/Erro>[\s\S]*?<MsgErro>(.*?)<\/MsgErro>[\s\S]*?<\/cServico>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const codigo = m[1];
    const valorStr = m[2];
    const prazo = m[3];
    const erro = m[4];
    // Valor vem no formato 15,90 com vírgula
    const valor = parseFloat(valorStr.replace(/\./g, '').replace(/,/g, '.')) || 0;
    services.push({ codigo, valor, prazo, erro });
  }

  return services;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cep = (body.cep || '').replace(/\D/g, '').slice(0, 8);

    if (!cep || cep.length !== 8) {
      return NextResponse.json({ message: 'CEP inválido.' }, { status: 400 });
    }

    // Peso estimado: se o front enviar items, você pode somar pesos; por enquanto 0.5kg por item
    const items = Array.isArray(body.items) ? body.items : [];
    let pesoKg = 0;
    if (items.length > 0) {
      for (const it of items) {
        const qty = Number(it.quantity || 1);
        // tenta usar peso fornecido, senão 0.5kg por unidade
        const unitWeight = Number(it.weight) || 0.5;
        pesoKg += unitWeight * qty;
      }
    } else {
      pesoKg = 0.5; // default
    }

    // Chamada ao Correios
    const services = await callCorreiosCalc(cep, pesoKg.toFixed(2).toString());

    if (!services || services.length === 0) {
      return NextResponse.json({ message: 'Não foi possível calcular o frete.' }, { status: 500 });
    }

    // Mapear serviços para opções legíveis. Usamos código para identificar (ex: 04510 = PAC)
    const mapped = services.map(s => {
      const code = s.codigo.trim();
      let label = 'Correios';
      if (code === '04510' || code === '04510') label = 'PAC';
      if (code === '04014' || code === '04014') label = 'SEDEX';
      return {
        code,
        cost: s.valor,
        prazo: s.prazo,
        label
      };
    });

    // Preferir PAC se houver, senão primeiro
    const pac = mapped.find(m => m.code === '04510');
    const chosen = pac || mapped[0];

    return NextResponse.json({ options: mapped, chosen });
  } catch (err) {
    console.error('Erro ao consultar Correios:', err);
    return NextResponse.json({ message: 'Erro ao consultar Correios.' }, { status: 500 });
  }
}
