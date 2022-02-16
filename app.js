// const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const UserInfo = require('./src/model/userDB');
const ArticleInfo =require('./src/model/ArticleDB');
const path = require('path');


const app= express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());


// dotenv.config({path:'./config.env'});


app.post('/api/login',(req,res)=>{
    const {email,password} = req.body;
    UserInfo.findOne({email:email},(err,user)=>{
        if(user){
            if(user.password === password){
                res.send({message:"Login successful",user});
            }
            else{ 
                res.send({message:"Incorrect Password"});
            } 
        }
        else{
            res.send({message:"User not registered."});
        }
    })
});

app.post('/api/signup',(req,res)=>{
    const {username,email,password} = req.body;
    UserInfo.findOne({email:email},(err,user)=>{
        if(user){
            res.send({message:"User already exists"})
        }
        else{
            const user = new UserInfo({
                username,
                email,
                password
            });
            user.save(err=>{
                if(err) res.send(err);
                else res.send({message:'Successfully Signed Up. Please Log In'})
            })
        }
    })
});

app.get('/api/article-list', async (req, res) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        await ArticleInfo.find({ })
            .then(function (article) {
                res.status(200).json(article);
            })
                
    }
    catch (error) {
        res.status(500).json({ message: 'Error', error });
    }
});

app.get('/api/article/:name', (req, res) => {
    try {
        const articleName = req.params.name;
        ArticleInfo.findOne({ name: articleName })
            .then(function (article) {
                res.status(200).json(article);
                console.log(article);
            })
    }
    catch (error) {
        res.status(500).json({ message: 'Error', error });
    }
});

app.put('/api/article/:name/edit', async(req, res) => {
    const blog =req.body;
    const editBlog = new ArticleInfo(blog);
    try{
        await ArticleInfo.updateOne({name: req.params.name}, editBlog);
        res.status(200).json(editBlog);
    } catch (error){
        res.status(400).json({ message: error.message});     
    }
});


app.post('/api/article/add-blog', (req, res) => {
    const {name,title,description} =req.body;
    const article = new ArticleInfo({
        name,
        title,
        description
    });
    article.save(err=>{
        if(err) res.send(err);
        else res.send({message:'Added successfully'})
    })
});

app.delete('/api/article/delete-blog/:name', async (req, res) => {
    
        const name = req.params.name;
        await ArticleInfo.findOneAndRemove({name}).exec();
        res.send('Article Deleted') ;
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('/build'));
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname + '/build/index.html'));
    });    
}

app.listen((process.env.PORT || 5000), function(){
    console.log('listening on :5000');
});