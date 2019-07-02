// select dom elements
const gallery = document.querySelector('#gallery');
const body = document.querySelector('body');

// API request for random user data
fetch('https://randomuser.me/api/?results=12&nat=us&inc=picture,name,email,location,cell,dob')
  .then(parseJSON)
  .then(data => generateCards(data.results))
  .then(dataResults => generateModals(dataResults));
// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------
// convert data to json
function parseJSON(response) {
  /**
   * "The json() method of the Body mixin takes
   * a Response stream and reads it to completion.
   * It returns a promise that resolves with the
   * result of parsing the body text as JSON."
   * https://developer.mozilla.org/en-US/docs/Web/API/Body/json
   *
   * IMPORTANT: It must only be acted upon by .then().
   * Anything else will interfere with what it is doing.
   */
  return response.json();
}

// use map to turn data into cards to insert into gallery div
function generateCards(dataResults) {
  const cards = dataResults
    .map(
      (card, index) => `<div class="card" id="user-${index}" onclick="handleClick(event)">
      <div class="card-img-container">
          <img class="card-img" src="${card.picture.medium}" alt="profile picture">
      </div>
      <div class="card-info-container">
          <h3 id="name" class="card-name cap">${`${card.name.first} ${card.name.last}`}</h3>
          <p class="card-text">${card.email}</p>
          <p class="card-text cap">${`${card.location.city}, ${card.location.state}`}</p>
      </div>
    </div>`,
    )
    .join('');
  gallery.innerHTML = cards;
  // console.log(data);

  return dataResults;
}

// use map to turn data into modals(hidden) to insert into gallery div
function generateModals(dataResults) {
  const modals = dataResults
    .map((modal, index) => {
      const {
        city, state, street, postcode,
      } = modal.location;
      const dob = modal.dob.date.replace(/(^\d{4})(?:-(\d{2})-)(\d{2})(?:.*)/, '$2/$3/$1');

      return `<div class="modal-container user-${index}" id="modal-${index}" style="display:none;" onclick="handleClick(event)">
    <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn" onclick="handleClick(event)"><strong>X</strong></button>
        <div class="modal-info-container">
            <img class="modal-img" src="${modal.picture.large}" alt="profile picture">
            <h3 id="name" class="modal-name cap">${`${modal.name.first} ${modal.name.last}`}</h3>
            <p class="modal-text">${modal.email}</p>
            <p class="modal-text cap">${`${city}, ${state}`}</p>
            <hr>
            <p class="modal-text">(555) 555-5555</p>
            <p class="modal-text">${`${street}, ${city}, ${state} ${postcode}`}</p>
            <p class="modal-text">Birthday: ${dob}</p>
        </div>
    </div>

    <div class="modal-btn-container" onclick="handleClick(event)">
        <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
        <button type="button" id="modal-next" class="modal-next btn">Next</button>
    </div>
</div>`;
    })
    .join('');
  const modalsWrapper = document.createElement('div');
  modalsWrapper.innerHTML = modals;
  body.append(modalsWrapper);
}
// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------

// event listener on the gallery div (through bubbling, will listen for clicks on items with class of card)
// gallery.addEventListener('click', handleClick);

// the callback for click listener on gallery
// opens a modal window for the click target
// has more information
// a close butn (changes the modal's dislay to hide)
// also closes when user clicks anywhere outside modal
// btns for prev and next cards
let modalActive = false;
let activeModal = null;
function handleClick(event) {
  // Stop event bubbling before it gets to the 'gallery' listener.
  event.stopPropagation();
  // Shows a modal.
  // TO DO replace the '*' with a class name on card child elements: card-body
  // console.log(event.currentTarget);
  if (event.currentTarget.matches('.modal-close-btn')) {
    closeModalView(activeModal);
  } else if (event.currentTarget.matches('.card') && modalActive === false) {
    const user = event.currentTarget.id;
    activeModal = document.querySelector(`.modal-container.${user}`);
    showModal(activeModal);
  } else if (
    // Close modal if user clicks outside of modal or on close btn
    (event.target.matches('.modal-container') && modalActive === true)
    || event.target.id === 'modal-close-btn'
  ) {
    closeModalView(activeModal);
  } else if (event.target.matches('#modal-prev')) {
    if (activeModal.previousSibling !== null) {
      hideModal(activeModal);
      activeModal = activeModal.previousSibling;
      showModal(activeModal);
    }
  } else if (event.target.matches('#modal-next')) {
    if (activeModal.nextSibling !== null) {
      hideModal(activeModal);
      activeModal = activeModal.nextSibling;
      showModal(activeModal);
    }
  }
}
// TO DO there needs to be a difference between clicking next/prev and closes the modal alltogether...

function showModal(modal) {
  modal.style.display = 'block';
  modalActive = true;
}
//
function hideModal(modal) {
  modal.style.display = 'none';
}
//
function closeModalView(modal) {
  hideModal(modal);
  modalActive = false;
}

// Search (searches names)
// Uses the data that site already has
// Handle this like with project 2
// control display based on clases added or removed
// have a global reset that hides all the cards
// then a class is added to those that match the search

// notes...about search...
// if you were working with a large amount of data,
// you would use a text or array search/find method that then
// created an array of matches
// any display method would then use that array of data to display
// so, this is a seperation of data and display
// but if one is using the html/dom to store the data,
// then they are tightly coupled
