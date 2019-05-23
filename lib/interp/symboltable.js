class SymbolTable {
  addAttribute(attribute, name) {
    if (!(name in this)) {
      this[name] = {};
    }

    this[name][attribute] = true;
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
