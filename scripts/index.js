const url = "http://127.0.0.1:5000/";

const phoneNumberPattern =  /^\d{10}$/;

function getStarted(){
    document.getElementById("mainContent").textContent = "";
    document.getElementById("loginDialog").classList.remove("display-none");
}

function showLoginForm(){
    document.getElementById("loginForm").classList.remove('display-none');
    document.getElementById("registerForm").classList.add('display-none');
}

function showRegisterForm(){
    document.getElementById("registerForm").classList.remove('display-none');
    document.getElementById("loginForm").classList.add('display-none');
}

function loginUser(){
    var phoneNumber = document.getElementById("loginPhoneNumber").value.trim();
    var password = document.getElementById("loginPassword").value.trim();

    if(! phoneNumber.match(phoneNumberPattern)){
        addValidationError("Invalid phone number");
        return;
    }

    if( password.length < 6){
        addValidationError("Invalid password");
        return;
    }

    if(phoneNumber.length>0 && password.length>0){
        var data = {
            phone : phoneNumber,
            password : password
        }
        post(url+"login",data).then(function(result){
            console.log(result)
            if(result.status==="success"){
                localStorage.setItem('token', result.token);
                localStorage.setItem('userName', result.name);
                window.location.href = "stocks.html";
            }else{
                addValidationError("Invalid Credentials! Please Check and Try Again");
            }
        });
    }
}

function registerUser(){
    var phoneNumber  = document.getElementById("registerPhoneNumber").value.trim();
    var name = document.getElementById("fullName").value.trim();
    var password = document.getElementById("registerPassword").value.trim();

    if(! phoneNumber.match(phoneNumberPattern)){
        addValidationError("Invalid phone number");
        return ;
    }
    if(!(name && name.length>0)){
        addValidationError("Invalid name");
        return ; 
    }
    if(password.length<6){
        addValidationError("Password must be atleast 6 characters");
        return ;
    }

    const userData = {
        "name" : name,
        "phone" : phoneNumber,
        "password" : password
    }

    const registerResponse = post(url+"register", userData);

    if(registerResponse["status"]==="error"){
        addValidationError(registerResponse["message"]);
        return ;
    }

    clearValidationErrors();
    var x = document.getElementById("snackbar");
    x.innerHTML = "Registered Sucessfully ! Login to Continue";
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    showLoginForm();
}

function addValidationError(message){
    document.getElementById("loginErrorMessage").textContent = message;
    document.getElementById("registerErrorMessage").textContent = message;
}

function clearValidationErrors(){
    document.getElementById("loginErrorMessage").textContent = "";
    document.getElementById("registerErrorMessage").textContent = "";
}


async function get(url){
    const rawResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token' : localStorage.getItem('token')
        }
    });
    const content = await rawResponse.json();
    return content;
}

async function post(url,data){
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token' : localStorage.getItem('token')
      },
      body: JSON.stringify(data)
    });
    const content = await rawResponse.json();
    return content;
}