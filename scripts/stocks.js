const url = "https://stock-price-notifier.herokuapp.com/";

var totalStocks = "";
var currentPage = 1;
var totalPages = 0;

var timeout = null;

window.onload = ()=>{ 
    setUserName(); 
    getStocks();
    checkLoginStatus();
};

stocksToSubscribe = []; 
stocksToUnSubscribe = [];

function checkLoginStatus(){
    if(localStorage.getItem("userName") === null){
        localStorage.clear();
        window.location.href = "index.html";
    }
}

function searchBoxInput(){
    if(timeout != null){
        clearTimeout(timeout);
        timeout = null;
    }
    timeout = setTimeout(()=>{ getStocks(); },1000);
}

function setUserName(){
    userName = localStorage.getItem("userName");
    console.log(document.getElementById("logoutButton"));
    document.getElementById("logoutButton").textContent =`Hello, ${userName} !`;
}

async function getStocks(){
    const data = {
        "name" : document.getElementById("searchBox").value,
        "page" : currentPage
    }
    const stocksResponse = await post(url+"getStocksList",data);
    const stocks = stocksResponse["stockList"];
    totalStocks = stocksResponse["total_records"];
    const stocksTable = document.getElementById("stocksTableBody");

    if(totalStocks === 0){
        document.getElementById("emptyStocksMessage").style.display = "block";
        document.getElementById("emptyStocksMessage").textContent = "No Stocks found with given name!";
    }
    else{
        document.getElementById("emptyStocksMessage").style.display = "none";
    }

    stocksTable.innerHTML = "";

    totalPages = Math.ceil(totalStocks/50);

    console.log(totalStocks+" "+totalPages);

    if(totalPages<=1){
        document.getElementById("pagination").style.display = "none";
        document.getElementById("paginationMessage").style.display = "none";
    }
    else{
        changePaginationText();
    }

    let index = 1;

    stocks.forEach(stock => {
        const row = document.createElement("tr");
        row.innerHTML = `<td class="text-center">${ index++ }</td>
        <td class="text-center">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" onclick="changeSubscriptionStatus(${stock.id})" id="userStockStatus${stock.id}"">
            </div>
        </td>
        <td class="text-center">${stock.name}</td>
        <td class="text-center">${stock.symbol}</td>
        <td class="text-center">${stock.industry}</td>`;
        stocksTable.appendChild(row);
        if(stock.subscribed){
            document.getElementById(`userStockStatus${stock.id}`).checked = true;
        }
    });
}

async function changeSubscriptionStatus(stockId){

    document.getElementById("saveChangesButton").disabled = false;

    const element = document.getElementById(`userStockStatus${stockId}`);
    if(element.checked){
        const subscribeIndex = stocksToSubscribe.indexOf(stockId);
        const unsubscribeIndex = stocksToUnSubscribe.indexOf(stockId);

        if(unsubscribeIndex >=0){
            stocksToUnSubscribe.splice(unsubscribeIndex, 1);
        }
        if(subscribeIndex == -1){
            stocksToSubscribe.push(stockId); 
        } 
    }
    else{
        const subscribeIndex = stocksToSubscribe.indexOf(stockId);
        const unsubscribeIndex = stocksToUnSubscribe.indexOf(stockId);
        if(subscribeIndex >=0){
            stocksToSubscribe.splice(subscribeIndex,1);
        }
        if(unsubscribeIndex === -1){
            stocksToUnSubscribe.push(stockId); 
        }
    }
}

async function saveSubscriptions(){
    const data = {
        "stocks_to_subscribe" : stocksToSubscribe,
        "stocks_to_unsubscribe" : stocksToUnSubscribe
    }
    const saveSubscriptionsResponse = await post(url+"subscribeStocks",data);
    var x = document.getElementById("snackbar");
    if(saveSubscriptionsResponse["status"]=="success"){
        x.innerHTML = "Changes Updated Successfully !";
    }
    else{
        x.innerHTML = "There was some error ! Please Try Again"
    }
    
    stocksToUnSubscribe = [];
    stocksToUnSubscribe =[]; 

    document.getElementById("saveChangesButton").disabled = true;

    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}



// PAGINATION FUNCTIONS

function nextPage(){
    if(currentPage===totalPages){
        return ;
    }
    document.getElementById("firstBoxInner").textContent = ++currentPage;
    if(currentPage===totalPages){
        document.getElementById("next_page").classList.add("disabled");
    } 
    document.getElementById("previous_page").classList.remove("disabled");
    getStocks();
    changePaginationText();
}

function previousPage(){
    if(currentPage === 1){
        return ;
    }
    document.getElementById("firstBoxInner").textContent = --currentPage;
    if(currentPage==1){
        document.getElementById("previous_page").classList.add("disabled");
    }
    document.getElementById("next_page").classList.remove("disabled");
    getStocks();
    changePaginationText();
}

function changePaginationText(){
    document.getElementById("paginationMessage").textContent = `Page ${currentPage} of ${totalPages}`
}

//Logout function

function logoutUser(){
    localStorage.clear();
    window.location.href = "index.html";
}

// HTTP REQUESTS

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