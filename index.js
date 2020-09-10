const express = require('express');
const app = express();
const port = 3000;

const request_promise = require("request-promise");
const parseString = require('xml2js').parseString;

app.get('/metro', (req, res) => {
  var options = {
    'method': 'POST',
    'url': 'http://apps.metrosp.com.br/api/diretodometro/v1/SituacaoLinhasMetro.asmx',
    'headers': {
      'Content-Type': 'text/xml; charset=utf-8'
    },
    body: "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <tem:GetSituacaoTodasLinhas>\n         <tem:appId>B7758201-15AF-4246-8892-EAAFFC170515</tem:appId>\n      </tem:GetSituacaoTodasLinhas>\n   </soapenv:Body>\n</soapenv:Envelope>"
  };

  let retorno = { status: [] };

  request_promise(options).then(response => {
    parseString(response, (err, result) => {
      let resultado = result['soap:Envelope']['soap:Body'][0].GetSituacaoTodasLinhasResponse[0]['GetSituacaoTodasLinhasResult'];

      parseString(resultado, (error, resultInner) => {
        let statusLinhas = resultInner.diretodometro.linhas[0].linha;
        statusLinhas.forEach(linha => {
          let nome = linha.nome[0].trim();
          let situacao = linha.situacao[0].trim();
          let cor = nome.split('-')[1];

          retorno.status.push({
            nome_completo: nome,
            numero: nome.match(/\d+/g)[0],
            cor: cor,
            status: situacao
          });
        });

        retorno.status.push({
          nome_completo: "Linha 11 - Coral",
          numero: "11",
          cor: "Coral",
          status: "Linha Parada"
        });

        retorno.status.push({
          nome_completo: "Linha XPTO - XYZ",
          numero: "20",
          cor: "Marrom",
          status: "Linha Parada"
        });

        res.status(200).send(retorno);
      });
    });
  });
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});