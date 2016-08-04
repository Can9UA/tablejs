'use strict';

var table = document.querySelector('table'),
    tbody = table.querySelector('tbody');

function getClosestTag(el, tagSelector) {
  tagSelector = tagSelector.toUpperCase();

  while (el.tagName !== tagSelector) {
    el = el.parentNode;
    if (!el) {return null;}
  }

  return el;
}

function sortTable(colIndex, direction) {
  var rowsArray = Array.prototype.slice.call(tbody.rows);

  rowsArray.sort(function(a, b) {
    var val = a.cells[colIndex].innerHTML >= b.cells[colIndex].innerHTML ? 1 : -1;

    return val * direction;
  });

  table.removeChild(tbody);

  for (var i = 0, length = rowsArray.length; i < length; i++) {
    tbody.appendChild(rowsArray[i]);
  }

  table.appendChild(tbody);
}

// 1 - asc
// -1 - desc
// Element.dataset not supported in IE
function getSortDirection(elem) {
  var direction = 1;

  if (elem.getAttribute('data-direction')) {
   direction = elem.getAttribute('data-direction') * -1;
  }

  elem.setAttribute('data-direction', direction);
  setDirectionClass(elem, direction);

  return direction;
}

function setDirectionClass(elem, direction) {
  if (direction === 1) {
    elem.classList.add('asc');
    elem.classList.remove('desc');
  } else {
    elem.classList.add('desc');
    elem.classList.remove('asc');
  }
}

table.addEventListener('click', function(event) {
  var target = event.target;

  // sort
  if (target.hasAttribute('data-sort-btn')) {
    sortTable(
      getClosestTag(target, 'th').cellIndex,
      getSortDirection(target)
    );
  }
});