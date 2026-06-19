describe("Submeter uma proposta", () => {
  let dados: any;

  before(() => {
    cy.fixture("submeter-proposta.json").then((fixtureData) => {
      dados = fixtureData;
    });
  });
 
  beforeEach(() => {
    cy.visit("/");

    cy.intercept('GET', '**/api/**').as('carregarLogin');
    cy.fixture("criar-conta").then((credenciais) => {
      cy.typeLogin(credenciais.email, credenciais.senha);
    });

    cy.get('[data-cy="user-menu"]', { timeout: 15000 })
    .should("be.visible");
    cy.wait('@carregarLogin');
  });
 
  function abrirPropostaParaEdicao() {
    cy.get('[data-cy="projetos-ver-mais"]')
      .click({ force: true });

    cy.contains(/Projeto Automatizado Cypress/i, { timeout: 15000 })
    .should('exist')
    .scrollIntoView();

    cy.contains(/Projeto Automatizado Cypress/i)
    .parents()
    .filter((_, el) => {
      return Cypress.$(el).find('button').length > 0;
    })
    .first()
    .within(() => {
      cy.get('button')
        .eq(1)
        .click({ force: true });
    });
  }
 
  
  function acessarSubsecao(secao: string, subsecao: string) {
    cy.contains(secao).should("be.visible").click({ force: true });
    cy.contains(subsecao).should("be.visible").click({ force: true });
  }

  function abrirEditaisAbertos() {
    cy.intercept('GET', '**').as('carregarEditais');
  cy.contains(/Editais abertos/i)
    .should("be.visible")
    .parents()
    .filter((_, el) => {
      return Cypress.$(el)
        .find("*")
        .filter((_, child) => {
          return /Ver Mais \(\d+\)/i.test(Cypress.$(child).text());
        }).length > 0;
    })
    .first()
    .within(() => {
      cy.contains(/Ver Mais \(\d+\)/i).click({ force: true });
    });
    cy.wait('@carregarEditais');
}

function visualizarEdital() {
  cy.contains(dados.edital.nome)
    .should("be.visible")
    .parents()
    .filter((_, el) => {
      return Cypress.$(el)
        .find("button, a")
        .filter((_, btn) => {
          return /visualizar edital/i.test(Cypress.$(btn).text());
        }).length > 0;
    })
    .first()
    .within(() => {
      cy.contains(/visualizar edital/i).click({ force: true });
    });



  }
  
  function preencherCampo(campo: any) {
    const label = campo.label;

    switch (campo.tipo) {
      case "textarea":
        if (campo.dataCy) {
          cy.get(`[data-cy="${campo.dataCy}"]`)
            .should("be.visible")
            .clear({ force: true })
            .type(campo.valor, { force: true });
        break;
      } 
        cy.contains("label", label)
          .parent()
          .find("textarea")
          .clear({ force: true })
          .type(campo.valor, { force: true });
        break;

      case "select":
        cy.contains("label", label)
          .parent()
          .find("input")
          .clear({ force: true })
          .type(`${campo.valor}{enter}`, { force: true });
        break;
  
      case "checkbox":
        cy.contains("label", label)
          .parent()
          .find('input[type="checkbox"]')
          .then(($checkbox) => {
            if (campo.valor) {
              cy.wrap($checkbox).check({ force: true });
            } else {
              cy.wrap($checkbox).uncheck({ force: true });
            }
          });
        break;

      case "radio":
        cy.contains("label", campo.valor)
          .click({ force: true });
        break;

      case "file":
        cy.contains("label", label)
          .parent()
          .find('input[type="file"]')
          .selectFile(`cypress/fixtures/${campo.valor}`, { force: true });
        break;
  
      case "text": 
      default:
      cy.contains("label", label)
        .parents()
        .filter((_, el) => Cypress.$(el).find("input").length > 0)
        .first()
        .find("input")
        .first()
        .should("be.visible")
        .clear({ force: true })
        .type(campo.valor, { force: true });
      break;
 
    }
  }
 
  function preencherESalvarSubsecao(
    secao: string,
    subsecao: string,
    campos: any[]
  ) {
    acessarSubsecao(secao, subsecao);

    campos.forEach((campo) => {
      preencherCampo(campo);
    });

    cy.contains("button", /salvar/i).click({ force: true });
  } 


  it("Deve criar a proposta e preencher Caracterização: Informações iniciais", () => {
    cy.intercept('**').as('propostaCriada');
    abrirEditaisAbertos();
    cy.wait('@propostaCriada');
    visualizarEdital();
    
    cy.contains(dados.edital.nome).should("be.visible");
    cy.contains(/Criar Proposta/i).click({ force: true });
    
    dados.caracterizacao.informacoesIniciais.forEach((campo: any) => {
      preencherCampo(campo);
    }); 
  
    cy.get('[data-cy="add-areas-de-conhecimento"]').click();

    dados.caracterizacao.informacoesComplementares.forEach((campo: any) => {
      preencherCampo(campo);
    });
 
    cy.get('[data-cy="areaDeConhecimento-confirmar"]').click();
     cy.get('[data-cy="menu-salvar"]').click({ force: true });
  });

  it("Deve preencher Caracterização: Informações complementares e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    
    cy.get('[data-cy="caracterizacao"]').click();
    cy.get('[data-cy="informacoes-complementares"]').click();


    dados.caracterizacao.informacoesComplementaresSub.forEach((campo: any) => {
      preencherCampo(campo);
    });

    cy.get('[data-cy="menu-salvar"]').click({ force: true });
  });
    
    it("Deve preencher Abrangência e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    
    cy.get('[data-cy="caracterizacao"]').click();
    cy.get('[data-cy="abrangencia"]').click();
    cy.get('[data-cy="add-button"]').click({ force: true });

    cy.get('[data-cy="search-estado-id"]').click({ force: true });
    cy.get(`[data-cy="${dados.caracterizacao.abrangencia.estado}"]`).click({ force: true });
      cy.get('#root label[for="search-abrangencia-municipio"]').click({ force: true });
    cy.get('[data-cy="search-abrangencia-municipio"]').click({ force: true });

  dados.caracterizacao.abrangencia.municipios.forEach(
    (municipio: string) => {
      cy.get(`[data-cy="${municipio}"]`)
        .click({ force: true });
    }
  );
  
  cy.get('[data-cy="abrangencia-confirmar"]').click({ force: true });
  cy.get('[data-cy="menu-salvar"]').click({ force: true });
  cy.contains('Salvo com sucesso!').should('be.visible'); 
  });
  

  it("Deve preencher Coordenacao: Dados pessoais e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    
    cy.wait('@carregarPagina');
    cy.wait('@carregarLogin');
    
  cy.get('[data-cy="coordenacao"]', { timeout: 15000 })
  .should('be.visible')
  .click({ force: true });

  cy.get('[data-cy="dados-pessoais"]', { timeout: 15000 })
  .should('be.visible')
  .click({ force: true }); 

  cy.get('[data-cy="search-raca-cor-id"]').click();
  cy.get('[data-cy="branco-a"]').click();

    cy.get('[data-cy="menu-salvar"]').click({ force: true });
    cy.contains('Salvo com sucesso!').should('be.visible'); 
  });

  it("Deve preencher Coordenação: endereço e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="coordenacao"]', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy="endereco"]', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true }); 

    cy.get('[data-cy="criadoPor.endereco.cep"]')
      .clear({ force: true })
    .type(dados.coordenacao.endereco.cep, { force: true });

    cy.get('[data-cy="criadoPor.endereco.bairro"]')
      .clear({ force: true })
      .type(dados.coordenacao.endereco.bairro, { force: true });

    cy.get('[data-cy="criadoPor.endereco.logradouro"]')
      .clear({ force: true })
      .type(dados.coordenacao.endereco.logradouro, { force: true });

    cy.get('[data-cy="search-estado"]')
      .click({ force: true });

    cy.get(`[data-cy="${dados.coordenacao.endereco.estado}"]`)
      .click({ force: true });

    cy.get('[data-cy="criadoPor.endereco.numero"]')
      .clear({ force: true })
      .type(dados.coordenacao.endereco.numero, { force: true });

    cy.get('[data-cy="search-municipio"]')
    .click({ force: true });

    cy.get(`[data-cy="${dados.coordenacao.endereco.municipio}"]`)
      .click({ force: true });

    cy.get('[data-cy="menu-salvar"]').click({ force: true });
      cy.contains('Salvo com sucesso!').should('be.visible'); 
    
  });

  it("Deve preencher Coordenação: dados acadêmicos e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    cy.get('[data-cy="coordenacao"]', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });
    cy.get('[data-cy="dados-academicos"]').click();
    
  cy.get('[data-cy="search-unidade-id"]').click({ force: true });

  cy.get('[data-cy="search-instituicao-id"]').click({ force: true });
  
  cy.get(`[data-cy="${dados.coordenacao.instituicaoExecutora.instituicao}"]`).click({ force: true });

  cy.get('[data-cy="search-unidade-id"]')
    .click({ force: true });

  cy.get(
    `[data-cy="${dados.coordenacao.instituicaoExecutora.unidade}"]`
  ).click({ force: true });

  cy.get('[data-cy="search-nivel-academico-id"]').click();

  cy.get(`[data-cy="${dados.coordenacao.dadosProfissionais.nivelAcademico}"]`).click({ force: true });

  cy.get('[data-cy="add-areas-de-conhecimento"]').click();

  cy.get('[data-cy="grande-area-id"]').click({ force: true });
  
    cy.get(`[data-cy="${dados.coordenacao.areaConhecimento.grandeArea}"]`).click({ force: true });
  
    cy.get('[data-cy="area-id"]').click();
  cy.get(`[data-cy="${dados.coordenacao.areaConhecimento.area}"]`).click({ force: true });

  cy.get('[data-cy="search-sub-area-id"]').click({ force: true });

  cy.get(
    `[data-cy="${dados.coordenacao.areaConhecimento.subarea}"]`).click({ force: true });

  cy.get('[data-cy="search-especialidade-id"]')
    .click({ force: true });

  cy.get(
    `[data-cy="${dados.coordenacao.areaConhecimento.especialidade}"]`
  ).click({ force: true });

  cy.get('[data-cy="criadoPor.areaDeConhecimento-confirmar"]')
    .click({ force: true });
 
  cy.get('[data-cy="menu-salvar"]').click();
  cy.contains('Salvo com sucesso!').should('be.visible');

});

  it("Deve preencher Coordenação: dados profissionais e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    cy.get('[data-cy="coordenacao"]', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });
    cy.get('[data-cy="dados-profissionais"]').click();
    
    cy.get(`[data-cy="${dados.coordenacao.dadosProfissionais.tipoVinculo}"]`).click({ force: true });
    
    if (dados.coordenacao.dadosProfissionais.possuiVinculoEmpregaticio) {
      cy.get('[data-cy="possui-vinculo-empregaticio-box"]')
    .click({ force: true }); 
    }
    
    cy.get('#root div:nth-child(3) svg.fa-calendar path').click({ force: true });
     
    cy.get(`div.open span[aria-label="${dados.coordenacao.dadosProfissionais.dataInicio}"]`).click({ force: true });
    
     
    cy.get('[data-cy="search-regime-trabalho-id"]').click({ force: true });
    
    cy.get(`[data-cy="${dados.coordenacao.dadosProfissionais.regimeTrabalho}"]`)
      .click({ force: true });
    
      cy.get('[data-cy="menu-salvar"]')
    .click({ force: true });
    cy.contains('Salvo com sucesso!').should('be.visible'); 
  });
 
  it("Deve preencher Apresentação e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="descricao"]').click();

  cy.get('#label-radio-formularioPropostaDescritiva\\.pergunta-221-0')
    .click({ force: true });

  cy.get('#radio-formularioPropostaDescritiva\\.pergunta-221-0')
    .check({ force: true });

  cy.get('[data-cy="formularioPropostaDescritiva.pergunta-222"]')
    .clear({ force: true })
    .type(
      dados.apresentacao.descricao.texto,
      { force: true }
    );

    cy.get('[data-cy="menu-salvar"]').click();
    cy.contains('Salvo com sucesso!').should('be.visible'); 
  });
  
  it("Deve preencher Apresentação: Indicadores de Produção e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="indicadores-de-producao"]').click();
 
    cy.get('#root tr:nth-child(1) input:nth-child(2)').clear().type(dados.apresentacao.orcamento.campo1);

cy.get('#root tr:nth-child(2) input:nth-child(1)').clear().type(dados.apresentacao.orcamento.campo2);

cy.get('#root tr:nth-child(2) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo3);

cy.get('#root tr:nth-child(3) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo4);

cy.get('#root tr:nth-child(3) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo5);

cy.get('#root tr:nth-child(4) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo6);

cy.get('#root tr:nth-child(4) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo7);

cy.get('#root tr:nth-child(5) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo8);

cy.get('#root tr:nth-child(5) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo9);

cy.get('#root tr:nth-child(6) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo10);

cy.get('#root tr:nth-child(6) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo11);

cy.get('#root tr:nth-child(7) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo12);

cy.get('#root tr:nth-child(7) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo13);

cy.get('#root tr:nth-child(8) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo14);

cy.get('#root tr:nth-child(8) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo15);

cy.get('#root tr:nth-child(9) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo16);

cy.get('#root tr:nth-child(9) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo17);

cy.get('#root tr:nth-child(10) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo18);

cy.get('#root tr:nth-child(10) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo19);

cy.get('#root tr:nth-child(11) input:nth-child(1)')
  .clear()
  .type(dados.apresentacao.orcamento.campo20);

cy.get('#root tr:nth-child(11) input:nth-child(2)')
  .clear()
  .type(dados.apresentacao.orcamento.campo21);

  cy.get('[data-cy="menu-salvar"]').click();
  cy.contains('Salvo com sucesso!').should('be.visible');
  });

  it("Deve preencher Apresentação: Membros e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="membros"]').click();
    cy.get('[data-cy="menu-salvar"]').click();
    cy.contains('Salvo com sucesso!').should('be.visible');
  });

  it("Deve preencher Apresentação: Atividades e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="atividades"]').click();

    cy.get('[data-cy="add-button"]').click();
 
    cy.get('[data-cy="propostaAtividadeForm.titulo"]').clear().type(dados.apresentacao.atividade.titulo);

    cy.get('[data-cy="propostaAtividadeForm.descricao"]').clear().type(dados.apresentacao.atividade.descricao);

    cy.get('[data-cy="search-mes-inicio"]').click({ force: true });

    cy.get(`[data-cy="${dados.apresentacao.atividade.mesInicio}"]`).click({ force: true });

    cy.get('[data-cy="search-duracao"]').click({ force: true });

cy.get(`[data-cy="${dados.apresentacao.atividade.duracao}"]`)
  .click({ force: true });

cy.get('[data-cy="search-carga-horaria-semanal"]')
  .click({ force: true });

cy.get(`[data-cy="${dados.apresentacao.atividade.cargaHoraria}"]`).click({ force: true });

 cy.get('#autocomplete-1-input', { timeout: 1000 }).should('be.visible').click({ force: true });

 cy.get('#autocomplete-1-listbox-option-0', { timeout: 1000 }).should('be.visible').click({ force: true });

 cy.get('[data-cy="propostaAtividade-confirmar"]')
   .click({ force: true });
  
    cy.get('[data-cy="menu-salvar"]').click();
    cy.contains('Salvo com sucesso!').should('be.visible'); 
  });
  it("Deve preencher Apresentação: Visualização das atividades e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    
    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="visualizacao-das-atividades"]').click();
   
    cy.get('[data-cy="menu-salvar"]').click({ force: true });
    cy.contains('Salvo com sucesso!').should('be.visible');
  });
  it("Deve preencher Apresentação: Orçamento: Faixa de Financiamento e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="orcamento"]').click();
    cy.get('[data-cy="faixa-de-financiamento"]').click();
   cy.get('[data-cy="search-faixa-financiamento-id"]').click({ force: true });

   cy.get(`[data-cy="${dados.apresentacao.financiamento.faixa}"]`).click({ force: true });

   cy.get('[data-cy="menu-salvar"]').click({ force: true });
   cy.contains('Salvo com sucesso!').should('be.visible'); 
  });

  it("Deve preencher Apresentação: Orçamento: serviço de terceiros e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="orcamento"]').click();
    cy.get('[data-cy="servicos-de-terceiros"]').click();
    
    cy.get('[data-cy="add-button"]').click({ force: true });

  });
    it("Deve preencher Apresentação: Orçamento: bolsas e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');
    cy.get('[data-cy="apresentacao"]').click();
    cy.get('[data-cy="orcamento"]').click();
    cy.get('[data-cy="bolsa"]').click();
    
      cy.get('[data-cy="add-button"]').click({ force: true });

    cy.get('[data-cy="search-modalidade-bolsa-id"]').click({ force: true });

    cy.get(`[data-cy="${dados.apresentacao.bolsas.modalidade}"]`).click({ force: true });

    cy.get('[data-cy="search-nivel-bolsa-id"]').click({ force: true });

    cy.get(`[data-cy="${dados.apresentacao.bolsas.nivel}"]`).click({ force: true });

    cy.get('[data-cy="rubricaBolsaForm.quantidade"]')
      .clear({ force: true })
      .type(
       dados.apresentacao.bolsas.quantidade,
      { force: true }
    );

 cy.get('[data-cy="search-duracao"]').click({ force: true });

 cy.get(
   `[data-cy="${dados.apresentacao.bolsas.duracao}"]`
 )
   .click({ force: true });

 cy.get('[data-cy="rubricaBolsa-confirmar"]')
   .click({ force: true });

   cy.get('[data-cy="menu-salvar"]').click();
   cy.contains("Salvo com sucesso!").should("be.visible");
 
  });
    it("Deve preencher Apresentação: Orçamento: Consolidação e salvar", () => {
      cy.intercept('GET', '**').as('carregarPagina');
      abrirPropostaParaEdicao();
      cy.wait('@carregarPagina');
      cy.get('[data-cy="apresentacao"]').click();
      cy.get('[data-cy="orcamento"]').click();
      cy.get('[data-cy="consolidacao"]').click();
      cy.get('[data-cy="menu-salvar"]').click();
      cy.contains("Salvo com sucesso!").should("be.visible");
    });
    
    it("Deve preencher Apresentação: Orçamento: Justificativa e salvar", () => {
      cy.intercept('GET', '**').as('carregarPagina');
      abrirPropostaParaEdicao();
      cy.wait('@carregarPagina');
      cy.get('[data-cy="apresentacao"]').click();
      cy.get('[data-cy="orcamento"]').click();
      cy.get('[data-cy="solicitado-a-fundacao"]').click();
    
      cy.get('[data-cy="menu-salvar"]')
        .click({ force: true });
      cy.contains('Salvo com sucesso!').should('be.visible'); 
    });

  it("Deve preencher Anexo: Documento do Usuário e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="anexos"]').click();
    cy.get('[data-cy="documentos-pessoais"]').click();
    
    cy.get('[data-cy="menu-salvar"]').click();
    cy.contains('Salvo com sucesso!').should('be.visible'); 
  });

  it("Deve preencher Anexo: Documento da Proposta e salvar", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="anexos"]').click();
    cy.get('[data-cy="documentos-da-proposta"]').click();
    
    cy.get('#select-categories-documento-proposta-anexo', {
      timeout: 1000
    })
  .should('be.visible');

  cy.get('#select-categories-documento-proposta-anexo span.css-12qaldc')
  .click({ force: true });

  cy.get('[data-cy="carta-de-apresentacao"]')
  .should('be.visible')
  .click({ force: true });
 
  cy.get('[data-cy="documentoPropostaAnexo-upload"]').should('exist').selectFile(`cypress/fixtures/${dados.anexos.documentosProposta.arquivo}`, {force: true});
   
  cy.get('[data-cy="menu-salvar"]').click();
  cy.contains('Salvo com sucesso!').should('be.visible'); 
});

  it("Deve verificar pendências e submeter a proposta", () => {
    cy.intercept('GET', '**').as('carregarPagina');
    abrirPropostaParaEdicao();
    cy.wait('@carregarPagina');

    cy.get('[data-cy="finalizacao"]').click();
    cy.get('[data-cy="visualizacao-da-proposta"]').click();
  cy.intercept('**').as('termoAceite');
  cy.get('[data-cy="termo-de-aceite"').click();
  cy.wait('@termoAceite');  
  cy.get('[data-cy="termo-de-aceite-aceito-box"]').click();
  cy.get('[data-cy="menu-salvar"]').click();
  cy.contains('Salvo com sucesso!').should('be.visible');
  cy.get('[data-cy="menu-verificar-pendencias"]').click();
  //cy.get('[data-cy="sim-continuar-button"]').click({ force: true });
  //cy.contains('Proposta submetida com sucesso!').should('be.visible');
  });
});
