let allInvestments = []
let d = new Date();
const table = document.getElementById("myTableBody");
let interval = 3000;

// load investments from local storage
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
        addRow(allInvestments[i].invName, allInvestments[i].startingVal, allInvestments[i].intRate, allInvestments[i].age);
    }
}

//initiates updating the values every 3 seconds
function updateValues() {
    compUpdate();
    setTimeout(updateValues, interval);
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
    //data validation
    let alphabetRegex = new RegExp("^[a-zA-Z]+$");
    if(!alphabetRegex.test(invName)) {
        alert("Investment name can only contain alphabetical characters");
        return;
    }
    if(!startingVal) {
        alert("Starting principal must be a number");
        return;
    }
    if(!intRate) {
        alert("Interest rate must be a number");
        return;
    }

    d = new Date();
    let startingTime = d.getTime();
    let age = 0;
    let isPaused = false;
    // check if blank input
    if(invName && startingVal && intRate){
        // append to table
        addRow(invName, startingVal, intRate, age);
        // add to list of investments
        allInvestments.push({invName, startingVal, intRate, startingTime, age, isPaused})
        // utilize local storage
        if (typeof(Storage)){
            // set local value
            localStorage.setItem("investments", JSON.stringify(allInvestments));
        }
    }
}

// takes text input and appends to DOM table
function addRow(invName, startingVal, intRate, age){
    // format row to add to DOM
    let newRow = `<tr id="${invName}">
                    <td class="playPause"><i value="" class="button small icon solid fas fa-pause" onclick="playPause('${invName}')"></i></td>
                    <td class="invName">${invName}</td>
                    <td class="invName">${(intRate * 100) + "%"}</td>
                    <td class="age">${0}</td>
                    <td class="simpleInt">${startingVal}</td>
                    <td class="compInt">${startingVal}</td>
                    <td class="newAgeCol"><input type="text" name="newAge" class="newAge" value="" placeholder="New Age" /></td>
                    <td class="updateAge"><input type="button" value="update" class="button small" onclick="updateAge('${invName}')" /></td>
                    <td class="delete"><input type="button" value="delete" class="button small" onclick="deleteRow('${invName}')" /></td>
                  </tr>`;
                  
    // add formatted row
    table.innerHTML += newRow;
}

//Toggle the isPaused value of a record and manage age
function playPause(rowID) {
    d = new Date();
    let ppButton;

    //identify index that matches rowID
    for(let i=0;i<allInvestments.length;i++) {
        if(allInvestments[i].invName === rowID) {
            
            ppButton = document.querySelector("#" + allInvestments[i].invName + " > .playPause > .button");

            //Before playing, resets starting time based on age so that the record will resume where it left off
            if(allInvestments[i].isPaused) {
                console.log("Playing ", rowID);
                allInvestments[i].startingTime = d.getTime() - (allInvestments[i].age * interval);

                //Change icon to "playing" state
                ppButton.classList.remove("fa-play");
                ppButton.classList.add("fa-pause");
            } else {
                console.log("Pausing ", rowID);
                //Change icon to "paused" state
                ppButton.classList.remove("fa-pause");
                ppButton.classList.add("fa-play");
            }

            //toggles paused state
            allInvestments[i].isPaused = !allInvestments[i].isPaused;
        }
    }

    
}

// delete record
function deleteRow(rowID) {
    console.log("Delete Row: ", rowID);
    //remove from array by filtering into a copy
    let newAllInvestments = allInvestments.filter(function(value){ 
        return value.invName !== rowID;
    });
    
    // set global array to filtered array values
    allInvestments = newAllInvestments;

    // save to local storage
    if (typeof(Storage)){
        // set local value
        localStorage.setItem("investments", JSON.stringify(allInvestments));
    }
    // remove from DOM
    document.querySelector("#" + rowID).remove();
}

//manually adjust the age of a record
function updateAge(rowID) {
    d = new Date();
    let i=-1;
    let newAge;

    //identify index that matches rowID
    for(let x=0;x<allInvestments.length;x++) {
        if(allInvestments[x].invName === rowID) {
            i=x;
        }
    }

    //exit the function if element is not found
    if(i === -1) return;

    //read newAge from the DOM and confirm it's a valid entry
    newAge = Number(document.querySelector("#" + rowID + " > .newAgeCol > .newAge").value);
    if(!newAge) {
        alert("Age must be a number");
        return;
    }

    //calculate starting time needed to reach that current age,then updates the array
    allInvestments[i].startingTime = d.getTime() - (newAge * interval);
    compUpdate();

    // save to local storage
    if (typeof(Storage)){
        // set local value
        localStorage.setItem("investments", JSON.stringify(allInvestments));
    }
}

//update table investment values
function compUpdate(){
    let updatedSimple = [];
    let updatedCompound = [];
    d = new Date();
    let updatedTime = d.getTime();

    for(let i=0; i<allInvestments.length; i++) {
        if(!allInvestments[i].isPaused) {
            allInvestments[i].age = Math.round((updatedTime - allInvestments[i].startingTime) / interval);
        }
    }
    
    //calculate simple and compound interest for each investment
    for(let i=0; i<allInvestments.length; i++) {
        
        //Simple interest formula: A = P(1 + rt)
        updatedSimple.push(allInvestments[i].startingVal * (1 + (allInvestments[i].intRate * allInvestments[i].age)));

        //Compound interest formula: A = P(1 + r/n)^(nt)
        updatedCompound.push(Math.pow((1 + (allInvestments[i].intRate / 12)),(12 * allInvestments[i].age)) * allInvestments[i].startingVal);
    }

    //update the DOM with the new actual values
    for(let i=0; i<allInvestments.length; i++) {
        document.querySelector("#" + allInvestments[i].invName + " > .age").innerHTML = allInvestments[i].age;
        document.querySelector("#" + allInvestments[i].invName + " > .simpleInt").innerHTML = Math.round(updatedSimple[i] * 100) / 100;
        document.querySelector("#" + allInvestments[i].invName + " > .compInt").innerHTML = Math.round(updatedCompound[i] * 100) / 100;
    }
}