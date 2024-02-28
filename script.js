"use strict";

let isEditing = false;

document.addEventListener('DOMContentLoaded', function () {
    initializePanning();
    initializeBubbles();
});

/**
 * Initializes functionality for panning the screen.
*/
function initializePanning() {
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    // Check if middle mouse button is pressed (button value for middle button is 1)
    document.addEventListener('mousedown', function (e) {
        if (e.button === 1) {
            e.preventDefault();

            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
        }
    });

    // If currently panning, scroll the page
    document.addEventListener('mousemove', function (e) {
        if (isPanning) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Scroll the page by the difference in the mouse's movement
            window.scrollBy(-deltaX, -deltaY);

            // Update the start position for the next mousemove event
            startX = e.clientX;
            startY = e.clientY;
        }
    });

    // Stop panning when middle mouse button is released
    document.addEventListener('mouseup', function (e) {
        if (e.button === 1) {
            isPanning = false;
        }
    });

    // Disable middle-click scroll behavior to avoid conflict
    document.addEventListener('click', function (e) {
        if (e.button === 1) {
            e.preventDefault();
        }
    });
}

/**
 * Initializes functionality for all .bubble elements.
*/
function initializeBubbles() {
    const bubbles = document.querySelectorAll('.bubble');

    bubbles.forEach(bubble => {
        initializeDoubleClickToEdit(bubble);
        initializeDragAndDrop(bubble);
    });
}

/**
 * Enables editing the <h3> element within a .bubble on double-click.
 * @param {HTMLElement} bubble - The bubble element to attach the double-click event.
*/
function initializeDoubleClickToEdit(bubble) {

    const h3 = bubble.querySelector('h3');

    bubble.addEventListener('dblclick', function (e) {
        e.stopPropagation(); // Prevent event from bubbling up to parent elements.
        isEditing = true;

        // Add the 'editing' class to the bubble being edited
        bubble.classList.add('editing');

        // Update cursor for all bubbles
        updateCursorForOtherBubbles(bubble, true);

        // Enable content editing
        h3.setAttribute('contenteditable', 'true');
        h3.focus(); // Focus the element to start editing.

        // Select all text inside h3 element
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(h3);
        selection.removeAllRanges();
        selection.addRange(range);

        // Disable content editing when the element loses focus
        h3.addEventListener('blur', function () {
            h3.removeAttribute('contenteditable');
            isEditing = false;

            // Remove the 'editing' class once editing is finished
            bubble.classList.remove('editing');

            // Reset cursor for all bubbles
            updateCursorForOtherBubbles(bubble, false);
        }, { once: true }); // Automatically remove the listener after it triggers.
    });
}

/**
 * Updates the cursor style for all .bubble elements except the one being edited.
 * 
 * This function iterates through all .bubble elements on the page and changes
 * their cursor style based on whether a .bubble is currently being edited. If a
 * .bubble is being edited, the cursor for all other .bubble elements is set to 'default'
 * to indicate that they are not editable at the moment. Once editing is finished,
 * the cursor style is reverted according to the standard CSS styling for those elements,
 * allowing the cursor style to reflect the editable state accurately.
 * 
 * @param {HTMLElement} editedBubble - The .bubble element that is currently being edited.
 * @param {boolean} editing - A boolean flag indicating whether the .bubble is currently being edited.
 */
function updateCursorForOtherBubbles(editedBubble, editing) {
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach(bubble => {
        if (bubble !== editedBubble) {
            bubble.style.cursor = editing ? 'pointer' : ''; // Set cursor to pointer when editing, else revert
        }
    });
}

/**
 * Initializes drag-and-drop functionality for a .bubble element.
 * @param {HTMLElement} bubble - The bubble element to make draggable.
 */
function initializeDragAndDrop(bubble) {
    bubble.addEventListener('mousedown', function (e) {
        if (isEditing) return;
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up.

        const clone = createDraggableClone(bubble);
        document.body.appendChild(clone);

        // Function to update the clone's position based on cursor movement.
        const moveClone = (e) => {
            updateClonePosition(clone, e.pageX, e.pageY, bubble.offsetWidth, bubble.offsetHeight);
        };

        // Attach event listener for moving the clone.
        document.addEventListener('mousemove', moveClone);

        // Cleanup once dragging ends.
        document.addEventListener('mouseup', function () {
            removeClone(clone, moveClone);
        }, { once: true });
    });
}

/**
 * Creates and returns a draggable clone of the bubble element.
 * @param {HTMLElement} bubble - The bubble element to clone.
 * @returns {HTMLElement} The clone of the bubble element.
 */
function createDraggableClone(bubble) {
    const clone = bubble.cloneNode(true);
    clone.style.position = 'absolute';
    clone.classList.add('dragging_bubble');
    return clone;
}

/**
 * Updates the position of the clone element based on cursor coordinates.
 * @param {HTMLElement} clone - The cloned bubble element.
 * @param {number} pageX - The X coordinate of the cursor.
 * @param {number} pageY - The Y coordinate of the cursor.
 * @param {number} offsetWidth - The offsetWidth of the original bubble.
 * @param {number} offsetHeight - The offsetHeight of the original bubble.
 */
function updateClonePosition(clone, pageX, pageY, offsetWidth, offsetHeight) {
    clone.style.left = pageX - offsetWidth / 2 + 'px';
    clone.style.top = pageY - offsetHeight / 2 + 'px';
}

/**
 * Removes the clone from the document and detaches the mousemove event listener.
 * @param {HTMLElement} clone - The cloned bubble element to remove.
 * @param {Function} moveClone - The function handling the clone's movement.
 */
function removeClone(clone, moveClone) {
    clone.remove();
    document.removeEventListener('mousemove', moveClone);
}