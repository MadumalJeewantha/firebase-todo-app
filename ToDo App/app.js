// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCOwjhR3XCWxnTq-TSdMWTB6petVA6VWgw",
    authDomain: "todo-app-f911f.firebaseapp.com",
    databaseURL: "https://todo-app-f911f.firebaseio.com",
    projectId: "todo-app-f911f",
    storageBucket: "todo-app-f911f.appspot.com",
    messagingSenderId: "13584298040",
    appId: "1:13584298040:web:004c30e6829c73108636cd",
    measurementId: "G-E6G94YHLQH"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Reference to auth method of Firebase
const auth = firebase.auth();

// Reference to database method of Firebase
const database = firebase.firestore();

// Access themodal element
const modal = document.getElementById('modal');

// Access theelement that closes the modal
const close = document.getElementById('close');

// Access the forms for email and password authentication
const createUserForm = document.getElementById('create-user-form');
const signInForm = document.getElementById('sign-in-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');

// Access the authentication dialogs
const createUserDialog = document.getElementById('create-user-dialog');
const signInDialog = document.getElementById('sign-in-dialog');
const haveOrNeedAccountDialog = document.getElementById('have-or-need-account-dialog');

// declare uid globally so you can access it throughout your app
let uid;

// When the user clicks the (x) button close the modal
close.addEventListener('click', () => {
    modal.style.display = 'none';
});

// When the user clicks anywhere outside of the modal close it.
window.addEventListener('click', event => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Access auth elements to listen for auth actions
const authAction = document.querySelectorAll('.auth');

// Loop through elements and use the associated auth attribute to determine what action to take when clicked
authAction.forEach(eachItem => {
    eachItem.addEventListener('click', event => {
        let chosen = event.target.getAttribute('auth')
        if (chosen === 'show-create-user-form') {
            showCreateUserForm();
        }
        else if (chosen === 'show-sign-in-form') {
            showSignInForm();
        }
        else if (chosen === 'show-forgot-password-form') {
            showForgotPasswordForm();
        }
        else if (chosen === 'sign-out') {
            signOut();
        }
    });
});

// Invoked at the start of auth functions in order to hide everything before selectively showing the correct form
hideAuthElements = () => {
    clearMessage();
    loading('hide');
    createUserForm.classList.add('hide');
    signInForm.classList.add('hide');
    forgotPasswordForm.classList.add('hide');
    createUserDialog.classList.add('hide');
    signInDialog.classList.add('hide');
    haveOrNeedAccountDialog.classList.add('hide');
}

// Invoked when user wants to create a new user account
showCreateUserForm = () => {
    hideAuthElements();
    modal.style.display = 'block';
    createUserForm.classList.remove('hide');
    signInDialog.classList.remove('hide');
    haveOrNeedAccountDialog.classList.remove('hide');
}

// Invoked when a user wants to sign in
showSignInForm = () => {
    hideAuthElements();
    modal.style.display = 'block';
    signInForm.classList.remove('hide');
    createUserDialog.classList.remove('hide');
    haveOrNeedAccountDialog.classList.remove('hide');
}

// Invoked when a user wants reset their password
showForgotPasswordForm = () => {
    hideAuthElements();
    modal.style.display = 'block';
    forgotPasswordForm.classList.remove('hide');
}

// Access elements that need to be hidden or show based on auth state
const hideWhenSignedIn = document.querySelectorAll('.hide-when-signed-in');
const hideWhenSignedOut = document.querySelectorAll('.hide-when-signed-out');

auth.onAuthStateChanged(user => {
    if (user) {
        // If user signed in
        uid = user.uid;
        modal.style.display = 'none';
        console.log(user.displayName);

        // Hides or shows elements depending on if user is signed in
        hideWhenSignedIn.forEach(eachItem => {
            eachItem.classList.add('hide');
        });
        hideWhenSignedOut.forEach(eachItem => {
            eachItem.classList.remove('hide');
        });

        // Greet the user with a message and make it personal by using their name
        if (user.displayName) {
            document.getElementById('display-name-header').textContent = `Hello, ${user.displayName}`;
        }

        database.collection('to-do-lists').doc(uid).collection('my-list')
            .onSnapshot(snapshot => {
                // generate to-do item and delete button for each entry in your collection
                document.getElementById('to-do-list-items').innerHTML = '';
                // loop through all document in the my-list collection
                snapshot.forEach(element => {
                    // create a pharagraph for each item
                    let p = document.createElement('p');
                    // fill the paragrahp with the text of the to-do
                    p.textContent = element.data().item;
                    let deleteButton = document.createElement('button');
                    deleteButton.textContent = 'x';
                    deleteButton.classList.add('delete-button');
                    deleteButton.setAttribute('data', element.id);
                    p.appendChild(deleteButton);
                    // append the paragraph as they are made to the DOM using the element 'to-do-list-items'
                    document.getElementById('to-do-list-items').appendChild(p);
                });
            });

    } else {
        // If not signed in
        console.log("User not signed in.");

        // Hides or shows elements depending on if user is signed out
        hideWhenSignedIn.forEach(eachItem => {
            eachItem.classList.remove('hide')
        });
        hideWhenSignedOut.forEach(eachItem => {
            eachItem.classList.add('hide')
        });
    }
});

// Create a user
createUserForm.addEventListener('submit', event => {
    event.preventDefault();
    loading('show');

    // Get values
    const displayName = document.getElementById('create-user-display-name').value;
    const email = document.getElementById('create-user-email').value;
    const password = document.getElementById('create-user-password').value;

    // Send values to firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            auth.currentUser.updateProfile({
                displayName: displayName
            })

            createUserForm.reset();
            hideAuthElements();
        })
        .catch(error => {
            console.log(error.message);
            displayMessage('error', error.message);
            loading('hide');
        });
});

// Invoked when user wants to sign out
signOut = () => {
    auth.signOut();
    hideAuthElements();
}

// Sign in form submit event
signInForm.addEventListener('submit', event => {
    event.preventDefault();
    loading('show');

    // Get values
    const email = document.getElementById('sign-in-email').value;
    const password = document.getElementById('sign-in-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            signInForm.reset();
            hideAuthElements();
        })
        .catch(error => {
            console.log(error.message);
            displayMessage('error', error.message);
            loading('hide');
        });
});

// Forgot password form submit event
forgotPasswordForm.addEventListener('submit', event => {
    event.preventDefault();
    loading('show');

    // Get values
    var emailAddress = document.getElementById('forgot-password-email').value;
    auth.sendPasswordResetEmail(emailAddress)
        .then(() => {
            forgotPasswordForm.reset();
            console.log("Reset link has been sent. Please check your email.")
            displayMessage('success', "Reset link has been sent. Please check your email.");
        })
        .catch(error => {
            console.log(error.message);
            displayMessage('error', error.message);
            loading('hide');
        });
});

// Access the message HTML element
const authMessage = document.getElementById('message');

// Makes the messageTimeout global so that the clearTimeout method will work when invoked
let messageTimeout;

// Error and message handling
displayMessage = (type, message) => {
    if (type == 'error') {
        authMessage.style.borderColor = 'red'
        authMessage.style.color = 'red'
        authMessage.style.display = 'block'
    } else if (type === 'success') {
        authMessage.style.borderColor = 'green'
        authMessage.style.color = 'green'
        authMessage.style.display = 'block'
    }
    authMessage.innerHTML = message;
    messageTimeout = setTimeout(() => {
        authMessage.innerHTML = '';
        authMessage.style.display = 'none';
    }, 7000);
}

clearMessage = () => {
    clearTimeout(messageTimeout);
    authMessage.innerHTML = '';
    authMessage.style.display = 'none';
}

// Function to hide and show the loading visual cue
loading = (action) => {
    if (action == 'show') {
        document.getElementById('loading-outer-container').style.display = 'block';
    } else if (action === 'hide') {
        document.getElementById('loading-outer-container').style.display = 'none';
    } else {
        console.log('loading error');
    }
}

// Get the to do list form for item submissions
const toDoListForm = document.getElementById('to-do-list-form');

// Add to-do item submit event
toDoListForm.addEventListener('submit', event => {
    event.preventDefault();
    // Send value to Firebase
    database.collection('to-do-lists').doc(uid).collection('my-list').add({
        // Grab values from form
        item: document.getElementById('item').value,
    });

    // Rest form
    toDoListForm.reset();
})

// Delete a to do list item
document.body.addEventListener('click', event => {
    if (event.target.matches('.delete-button')) {
        key = event.target.getAttribute('data');
        database.collection('to-do-lists').doc(uid).collection('my-list').doc(key).delete();
    };
});