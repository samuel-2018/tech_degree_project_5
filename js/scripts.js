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
  .then(generateList)
  .catch((error) => {
    gallery.innerHTML = `Something went wrong: "${error}"`;
  });

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
      ) => `<div class="card js-result js-searchDisplay" id="employee-${index}" onclick="handleClick(event)">
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

      return `<div class="modal-container employee-${index} js-result js-searchDisplay" id="modal-${index}" style="display:none;" onclick="handleClick(event)">
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
//  CLICK HANDLER
// ------------------------------------------

function handleClick(event) {
  // Prevents event from being captured an extra time.
  event.stopPropagation();

  const modalAction = {
    show() {
      handleClick.activeModal.style.display = 'block';
      handleClick.modalActive = true;
    },

    hide() {
      handleClick.activeModal.style.display = 'none';
    },

    closeCarousel() {
      modalAction.hide();
      handleClick.modalActive = false;
    },

    get() {
      // Gets the id from the clicked card.
      const employee = event.currentTarget.id;
      // Uses id to select matching class name on the modal.
      const modal = document.querySelector(`.modal-container.${employee}`);
      return modal;
    },

    update(modal) {
      // Stores reference to active modal.
      handleClick.activeModal = modal;
    },

    go(direction) {
      let continueModalSearch = true;
      let lastModal = handleClick.activeModal;
      // Searches
      while (continueModalSearch) {
        // Is there a modal that direction?
        if (lastModal[`${direction}Sibling`] !== null) {
          // Is the modal part of the user's search term?
          if (lastModal[`${direction}Sibling`].matches('.js-result')) {
            // Found a match. Now do updates.
            modalAction.hide();
            modalAction.update(lastModal[`${direction}Sibling`]);
            modalAction.show();
            continueModalSearch = false;
          } else {
            lastModal = lastModal[`${direction}Sibling`];
          }
        } else {
          // Nothing left that direction.
          continueModalSearch = false;
        }
      }
    },
  };

  // Closes modal upon button click.
  if (event.currentTarget.matches('.modal-close-btn')) {
    modalAction.closeCarousel();

    // Shows modal.
  } else if (event.currentTarget.matches('.card') && handleClick.modalActive === false) {
    modalAction.update(modalAction.get());
    modalAction.show();

    // Closes modal upon outside click.
  } else if (
    (event.target.matches('.modal-container') && handleClick.modalActive === true)
    || event.target.id === 'modal-close-btn'
  ) {
    modalAction.closeCarousel();

    // Shows prev modal.
  } else if (event.target.matches('#modal-prev')) {
    modalAction.go('previous');

    // Shows next modal.
  } else if (event.target.matches('#modal-next')) {
    modalAction.go('next');
  }
}

/**
 * Static variables for 'handleClick()':
 * Within the function, these have to be
 * prefaced with 'handleClick' NOT 'this'.
 */
handleClick.modalActive = false;
handleClick.activeModal = null;

// ------------------------------------------
//  FORM SUBMIT (SEARCH)
// ------------------------------------------

// Selects form.
const form = document.querySelector('.search-container > form');

// Form submit listener
form.addEventListener('submit', handleSubmit);

function generateList() {
  // List of all cards and modals. (Called once, after 'fetch'.)
  // (querySelectorAll returns a NodeList, which has to be converted to an array.)
  handleSubmit.cardsModalsList = Array.from(document.querySelectorAll('.js-searchDisplay'));
}

function handleSubmit(event) {
  const action = {
    showSearchResults(search) {
      action.clearAll();
      handleSubmit.cardsModalsList.forEach((element) => {
        const nameElement = element.querySelector('.js-name');
        // Finds matching cards and modals.
        if (nameElement.textContent.includes(search)) {
          // Both cards and modals
          element.className += ' js-result';
          if (element.matches('.card')) {
            // Only cards
            element.style.display = '';
          }
        }
      });
    },

    clearAll() {
      document.querySelectorAll('.card').forEach((card) => {
        // Hides card.
        card.style.display = 'none';
        // Removes card from results.
        card.className = card.className.replace(' js-result', '');
      });
      document.querySelectorAll('.modal-container').forEach((modal) => {
        // Removes modal from results.
        modal.className = modal.className.replace(' js-result', '');
      });
    },
  };

  event.preventDefault();
  // 'Elements' is the content of the form submission.
  const { elements } = this;
  const search = elements[0].value.toLowerCase();
  action.showSearchResults(search);
}
// Static variable
handleSubmit.cardsModalsList = null;
