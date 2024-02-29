module.exports = {
  // Chuyển số sang định dạng tiền VNĐ
  formatToVND: (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  },

  formatDate: (dateString, showTime = false) => {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return showTime ? `${formattedDate} ${formattedTime}` : formattedDate;
  },
};
