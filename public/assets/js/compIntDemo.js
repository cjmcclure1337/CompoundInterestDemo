let allInvestments = []
let d = new Date();
const table = document.getElementById("myTableBody");

// TODO: load investments from local storage
function getLocalInvestments(){
    let localInvestments = [];

    // check if storage useable
    if (typeof(Storage)){
        // if stored value exists
        if(localStorage.getItem("investments")){
            // parse string to JSON object for app
            localInvestments = JSON.parse(localStorage.getItem("investments"));
        }
    }

    // return formatted array
    return localInvestments;
}

// display all investments if any currently exist on page load
function loadInvestments(){
    // get objects from local storage and parse from string
    allInvestments = getLocalInvestments();
    for(let i = 0; i < allInvestments.length; i++){
        addRow(allInvestments[i].invName, allInvestments[i].startingVal, allInvestments[i].intRate, allInvestments[i].startingTime);
    }
}

//initiates updating the values every 3 seconds
function updateValues() {
    compUpdate();
    setTimeout(updateValues, 3000);
}

// start app functionality
loadInvestments();
updateValues();

// read text input
function createInvestment(){
    // get user input values
    let invName = document.getElementById("invName").value;
    let startingVal = Number(document.getElementById("startingVal").value);
    let intRate = Number(document.getElementById("intRate").value)/100;
    d = new Date();
    let startingTime = d.getTime();
    // check if blank input
    if(invName && startingVal && intRate){
        // append to table
        addRow(invName, startingVal, intRate);
        // add to list of investments
        allInvestments.push({invName, startingVal, intRate, startingTime})
        // utilize local storage
        if (typeof(Storage)){
            // set local value
            localStorage.setItem("investments", JSON.stringify(allInvestments));
        }
    }
}

// takes text input and appends to DOM table
function addRow(invName, startingVal, intRate){
    // format row to add to dom
    let newRow = `<tr id="`+invName+`">
                    <td class="invName">`+invName+`</td>
                    <td class="age">`+0+`</td>
                    <td class="simpleInt">`+startingVal+`</td>
                    <td class="compInt">`+startingVal+`</td>
                    <td class="delete"><input type="button" value="delete" class="button small" onclick="deleteRow('`+invName+`')" /></td>
                  </tr>`;
                  
    // add formatted row
    table.innerHTML += newRow;
}

function deleteRow(rowID) {
    console.log("Delete Row: ", rowID);
    //TODO: remove from array

    //TODO: remove from DOM

}

//update table investment values
function compUpdate(){
    let updatedSimple = [];
    let updatedCompound = [];
    d = new Date();
    let updatedTime = d.getTime();
    let age;
    
    //calculate simple and compound interest for each investment
    for(let i=0; i<allInvestments.length; i++) {
        age = parseInt((updatedTime - allInvestments[i].startingTime) / 5000);
        
        //Simple interest formula: A = P(1 + rt)
        updatedSimple.push(allInvestments[i].startingVal * (1 + (allInvestments[i].intRate * age)));

        //Compound interest formula: A = P(1 + r/n)^(nt)
        updatedCompound.push(Math.pow((1 + (allInvestments[i].intRate / 12)),(12 * age)) * allInvestments[i].startingVal);
    }

    //update the DOM with the new actual values
    for(let i=0; i<allInvestments.length; i++) {
        age = parseInt((updatedTime - allInvestments[i].startingTime) / 5000);

        document.querySelector("#" + allInvestments[i].invName + " > .age").innerHTML = age;
        document.querySelector("#" + allInvestments[i].invName + " > .simpleInt").innerHTML = Math.round(updatedSimple[i] * 100) / 100;
        document.querySelector("#" + allInvestments[i].invName + " > .compInt").innerHTML = Math.round(updatedCompound[i] * 100) / 100;
    }
}