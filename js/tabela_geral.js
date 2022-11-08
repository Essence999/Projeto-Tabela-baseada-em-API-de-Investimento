let fii_user = [];
let fii_table = [];

async function carregarDadosUser(url) {
    await fetch(url)
        .then(resp => resp.json())
        .then(json => fii_user = json);
    carregarDadosFundos();
}

async function carregarDadosFundos() {

    for (let fii of fii_user) {
        let json = await fetch(`https://api-simple-flask.herokuapp.com/api/${fii.nome}`)
            .then(resp => resp.json());
        fii_table.push(json);
        console.log(fii);
    }
    exibirTabela();
}

carregarDadosUser("json/fii.json");

function exibirTabela() {
    document.querySelector("img").style.display = "none";

    fii_user.forEach(fii => {
        let dados_fii = fii_table.find((item) => item.fundo.indexOf(fii.nome.toUpperCase()) >= 0);
        let dados_pesquisar = [fii.nome.toUpperCase(), "setor", "proximoRendimento.dataBase", "proximoRendimento.dataPag", "proximoRendimento.rendimento", "valorAtual", fii.qtde, fii.totalgasto, (fii.totalgasto / fii.qtde).toFixed(2),
            "rendimento", "dividendYield", "rendimentoMedio24M"]
        let dado;

        for (let i of [1, 2, 3, 4, 5, 9, 10, 11]) {
            dado = eval(`dados_fii.${dados_pesquisar[i]}`)
            if (i == 2 || i == 3 || i == 4 && dado == "-") {
                dado = eval(`dados_fii.${dados_pesquisar[i].replace("proximo", "ultimo")}`)
            }
            else if (i == 9) {
                dados_pesquisar[9] = ((dados_pesquisar[4] * 100) / dados_pesquisar[5]).toFixed(2)
                continue
            }
            else if (i == 10) {
                dado += "%"
            }
            else if (i == 11) {
                dado = dado.toFixed(2)
            }
            dados_pesquisar.splice(i, 1, dado)
        }

        document.querySelector("#tabela").innerHTML += `<tr id="linha-${fii.nome}"></tr>`;
        for (let i = 0; i < 12; i++) {
            if (i == 4 || i == 5 || i == 7 || i == 8 || i == 11) {
                dados_pesquisar[i] = "R$ " + dados_pesquisar[i]
            }
            else if (i == 9) {
                if (dados_pesquisar[i] >= 0.6) {
                    document.querySelector(`#linha-${fii.nome}`).classList.add("positivo")
                }
                else {
                    document.querySelector(`#linha-${fii.nome}`).classList.add("negativo")
                }
                dados_pesquisar[i] += "%"
            }

            document.querySelector(`#linha-${fii.nome}`).innerHTML += `<td>${dados_pesquisar[i]}</td>`
        }
    })

    // Passo 3 - Linha Final

    document.querySelector("#tabela").innerHTML += `<tr class="fundo_total"></tr>`
    document.querySelector(".fundo_total").innerHTML += `<td colspan="4">Total Geral</td>`
    for (let i = 0; i < 8; i++) {
        if (i == 0 || i == 3) {
            document.querySelector(".fundo_total").innerHTML += `<td>R$</td>`
        }
        else {
            document.querySelector(".fundo_total").innerHTML += `<td>-</td>`
        }
    }

    let tabelas = document.querySelectorAll("td")

    let num = [4, 6, 7]
    let tds_3 = {prox_prov: [], qtd_cotas: [], tot_inv:[]}
    tabelas.forEach(function (tabela, numero) {
        if (numero == num[0] && numero <= 160) {
            num[0] += 12
            tds_3.prox_prov.push(Number((tabela.innerHTML).replace("R$ ", "")))
        }
        else if (numero == num[1] && numero <= 162) {
            num[1] += 12
            tds_3.qtd_cotas.push(Number((tabela.innerHTML).replace("R$ ", "")))
        }
        else if (numero == num[2] && numero <= 163) {
            num[2] += 12
            tds_3.tot_inv.push(Number((tabela.innerHTML).replace("R$ ", "")))
        }
    })

    tds_3 = Object.values(tds_3)

    let tot_inv = 0;
    tds_3[2].forEach(valor => {
        tot_inv += valor
    })

    let qtd_cotas = 0;
    tds_3[1].forEach(valor => {
        qtd_cotas += valor
    })

    let prox_prov = 0;
    for (let i = 0; i < tds_3[1].length; i++) {
        prox_prov += tds_3[0][i] * tds_3[1][i]
    }

    tabelas[172].innerHTML = "R$ " + tot_inv.toFixed(2)
    tabelas[171].innerHTML = qtd_cotas
    tabelas[169].innerHTML = "R$ " + prox_prov.toFixed(2)
}