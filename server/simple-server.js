const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req,res,next)=>{ res.header('Access-Control-Allow-Origin','*'); res.header('Access-Control-Allow-Headers','*'); next(); });

app.get('/health', (req,res)=> res.json({status:'ok', version:'1.0.0', mode:'AI Fitness Pro Demo'}));

app.post('/api/reps/verify', (req,res)=>{
  const reps = req.body.reps || [];
  const verified = reps.filter(r=> r.minElbowAngle <=90 && r.maxElbowAngle >=160 && r.backDeviation <=20);
  res.json({
    verifiedCount: verified.length,
    rejectedCount: reps.length-verified.length,
    earnedRub: verified.length*0.1,
    newBalance: 23.5 + verified.length*0.1,
    achievementsUnlocked: verified.length>0?['first_10']:[],
    techniqueFeedback: verified.length>0?'Отличная техника!':'Глубже!'
  });
});

app.get('/api/balance', (req,res)=> res.json({balance:23.5, pendingWithdraw:0, history:[]}));
app.get('/api/competitions', (req,res)=> res.json([{id:'1', title:'Челлендж 1000', prize_pool:500, participants:42, ends_at:new Date(Date.now()+86400000*3).toISOString()}]));

app.use(express.static(path.join(__dirname,'public')));
app.get('*', (req,res)=>{
  if(req.path.startsWith('/api/')) return res.status(404).json({error:'not found'});
  res.sendFile(path.join(__dirname,'public','index.html'));
});

app.listen(PORT, '0.0.0.0', ()=> console.log(`🚀 AI Fitness Demo running on ${PORT}`));
