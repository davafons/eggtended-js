class SymbolTable {
  addAttribute(attribute, value, name) {
    if (!(name in this)) {
      this[name] = {};
    }

    this[name][attribute] = value;
  }

  checkAttribute(attribute, name) {
    if (name in this && attribute in this[name]) {
      return true;
    }

    return false;
  }
}

module.exports = {
  SymbolTable
};
