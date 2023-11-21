const session = require('express-session');
const express = require('express');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();


// Configuração do MySQL
const connection = mysql.createConnection({
 host: 'localhost',
   port: '3306', // Aqui coloca a porta do mysql 
   user: 'root', //aqui o usuario do mysql
   password: 'tcctedio1234',  //aqui a senha do banco de dados 
   database: 'Conecta' // aqui e o nome da tabela 
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`Requisição para recurso estático: ${req.path}`);
    next();
});
app.use((req, res, next) => {
    console.log(`Recebendo solicitação: ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

app.use(express.static(__dirname));
app.use(session({
    secret: 'tcccefet1234',  // valor secreto para assinar o ID da sessão.
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Defina como true se estiver usando HTTPS
  }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/form.html');
});

app.use(bodyParser.json());

// Rota para processar o cadastro de usuarios
app.post('/form', (req, res) => {
    const { nome, numbercpf, email, numberreg, telefone, especialidade, senha, confirmar_senha } = req.body;

    console.log("Dados recebidos:", req.body);
    console.log("Senha recebida:", senha);

    if (!senha) {
        console.error("Senha não fornecida ou indefinida");
        res.send("Erro ao cadastrar. Senha não fornecida.");
        return;
    }

    if (senha !== confirmar_senha) {
        console.error("As senhas não coincidem");
        res.status(400).send("As senhas não coincidem");
        return;
    }

    const query = 'INSERT INTO medicos (nome, numbercpf, email, numberreg, telefone, especialidade, senha) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [nome, numbercpf, email, numberreg, telefone, especialidade, senha], (err, results) => {
        if (err) {
            console.error("Erro ao inserir os dados:", err);
            res.send("Erro ao cadastrar. Tente novamente.");
        } else {
            res.sendFile(__dirname + '/public/login.html');
        }
    });
});
// Rota para processar o login
app.post('/login', (req, res) => {
    console.log("Acessando rota /login");
    const { email, senha: senha} = req.body;
    console.log(`Dados de login recebidos: Email: ${email}, Senha: ${senha}`);

    const queryusuario = 'SELECT senha FROM medicos WHERE email = ?';
    connection.query(queryusuario, [email], (err, results) => {
        if (err) {
            console.error("Erro ao buscar o email na tabela Usuario:", err);
            res.status(500).send("Erro interno do servidor");
            return;
        }


                 verifyPassword(results, "medicos");
            });
    } 
    
    );

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TCC-main', 'index.html'));
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
