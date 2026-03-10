function login(){

let email=document.getElementById("email").value
let pass=document.getElementById("password").value

if(email && pass){

window.location="/dashboard"

}else{

alert("Enter login details")

}

}

async function loadQR(){

let res=await fetch("/qr")
let data=await res.json()

if(data.qr){
document.getElementById("qr").src=data.qr
}

}

setInterval(loadQR,3000)

async function getCode(){

let number=document.getElementById("number").value

let res=await fetch("/pair",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({number})
})

let data=await res.json()

document.getElementById("paircode").innerText="PAIR CODE : "+data.code

}
