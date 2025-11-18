//import express from 'express';
const express = require('express');

//import createClient from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
//import {createClient} from '@supabase/supabase-js'
const supabaseClient = require('@supabase/supabase-js');

//import morgan from 'morgan';
const morgan = require('morgan');

//import bodyParser from "body-parser";
const bodyParser = require('body-parser');

//import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const app = express();

const cors=require("cors");
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration


// using morgan for logs
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// ATENÇÃO: Mantenha suas próprias credenciais Supabase aqui
const SUPABASE_URL = 'https://jdmziauxomjjpzjdnaeu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXppYXV4b21qanB6amRuYWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDUxMzksImV4cCI6MjA3ODM4MTEzOX0.8HL2VQt6huHzNojpuTwqHoT5FnbvYWqRFNAmElSVx0U';

const supabase = 
    supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Rota GET para listar todos os produtos
app.get('/products', async (req, res) => {
    const {data, error} = await supabase
        .from('products')
        .select()
        .order('id', { ascending: true }) // Ordena por ID para melhor UX
    
    if (error) {
        console.error('Erro ao listar produtos:', error);
        return res.status(500).send(error);
    }
    res.send(data);
    console.log(`Lista todos os produtos. Quantidade: ${data ? data.length : 0}`);
});

// Rota GET para buscar produtos por nome (Funcionalidade de Pesquisa)
app.get('/products/search', async (req, res) => {
    const { name } = req.query;
    
    if (!name) {
        return res.status(400).send({ error: 'Parâmetro de busca por nome é obrigatório.' });
    }

    // Usa 'ilike' para busca parcial e case-insensitive
    const {data, error} = await supabase
        .from('products')
        .select()
        .ilike('name', `%${name}%`) 
        .order('id', { ascending: true });

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).send(error);
    }
    res.send(data);
    console.log(`Busca por nome '${name}' retornou: ${data ? data.length : 0} produtos.`);
});


// Rota GET para buscar produto por ID
app.get('/products/:id', async (req, res) => {
    console.log("id = " + req.params.id);
    const {data, error} = await supabase
        .from('products')
        .select()
        .eq('id', req.params.id)
    
    if (error) {
        console.error('Erro ao buscar produto por ID:', error);
        return res.status(500).send(error);
    }
    // Retorna a array, que será vazia se o ID não for encontrado
    res.send(data || []); 
    console.log("Produto(s) retornado(s): "+ (data ? data.length : 0));
});

// Rota POST para adicionar um novo produto
app.post('/products', async (req, res) => {
    const {error} = await supabase
        .from('products')
        .insert({
            name: req.body.name,
            description: req.body.description, // Incluindo descrição
            price: req.body.price,
        })
    if (error) {
        console.error('Erro ao criar produto:', error);
        return res.status(500).send(error);
    }
    res.send("created!!");
});

// Rota PUT para atualizar um produto
app.put('/products/:id', async (req, res) => {
    const {error} = await supabase
        .from('products')
        .update({
            name: req.body.name,
            description: req.body.description, // Incluindo descrição
            price: req.body.price
        })
        .eq('id', req.params.id)
    if (error) {
        console.error('Erro ao atualizar produto:', error);
        return res.status(500).send(error);
    }
    res.send("updated!!");
});

// Rota DELETE para deletar um produto
app.delete('/products/:id', async (req, res) => {
    const {error} = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
    if (error) {
        console.error('Erro ao deletar produto:', error);
        return res.status(500).send(error);
    }
    res.send("deleted!!")
    console.log("Produto deletado com ID: " + req.params.id);

});

// Rotas de Boas-vindas
app.get('/', (req, res) => {
    res.send("Hello I am working my friend Supabase <3");
});

app.get(/(.*)/, (req, res) => {
    res.send("Hello again I am working my friend to the moon and behind <3");
});

// Inicialização do Servidor
app.listen(3000, () => {
    console.log(`> Ready on http://localhost:3000`);
});