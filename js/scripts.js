// Select dom elements.
const gallery = document.querySelector('#gallery');
const body = document.querySelector('body');

// ------------------------------------------
//  FETCH FUNCTION
// ------------------------------------------

fetch('https://randomuser.me/api/?results=12&nat=us&inc=picture,name,email,location,cell,dob')
  .then(parseJSON)
  .then(data => generateCards(data.results))
  .then(dataResults => generateModals(dataResults))
  .then(generateList);

// ------------------------------------------
//  FETCH HELPER FUNCTION
// ------------------------------------------

function parseJSON(response) {
  /**
   * "The json() method of the Body mixin takes
   * a Response stream and reads it to completion.
   * It returns a promise that resolves with the
   * result of parsing the body text as JSON."
   * https://developer.mozilla.org/en-US/docs/Web/API/Body/json
   *
   * IMPORTANT: It must only be acted upon by '.then()'.
   * Anything else will interfere with what it is doing.
   */
  return response.json();
}

// ------------------------------------------
//  GENERATE HTML
// ------------------------------------------

function generateCards(dataResults) {
  const cards = dataResults
    .map(
      (
        card,
        index,
      ) => `<div class="card isResult js-searchDisplay" id="employee-${index}" onclick="handleClick(event)">
      <div class="card-img-container">
          <img class="card-img" src="${card.picture.medium}" alt="profile picture">
      </div>
      <div class="card-info-container">
          <h3 id="name" class="card-name cap js-name">${`${card.name.first} ${card.name.last}`}</h3>
          <p class="card-text">${card.email}</p>
          <p class="card-text cap">${`${card.location.city}, ${card.location.state}`}</p>
      </div>
    </div>`,
    )
    .join('');
  gallery.innerHTML = cards;

  // Returned data will be used by next '.then()'.
  return dataResults;
}

function generateModals(dataResults) {
  const modals = dataResults
    .map((modal, index) => {
      const {
        email,
        location: {
          city, state, street, postcode,
        },
        name: { first, last },
        picture: { large },
      } = modal;

      const dob = modal.dob.date.replace(/(^\d{4})(?:-(\d{2})-)(\d{2})(?:.*)/, '$2/$3/$1');

      // Modals will be hidden until needed.

      // TO DO add comments to explain classe etc... and revise class names and ids... remove some? rename some?

      return `<div class="modal-container employee-${index} isResult js-searchDisplay" id="modal-${index}" style="display:none;" onclick="handleClick(event)">
    <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn" onclick="handleClick(event)"><strong>X</strong></button>
        <div class="modal-info-container">
            <img class="modal-img" src="${large}" alt="profile picture">
            <h3 id="name" class="modal-name cap js-name">${`${first} ${last}`}</h3>
            <p class="modal-text">${email}</p>
            <p class="modal-text cap">${`${city}, ${state}`}</p>
            <hr>
            <p class="modal-text">(555) 555-5555</p>
            <p class="modal-text cap">${`${street}, ${city}, ${state} ${postcode}`}</p>
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

const searchContainer = document.querySelector('.search-container');
searchContainer.innerHTML = `<form action="#" method="get">
    <input type="search" id="search-input" class="search-input" placeholder="Search...">
    <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
  </form>`;

// ------------------------------------------
//  EVENT HANDLERS
// ------------------------------------------

function handleClick(event) {
  // TO DO Convert functions into an object?
  function showModal() {
    handleClick.activeModal.style.display = 'block';
    handleClick.modalActive = true;
  }

  function hideModal() {
    handleClick.activeModal.style.display = 'none';
  }

  function closeModalView() {
    hideModal();
    handleClick.modalActive = false;
  }
  function getModal() {
    // Gets the id from the clicked card.
    const employee = event.currentTarget.id;
    // Uses id to select matching class name on the modal.
    const modal = document.querySelector(`.modal-container.${employee}`);
    return modal;
  }
  function updateModal(modal) {
    handleClick.activeModal = modal;
  }
  // Closes modal upon btn click.
  if (event.currentTarget.matches('.modal-close-btn')) {
    closeModalView();

    // Shows modal.
  } else if (event.currentTarget.matches('.card') && handleClick.modalActive === false) {
    updateModal(getModal());
    showModal();

    // Closes modal upon outside click.
  } else if (
    (event.target.matches('.modal-container') && handleClick.modalActive === true)
    || event.target.id === 'modal-close-btn'
  ) {
    closeModalView();

    // Shows prev modal.
  } else if (event.target.matches('#modal-prev')) {
    let continueModalSearch = true;
    let lastModal = handleClick.activeModal;
    while (continueModalSearch) {
      if (lastModal.previousSibling !== null) {
        if (lastModal.previousSibling.matches('.isResult')) {
          hideModal();
          updateModal(lastModal.previousSibling);
          showModal();
          continueModalSearch = false;
        } else {
          lastModal = lastModal.previousSibling;
        }
      } else {
        // Nothing left that direction.
        continueModalSearch = false;
      }
    }

    // Shows next modal.
  } else if (event.target.matches('#modal-next')) {
    let continueModalSearch = true;
    let lastModal = handleClick.activeModal;
    while (continueModalSearch) {
      if (lastModal.nextSibling !== null) {
        if (lastModal.nextSibling.matches('.isResult')) {
          hideModal();
          updateModal(lastModal.nextSibling);
          showModal();
          continueModalSearch = false;
        } else {
          lastModal = lastModal.nextSibling;
        }
      } else {
        // Nothing left that direction.
        continueModalSearch = false;
      }
    }
  }
}

/**
 * Within the function, these have to be
 * prefaced with 'handleClick' NOT 'this'.
 */
// Static variables for handleClick()
handleClick.modalActive = false;
handleClick.activeModal = null;

// Search listener
const form = document.querySelector('.search-container > form');
form.addEventListener('submit', function handleSearch(event) {
  event.preventDefault();
  const { elements } = this;
  const search = elements[0].value.toLowerCase();
  showSearchResults(search);
});

// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------

let list = null;
function generateList() {
  // List of all cards and modals.
  // (querySelectorAll returns a NodeList, which has to be converted to an array.)
  list = Array.from(document.querySelectorAll('.js-searchDisplay'));
}

function showSearchResults(search) {
  clearAll();
  list.forEach((element) => {
    const nameElement = element.querySelector('.js-name');
    // Finds matching cards and modals.
    if (nameElement.textContent.includes(search)) {
      // Both cards and modals
      element.className += ' isResult';
      if (element.matches('.card')) {
        // Only cards
        element.style.display = 'block';
      }
    }
  });
}

// Hides all of the cards.
function clearAll() {
  document.querySelectorAll('.card').forEach((card) => {
    card.style.display = 'none';
    card.className = card.className.replace(' isResult', '');
  });
  document.querySelectorAll('.modal-container').forEach((modal) => {
    modal.className = modal.className.replace(' isResult', '');
  });
}

// ------------------------------------------
//   NOTES
// ------------------------------------------

// notes...about search...
// if you were working with a large amount of data,
// you would use a text or array search/find method that then
// created an array of matches
// any display method would then use that array of data to display
// so, this is a seperation of data and display
// but if one is using the html/dom to store the data,
// then they are tightly coupled
