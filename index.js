//Declaring Data Arrays to be stored in Local Storage
let localContacts = JSON.parse(localStorage.getItem("contacts"));
let contacts = localStorage.getItem("contacts") !== null ? localContacts : []

//Utility
function clearValues(){
    $("#firstName").val(null);
    $("#lastName").val(null);
    $("#mobile").val(null);
    $("#email").val(null);
    $("#city").val(null);
};

function generateID(){
    return Math.floor(Math.random() * 10000);
};

function updateLocalStorage(){
    localStorage.setItem("contacts", JSON.stringify(contacts));
}


//onTab Click
$("#contact-tab").click((e) => {
    e.preventDefault();
    const loggedIn = localStorage.getItem("userDetails")
    clearValues()
    if(loggedIn){
        $("#nav-home").hide();
        $("#nav-contact").show();
    }else {
        $("#nav-contact").hide();

    }
})

$("#home-tab").click((e) => {
    e.preventDefault();
    const loggedIn = localStorage.getItem("userDetails")

    if(loggedIn){
        $("#nav-home").show();
        $("#nav-contact").hide();
    }else {
        $("#nav-home").hide();
    }
})

//Logout 
$("#login-tab").click((e) => {
    e.preventDefault();

    const loggedIn = localStorage.getItem("userDetails")
    if(loggedIn){
        localStorage.setItem("userDetails", "")
        $("#nav-contact").hide();
        init();
        $(".login-success-msg").html("")
        $("#username").val(null)
        $("#password").val(null)
    } 
})


//====CUD Operation====

//Add
function addRowData(contact, callBack){
    contacts.push(contact);
    callBack();
}

//Edit
function editRowData(editContact, callBack){
    
    let editIndex = contacts.findIndex(contact => contact.id == editContact.id)

    contacts[editIndex].firstName = editContact.firstName
    contacts[editIndex].lastName = editContact.lastName
    contacts[editIndex].mobile = editContact.mobile
    contacts[editIndex].email = editContact.email
    contacts[editIndex].city = editContact.city

    callBack();
}


//Delete
function deleteContact(id) {
    contacts = contacts.filter(contact => contact.id !== id)
    updateLocalStorage();
    init();
}


//Contact Form Submit
$("#contact-submit-btn").click((e) => {
    e.preventDefault()
    const editID = localStorage.getItem("editID")

    const contactData =  {
        id: editID ? editID : generateID(),
        firstName: $("#firstName").val().trim(),
        lastName: $("#lastName").val().trim(),
        mobile: $("#mobile").val().trim(),
        email: $("#email").val().trim(),
        city: $("#city").val().trim(),
    }

    let isValid = contactData.firstName && contactData.lastName && contactData.mobile && contactData.email && contactData.city 
    
    if(isValid && editID){
        editRowData(contactData, () => {
            updateLocalStorage();
            clearValues();
            init();
            let navHome = $("#home-tab")
            $("#contact-submit-btn").text("Submit")
            let navHomeTab = new bootstrap.Tab(navHome)
            navHomeTab.show()
        })
    } else {
        addRowData(contactData, () => {
            updateLocalStorage();
            clearValues();
            init();
        })
    };

    clearValues();
})

//Login Form Submit
$("#login-submit-btn").click((e)=>{
    e.preventDefault()
    const loginData = {
        username: $("#username").val().trim(),
        password: $("#password").val().trim(),
    }

    const xhr = new XMLHttpRequest();
    
    xhr.onload = () => {
        const userData = JSON.parse(xhr.responseText);
       
        userData.map((user)=> {
            if(loginData.username === user.loginName && loginData.password === user.password){
                localStorage.setItem("userDetails", JSON.stringify(user));
                let navHome = $("#home-tab")
                let navHomeTab = new bootstrap.Tab(navHome)
                navHomeTab.show()
                
                $("#login-tab").html(
                    `
                        <i class="bi bi-person-fill"></i>
                        Logout
                    `
                )  
                $(".login-error-msg").text("")
            } 
        })

        if(localStorage.getItem("userDetails") === ""){
            $(".login-error-msg").text("User not found")
        }

        

        init();
    };

    xhr.open("get", "login.json");
    xhr.overrideMimeType("text/html");
    xhr.send();
})




//DOM Manipulation
function addContactsToDOM(contact, index){
    const contactRow = document.createElement("tr");
    const userDetails = JSON.parse(localStorage.getItem("userDetails"))
    const userRole = userDetails  ? userDetails.role : ""

    contactRow.innerHTML = `
        <td>${index+1}</td>
        <td>${contact.firstName}</td>
        <td>${contact.lastName}</td>
        <td>${contact.mobile}</td>
        <td>${contact.email}</td>
        <td>${contact.city}</td>
        <td>
            <button id="edit" class="btn p-0 ${userRole !== "admin" ? "disabled" : ""}" style="color: green;" onClick="editContactToDOM(${contact.id})">
                Edit
            </button> |
            <button id="delete" class="btn p-0 ${userRole !== "admin" ? "disabled" : ""}" style="color: red;" onClick="deleteContact(${contact.id})">
                Delete
            </button>
        </td>
    `
    $("#contact-row").append(contactRow)
}

function editContactToDOM(id){

    contacts.map(contact => {

        if(contact.id === id){
            $("#firstName").val(contact.firstName)
            $("#lastName").val(contact.lastName)
            $("#mobile").val(contact.mobile)
            $("#email").val(contact.email)
            $("#city").val(contact.city)

            let navContact = $("#contact-tab")
            let navContactTab = new bootstrap.Tab(navContact)
            navContactTab.show()
            $("#nav-home").hide();
            $("#nav-contact").show();
            $("#contact-submit-btn").text("Edit")
            localStorage.setItem("editID", id)
        }
    })
};

//Search-Filter
$("#search-btn").click((e) => {
    e.preventDefault();

    const searchValue = $("#search").val().trim()
    if( searchValue.length > 3){
        $("#contact-row").html("")

        contacts?.filter(contact => {
            const { firstName, lastName, mobile, email, city} = contact
            if(searchValue == firstName || searchValue ==  lastName || searchValue == mobile || searchValue == email || searchValue == city){
                return contact
            } 
        }).map((contact, index) => {
            addContactsToDOM(contact, index);
        })
    } else {
        alert("Add more than three letters")
    }

})


function init(){
    const loggedIn = localStorage.getItem("userDetails")

    //clearing before repopulating
    $("#contact-row").html("")

    if(loggedIn){
        $("#nav-home").show()
        $("#nav-login").hide()
        $("#login-tab").html(
            `
                <i class="bi bi-person-fill"></i>
                Logout
            `
        )

        $("#welcome").text(`Welcome ${JSON.parse(loggedIn).firstName}!`)
       
        const contacts = JSON.parse(localStorage.getItem("contacts"));

        contacts?.map((contact, index) => {
            addContactsToDOM(contact, index);
        })
    } else {
        $("#nav-home").hide()
        $("#nav-login").show()

        $("#login-tab").html(
            `
                <i class="bi bi-person-fill"></i>
                Login
            `
        )
    };
};


init();