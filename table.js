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
    this.rows = Array.prototype.slice.call(this.tbody.rows);
    this.deleteBtn = document.querySelector(this.config.rowDeleteBtn);

    // filter
    var filterConfig = this.config.filter;
    if (typeof filterConfig === 'object') {
      this.filter = {};
      this.filter.input = document.querySelector(filterConfig.input);
      this.filter.column = document.querySelector(filterConfig.column);
      this.filter.startAfter = filterConfig.startAfter || 1;
    }

    return true;
  },
  bindEvents: function () {
    var self = this;

    // sort table
    this.table.addEventListener('click', function (event) {
      var target = event.target;

      if (target.hasAttribute(self.config.sortBtn)) {
        self.sortTable(
          self.getClosestTag(target, 'th').cellIndex,
          self.getSortDirection(target)
        );
      }
    });

    // delete marked rows
    if (this.deleteBtn) {
      self.deleteBtn.addEventListener('click', function (event) {
        var removeArr = self.getMarkedRows(self.tbody);

        event.preventDefault();

        for (var i = 0, length = removeArr.length; i < length; i++) {
          self.tbody.removeChild(removeArr[i]);
          self.rows.splice(self.rows.indexOf(removeArr[i]), 1);
        }
      });
    }

    // change cell value
    this.tbody.addEventListener('dblclick', function (event) {
      var target = event.target;

      if (target.tagName === 'TD' && !target.querySelector(self.config.deleteBtn)) {

        self.changeCellValue(target);
      }
    });

    // filter
    if (typeof this.filter === 'object') {
      this.filter.input.addEventListener('keyup', function () {
        var value = this.value;

        if (value.length >= self.filter.startAfter) {
          self.filterActive = true;
          self.filterTable(self.filter.column, value);
        } else if (value.length === 0) {
          self.filterActive = false;
          self.resetTable();
        }
      });
    }
  },
  resetTable: function () {
    this.table.removeChild(this.tbody);

    for (var i = 0, length = this.rows.length; i < length; i++) {
      this.tbody.appendChild(this.rows[i]);
    }

    this.table.appendChild(this.tbody);
  },
  searchRowsByFilter: function (colIndex, value) {
    var suitableRows = [];
    var row;
    var cellValue;
    var regExp = new RegExp(value, 'ig');

    for (var i = 0, length = this.rows.length; i < length; i++) {
      row = this.rows[i];
      cellValue = row.cells[colIndex].innerHTML;

      if (cellValue.match(regExp)) {
        suitableRows.push(row);
      }
    }

    return suitableRows;
  },
  filterTable: function (colIndex, value) {
    var filterdRows;

    colIndex = (typeof colIndex === 'number') ? colIndex : colIndex.cellIndex;

    this.table.removeChild(this.tbody);

    filterdRows = this.searchRowsByFilter(colIndex, value);

    for (var i = 0, rowsLength = this.rows.length; i < rowsLength; i++) {
      this.tbody.removeChild(this.rows[i]);
    }

    for (var j = 0, length = filterdRows.length; j < length; j++) {
      this.tbody.appendChild(filterdRows[j]);
    }

    this.table.appendChild(this.tbody);
  },
  sortTable: function (colIndex, direction) {
    var rows = (this.filterActive) ? Array.prototype.slice.call(this.tbody.rows) : this.rows;

    rows.sort(function(a, b) {
      var val = a.cells[colIndex].innerHTML >= b.cells[colIndex].innerHTML ? 1 : -1;

      return val * direction;
    });

    this.table.removeChild(this.tbody);

    for (var i = 0, length = rows.length; i < length; i++) {
      this.tbody.appendChild(rows[i]);
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
    // 1 - ascending
    // -1 - descending
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
  getMarkedRows: function () {
    return this.rows.filter(function(row) {
      var deleteBtn = row.querySelector('input[data-delete]');

      return deleteBtn && deleteBtn.checked;
    });
  },
  createAuxiliaryElements: function () {
    // create input tag for changing value in cell
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
  rowDeleteBtn: '[data-delete-btn]',
  filter: {
    input: '[data-filter-value]',
    column: '[data-filter-column]',
    startAfter: 0
  }
});