const mongoose=require('mongoose');

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        tls:true
    })
    .then(()=>{
        console.log("DB connected sucessfully");
    })
    .catch((err)=>{
        //console.log();
        console.log("DB Connection ISSUE!!");
        console.error(err);
        process.exit(1);
    })
}
