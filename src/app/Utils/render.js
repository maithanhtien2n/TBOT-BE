module.exports = {
  // Random value
  generateRandomCode: (v1, v2, length) => {
    var characters = `${v1}${v2}`;
    var code = "";

    for (var i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  },

  convertToStringKeySearch: (keySearch) => {
    console.log(keySearch);
    if (typeof keySearch !== "string") {
      return "";
    }

    // Convert to lowercase
    let lowerCaseString = keySearch.toLowerCase();

    // Remove diacritics
    let stringWithoutDiacritics = lowerCaseString
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return stringWithoutDiacritics;
  },

  generateOTP: () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
  },

  renderHost: (req) => {
    return `${req.protocol}://${req.get("host")}`;
  },

  onRenderPath: (folder, fileName) => {
    return `uploads/${folder}/${Date.now()}$${fileName}`;
  },
};
