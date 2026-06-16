describe('Completar Cadastro do Usuário', () => {
  let dados: any;

  before(() => {
    cy.fixture('completar-cadastro.json').then((fixtureData) => {
      dados = fixtureData;
    });
  });

  beforeEach(() => {
    cy.visit("/");

    cy.fixture("criar-conta").then((credenciais) => {
      cy.typeLogin(credenciais.email, credenciais.senha);
    });

    cy.get('[data-cy="user-menu"]').should("be.visible").click();
    cy.contains("Perfil").click();
  });

  it('Deve preencher e salvar a sub-seção: Endereço', () => {
    cy.contains('Endereço').click();

    cy.contains('label', 'CEP').parent().find('input').clear().type(dados.endereco.cep);
    cy.contains('label', 'Logradouro').parent().find('input').clear().type(dados.endereco.logradouro);
    cy.contains('label', 'Número').parent().find('input').clear().type(dados.endereco.numero);
    cy.contains('label', 'Complemento').parent().find('input').clear().type(dados.endereco.complemento);
    cy.contains('label', 'Bairro').parent().find('input').clear().type(dados.endereco.bairro);
    
    cy.contains('label', 'Estado').parent().find('input').clear({ force: true }).type(`${dados.endereco.estado}{enter}`, { force: true });
    cy.contains('label', 'Município').parent().find('input').clear({ force: true }).type(`${dados.endereco.municipio}{enter}`, { force: true });

    cy.contains('button', /salvar/i).click({ force: true });
  });
  
  it('Deve preencher e salvar a sub-seção: Dados Acadêmicos', () => {
    cy.wait(1500);
    cy.contains('Dados acadêmicos').click();

    cy.get('input[placeholder="Sigla/Instituição"]').clear({ force: true }).type(`${dados.academico.siglaInstituicao}{enter}`, { force: true });
    cy.get('input[placeholder="Sigla/Unidade"]').clear({ force: true }).type(`${dados.academico.siglaUnidade}{enter}`, { force: true });
    cy.get('input[placeholder="Selecione uma opção"]').clear({ force: true }).type(`${dados.academico.nivel}{enter}`, { force: true });

    cy.contains('label', 'Currículo Lattes').parent().find('input').clear().type(dados.academico.curriculoLattes);
    cy.contains('label', 'LinkedIn').parent().find('input').clear().type(dados.academico.linkedin);

    cy.contains('button', /salvar/i).click({ force: true });
  });

  it('Deve preencher e salvar a sub-seção: Dados Profissionais', () => {
    cy.contains('Dados profissionais').click();

    if (dados.profissional.possuoVinculoInstitucional) {
      cy.contains('Possuo vínculo institucional').parent().find('input[type="checkbox"]').check({ force: true });
    }

    cy.get('input[placeholder="Tipo de vínculo"]').clear({ force: true }).type(`${dados.profissional.tipoVinculo}{enter}`, { force: true });
    cy.get('input[placeholder="Início de serviço"]').clear({ force: true }).type(dados.profissional.inicioServico, { force: true });
    cy.get('input[placeholder="Regime de trabalho"]').clear({ force: true }).type(`${dados.profissional.regimeTrabalho}{enter}`, { force: true });
    
    cy.get('input[placeholder="Digite aqui..."]').clear({ force: true }).type(dados.profissional.funcaoCargo, { force: true });
    cy.get('input[placeholder="Início de função/cargo"]').clear({ force: true }).type(dados.profissional.inicioFuncaoCargo, { force: true });

    cy.contains('button', /salvar/i).click({ force: true });
  });

  it('Deve submeter os arquivos na sub-seção: Documentos Pessoais', () => {
    cy.contains('Documentos Pessoais').click();

    cy.contains('Selecione uma opção').click({ force: true });
    
    cy.contains(dados.documento.tipoDocumento).click({ force: true });

    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${dados.documento.nomeArquivo}`, { force: true });

    cy.contains('button', /salvar/i).click({ force: true });
  });
});