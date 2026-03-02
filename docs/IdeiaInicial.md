Sistema de venda de gás 
Sistema Corporativo de Gestão para Distribuidora de Gás

O projeto propõe o desenvolvimento de um sistema corporativo para gestão integrada de uma distribuidora de gás, contemplando controle de estoque de botijões, gestão de rotas de entrega, controle financeiro e relacionamento com clientes, voltado para empresas de pequeno e médio porte do setor.



O sistema resolve a falta de controle operacional e estratégico nas operações da distribuidora, substituindo processos manuais, anotações em papel ou planilhas desconectadas que geram erros, perdas de estoque, falhas em entregas e dificuldade para visualizar o lucro real. Ele integrará vendas, estoque, logística e financeiro em um único ambiente, atualizando automaticamente a movimentação de botijões (cheios e vazios), o caixa e as contas a receber a cada venda ou entrega realizada.

Como diferenciais, contará com:

 -Controle completo de estoque por tipo de botijão (P13, P45 etc.), incluindo rastreabilidade de entrada, saída e retorno de vasilhames;

 -Gestão inteligente de rotas de entrega com otimização por região e acompanhamento em tempo real;

 -Controle de comodato de botijões com registro por cliente;

 -Alertas de estoque mínimo e previsão de reposição com base no histórico de vendas;

 -Gestão de pedidos via aplicativo (equipe interna  

 -controle de pagamentos (à vista, fiado, cartão, PIx)

 -Controle de inadimplência e limite de crédito por cliente;

 -Dashboard gerencial com indicadores estratégicos como faturamento diário, margem por tipo de gás, desempenho por entregador, ticket médio e giro de estoque;



Além disso, o sistema permitirá auditoria completa das operações, registro de perdas e avarias, controle de manutenção de veículos e acompanhamento de metas comerciais, garantindo maior eficiência operacional, redução de prejuízos e tomada de decisão baseada em dados.



O resultado é uma gestão integrada, automatizada e estratégica que aumenta a rentabilidade, melhora o atendimento ao cliente e proporciona maior controle e segurança nas operações da distribuidora de gás.



Aluno:Samuel Lima



Feedback do professor para alteração: É necessário atenção pois a ideia apresentada se trata de um erp/crm vertical (sistema de nicho). Caso o foco seja apenas venda, vai ser um sistema transacional simples sem integrações com outros sistemas, para ser corporativo a ênfase deve estar de fato na integração com outras áreas. Outra atenção é em relação ao tempo, ERP/CRM são sistemas que contem muitas features que precisam ser desenvolvidas, que pela a quantidade pode não dar tempo.  



Para que a proposta seja validada como corporativa, você deve elevar o escopo de uma "ferramenta de vendas" para uma plataforma de governança de ativos e conformidade. O projeto será salvo se contemplar os seguintes ajustes:



Visão de Holding (Multi-unidade): O sistema deve permitir a gestão centralizada de múltiplas filiais ou depósitos, consolidando estoques de vasilhames (ativos imobilizados) e resultados financeiros macro.



Arquitetura de Subsistemas: Os módulos (Logística, Financeiro, RH/Frota) devem ser tratados como microsserviços ou módulos independentes que se comunicam via APIs, e não apenas como páginas de um mesmo CRUD.



Interoperabilidade e Compliance: É obrigatório prever a integração com o ecossistema externo, como APIs de Notas Fiscais (NF-e/NFC-e), padrões regulatórios da ANP e serviços profissionais de roteirização (Google Maps/Fleet).



Gestão de Identidade e Auditoria: Implementar controle de acesso granular (RBAC) e trilhas de auditoria imutáveis, garantindo que toda movimentação de estoque ou financeira seja rastreável para fins de compliance jurídico.