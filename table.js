'use strict';

var tableData = [{number: 1, firstName: 'A', lastName: 'X'},{number: 2, firstName: 'B', lastName: 'Y'},{number: 3, firstName: 'C', lastName: 'Z'},{number: 4, firstName: 'D', lastName: 'Xx'},{number: 5, firstName: 'Aa', lastName: 'Xy'},{number: 6, firstName: 'Ab', lastName: 'Xz'},{number: 7, firstName: 'Ac', lastName: 'Zx'},{number: 8, firstName: 'Ba', lastName: 'Zy'},{number: 9, firstName: 'Bb', lastName: 'Zz'},{number: 10, firstName: 'Bc', lastName: 'Y'}];

var Table = function (config) {
  var self = this;

  this.config = config;

  function getClosestTag (elem, tagSelector) {
    tagSelector = tagSelector.toUpperCase();

    while (elem.tagName !== tagSelector) {
      elem = elem.parentNode;
      if (!elem) {return null;}
    }

    return elem;
  }

  function prepareData(data) {
    var row;
    var cell;
    var deleteBtn;

    if (!data.length) {return false;}

    self.rows = [];

    for (var i = 0, len = data.length; i < len; i++) {
      row = document.createElement('tr');

      for (var prop in data[i]) {
        cell = document.createElement('td');
        cell.innerText = data[i][prop];
        row.appendChild(cell);
      }

      deleteBtn = document.createElement('td');
      deleteBtn.innerHTML = '<input type="checkbox" data-delete>';

      row.appendChild(deleteBtn);
      self.rows.push(row);
    }

    return self.rows;
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

  function getSortDirection(elem) {
    // 1 - ascending
    // -1 - descending
    var direction = 1;

    if (elem.getAttribute('data-direction')) {
      direction = elem.getAttribute('data-direction') * -1;
    }

    elem.setAttribute('data-direction', direction);
    setDirectionClass(elem, direction);

    return direction;
  }

  this.findElemens = function () {
    this.table = document.querySelector(this.config.table);

    if (!this.table) {return false;}

    this.tbody = this.table.querySelector('tbody');
    this.deleteBtn = document.querySelector(this.config.rowDeleteBtn);

    // filter
    var filterConfig = this.config.filter;

    if (typeof filterConfig === 'object') {
      this.filter = {};
      this.filter.inputs = this.table.querySelectorAll(filterConfig.inputs);
      this.filter.startAfter = filterConfig.startAfter || 1;
    }

    return true;
  };

  this.fillInTable = function (data) {
    if (!this.tbody) {return false;}

    if (data && data.length) {
      data = prepareData(data);
    } else if (typeof this.config.getDataCallback === 'function') {
      data = prepareData(this.config.getDataCallback(this));
    } else {
      console.warn('No data for table!');
      return false;
    }

    if (!data.length) {return false;}

    for (var i = 0, len = data.length; i < len; i++) {
      this.tbody.appendChild(data[i]);
    }

    return true;
  };

  this.bindEvents = function () {
    // sort table
    this.table.addEventListener('click', function (event) {
      var target = event.target;

      if (target.hasAttribute(self.config.sortBtn)) {
        self.sortTable(
          getClosestTag(target, 'th').cellIndex,
          getSortDirection(target)
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
      var handler = function () {
        var value = this.value;

        if (value.length >= self.filter.startAfter) {
          self.filterActive = true;
          self.filterTable(this.getAttribute('data-filter-value'), value);
        } else if (value.length === 0) {
          self.filterActive = false;
          self.resetTable();
          self.resetFilters();
        }
      };

      for (var i = 0, len = this.filter.inputs.length; i < len; i++) {
        this.filter.inputs[i].addEventListener('keyup', handler);
      }
    }
  };

  this.createAuxiliaryElements = function () {
    // create input tag for changing value in cell
    this.input = document.createElement('input');
    this.input.setAttribute('type', 'text');
    this.input.className = 'cell-value';
  };

  this.resetTable = function () {
    this.table.removeChild(this.tbody);

    for (var i = 0, length = this.rows.length; i < length; i++) {
      this.tbody.appendChild(this.rows[i]);
    }

    this.table.appendChild(this.tbody);
  };

  this.resetFilters = function () {
    for (var i = 0, len = this.filter.inputs.length; i < len; i++) {
      this.filter.inputs[i].value= '';
    }
  };

  this.searchRowsByFilter = function (colIndex, value) {
    var suitableRows = [];
    var row;
    var cellValue;
    var regExp = new RegExp(value, 'ig');
    var rows = (this.filterActive) ? Array.prototype.slice.call(this.tbody.rows) : this.rows;

    for (var i = 0, length = rows.length; i < length; i++) {
      row = rows[i];
      cellValue = row.cells[colIndex].innerHTML;

      if (cellValue.match(regExp)) {
        suitableRows.push(row);
      }
    }

    return suitableRows;
  };

  this.filterTable = function (colIndex, value) {
    var filterdRows;

    this.table.removeChild(this.tbody);

    filterdRows = this.searchRowsByFilter(colIndex, value);

    // clear tbody
    while (this.tbody.firstChild) {
      this.tbody.removeChild(this.tbody.firstChild);
    }

    for (var j = 0, length = filterdRows.length; j < length; j++) {
      this.tbody.appendChild(filterdRows[j]);
    }

    this.table.appendChild(this.tbody);
  };

  this.sortTable = function (colIndex, direction) {
    var rows = (this.filterActive) ? Array.prototype.slice.call(this.tbody.rows) : this.rows;
    var sortFunction;

    if (rows[0].cells[colIndex].innerHTML == +rows[0].cells[colIndex].innerHTML) {
      sortFunction = function(a, b) {
        var val = a.cells[colIndex].innerHTML - b.cells[colIndex].innerHTML;

        return val * direction;
      };
    } else {
      sortFunction = function(a, b) {
        var val = a.cells[colIndex].innerHTML > b.cells[colIndex].innerHTML ? 1 : -1;

        return val * direction;
      };
    }

    rows.sort(sortFunction);

    this.table.removeChild(this.tbody);

    for (var i = 0, length = rows.length; i < length; i++) {
      this.tbody.appendChild(rows[i]);
    }

    this.table.appendChild(this.tbody);
  };

  this.getMarkedRows = function () {
    return this.rows.filter(function(row) {
      var deleteBtn = row.querySelector('input[data-delete]');

      return deleteBtn && deleteBtn.checked;
    });
  };

  this.changeCellValue = function(cell) {
    var setValueAndClose;

    setValueAndClose = function () {
      self.input.removeEventListener('blur', setValueAndClose);
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
  };

  if (this.findElemens() && this.fillInTable()) {
    this.bindEvents();
    this.createAuxiliaryElements();
  }
};

var table1 = new Table({
  table: '.table-1',
  sortBtn: 'data-sort-btn',
  deleteBtn: 'input[data-delete]',
  rowDeleteBtn: '[data-delete-btn]',
  filter: {
    inputs: '[data-filter-value]',
    startAfter: 0
  },
  getDataCallback: function () {
    // first argument is api of table
    return tableData; // lorem data
  }
});

console.log('table 1 api: ', table1);

var table2 = new Table({
  table: '.table-2',
  sortBtn: 'data-sort-btn',
  deleteBtn: 'input[data-delete]',
  rowDeleteBtn: '[data-delete-btn]',
  filter: {
    inputs: '[data-filter-value]',
    startAfter: 0
  },
  getDataCallback: function () {
    // first argument is api of table
    return tableData; // lorem data
  }
});