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

  convertTimestampToDateTimeString: (timestamp) => {
    // Tạo đối tượng Date từ timestamp (được nhân với 1000 để chuyển đổi sang đơn vị mili giây)
    const date = new Date(timestamp * 1000);

    // Lấy thông tin ngày, tháng, năm, giờ, phút, giây
    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng trong đối tượng Date bắt đầu từ 0
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format thành chuỗi ngày tháng năm giờ phút giây
    const formattedString = `${day}/${month}/${year} ${hours}:${minutes}`;

    // Trả về chuỗi ngày tháng năm giờ phút giây
    return formattedString;
  },
};
