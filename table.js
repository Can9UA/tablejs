'use strict';

var smartTable = {
  init: function (config) {
    this.config = config;

    if (this.findElemens()) {
      this.bindEvents();
      this.createAuxiliaryElements();
    }
  },
  findElemens: function () {
    this.table = document.querySelector(this.config.table);

    if (!this.table) {return false;}

    this.tbody = this.table.querySelector('tbody');
    this.deleteBtn = document.querySelector(this.config.rowDeleteBtn);

    return true;
  },
  bindEvents: function () {
    var self = this;

    this.table.addEventListener('click', function(event) {
      var target = event.target;

      // sort
      if (target.hasAttribute(self.config.sortBtn)) {
        self.sortTable(
          self.getClosestTag(target, 'th').cellIndex,
          self.getSortDirection(target)
        );
      }
    });

    this.tbody.addEventListener('dblclick', function(event) {
      var target = event.target;

      if (target.tagName === 'TD' && !target.querySelector(self.config.deleteBtn)) {

        self.changeCellValue(target);
      }
    });

    if (self.deleteBtn) {
      self.deleteBtn.addEventListener('click', function (event) {
        var removeArr = self.getMarkedRows(self.tbody);

        event.preventDefault();

        for (var i = 0, length = removeArr.length; i < length; i++) {
          self.tbody.removeChild(removeArr[i]);
        }
      });
    }
  },
  sortTable: function (colIndex, direction) {
    var rowsArray = Array.prototype.slice.call(this.tbody.rows);

    rowsArray.sort(function(a, b) {
      var val = a.cells[colIndex].innerHTML >= b.cells[colIndex].innerHTML ? 1 : -1;

      return val * direction;
    });

    this.table.removeChild(this.tbody);

    for (var i = 0, length = rowsArray.length; i < length; i++) {
      this.tbody.appendChild(rowsArray[i]);
    }

    this.table.appendChild(this.tbody);
  },
  getClosestTag: function (elem, tagSelector) {
    tagSelector = tagSelector.toUpperCase();

    while (elem.tagName !== tagSelector) {
      elem = elem.parentNode;
      if (!elem) {return null;}
    }

    return elem;
  },
  getSortDirection: function (elem) {
    // 1 - asc
    // -1 - desc
    var direction = 1;

    if (elem.getAttribute('data-direction')) {
     direction = elem.getAttribute('data-direction') * -1;
    }

    elem.setAttribute('data-direction', direction);
    this.setDirectionClass(elem, direction);

    return direction;
  },
  setDirectionClass: function (elem, direction) {
    if (direction === 1) {
      elem.classList.add('asc');
      elem.classList.remove('desc');
    } else {
      elem.classList.add('desc');
      elem.classList.remove('asc');
    }
  },
  getMarkedRows: function (parent) {
    var rows = Array.prototype.slice.call(parent.rows);

    return rows.filter(function(row) {
      var deleteBtn = row.querySelector('input[data-delete]');

      return deleteBtn && deleteBtn.checked;
    });
  },
  createAuxiliaryElements: function () {
    this.input = document.createElement('input');
    this.input.setAttribute('type', 'text');
    this.input.className = 'cell-value';
  },
  changeCellValue: function(cell) {
    var self = this,
        setValueAndClose;

    setValueAndClose = function () {
      self.input.removeEventListener('blur', setValueAndClose);
      // self.input.remove(); // ie 11 doesn't support
      cell.removeChild(self.input);
      cell.innerText = self.input.value;
    };

    self.input.value = cell.innerText;
    self.input.style.width = getComputedStyle(cell).width;

    cell.innerText = '';

    cell.appendChild(self.input);
    self.input.focus();
    self.input.setSelectionRange(0, self.input.value.length);

    self.input.addEventListener('blur', setValueAndClose);
  }
};

smartTable.init({
  table: 'table',
  sortBtn: 'data-sort-btn',
  deleteBtn: 'input[data-delete]',
  rowDeleteBtn: '[data-delete-btn]'
});