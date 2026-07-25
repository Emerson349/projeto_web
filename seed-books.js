const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ============================================================
// SEED COMPLETO — COMPIA Editora
// Popula o banco com categorias, tags e 12 livros realistas
// ============================================================

async function main() {
  console.log('=== COMPIA Editora — Seed Completo ===\n');

  // 1. Carrega o .env.local
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.substring(0, separatorIndex).trim();
    let val = trimmed.substring(separatorIndex + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });

  // 2. Configura SSL
  const sslConfig = { minVersion: 'TLSv1.2', rejectUnauthorized: true };

  // 3. Conecta ao Banco
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: sslConfig
  });

  // ============================================================
  // CATEGORIAS
  // ============================================================
  const categories = [
    { name: 'Inteligência Artificial', slug: 'inteligencia-artificial' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Deep Learning', slug: 'deep-learning' },
    { name: 'Processamento de Linguagem Natural', slug: 'processamento-linguagem-natural' },
    { name: 'Visão Computacional', slug: 'visao-computacional' },
    { name: 'Ética em IA', slug: 'etica-em-ia' },
    { name: 'Blockchain e Criptografia', slug: 'blockchain-criptografia' },
    { name: 'Cibersegurança', slug: 'ciberseguranca' },
  ];

  // ============================================================
  // TAGS
  // ============================================================
  const tags = [
    { name: 'Iniciante', slug: 'iniciante' },
    { name: 'Intermediário', slug: 'intermediario' },
    { name: 'Avançado', slug: 'avancado' },
    { name: 'Python', slug: 'python' },
    { name: 'Pesquisa', slug: 'pesquisa' },
    { name: 'Prático', slug: 'pratico' },
    { name: 'Teórico', slug: 'teorico' },
    { name: 'Novo Lançamento', slug: 'novo-lancamento' },
  ];

  // ============================================================
  // LIVROS (12 livros realistas sobre IA e áreas relacionadas)
  // ============================================================
  const books = [
    {
      title: 'Fundamentos de Inteligência Artificial',
      slug: 'fundamentos-inteligencia-artificial',
      author: 'Carlos Eduardo Lima',
      description: 'Uma introdução abrangente aos conceitos fundamentais da Inteligência Artificial, cobrindo desde a história e filosofia da área até algoritmos de busca, representação de conhecimento, sistemas especialistas e introdução ao aprendizado de máquina. Ideal para estudantes de graduação e profissionais que desejam construir uma base sólida em IA.',
      format: 'fisico',
      price: 89.90,
      cover_url: '/covers/fundamentos-ia.png',
      isbn: '978-65-00001-01-0',
      publication_year: 2025,
      pages: 420,
      is_featured: true,
      categories: ['inteligencia-artificial'],
      tags: ['iniciante', 'teorico']
    },
    {
      title: 'Machine Learning: Da Teoria à Prática com Python',
      slug: 'machine-learning-teoria-pratica-python',
      author: 'Ana Beatriz Fernandes',
      description: 'Este livro combina rigor matemático com implementações práticas em Python, explorando algoritmos supervisionados e não-supervisionados, validação cruzada, engenharia de features, pipelines de dados e deploy de modelos. Cada capítulo inclui exercícios com datasets reais e projetos completos usando scikit-learn, pandas e matplotlib.',
      format: 'fisico',
      price: 109.90,
      cover_url: '/covers/machine-learning.png',
      isbn: '978-65-00001-02-7',
      publication_year: 2025,
      pages: 548,
      is_featured: true,
      categories: ['machine-learning', 'inteligencia-artificial'],
      tags: ['intermediario', 'python', 'pratico']
    },
    {
      title: 'Deep Learning: Redes Neurais Profundas',
      slug: 'deep-learning-redes-neurais-profundas',
      author: 'Prof. Ricardo Santos',
      description: 'Uma exploração detalhada das arquiteturas de deep learning, desde perceptrons multicamada até CNNs, RNNs, LSTMs e arquiteturas de atenção. Aborda fundamentos matemáticos de backpropagation, regularização, otimização, normalização de lotes e técnicas de treinamento avançadas. Inclui exemplos práticos com PyTorch.',
      format: 'fisico',
      price: 129.90,
      cover_url: '/covers/deep-learning.png',
      isbn: '978-65-00001-03-4',
      publication_year: 2026,
      pages: 612,
      is_featured: true,
      categories: ['deep-learning', 'machine-learning'],
      tags: ['avancado', 'python', 'teorico']
    },
    {
      title: 'Processamento de Linguagem Natural com Transformers',
      slug: 'processamento-linguagem-natural-transformers',
      author: 'Mariana Costa Silva',
      description: 'Do word2vec aos Large Language Models: este livro apresenta a evolução do PLN moderno, com foco especial na arquitetura Transformer e seus derivados (BERT, GPT, T5). Aborda tokenização, embeddings, mecanismos de atenção, fine-tuning e aplicações como análise de sentimento, NER, sumarização e geração de texto.',
      format: 'digital',
      price: 79.90,
      cover_url: '/covers/nlp-transformers.png',
      isbn: '978-65-00001-04-1',
      publication_year: 2026,
      pages: 380,
      is_featured: true,
      categories: ['processamento-linguagem-natural', 'deep-learning'],
      tags: ['avancado', 'python', 'novo-lancamento']
    },
    {
      title: 'Visão Computacional: Algoritmos e Aplicações',
      slug: 'visao-computacional-algoritmos-aplicacoes',
      author: 'Prof. Fernando Almeida',
      description: 'Uma abordagem completa de visão computacional, desde processamento de imagens e filtragem até detecção de objetos, segmentação semântica e estimativa de pose. Cobre técnicas clássicas e modernas (YOLO, Faster R-CNN, U-Net, Vision Transformers) com implementações em OpenCV e PyTorch. Casos de uso em medicina, veículos autônomos e indústria.',
      format: 'fisico',
      price: 119.90,
      cover_url: '/covers/visao-computacional.png',
      isbn: '978-65-00001-05-8',
      publication_year: 2025,
      pages: 490,
      is_featured: false,
      categories: ['visao-computacional', 'deep-learning'],
      tags: ['intermediario', 'python', 'pratico']
    },
    {
      title: 'Ética e Inteligência Artificial: Desafios do Século XXI',
      slug: 'etica-inteligencia-artificial-desafios',
      author: 'Dra. Juliana Rocha',
      description: 'Este livro examina as implicações éticas, sociais e legais da inteligência artificial no mundo contemporâneo. Discute viés algorítmico, privacidade, vigilância, armas autônomas, impacto no mercado de trabalho, regulamentação (AI Act da UE, LGPD) e propostas para uma IA responsável e centrada no ser humano. Leitura essencial para gestores, legisladores e pesquisadores.',
      format: 'fisico',
      price: 69.90,
      cover_url: '/covers/etica-ia.png',
      isbn: '978-65-00001-06-5',
      publication_year: 2025,
      pages: 312,
      is_featured: false,
      categories: ['etica-em-ia', 'inteligencia-artificial'],
      tags: ['iniciante', 'teorico', 'pesquisa']
    },
    {
      title: 'Blockchain e Criptografia Moderna',
      slug: 'blockchain-criptografia-moderna',
      author: 'Prof. Marcos Pereira',
      description: 'Dos fundamentos da criptografia clássica aos protocolos de consenso distribuído: este livro cobre funções hash, assinaturas digitais, criptografia de curvas elípticas, smart contracts, DeFi e a interseção entre blockchain e inteligência artificial. Inclui projetos práticos com Solidity e análise de protocolos como Bitcoin e Ethereum.',
      format: 'fisico',
      price: 99.90,
      cover_url: '/covers/blockchain.png',
      isbn: '978-65-00001-07-2',
      publication_year: 2024,
      pages: 456,
      is_featured: false,
      categories: ['blockchain-criptografia'],
      tags: ['intermediario', 'pratico']
    },
    {
      title: 'Cibersegurança: Fundamentos e Práticas',
      slug: 'ciberseguranca-fundamentos-praticas',
      author: 'Rafael Oliveira',
      description: 'Um guia completo de segurança da informação para profissionais e estudantes. Aborda modelagem de ameaças, análise de vulnerabilidades, criptografia aplicada, segurança de redes, pentesting, engenharia social, SIEM, resposta a incidentes e uso de IA na detecção de intrusões. Inclui laboratórios práticos com Kali Linux e ferramentas open-source.',
      format: 'digital',
      price: 74.90,
      cover_url: '/covers/ciberseguranca.png',
      isbn: '978-65-00001-08-9',
      publication_year: 2025,
      pages: 388,
      is_featured: false,
      categories: ['ciberseguranca'],
      tags: ['intermediario', 'pratico']
    },
    {
      title: 'Large Language Models: Arquitetura e Aplicações',
      slug: 'large-language-models-arquitetura-aplicacoes',
      author: 'Dr. Paulo Henrique Souza',
      description: 'Um mergulho profundo na arquitetura, treinamento e aplicação de Large Language Models. Cobre a evolução dos modelos de linguagem, técnicas de pré-treinamento, RLHF, prompt engineering, RAG (Retrieval-Augmented Generation), agentes de IA e frameworks como LangChain e LlamaIndex. Discute limitações, alucinações e o futuro dos LLMs.',
      format: 'fisico',
      price: 139.90,
      cover_url: '/covers/llms.png',
      isbn: '978-65-00001-09-6',
      publication_year: 2026,
      pages: 520,
      is_featured: true,
      categories: ['processamento-linguagem-natural', 'deep-learning', 'inteligencia-artificial'],
      tags: ['avancado', 'python', 'novo-lancamento']
    },
    {
      title: 'Aprendizado por Reforço: Teoria e Prática',
      slug: 'aprendizado-reforco-teoria-pratica',
      author: 'Dra. Camila Barros',
      description: 'Uma cobertura completa de Reinforcement Learning, desde processos de decisão de Markov e programação dinâmica até métodos de Monte Carlo, TD-Learning, Q-Learning, Policy Gradients e algoritmos actor-critic. Inclui aplicações em jogos, robótica e otimização, com implementações em Python usando Gymnasium e Stable-Baselines3.',
      format: 'digital',
      price: 84.90,
      cover_url: '/covers/aprendizado-reforco.png',
      isbn: '978-65-00001-10-2',
      publication_year: 2026,
      pages: 410,
      is_featured: false,
      categories: ['machine-learning', 'inteligencia-artificial'],
      tags: ['avancado', 'python', 'pesquisa']
    },
    {
      title: 'Inteligência Artificial Generativa',
      slug: 'inteligencia-artificial-generativa',
      author: 'Lucas Mendes',
      description: 'Explore o fascinante mundo da IA generativa: GANs, VAEs, modelos de difusão, Stable Diffusion e geração multimodal. Este livro aborda a teoria matemática por trás dos modelos generativos e suas aplicações em arte, design, música, texto e vídeo. Discute também questões de direitos autorais, deepfakes e regulamentação.',
      format: 'fisico',
      price: 114.90,
      cover_url: '/covers/ia-generativa.png',
      isbn: '978-65-00001-11-9',
      publication_year: 2026,
      pages: 468,
      is_featured: true,
      categories: ['deep-learning', 'inteligencia-artificial'],
      tags: ['intermediario', 'pratico', 'novo-lancamento']
    },
    {
      title: 'Arquitetura de Software Inteligente',
      slug: 'arquitetura-software-inteligente',
      author: 'Prof. André Cavalcanti',
      description: 'Como projetar e implementar sistemas de software que incorporam componentes de IA. Aborda padrões arquiteturais para ML (feature stores, model serving, MLOps), microsserviços inteligentes, pipelines de dados, monitoramento de modelos em produção, testes A/B e design para escalabilidade. Ideal para engenheiros de software e arquitetos.',
      format: 'fisico',
      price: 104.90,
      cover_url: '/covers/arquitetura-software.png',
      isbn: '978-65-00001-12-6',
      publication_year: 2025,
      pages: 440,
      is_featured: false,
      categories: ['inteligencia-artificial'],
      tags: ['intermediario', 'pratico', 'pesquisa']
    },
  ];

  try {
    // ============================================================
    // LIMPA DADOS ANTERIORES (preserva estrutura)
    // ============================================================
    console.log('🗑️  Limpando dados antigos...');
    await connection.execute('DELETE FROM product_categories');
    await connection.execute('DELETE FROM product_tags');
    await connection.execute('DELETE FROM products');
    await connection.execute('DELETE FROM categories');
    await connection.execute('DELETE FROM tags');

    // Reset auto_increment
    await connection.execute('ALTER TABLE products AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE categories AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE tags AUTO_INCREMENT = 1');

    // ============================================================
    // INSERE CATEGORIAS
    // ============================================================
    console.log('📂 Inserindo categorias...');
    const categoryMap = {};
    for (const cat of categories) {
      const [result] = await connection.execute(
        'INSERT INTO categories (name, slug) VALUES (?, ?)',
        [cat.name, cat.slug]
      );
      categoryMap[cat.slug] = result.insertId;
      console.log(`   ✅ ${cat.name} (id: ${result.insertId})`);
    }

    // ============================================================
    // INSERE TAGS
    // ============================================================
    console.log('\n🏷️  Inserindo tags...');
    const tagMap = {};
    for (const tag of tags) {
      const [result] = await connection.execute(
        'INSERT INTO tags (name, slug) VALUES (?, ?)',
        [tag.name, tag.slug]
      );
      tagMap[tag.slug] = result.insertId;
      console.log(`   ✅ ${tag.name} (id: ${result.insertId})`);
    }

    // ============================================================
    // INSERE LIVROS + RELACIONAMENTOS
    // ============================================================
    console.log('\n📚 Inserindo livros...');
    for (const book of books) {
      const [result] = await connection.execute(
        `INSERT INTO products (title, slug, author, description, format, price, cover_url, isbn, publication_year, pages, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          book.title,
          book.slug,
          book.author,
          book.description,
          book.format,
          book.price,
          book.cover_url,
          book.isbn,
          book.publication_year,
          book.pages,
          book.is_featured
        ]
      );
      const productId = result.insertId;

      // Insere relacionamentos com categorias
      for (const catSlug of book.categories) {
        const catId = categoryMap[catSlug];
        if (catId) {
          await connection.execute(
            'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
            [productId, catId]
          );
        }
      }

      // Insere relacionamentos com tags
      for (const tagSlug of book.tags) {
        const tagId = tagMap[tagSlug];
        if (tagId) {
          await connection.execute(
            'INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)',
            [productId, tagId]
          );
        }
      }

      const icon = book.format === 'digital' ? '💾' : '📖';
      const featured = book.is_featured ? ' ⭐' : '';
      console.log(`   ${icon} ${book.title} — R$ ${book.price.toFixed(2)}${featured}`);
    }

    // ============================================================
    // RESUMO
    // ============================================================
    const [catCount] = await connection.execute('SELECT COUNT(*) as total FROM categories');
    const [tagCount] = await connection.execute('SELECT COUNT(*) as total FROM tags');
    const [prodCount] = await connection.execute('SELECT COUNT(*) as total FROM products');
    const [featCount] = await connection.execute('SELECT COUNT(*) as total FROM products WHERE is_featured = TRUE');

    console.log('\n========================================');
    console.log('🎉 Seed finalizado com sucesso!');
    console.log('========================================');
    console.log(`   Categorias: ${catCount[0].total}`);
    console.log(`   Tags:       ${tagCount[0].total}`);
    console.log(`   Livros:     ${prodCount[0].total} (${featCount[0].total} destaques)`);
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ Erro durante o seed:', err.message);
    console.error(err);
  } finally {
    await connection.end();
  }
}

main();
