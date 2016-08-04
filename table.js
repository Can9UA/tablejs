'use strict';

var table = document.querySelector('table'),
    tbody = table.querySelector('tbody');

function getClosestTag(elem, tagSelector) {
  tagSelector = tagSelector.toUpperCase();

  while (elem.tagName !== tagSelector) {
    elem = elem.parentNode;
    if (!elem) {return null;}
  }

  return elem;
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

// ---------
function getMarkedRows(parent) {
  var rows = Array.prototype.slice.call(parent.rows);

  return rows.filter(function(row) {
    var deleteBtn = row.querySelector('input[data-delete]');

    return deleteBtn && deleteBtn.checked;
  });
}

document.querySelector('[data-delete-btn]').addEventListener('click', function (event) {
  var removeArr = getMarkedRows(tbody);

  event.preventDefault();

  for (var i = 0, length = removeArr.length; i < length; i++) {
    tbody.removeChild(removeArr[i]);
  }
});

// ---------
var input = document.createElement('input');
input.setAttribute('type', 'text');
input.className = 'cell-value';

function changeCellValue(cell) {
  input.value = cell.innerText;
  input.style.width = getComputedStyle(cell).width;

  cell.innerText = '';

  cell.appendChild(input);
  input.focus();
  input.setSelectionRange(0, input.value.length);

  var setValueAndClose = function () {
    input.removeEventListener('blur', setValueAndClose);
    // input.remove(); // ie 11 doesn't support
    cell.removeChild(input);
    cell.innerText = input.value;
  };

  input.addEventListener('blur', setValueAndClose);
}

tbody.addEventListener('dblclick', function(event) {
  var target = event.target;

  if (target.tagName === 'TD' && !target.querySelector('input[data-delete]')) {

    changeCellValue(target);
  }
});