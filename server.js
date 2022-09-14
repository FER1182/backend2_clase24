const express = require("express")
const handlebars = require("express-handlebars")
const session = require("express-session")
const MongoStore = require("connect-mongo")

const app = express()
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
    store: MongoStore.create({
        mongoUrl:"mongodb+srv://fer231182:fer231182@cluster0.hod4gpe.mongodb.net/?retryWrites=true&w=majority",
        ttl: 600
    }),
    secret:"coder",
    resave:"false",
    saveUninitialized: false 

}))

const auth = (req,res,next)=>{
    if(req.session.user){
        return next()
    }
    res.redirect("http://localhost:3000/login")
}

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/",auth,(req,res)=>{
    res.render("main",{
        user: req.session.user
    })
});


app.post("/login",(req,res)=>{
    const username = req.body.user
    if(username=="pepe"){
        req.session.user = username
        res.redirect(200,"http://localhost:3000")
        return
    }
    res.send("login error")
})

app.get("/logout",(req,res)=>{
    res.render("logout", {user:req.session.user})
    req.session.destroy(err=>{
        if(err){
        return res.json({status:"logout error",body:err})
        }
    })
    //setTimeout(function () {
    //    res.redirect("login");
    //  }, 200);
    
})

//configuarciones//

app.engine(
    "hbs",
    handlebars.engine({
        extname:"hbs",
        defaultLayout:"index.hbs",
        layoutsDir:__dirname+"/views/layouts",
        partialsDir:__dirname+"/views/partials",
    })
)

app.set("view engine","hbs");
app.set("views","./views");

app.listen(3000,()=>{
    console.log("server ok")
})

